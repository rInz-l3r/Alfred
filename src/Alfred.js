const discord = require('discord.js');
const client = new discord.Client();
const ActionHandler = require("./actionHandler");
const fetch = require('node-fetch');

const ah = new ActionHandler(new discord.Client())

