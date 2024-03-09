const axios = require('axios');

module.exports.config = {
    name: "claude",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Jonell Magallanes",
    description: "CLAUDE AI BY JONELL MAGALLANES CMD ", //API BY HAZEY
    usePrefix: false,
    commandCategory: "EDUCATION",
    usages: "[question]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const content = encodeURIComponent(args.join(" "));
    const apiUrl = `https://hazee-claude-ai-5b3176a38696.herokuapp.com/claude?q=${content}`;

    if (!content) return api.sendMessage("Please provide your question", event.threadID, event.messageID);

    try {
        api.sendMessage("🔍 | Claude AI is searching. Please wait...", event.threadID, event.messageID);

        const response = await axios.get(apiUrl);
        const { response } = response.data;

        if (response && response.length > 0) {
            const { type, text } = response[0];
            if (type === "text") {
                api.sendMessage(text, event.threadID, event.messageID);
            } else {
                api.sendMessage("Unexpected response type from Claude AI.", event.threadID);
            }
        } else {
            api.sendMessage("No valid response from AI.", event.threadID);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
};
