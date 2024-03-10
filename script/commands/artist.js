const axios = require('axios');

module.exports.config = {
    name: "artist",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Magallanes",
    description: "Artist AI developed by jonell Magallanes",
    usePrefix: false,
    commandCategory: "Arts",
    usages: "[question]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const content = encodeURIComponent(args.join(" "));
    const apiUrl = `https://artistai-e2000fe7437b.herokuapp.com/artist?query=${content}`;

    if (!content) return api.sendMessage("Hello There I'm AI Artist to guide to your drawing and ideas!\n\nUsages: ${global.config.PREFIX}artist how to draw tree?", event.threadID, event.messageID);

    try {
        api.sendMessage("🎨 | AI ARTIST Searching your answer. Please wait...", event.threadID, event.messageID);

        const response = await axios.get(apiUrl);
        const { prompt, instructions } = response.data;

        api.sendMessage(`${prompt}`, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
};
