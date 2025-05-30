require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { OpenAI } = require("openai");

const app = express();
const port = 3000;

// Initialize OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    endpoints: {
      'POST /api/chat-with-llm': 'Main endpoint for LLM chat'
    }
  });
});

app.post('/api/chat-with-llm', async (req, res) => {
  const { snippet, prompt, pageUrl } = req.body;

  console.log("Received data for LLM:", { snippet, prompt, pageUrl });

  if (!snippet || !prompt) {
    return res.status(400).json({ error: "Snippet and prompt are required." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Or your preferred model, e.g., "gpt-4"
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that helps users understand and learn from text snippets they encounter online. Provide clear, informative responses based on the text snippet and user's question."
        },
        {
          role: "user",
          content: `Here's a text snippet from ${pageUrl}:\n\n"${snippet}"\n\nUser question: ${prompt}`
        }
      ],
    });

    const llmReply = completion.choices[0]?.message?.content;

    if (llmReply) {
      res.json({ reply: llmReply });
    } else {
      res.status(500).json({ error: "No response content from LLM." });
    }

  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "Failed to get response from OpenAI." });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});

