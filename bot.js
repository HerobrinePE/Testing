const Discord = require('discord.js');

const client = new Discord.Client();

const router = require("./router.js");



client.once('ready', () => {
    console.log('Ready!');

    router.onLoad(client);

});

client.login(process.env.DISCORD_KEY);
