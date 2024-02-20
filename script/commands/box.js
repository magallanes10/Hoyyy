const axios = require('axios');

module.exports.config = {
    name: "box",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Magallanes",
    description: "EDUCATIONAL",
    usePrefix: false,
    commandCategory: "Educational",
    usages: "[question]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const content = encodeURIComponent(args.join(" "));
    const apiUrl = `https://api.easy-api.online/api/blackbox?query=${content}`;

    if (!content) return api.sendMessage("Please provide your question.\n\nExample: ai what is the solar system?", event.threadID, event.messageID);

    try {
        api.sendMessage("📝 | AI Box is searching for your answer. Please wait...", event.threadID, event.messageID);

        const response = await axios.get(apiUrl);
        const aiResponse = response.data.response;

        api.sendMessage(`${aiResponse}`, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
};
