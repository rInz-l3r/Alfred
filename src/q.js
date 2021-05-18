const discord = require('discord.js');
const client = new discord.Client()
// import ActionHandler from "./actionHandler"; 
const ActionHandler = require("./actionHandler")



client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('T h i n g s', { type: 'LISTENING' });
});

client.on('message', async message => {
    const ah = new ActionHandler(message.content, client)
    if (ah.valid){
        let goal = ah.handle(message.content)
        console.log(goal)
    }
    });

client.login(process.env['ALFRED_TEST']);