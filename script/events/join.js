const moment = require("moment");

module.exports.config = {
    name: "join",
    eventType: ['log:subscribe'],
    version: "1.0.0",
    credits: "Mirai-Team", //mod by jonell Magallanes 
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
        return reply(`✅ | ${global.config.BOTNAME} connected successfully!\nType "${global.config.PREFIX}help" to view all commands\n\nContact the admin if you encounter an error.\n\n👷Developer: Jonell Magallanes`);
    } else {
        try {
            const {
                threadID
            } = event;
            let {
                threadName,
                participantIDs,
                imageSrc
            } = await api.getThreadInfo(threadID);
            var tn = threadName;
            if (threadName == null) {
                var tn = "Unnamed group"
            }
            var threadInfo = await api.getThreadInfo(threadID);
            var mentions = [],
                nameArray = [],
                memLength = [],
                i = 0;
            let addedParticipants1 = event.logMessageData.addedParticipants;
            for (let newParticipant of addedParticipants1) {
                let userID = newParticipant.userFbId
                api.getUserInfo(parseInt(userID), (err, data) => {
                    if (err) {
                        return console.log(err)
                    }
                    var obj = Object.keys(data);
                    var userName = data[obj].name.replace("@", "");
                    if (userID !== api.getCurrentUserID()) {
                        nameArray.push(userName);
                        mentions.push({
                            tag: userName,
                            id: userID,
                            fromIndex: 0
                        });
                        memLength.push(participantIDs.length - i++);
                        memLength.sort((a, b) => a - b);
                        let avt = ["https://i.postimg.cc/pTGHDKnY/images-2023-08-19-T230758-444.jpg", "https://i.postimg.cc/pd0WBwwF/images-2023-08-19-T230807-555.jpg", "https://i.postimg.cc/gkvG7L9d/images-2023-08-19-T230828-578.jpg", "https://i.postimg.cc/XNfXtYyf/images-2023-08-19-T230845-301.jpg"]
                        var avt1 = avt[Math.floor(Math.random() * avt.length)];

                        let firstName = nameArray[0].split(" ")[0]; // Extracting the first name from the array

                        let requestURL = `https://join2apibyjonell-7b4fde8396f3.herokuapp.com/join2?name=${firstName}&id=${event.senderID}&background=${avt1}&count=${participantIDs.length}`;

                        let addedBy = event.logMessageData.addedBy; 
                        let currentTime = moment().format("MMMM Do YYYY, h:mm:ss a"); 

                        let callback = function () {
                            let welcomeText = `Hello There ${userName}!\nWelcome to ${tn}\nYou're the ${participantIDs.length}th member on this group and enjoy!\n\n👤 Added by: ${addedBy}\n⏰ Time: ${currentTime}`;

                            return reply({
                                body: welcomeText,
                                attachment: fs.createReadStream(`come.jpg`),
                                mentions
                            }, () => fs.unlinkSync(`come.jpg`));

                        };
                        request(encodeURI(requestURL))
                            .pipe(fs.createWriteStream(`come.jpg`))
                            .on("close", callback)
                    }
                })
            }
        } catch (err) {
            return console.log("ERROR: " + err);
        }
    }
};
