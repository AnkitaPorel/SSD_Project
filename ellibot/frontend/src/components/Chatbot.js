import React, { useState, useEffect, useRef } from 'react';
import '../styles/Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [metaModel, setMetaModel] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [isDefaultQuestionAsked, setIsDefaultQuestionAsked] = useState(false);
  const messagesEndRef = useRef(null);
  const [userEmail, setUserEmail] = useState('');
  const defaultQuestion = "Before we finish, is there anything else you'd like to share or clarify?";

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
        const nestedAttrIndex = Object.keys(userResponses[currentAttribute.name] || {}).length;
        const nestedAttribute = currentAttribute.attributes[nestedAttrIndex];
  
        if (nestedAttribute) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `Would you like to add anything to the ${nestedAttribute.label}?` },
          ]);
  
          setUserResponses((prev) => ({
            ...prev,
            [currentAttribute.name]: {
              ...prev[currentAttribute.name],
              [nestedAttribute.name]: input.trim(),
            },
          }));
        } else {
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
          if (currentQuestionIndex + 1 < metaModel.data.reportMetaModel.attributes.length) {
            handleMetaModelQuestions();
          } else {
            summarizeResponses();
          }
        }
      } else {
        setUserResponses((prev) => ({
          ...prev,
          [currentAttribute.name]: input.trim(),
        }));
  
        const nextIndex = currentQuestionIndex + 1;
  
        if (nextIndex < metaModel.data.reportMetaModel.attributes.length) {
          const nextAttribute = metaModel.data.reportMetaModel.attributes[nextIndex];
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: `Do you have any requirements for ${nextAttribute.label}?` },
          ]);
          setCurrentQuestionIndex(nextIndex);
        } else {
          summarizeResponses();
        }
      }
    }
  };
  
  const summarizeResponses = async () => {
    let summary = 'Here is a quick summary the responses you gave: \n';
  
    metaModel.data.reportMetaModel.attributes.forEach((attr) => {
      const userResponse = userResponses[attr.name];
      if (attr.type === 'object' && attr.attributes) {
        summary += `${attr.label}:\n`;
        attr.attributes.forEach((nestedAttr) => {
          const nestedResponse = userResponse?.[nestedAttr.name] || 'N/A';
          summary += `   - ${nestedAttr.label}: ${nestedResponse}, \n`;
        });
      } else {
        summary += `${attr.label}: ${userResponse || 'N/A'}, n`;
      }
    });
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: "Here's what we have so far: " },
      { sender: 'bot', text: summary },
      { sender: 'bot', text: defaultQuestion },
    ]);
  
    setIsDefaultQuestionAsked(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/save-user-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userResponses, userId: userEmail || 'guest',
         }),
      });

      if (!response.ok) {
        console.error('Error saving responses:', await response.json());
      }
    } catch (error) {
      console.error('Error saving responses:', error);
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
        <div ref={messagesEndRef}></div>
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