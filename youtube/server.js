require('dotenv').config();
const express = require('express');
const cors = require('cors');
const getSubtitles = require('youtube-captions-scraper').getSubtitles;
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to extract video ID from YouTube URL
function extractVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

// Function to chunk text into smaller pieces
function chunkText(text, maxLength = 30000) {
    const chunks = [];
    let currentChunk = '';
    const sentences = text.split('. ');

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length < maxLength) {
            currentChunk += sentence + '. ';
        } else {
            chunks.push(currentChunk);
            currentChunk = sentence + '. ';
        }
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}

app.post('/summarize', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        const videoId = extractVideoId(videoUrl);

        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        try {
            const transcript = await getSubtitles({
                videoID: videoId,
                lang: 'en'
            });
            
            const transcriptText = transcript.map(t => t.text).join(' ');
            const chunks = chunkText(transcriptText);

            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            let fullSummary = '';

            // Process each chunk and combine summaries
            for (const chunk of chunks) {
                const prompt = `Please provide a concise summary of the following video transcript part: ${chunk}`;
                const result = await model.generateContent(prompt);
                fullSummary += result.response.text() + '\n\n';
            }

            // Generate final consolidated summary if needed
            if (chunks.length > 1) {
                const finalPrompt = `Please provide a coherent and concise final summary combining these points: ${fullSummary}`;
                const finalResult = await model.generateContent(finalPrompt);
                fullSummary = finalResult.response.text();
            }

            res.json({ 
                summary: fullSummary,
                transcript: transcriptText
            });
        } catch (transcriptError) {
            console.error('Transcript Error:', transcriptError);
            res.status(404).json({ error: 'Could not fetch video transcript. The video might be private or have no captions.' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error generating summary' });
    }
});

app.post('/ask-followup', async (req, res) => {
    try {
        const { question, transcript } = req.body;

        if (!question || !transcript) {
            return res.status(400).json({ error: 'Question and transcript are required' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Based on the following video transcript: "${transcript}", please answer this question: ${question}`;

        const result = await model.generateContent(prompt);
        const answer = result.response.text();

        res.json({ answer });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error answering question' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});