const logger = require('./utils/log');
const cron = require('node-cron');
const axios = require("axios");
const fs = require('fs-extra');

const minInterval = 5;
let lastMessageTime = 0;
let messagedThreads = new Set();

const config = {
  autoRestart: {
    status: true,
    time: 40,
    note: 'To avoid problems, enable periodic bot restarts',
  },
  acceptPending: {
    status: false,
    time: 30,
    note: 'Approve waiting messages after a certain time',
  },
};

function autoRestart(config) {
  if (config.status) {
    cron.schedule(`*/${config.time} * * * *`, () => {
      logger('Start rebooting the system!', 'Auto Restart');
      process.exit(1);
    });
  }
}

function acceptPending(config) {
  if (config.status) {
    cron.schedule(`*/${config.time} * * * *`, async () => {
      const list = [
        ...(await api.getThreadList(1, null, ['PENDING'])),
        ...(await api.getThreadList(1, null, ['OTHER'])),
      ];
      // Do something with the pending messages, or simply ignore them
    });
  }
}

autoRestart(config.autoRestart);
acceptPending(config.acceptPending);

function sendAutoGreet(api, weatherInfo) {
  const currentTime = Date.now();
  if (currentTime - lastMessageTime < minInterval) {
    console.log("Skipping message due to rate limit");
    return;
  }

  api.getThreadList(25, null, ['INBOX'], async (err, data) => {
    if (err) return console.error("Error [Thread List Cron]: " + err);
    let i = 0;
    let j = 0;

    async function message(thread) {
      try {
        api.sendMessage({
          body: `Hello everyone,\n\n${weatherInfo}.\n\nStay safe!`
        }, thread.threadID, (err) => {
          if (err) return;
          messagedThreads.add(thread.threadID);
        });
      } catch (error) {
        console.error("Error sending a message:", error);
      }
    }

    while (j < 20 && i < data.length) {
      if (data[i].isGroup && data[i].name != data[i].threadID && !messagedThreads.has(data[i].threadID)) {
        await message(data[i]);
        j++;
        const CuD = data[i].threadID;
        setTimeout(() => {
          messagedThreads.delete(CuD);
        }, 1000);
      }
      i++;
    }
  });
}

// AUTOGREET EVERY HOUR
cron.schedule('0 */1 * * *', async () => { // Every hour
  try {
    const response = await axios.get(`http://api.weatherapi.com/v1/current.json?key=6d9f35c258a84512bc850000230111&q=Philippines`);
    const temperature = response.data['current']['temp_c'];
    const heatIndex = response.data['current']['feelslike_c'];

    let weatherInfo = `The current temperature is ${temperature}°C in ${response.data['location']['name']}, ${response.data['location']['region']}.`;

    if (heatIndex >= 38 && heatIndex <= 40) {
      weatherInfo += "\n\nHeat Index Detected!";
    }

    sendAutoGreet(api, weatherInfo);
  } catch (error) {
    console.log(`❌ ${error.message}`);
  }
}, {
  scheduled: true,
  timezone: "Asia/Manila"
});

// AUTOGREET EVERY DAY
cron.schedule('0 0 * * *', async () => { // Every day at midnight
  try {
    const response = await axios.get(`http://api.weatherapi.com/v1/current.json?key=6d9f35c258a84512bc850000230111&q=Philippines`);
    const temperature = response.data['current']['temp_c'];

    const weatherInfo = `Good morning! The current temperature is ${temperature}°C in ${response.data['location']['name']}, ${response.data['location']['region']}. Have a great day!`;

    sendAutoGreet(api, weatherInfo);
  } catch (error) {
    console.log(`❌ ${error.message}`);
  }
}, {
  scheduled: true,
  timezone: "Asia/Manila"
});
