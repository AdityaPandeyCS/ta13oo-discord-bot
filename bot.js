const Discord = require("discord.js");
const http = require("http");
const express = require("express");
const favicon = require("serve-favicon");
const fs = require("fs");

const bot = new Discord.Client();
const app = express();
const token = process.env.TOKEN;
const ownerID = process.env.OWNER;
const trigger = "!taboo";

app.use(favicon("icon.jpg"));
app.use(express.static("public"));
app.get("/", (request, response) => {
  console.log("Ping received from " + request.ip);
  response.send("YOO");
});

app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
  console.log("pinged");
}, 280000);

function applySwaps(original) {
  return original
    .replace(/B/g, "13")
    .replace(/S/g, "Z")
    .replace(/I/g, "1")
    .replace(/13LACK METAL TERROR1ZT/g, "13 M T");
}

function tabooify(message, post) {
  if (!message) {
    console.log("Message didn't have any text");
    return;
  }
  var reply = message.toUpperCase() + " | " + applySwaps(message.toUpperCase());
  // undo emoji transformations
  var emojis = post.guild.emojis;
  emojis.tap(emoji => {
    var upper = new RegExp(emoji.toString().toUpperCase(), "g");
    var edited = new RegExp(applySwaps(emoji.toString().toUpperCase()), "g");
    var correct = emoji.toString();
    reply = reply.replace(upper, correct).replace(edited, correct);
  });
  if (reply.length <= 2000) {
    console.log(
      "Replying to " +
        post.content +
        " by " +
        post.author.username +
        " in #" +
        post.channel.name
    );
    post.channel.send(reply);
  } else {
    console.log(post.author.username + "'s comment was too long");
    var emoji = emojis.random().toString();
    post.channel.send(emoji);
  }
}

function notifyOwner(msg) {
  bot
    .fetchUser(ownerID)
    .then(user => {
      var embed = {
        description: "[" + msg.content + "](" + msg.url + ")"
      };
      user.send({ embed });
    })
    .catch(err => {
      console.error(err);
    });
}

bot.on("ready", () => {
  console.log("Connected!");
});

bot.on("guildCreate", guild => {
  console.log("Joined " + guild.name);
  var generalChannel = guild.channels.find(
    channel => channel.name === "general"
  );
  if (generalChannel) {
    generalChannel.send("YOO");
  }
});

bot.on("message", msg => {
  if (!msg.content.includes(trigger)) {
    return;
  }
  notifyOwner(msg);

  var index = msg.content.indexOf(trigger);
  var message = msg.content.substring(index + 6);

  // remove leading spaces
  var pos = 0;
  while (message.charAt(pos) === " ") {
    pos++;
  }
  message = message.substring(pos);

  // if the message was blank, use the parent message instead
  if (!message) {
    msg.channel
      .fetchMessages({
        limit: 1,
        before: msg.id
      })
      .then(msgCollection => {
        if (msgCollection.first()) {
          tabooify(msgCollection.first().content, msg);
        } else {
          console.log("Channel was empty");
        }
      });
  } else {
    tabooify(message, msg);
  }
});

bot.on("error", err => {
  console.log(err);
});

bot.login(token);
