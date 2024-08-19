const cron = require('node-cron');
const axios = require('axios');
const prefix = '.';
const botName = 'Nics Bot';
const ownerName = 'ADAJAR';

let autopostState = true; // Keeps track of whether autopost is active
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
      api.sendMessage(verse, '8067186493364910'); // Replace '8067186493364910' with the actual thread ID
    }
  }, 20 * 60 * 1000); // Every 20 minutes
}

function stopAutopost() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
