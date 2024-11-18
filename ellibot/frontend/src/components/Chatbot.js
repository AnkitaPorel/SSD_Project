import React, { useState, useEffect } from 'react';
import '../styles/Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [metaModel, setMetaModel] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [isDefaultQuestionAsked, setIsDefaultQuestionAsked] = useState(false);

  const defaultQuestion = "Before we finish, is there anything else you'd like to share or clarify?";

  // Fetch meta-model on mount
  useEffect(() => {
    const fetchMetaModel = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/meta-model');
        if (!response.ok) throw new Error('Failed to fetch meta-model');

        const data = await response.json();
        setMetaModel(data);

        setMessages([
          { sender: 'bot', text: 'Welcome to the chat!' },
          { sender: 'bot', text: `Let’s get started. Could you please specify the ${data.data.reportMetaModel.attributes[0].label}?` },
        ]);
      } catch (error) {
        console.error('Error fetching meta-model:', error);
        setMessages([{ sender: 'bot', text: `Error: ${error.message}` }]);
      }
    };

    fetchMetaModel();
  }, []);

  const handleSendMessage = async () => {
    if (input.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', text: input.trim() },
      ]);

      if (isDefaultQuestionAsked) {
        handleDefaultQuestion(input.trim());
      } else {
        handleMetaModelQuestions();
      }

      setInput('');
    }
  };

  const handleMetaModelQuestions = () => {
    const currentAttribute = metaModel.data.reportMetaModel.attributes[currentQuestionIndex];
  
    if (currentAttribute) {
      if (currentAttribute.type === 'object' && currentAttribute.attributes) {
        // Handle nested attributes for object-type questions (e.g., Graph Options)
        const nestedAttrIndex = Object.keys(userResponses[currentAttribute.name] || {}).length;
        const nestedAttribute = currentAttribute.attributes[nestedAttrIndex];
  
        if (nestedAttribute) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `Could you please specify the ${nestedAttribute.label}?` },
          ]);
  
          // Update userResponses for nested fields
          setUserResponses((prev) => ({
            ...prev,
            [currentAttribute.name]: {
              ...prev[currentAttribute.name],
              [nestedAttribute.name]: input.trim(),
            },
          }));
        } else {
          // All nested attributes are answered, move to the next main attribute
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
          // Trigger the next question only if there are more main attributes
          if (currentQuestionIndex + 1 < metaModel.data.reportMetaModel.attributes.length) {
            handleMetaModelQuestions();
          } else {
            summarizeResponses(); // Call summary if all questions are done
          }
        }
      } else {
        // Handle regular (non-object) attributes
        setUserResponses((prev) => ({
          ...prev,
          [currentAttribute.name]: input.trim(),
        }));
  
        const nextIndex = currentQuestionIndex + 1;
  
        if (nextIndex < metaModel.data.reportMetaModel.attributes.length) {
          const nextAttribute = metaModel.data.reportMetaModel.attributes[nextIndex];
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `Can you please provide the ${nextAttribute.label}?` },
          ]);
          setCurrentQuestionIndex(nextIndex);
        } else {
          summarizeResponses();
        }
      }
    }
  };
  
  
  const summarizeResponses = async () => {
    let summary = 'Here is a quick summary of what you’ve shared:\n';
  
    metaModel.data.reportMetaModel.attributes.forEach((attr) => {
      const userResponse = userResponses[attr.name];
      if (attr.type === 'object' && attr.attributes) {
        // Handle nested object attributes
        summary += `${attr.label}:\n`;
        attr.attributes.forEach((nestedAttr) => {
          const nestedResponse = userResponse?.[nestedAttr.name] || 'N/A';
          summary += `   - ${nestedAttr.label}: ${nestedResponse}\n`;
        });
      } else {
        summary += `${attr.label}: ${userResponse || 'N/A'}\n`;
      }
    });
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: "Here's what we have so far:" },
      { sender: 'bot', text: summary },
      { sender: 'bot', text: defaultQuestion },
    ]);
  
    setIsDefaultQuestionAsked(true);
  
    // Send the summary to the backend
    try {
      const response = await fetch('http://localhost:5001/api/save-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, userId: 'guest' }),
      });
  
      if (!response.ok) {
        console.error('Error saving summary:', await response.json());
      }
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  };
  
  const handleDefaultQuestion = (response) => {
    const lowercasedResponse = response.toLowerCase();
    if (lowercasedResponse === 'no' || lowercasedResponse === 'leave') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Thank you for your time! If you need further assistance, feel free to reach out again. Have a great day!' },
      ]);
      setIsDefaultQuestionAsked(false);
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Got it. Please share any additional details or clarifications you have.' },
      ]);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chatbot-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
