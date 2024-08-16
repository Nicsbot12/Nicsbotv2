const axios = require('axios');
const fs = require('fs');
 
module.exports = {
  config: {
    name: "alldl",
    version: "1.8",
    author: "ADAJAR",
    countDown: 5,
    role: 0,
    shortDescription: "download content by link",
    longDescription: "download content",
    category: "download",
    guide: "{pn} link"
  },
 
  onStart: async function ({ message, args }) {
    const link = args.join(" ");
    if (!link)
      return message.reply(`Please provide the link.`);
    else {
      let BASE_URL;
 
      if (link.includes("facebook.com")) {
        BASE_URL = `https://markdevs-last-api.onrender.com/facebook?url=${encodeURIComponent(link)}`;
      } else if (link.includes("twitter.com") || link.includes("x.com")) {
        BASE_URL = `https://apis-samir.onrender.com/twitter?url=${encodeURIComponent(link)}`;
      } else if (link.includes("tiktok.com")) {
        BASE_URL = `https://markdevs-last-api.onrender.com/api/tiktokdl?link=${encodeURIComponent(link)}`;
      } else if (link.includes("open.spotify.com")) {
        BASE_URL = `https://markdevs-last-api.onrender.com/spotify?q=${encodeURIComponent(link)}`;
 
 
        try {
          const apiResponse = await axios.get(BASE_URL);
 
          if (apiResponse.data.success) {
            const metadata = apiResponse.data.metadata;
            const audioUrl = apiResponse.data.link;
 
            message.reply("⬇ | Downloading the content for you");
 
            const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(__dirname + '/cache/spotify.mp3', Buffer.from(audioResponse.data));
 
            message.reply({
              body: `• Title: ${metadata.title}\n• Album: ${metadata.album}\n• Artist: ${metadata.artists}\n• Released: ${metadata.releaseDate}`,
              attachment: fs.createReadStream(__dirname + '/cache/spotify.mp3')
            });
          } else {
            message.reply("Sorry, the Spotify content could not be downloaded.");
          }
        } catch (error) {
          console.error(error);
          message.reply("Sorry, an error occurred while processing your request.");
        }
 
        return;
      } else if (link.includes("youtu.be") || link.includes("youtube.com")) {
        const providedURL = `https://markdevs-last-api.onrender.com/api/ytdl?url=${link}`;
        message.reply({
          attachment: await global.utils.getStreamFromURL(providedURL),
        });
        return;
      } else if (link.includes("instagram.com")) {
        BASE_URL = `https://markdevs-last-api.onrender.com/api/instadl?userUrl=${encodeURIComponent(link)}`;
      } else {
        return message.reply(`Unsupported source.`);
      }
 
      message.reply("Processing your request... Please wait.");
 
      try {
        let res = await axios.get(BASE_URL);
 
        let contentUrl;
 
        if (link.includes("facebook.com")) {
          contentUrl = res.data.links["Download High Quality"];
        } else if (link.includes("twitter.com") || link.includes("x.com")) {
          contentUrl = res.data.HD;
        } else if (link.includes("tiktok.com")) {
          contentUrl = res.data.hdplay;
        } else if (link.includes("instagram.com")) {
          contentUrl = res.downloadHref;
        }
 
        const response = {
          attachment: await global.utils.getStreamFromURL(contentUrl)
        };
 
        await message.reply(response);
      } catch (error) {
        message.reply(`Sorry, an error occurred: ${error.message}`);
      }
    }
  }
};
