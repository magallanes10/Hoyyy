const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

module.exports.config = {
    name: "gpt",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Magallanes",
    description: "EDUCATIONAL",
    usePrefix: false,
    commandCategory: "other",
    usages: "[question]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const content = encodeURIComponent(args.join(" "));
    const gptApiUrl = `https://jonellccapisproject-e1a0d0d91186.herokuapp.com/api/gpt?prompt=${content}`;
    const voiceApiUrl = 'https://for-devs.onrender.com/api/voice';
    const voiceApiKey = 'fuck';
    const voiceOutputDir = './';

    if (!content) return api.sendMessage("Please provide your question.\n\nExample: ai what is the solar system?", event.threadID, event.messageID);

    try {
        const initialMessage = await api.sendMessage("🔍 | AI is searching for your answer. Please wait...", event.threadID, event.messageID);

        
        const gptResponse = await axios.get(gptApiUrl);
        const { gptResult } = gptResponse.data.result;
        const { gpt, code, status } = gptResult;

        if (status && code === 200) {
            
            const voiceResponse = await axios.post(voiceApiUrl, {
                text: gpt,
                voiceid: 'adam',
                apikey: voiceApiKey
            });

            // Check if the voice API response contains an attachment
            if (voiceResponse.data && voiceResponse.data.attachments) {                const voiceAttachment = voiceResponse.data.attachments[0];
                const voiceDownloadUrl = voiceAttachment.url;

                const voiceFileName = `voice_ai_response_${Date.now()}.mp3`;
                const voiceFilePath = path.join(voiceOutputDir, voiceFileName);

                await fs.writeFile(voiceFilePath, await axios.get(voiceDownloadUrl, { responseType: 'arraybuffer' }).then(res => res.data));

                
                await api.sendMessage(`${gpt}\n\n📝 Request count: ${gptResponse.data.requestNumber}`, event.threadID, initialMessage.messageID);

                await api.sendMessage({
                    body: '🔊 Voice AI Response:',
                    attachment: fs.createReadStream(voiceFilePath),
                    mentions: [{
                        tag: '@fbid',
                        id: event.senderID
                    }]
                }, event.threadID, initialMessage.messageID);
            } else {
                await api.sendMessage("An error occurred while processing the voice request.", event.threadID, initialMessage.messageID);
            }
        } else {
            await api.sendMessage("An error occurred while processing your GPT request.", event.threadID, initialMessage.messageID);
        }
    } catch (error) {
        console.error(error);
        await api.sendMessage("An error occurred while processing your request.", event.threadID, event.messageID);
    }
};
