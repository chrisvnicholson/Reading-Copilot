require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { OpenAI } = require("openai");
const markdown = require('markdown-js'); 

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
  const { snippet, prompt, pageUrl, systemPrompt: customSystemPrompt } = req.body; // Assuming you might add systemPrompt later

  console.log("Received data for LLM:", { snippet, prompt, pageUrl });

  if (!snippet || !prompt) {
    return res.status(400).json({ error: "Snippet and prompt are required." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1", 
      messages: [
        {
          role: "system",
          
          content: customSystemPrompt || "You are a helpful assistant that helps users understand and learn from text snippets they encounter online. Provide clear, informative responses based on the text snippet and user's question. Feel free to use Markdown for formatting if it enhances clarity."
        },
        {
          role: "user",
          content: `Here's a text snippet from ${pageUrl}:\n\n"${snippet}"\n\nUser question: ${prompt}`
        }
      ],
    });

    const llmReply = completion.choices[0]?.message?.content;

    if (llmReply) {
      const htmlReply = markdown.toHTML(llmReply); // <--- Parse Markdown to HTML
      res.json({ reply: htmlReply }); // <--- Send HTML reply
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
