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
    const voiceApiKey = 'fuck';  // Replace with your actual API key
    const voiceOutputDir = './';  // Replace with your desired output directory

    if (!content) return api.sendMessage("Please provide your question.\n\nExample: ai what is the solar system?", event.threadID, event.messageID);

    try {
        api.sendMessage("🔍 | AI is searching for your answer. Please wait...", event.threadID, event.messageID);

        // Call GPT API
        const gptResponse = await axios.get(gptApiUrl);
        const { gptResult } = gptResponse.data.result;
        const { gpt, code, status } = gptResult;

        if (status && code === 200) {
            // Call Voice API
            const voiceResponse = await axios.post(voiceApiUrl, {
                text: gpt,
                voiceid: 'adam',
                apikey: voiceApiKey
            });

            // Check if the voice API response contains an attachment
            if (voiceResponse.data && voiceResponse.data.attachments) {
                // Download the voice attachment
                const voiceAttachment = voiceResponse.data.attachments[0];
                const voiceDownloadUrl = voiceAttachment.url;

                // Save the voice file locally
                const voiceFileName = `vai${Date.now()}.mp3`;
                const voiceFilePath = path.join(voiceOutputDir, voiceFileName);

                await fs.writeFile(voiceFilePath, await axios.get(voiceDownloadUrl, { responseType: 'arraybuffer' }).then(res => res.data));

                // Send the GPT response text
                api.sendMessage(`${gpt}\n\n📝 Request count: ${gptResponse.data.requestNumber}`, event.threadID, event.messageID);

                // Send the voice message separately
                api.sendMessage({
                    body: '🔊 Voice AI Response:',
                    attachment: fs.createReadStream(voiceFilePath),
                    mentions: [{
                        tag: '@fbid',
                        id: event.senderID
                    }]
                }, event.threadID);
            } else {
                api.sendMessage("An error occurred while processing the voice request.", event.threadID);
            }
        } else {
            api.sendMessage("An error occurred while processing your GPT request.", event.threadID);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
};
