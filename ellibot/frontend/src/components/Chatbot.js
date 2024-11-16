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
  
      const isValid = isValidEnglishPhrase(input.trim());
      if (isValid) {
        const validationResponse = await validateResponse(input.trim());
        if (validationResponse.isValid) {
          handleMetaModelQuestions();
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: validationResponse.message },
          ]);
        }
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: "Sorry, your response doesn't seem valid. Please use proper English phrases.",
          },
        ]);
      }
  
      setInput('');
    }
  };
  
  // Simple local validation in the frontend
  const isValidEnglishPhrase = (text) => {
    const regex = /^[A-Za-z0-9,.!?'" ]+$/; // Allow letters, numbers, punctuation, and spaces
    return regex.test(text) && text.trim().length > 0;
  };
  
  // Validate response using backend API
  const validateResponse = async (response) => {
    try {
      const res = await fetch('http://localhost:5001/api/validate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error during validation:', error);
      return { isValid: false, message: 'Failed to validate the response.' };
    }
  };  

  const handleMetaModelQuestions = async () => {
    const currentAttribute = metaModel.data.reportMetaModel.attributes[currentQuestionIndex];
    if (currentAttribute) {
        setUserResponses((prev) => ({
            ...prev,
            [currentAttribute.name]: input.trim(),
        }));

        // Validate the user response via API
        const validationResponse = await validateResponse(input.trim(), currentAttribute);

        if (validationResponse.isValid) {
            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex < metaModel.data.reportMetaModel.attributes.length) {
                const nextAttribute = metaModel.data.reportMetaModel.attributes[nextIndex];
                const variedQuestions = [
                    `Can you please provide the ${nextAttribute.label}?`,
                    `I need to know the ${nextAttribute.label}. Could you share it?`,
                    `Next, could you specify the ${nextAttribute.label}?`,
                ];
                const randomQuestion = variedQuestions[Math.floor(Math.random() * variedQuestions.length)];

                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'bot', text: randomQuestion },
                ]);
                setCurrentQuestionIndex(nextIndex);
            } else {
                summarizeResponses();
            }
        } else {
            // Provide more detailed feedback when validation fails
            const feedback = validationResponse.suggestion || 'Your input could not be validated. Please try again.';
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'bot', text: `Sorry, the response for ${currentAttribute.label} is not quite clear. Could you please clarify?` },
                { sender: 'bot', text: `Here’s why: ${feedback}` },
            ]);
        }
    }
};


  const summarizeResponses = () => {
    let summary = 'Here is a quick summary of what you’ve shared:\n';
    metaModel.data.reportMetaModel.attributes.forEach((attr) => {
      const userResponse = userResponses[attr.name] || 'N/A';
      summary += `${attr.label}: ${userResponse}\n`;
    });

    const variedSummaryMessages = [
      "Here's what we have so far:",
      "Here’s a recap of your responses:",
      "This is the information you've provided:",
    ];
    const summaryIntro = variedSummaryMessages[Math.floor(Math.random() * variedSummaryMessages.length)];

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: summaryIntro },
      { sender: 'bot', text: summary },
      { sender: 'bot', text: defaultQuestion },
    ]);

    setIsDefaultQuestionAsked(true);
  };

  const handleDefaultQuestionResponse = () => {
    const variedFinalMessages = [
      "Thank you for your input! Let me know if you'd like to revisit anything.",
      "Got it! If there's nothing else, have a great day!",
      "Thanks for sharing! If you need further assistance, just let me know.",
    ];
    const finalMessage = variedFinalMessages[Math.floor(Math.random() * variedFinalMessages.length)];

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: finalMessage },
    ]);
    setIsDefaultQuestionAsked(false);
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