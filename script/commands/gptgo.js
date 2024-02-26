const axios = require("axios");

module.exports.config = {
  name: "gptgo",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Jonell Magallanes",
  description: "asking questions without prefix or command",
  usePrefix: false,
  commandCategory: "ai",
  usages: "[ask]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const gptEnabled = true;

  if (gptEnabled) {
    const { messageID, threadID, senderID, body } = event;
    const content = encodeURIComponent(body);

    try {
      const res = await axios.get(`https://cc-project-apis-jonell-magallanes.onrender.com/api/globalgpt?content=${content}`);
      const respond = res.data.content;
      const requestNumber = res.data.requestCount;

      if (res.data.error) {
        api.sendMessage(`Error: ${res.data.error}`, threadID, messageID);
      } else {
        api.sendMessage(`${respond}\n\n📝 Request count: ${requestNumber}`, threadID, messageID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while fetching the data.", threadID, messageID);
    }
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const gptEnabled = true;

  if (gptEnabled) {
    const { threadID, messageID, senderID, body } = event;

    if (body.endsWith("?")) {
      return this.run({ api, event, args: [body] });
    }
  }
};

module.exports.turnGptOn = function () {
  gptEnabled = true;
};

module.exports.turnGptOff = function () {
  gptEnabled = false;
};
