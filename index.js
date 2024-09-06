const express = require('express');
const { RAGChat, openai } = require('@upstash/rag-chat');

const app = express();
const port = 3000; // You can change this to your preferred port

app.use(express.json());

const ragChat = new RAGChat({
    model: openai("gpt-4-turbo"),
});

app.post('/api/message', async (req, res) => {
    const { message, chatHistory } = req.body;

    try {
        const result = await ragChat.chat(message, {
            promptFn: ({ question, chatHistory }) => {
                console.log('chat_history', chatHistory, 'question', question);

                return chatHistory ? `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
                Chat History:
                ${chatHistory}
                Follow Up Input: ${question}
                Standalone question:` : `Standalone question: ${question}`;
            },
            onContextFetched: (context) => {
                console.log("Retrieved context:", context)

                return context;
            },
        });
        console.log('result', result);
        
        res.status(200).json({ response: result, context: result.context });
    } catch (error) {
        console.error('Error processing chat request:', error);
        res.status(500).json({ error: 'Error processing chat request' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

