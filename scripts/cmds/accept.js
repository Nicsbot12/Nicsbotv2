const moment = require("moment-timezone");

let autoAccept = true;

module.exports = {
  config: {
    name: "accept",
    aliases: ["accept"],
    version: "1.0",
    author: "Jm Labaco",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Make friends via Facebook Account."
    },
    longDescription: {
      en: "Make friends via Facebook Account."
    },
    category: "admin",
    guide: {
      en: "{p}accept "
    }
  },
  onStart: async function ({ api, event, args }) {
    try {
      if (args.length >= 1) {
        if (args[0].toLowerCase() === "on") {
          autoAccept = true;
          return api.sendMessage("Auto-accept is now turned on.", event.threadID);
        } else if (args[0].toLowerCase() === "off") {
          autoAccept = false;
          return api.sendMessage("Auto-accept is now turned off.", event.threadID);
        }
      }

      if (autoAccept) {
        const form = {
          av: api.getCurrentUserID(),
          fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
          fb_api_caller_class: "RelayModern",
          doc_id: "4499164963466303",
          variables: JSON.stringify({ input: { scale: 3 } })
        };

        const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        const responseData = JSON.parse(response);

        if (responseData.data && responseData.data.viewer && responseData.data.viewer.friending_possibilities) {
          const listRequest = responseData.data.viewer.friending_possibilities.edges;
          const success = [];
          const failed = [];

          for (const user of listRequest) {
            const u = user.node;
            const friendRequestForm = {
              av: api.getCurrentUserID(),
              fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
              doc_id: "1472456629576662",
              variables: JSON.stringify({
                input: {
                  friend_requester_id: u.id,
                  action: "confirm"
                }
              })
            };

            try {
              const friendRequest = await api.httpPost("https://www.facebook.com/api/graphql/", friendRequestForm);
              const friendRequestData = JSON.parse(friendRequest);

              if (!friendRequestData.errors) {
                success.push(u.name);
              } else {
                failed.push(u.name);
              }
            } catch (e) {
              failed.push(u.name);
            }
          }

          api.sendMessage(`Auto-accepted ${success.length} friend requests:\n${success.join("\n")}${failed.length > 0 ? `\nFailed to accept with ${failed.length} person: ${failed.join("\n")}` : ""}`, event.threadID);
        } else {
          api.sendMessage("Unable to fetch friend requests data.", event.threadID);
        }
      } else {
        api.sendMessage("Auto-accept is currently turned off.", event.threadID);
      }
    } catch (error) {
      api.sendMessage("An error occurred while processing your request.", event.threadID);
      console.error(error);
    }
  }
};
