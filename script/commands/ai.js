const axios = require('axios');
const fs = require('fs-extra');
const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const google = require('googlethis');
const cloudscraper = require('cloudscraper');
const request = require("request");
const usetube = require('usetube');

module.exports.config = {
    name: 'ai',
    version: '1.0.0',
    hasPermission: 0,
    credits: 'Jonell Magallanes',
    description: 'EDUCATIONAL / Play a song, get details about a song, or search for an image',
    usePrefix: false,
    commandCategory: 'utility',
    usages: '[question] / [title] / image [query]',
    cooldowns: 10,
    dependencies: {
        axios: '',
        'fs-extra': '',
        '@distube/ytdl-core': '',
        'yt-search': '',
        'googlethis': '',
        'cloudscraper': '',
        'request': '',
        'usetube': ''
    }
};

module.exports.run = async function ({ api, event, args }) {
    const content = encodeURIComponent(args.join(' '));

    if (!content) {
        return api.sendMessage('Please provide your question\n\nMusic Response\nUsages: ai music of [your music title]\n\nImages response\nUsages:\nai image of [Name of images]', event.threadID, event.messageID);
    }

    try {
        const musicRegex = /\b(?:music|song|play)\b/i;
        const imageRegex = /\b(?:image)\b/i;
        const videoRegex = /\b(?:video of)\b/i;

        if (musicRegex.test(content)) {
            // Music-related functionality
            api.sendMessage('🎶 | AI is searching for music. Please wait...', event.threadID);
            const searchResults = await yts(content);

            if (!searchResults.videos.length) {
                return api.sendMessage('Error: Invalid request.', event.threadID, event.messageID);
            }

            const video = searchResults.videos[0];
            const videoUrl = video.url;

            const stream = ytdl(videoUrl, { filter: 'audioonly' });
            const fileName = `${event.senderID}.mp3`;
            const filePath = __dirname + `/cache/${fileName}`;

            stream.pipe(fs.createWriteStream(filePath));

            stream.on('response', () => {
                console.info('[DOWNLOADER]', 'Starting download now!');
            });

            stream.on('info', (info) => {
                console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
            });

            stream.on('end', () => {
                console.info('[DOWNLOADER] Downloaded');

                if (fs.statSync(filePath).size > 26214400) {
                    fs.unlinkSync(filePath);
                    return api.sendMessage('[ERR] The file could not be sent because it is larger than 25MB.', event.threadID);
                }

                const message = {
                    body: `Here's your music i hope you like it and enjoy\n\nTitle: ${video.title}\nArtist: ${video.author.name}`,
                    attachment: fs.createReadStream(filePath)
                };

                api.sendMessage(message, event.threadID, () => {
                    fs.unlinkSync(filePath);
                });
            });
        } else if (imageRegex.test(content)) {
            // Image search functionality
            google.resultsPerPage = 10;
            let result = await google.image(content, { safe: false });
            api.sendMessage("🖼️ | AI is Searching an Images. Please Wait.....", event.threadID, event.messageID);

            if (result.length === 0) {
                return api.sendMessage(`Sorry but I can't find the image you want to search.`, event.threadID, event.messageID);
            }

            let streams = [];
            let counter = 0;

            for (let image of result) {
                if (counter >= 10) break;

                let url = image.url;
                if (!url.endsWith('.jpg') && !url.endsWith('.png')) continue;

                let path = __dirname + `/cache/search-image-${counter}.jpg`;
                let hasError = false;

                await cloudscraper.get({ uri: url, encoding: null })
                    .then((buffer) => fs.writeFileSync(path, buffer))
                    .catch((error) => {
                        console.log(error);
                        hasError = true;
                    });

                if (hasError) continue;

                streams.push(fs.createReadStream(path).on('end', async () => {
                    if (fs.existsSync(path)) {
                        fs.unlink(path, (err) => {
                            if (err) return console.log(err);
                            console.log(`Deleted file: ${path}`);
                        });
                    }
                }));

                counter += 1;
            }

            api.sendMessage('⏱️ | Almost There.....', event.threadID, event.messageID);

            let msg = {
                body: `Here's your images searched\n\nSource: Google Image`,
                attachment: streams
            };

            api.sendMessage(msg, event.threadID, event.messageID);
        } else if (videoRegex.test(content)) {
            // Video search functionality
            api.sendMessage('🎬 | AI is searching for a video related to your query. Please wait...', event.threadID);

            const videoQuery = content.replace(videoRegex, '').trim();

            const res = await usetube.searchVideo(videoQuery);
            const randomIndex = Math.floor(Math.random() * res.videos.length);
            const selectedVideo = res.videos[randomIndex];

            const stream = ytdl(`https://www.youtube.com/watch?v=${selectedVideo.id}`, {
                filter: 'audioandvideo',
                quality: 'highestvideo',
                format: 'mp4'
            });

            const path = `${__dirname}/cache/video.mp4`;
            stream.pipe(fs.createWriteStream(path)).on('finish', () => {
                const message = {
                    body: `Here's a video related to your query! 🎬\nTitle: ${selectedVideo.title}\nEnjoy watching! 🥰`,
                    attachment: fs.createReadStream(path)
                };

                api.sendMessage(message, event.threadID, () => fs.unlinkSync(path));
            });
        } else {
            // AI-related functionality
   try {
                const apiUrl = `https://cc-project-apis-jonell-magallanes.onrender.com/api/ai?content=${content}`;
                api.sendMessage('🔍 | AI is searching for your answer. Please wait...', event.threadID, event.messageID);

                const response = await axios.get(apiUrl);
                const { content: aiResponse, requestCount } = response.data;

                api.sendMessage(`${aiResponse}\n\n📝 Request Count: ${requestCount}`, event.threadID, event.messageID);
            } catch (error) {
                console.error(error);
                api.sendMessage('An error occurred while processing your request.', event.threadID);
            }
        }
    } catch (error) {
        console.error(error);
        api.sendMessage('An error occurred while processing your request.', event.threadID);
    }
};
