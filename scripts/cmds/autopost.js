const cron = require('node-cron');
const axios = require('axios');
const prefix = '/'; // Your bot's prefix
const botName = '𝗚𝗼𝗷𝗼 | ☣️';
const ownerName = '☣️ 𝗚𝗮𝗯 𝗬𝘂';

let autopostState = false; // Keeps track of whether autopost is active
let intervalId = null; // Holds the interval ID to manage the scheduling

async function fetchRandomBibleVerse() {
  try {
    const response = await axios.get('https://bibleverseapi.com/random');
    const verse = response.data;
    return `📖 ${verse.text} — ${verse.reference}`;
  } catch (error) {
    console.error('Error fetching Bible verse:', error);
    return 'Error fetching Bible verse.';
  }
}

function startAutopost(api) {
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(async () => {
    if (autopostState) {
      const verse = await fetchRandomBibleVerse();
      api.sendMessage(verse, 'YOUR_THREAD_ID'); // Replace 'YOUR_THREAD_ID' with the actual thread ID
    }
  }, 20 * 60 * 1000); // Every 20 minutes
}

function stopAutopost() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = {
  config: {
    name: 'autopost',
    author: 'Ron Zedric Laurente', // Convert By Goatbot Zed
    role: 2,
    shortDescription: 'Automatically post Bible verses at specified intervals.',
    longDescription: 'This command allows users to toggle automatic posting of Bible verses at 20-minute intervals.',
    category: 'owner',
    guide: {
      en: '{pn}autopost [on|off]'
    }
  },

  onStart: async function ({ api, event }) {
    // Initialize the command, ensuring autopost is not started by default
    autopostState = false;
    startAutopost(api);
    api.sendMessage(`Autopost system initialized. Use ${prefix}autopost on or ${prefix}autopost off to toggle the feature.`, event.threadID);
  },

  onChat: async function ({ api, event, args }) {
    const command = args[0]?.toLowerCase();

    if (command === 'on') {
      if (autopostState) {
        return api.sendMessage('Autopost is already active.', event.threadID);
      }
      autopostState = true;
      startAutopost(api);
      api.sendMessage('Autopost has been enabled.', event.threadID);
    } else if (command === 'off') {
      if (!autopostState) {
        return api.sendMessage('Autopost is not active.', event.threadID);
      }
      autopostState = false;
      stopAutopost();
      api.sendMessage('Autopost has been disabled.', event.threadID);
    } else {
      api.sendMessage(`Invalid command. Use ${prefix}autopost on to enable or ${prefix}autopost off to disable.`, event.threadID);
    }
  }
};
