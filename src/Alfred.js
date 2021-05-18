const discord = require('discord.js');
const client = new discord.Client()
const ActionHandler = require("./actionHandler")


const ah = new ActionHandler(new discord.Client())