const fs = require("fs");
const axios = require("axios");

module.exports.config = {
    name: "leaveNoti",
    eventType: ["log:unsubscribe"],
    version: "1.0.0",
    credits: "Deku",
    description: "Notify left members",
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

module.exports.run = async function({ api, event, Users, Threads }) {
    function reply(data) {
        api.sendMessage(data, event.threadID, event.messageID);
    }

    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    let { threadName, participantIDs } = await api.getThreadInfo(event.threadID);
    const type = (event.author == event.logMessageData.leftParticipantFbId) ? "left the group." : "kicked by Admin of the group";
    let pathh = __dirname + `/cache/bye.png`;
    let name = (await api.getUserInfo(event.logMessageData.leftParticipantFbId))[event.logMessageData.leftParticipantFbId].name;
    let avt = ["https://i.postimg.cc/NG8bzNng/5f72fa7bca49768489ca59d27332defa.jpg", "https://i.postimg.cc/4NScLVXf/8ab4bc55a2d413b2b589c1c0103045d7.jpg", "https://i.postimg.cc/4xcYW08P/af472054e9e551af3a5295c47192ffda.jpg", "https://i.postimg.cc/RVLSqzbj/5f48a6f71dceb60103ba40b6e67ac15f.jpg"];
    let avt1 = avt[Math.floor(Math.random() * avt.length)];
    const firstName = name.split(" ")[0]; // Extracting the first name

    let encodedUrl = `https://leavecanvasapibyjonell-5715724d201c.herokuapp.com/leave?name=${firstName}&id=${event.logMessageData.leftParticipantFbId}&background=${avt1}&count=${participantIDs.length}`;

    axios.get(encodeURI(encodedUrl), { responseType: 'arraybuffer' })
        .then(response => {
            fs.writeFileSync(pathh, Buffer.from(response.data, 'binary'));
            reply({
                body: `${name} has been ${type}\nMember’s left: ${participantIDs.length}`,
                attachment: fs.createReadStream(pathh)
            });
        })
        .catch(error => console.log("Axios Error: ", error));
};
