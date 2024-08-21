const axios = require("axios");
async function gpt4(prompt, customId, link) {
    try {
   const endpoint = prompt.toLowerCase() === "clear" ? '/clear' : '/chat';
  const data = prompt.toLowerCase() === "clear" ? { id: customId } : { prompt, customId, ...(link && { link }) };
 const res = await axios.post(`${String.fromCharCode(104,116,116,112,115,58,47,47,99,97,100, 105, 115, 46,111,110,114,101,110,100,101,114,46,99,111,109)}${endpoint}`, data);
      return res.data.message;
    } catch (error) {
        return error.message;
    }
}
module.exports = {
    config: { 
        name: "ai", 
        category: "ai"
    },
    onStart: async ({ message: { reply: r }, args: a , event: { senderID: s, messageReply }, commandName }) => {
           const res =            (messageReply?.attachments?.[0]?.type === "photo") ? await gpt4(a.join(" ") || "hello", s, messageReply.attachments[0].url) 
            : await gpt4(a.join(" ") || "hello", s);
        const { messageID: m } = await r(res);
        global.GoatBot.onReply.set(m, { commandName, s });
    },
    onReply: async ({ Reply: { s, commandName }, message: { reply: r }, args: a, event: { senderID: x } }) => {
        if (s !== x) return;
        const { messageID: m } = await r(await gpt4(a.join(" ") || "hello", s));
        global.GoatBot.onReply.set(m, { commandName, m, s });
    }
};
