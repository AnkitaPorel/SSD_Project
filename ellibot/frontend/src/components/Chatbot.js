import React, { useState, useEffect } from 'react';
import '../styles/Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [metaModel, setMetaModel] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [isDefaultQuestionAsked, setIsDefaultQuestionAsked] = useState(false);

  const defaultQuestion = "Is there anything else you would like to add or clarify?";

  // Fetch meta-model on mount
  useEffect(() => {
    const fetchMetaModel = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/meta-model');
        if (!response.ok) throw new Error('Failed to fetch meta-model');
        
        const data = await response.json();
        setMetaModel(data); // Store meta-model
        
        setMessages([
          { sender: 'bot', text: 'Welcome to the chat!' },
          { sender: 'bot', text: `Please specify the ${data.data.reportMetaModel.attributes[0].label}.` },
        ]);
      } catch (error) {
        console.error('Error fetching meta-model:', error);
        setMessages([{ sender: 'bot', text: `Error: ${error.message}` }]);
      }
    };

    fetchMetaModel();
  }, []); // Run only once on mount

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', text: input.trim() },
      ]);

      // Handle input based on current state
      if (isDefaultQuestionAsked) {
        handleDefaultQuestionResponse();
      } else if (metaModel) {
        handleMetaModelQuestions();
      }

      setInput(''); // Clear the input field
    }
  };

  const handleMetaModelQuestions = () => {
    const currentAttribute = metaModel.data.reportMetaModel.attributes[currentQuestionIndex];
    if (currentAttribute) {
      // Save user response
      setUserResponses((prev) => ({
        ...prev,
        [currentAttribute.name]: input.trim(),
      }));

      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < metaModel.data.reportMetaModel.attributes.length) {
        const nextAttribute = metaModel.data.reportMetaModel.attributes[nextIndex];
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: `Please specify the ${nextAttribute.label}.` },
        ]);
        setCurrentQuestionIndex(nextIndex);
      } else {
        summarizeResponses();
      }
    }
  };

  const summarizeResponses = () => {
    let summary = 'Here is the summary of your responses:\n';
    metaModel.data.reportMetaModel.attributes.forEach((attr) => {
      const userResponse = userResponses[attr.name] || 'N/A';
      summary += `${attr.label}: ${userResponse}\n`;
    });

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: summary },
      { sender: 'bot', text: defaultQuestion },
    ]);

    setIsDefaultQuestionAsked(true); // Mark that the default question has been asked
  };

  const handleDefaultQuestionResponse = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: "Thank you for your input! If you'd like to start over, let me know." },
    ]);
    setIsDefaultQuestionAsked(false); // Reset to avoid further handling of the default question
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