module.exports.config = {
  name: "join",
  eventType: ["log:subscribe"],
  version: "1.0.1",
  credits: "SaikiDesu/Jonell Magallanes ",
  description: "Notify bots or people entering the group",
  dependencies: {
    "fs-extra": "",
    "axios": "0.24.0" // Make sure to install this dependency
  }
};

module.exports.run = async function ({ api, event }) {
  const request = require("request");
  const axios = require("axios");
  const path = require("path");
  const fs = global.nodemodule["fs-extra"];
  const { threadID } = event;

  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    api.changeNickname(`» ${global.config.PREFIX} « ${(!global.config.BOTNAME) ? " " : global.config.BOTNAME}`, threadID, api.getCurrentUserID());
    return api.sendMessage(`${global.config.BOTNAME} connected successfully!\nType "${global.config.PREFIX}help" to view all commands\n\nContact the admin if you encounter an error.\n\n👷 Developer:${global.config.BOTOWNER}`, threadID);
  } else {
    try {
      const { threadName, participantIDs } = await api.getThreadInfo(threadID);
      const threadData = global.data.threadData.get(parseInt(threadID)) || {};
      const mentions = [], nameArray = [], memLength = [];

      for (let newParticipant of event.logMessageData.addedParticipants) {
        let userID = newParticipant.userFbId;
        api.getUserInfo(parseInt(userID), async (err, data) => {
          if (err) return console.log(err);

          var obj = Object.keys(data);
          var userName = data[obj].name.replace("@", "");

          if (userID !== api.getCurrentUserID()) {
            nameArray.push(userName);
            mentions.push({ tag: userName, id: userID, fromIndex: 0 });
            memLength.push(participantIDs.length - memLength.length + 1);

            const msg = (typeof threadData.customJoin == "undefined") ?
              `BONJOUR!, ${userName}\n┌────── ～●～ ──────┐\n----- Welcome to ${threadName} -----\n└────── ～●～ ──────┘\nYou're the ${participantIDs.length} the member of this group, please enjoy! 🥳♥` :
              threadData.customJoin;

            const background = ["https://i.postimg.cc/k5Yt863Q/desktop-wallpaper-firewatch-best-games-game-quest-horror-pc-ps4.jpg", "https://i.postimg.cc/FKVTQxS9/images-2023-08-19-T230916-290.jpg"];
            const selectedBackground = background[Math.floor(Math.random() * background.length)];

            const avtUrl = `https://graph.facebook.com/${userID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
const pathavt1 = path.join(__dirname, '/cache/avt.png');

            const avtResponse = await axios({
              method: 'get',
              url: avtUrl,
              responseType: 'stream'
            });
                        avtResponse.data.pipe(fs.createWriteStream(pathavt1));

            const callback = function () {
              return api.sendMessage({
                body: msg,
                attachment: fs.createReadStream(__dirname + `/cache/come.jpg`),
                mentions
              }, event.threadID, () => fs.unlinkSync(__dirname + `/cache/come.jpg`));
            };

            request(encodeURI(`https://api.popcat.xyz/welcomecard?background=${selectedBackground}&text1=${userName}&text2=Welcome+To+${threadName}&text3=You+Are+The ${participantIDs.length} the+Member&avatar=${avtUrl}`)).pipe(fs.createWriteStream(__dirname + `/cache/come.jpg`)).on("close", callback);
          }
        });
      }
    } catch (err) {
      return console.log("ERROR: " + err);
    }
  }
};
