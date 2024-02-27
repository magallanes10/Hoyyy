module.exports.config = {
  name: "join",
  eventType: ['log:subscribe'],
  version: "1.0.0",
  credits: "Mirai-Team", //mod by deku
  description: "GROUP UPDATE NOTIFICATION"
};

module.exports.run = async function ({ api, event, Users, Threads }) {
  const fs = require("fs");
  const axios = require("axios");
  const request = require("request");

  function reply(data) {
    api.sendMessage(data, event.threadID, event.messageID);
  }

  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    api.changeNickname(`${global.config.BOTNAME} • [ ${global.config.PREFIX} ]`, event.threadID, api.getCurrentUserID());
    return reply(`${global.config.BOTNAME} connected successfully!\nType "${global.config.PREFIX}help" to view all commands\n\nContact the admin if you encounter an error.\n\n👷 Developer:${global.config.BOTOWNER}`);
  } else {
    try {
      const { threadID } = event;
      let { threadName, participantIDs, imageSrc } = await api.getThreadInfo(threadID);
      var tn = threadName;
      if (threadName == null) {
        var tn = "Unnamed group";
      }
      var threadInfo = await api.getThreadInfo(threadID);
      var mentions = [],
        nameArray = [],
        memLength = [],
        i = 0;

      let addedParticipants1 = event.logMessageData.addedParticipants;
      for (let newParticipant of addedParticipants1) {
        let userID = newParticipant.userFbId;
        const userNames = await getUserNames(api, userID);

        if (userID !== api.getCurrentUserID()) {
          nameArray.push(userNames);
          mentions.push({
            tag: userNames,
            id: userID,
            fromIndex: 0
          });
          memLength.push(participantIDs.length - i++);
          memLength.sort((a, b) => a - b);
          let avt = ["https://i.postimg.cc/15HRf0gW/images-2023-08-19-T230952-245.jpg", "https://i.postimg.cc/DyDjQHbm/images-2023-09-05-T174116-282.jpg", "https://i.postimg.cc/FKbT4KCJ/images-2023-08-18-T223959-843.jpg", "https://i.postimg.cc/7hRVVJhj/images-2023-07-26-T114510-257.jpg"];
          var avt1 = avt[Math.floor(Math.random() * avt.length)];

          let callback = function () {
            return reply({
              body: `Hello ${userNames}\nWelcome to ${tn}\nYou're the ${participantIDs.length}th member on this group.\nEnjoy!`,
              attachment: fs.createReadStream(`come.jpg`),
              mentions
            }, () => fs.unlinkSync(`come.jpg`));
          };

          request(encodeURI(`https://joinapibyjonell-23c74876953d.herokuapp.com/join?name=${userNames}&imagebackground=${Math.random() * 100}&groupname=${threadName}&count=${participantIDs.length}`))
            .pipe(fs.createWriteStream(`come.jpg`))
            .on("close", callback);
        }
      }
    } catch (err) {
      return console.log("ERROR: " + err);
    }
  }
}
