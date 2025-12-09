// routes/chatRoutes.js
const Conversation = require('../models/conversationModel');
const axios = require('axios'); // To talk to your FastAPI

router.post('/send', async (req, res) => {
  const { userId, conversationId, prompt } = req.body;

  try {
    // 1. Find or Create Conversation
    let chat = await Conversation.findById(conversationId);
    if (!chat) {
      chat = new Conversation({ userId, messages: [] });
    }

    // 2. Save User Message to DB immediately
    chat.messages.push({ sender: 'user', text: prompt });
    await chat.save();

    // 3. Call your Python AI Agent (FastAPI)
    // You pass the history so the agent has context
    const aiResponse = await axios.post('http://localhost:8000/process-agent', {
      prompt: prompt,
      history: chat.messages // Sending past context
    });

    const { answer, intent } = aiResponse.data;

    // 4. Save AI Response to DB
    chat.messages.push({ 
      sender: 'ai', 
      text: answer,
      intent: intent // Very useful for your "CEO Agent" analytics
    });
    
    chat.lastUpdated = Date.now();
    await chat.save();

    res.json({ reply: answer, conversationId: chat._id });

  } catch (error) {
    console.error(error);
    res.status(500).send("AI Brain Malfunction");
  }
});