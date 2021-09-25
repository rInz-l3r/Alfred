const MusicManager = require("./musicManager")
const fetch = require('node-fetch');

class ActionHandler {
    #args = [
        'aplay', 
        'astop', 
        'askip', 
        'apause', 
        'aresume'
        ];

    
    // starting bot, getting musicManager
    constructor(client, identifer, IP, PORT){
        this.managerIp = IP;
        this.managerPort = PORT;
        this.identifier = identifer
        this.musicManager = MusicManager;
        this.bot = client;
        this.bot.login(process.env['ALFRED_TOKEN']);
        this.bot.once('ready', () => {
                console.log('Ready!');
            });

        this.bot.on('message', async message =>{
            if (this.deconflict(message)){
                await this.handle(message);
            };
        });
    };

    // making sure we dont have multiple commands in one message
    deconflict(message){
        let count = 0;
        // removing messages from bot
        if (message.author.bot != true) {
            for (const e in this.#args){
                if (message.content.includes(this.#args[e])){
                    count++                
                };
    
            };
        if (count = 1){
            return true
            };
        return false
        }
    }

    async verifyjob(message){
        console.log(" ## Checking job...")
        let path = this.managerIp+this.managerPort
        console.log(`Checking Path ${path}`)
        let resp = await fetch(path+"/manager/job", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "instance": this.identifier,
                "guild": message.member.guild.id},
            )});
        if (resp.status === 200){
            return true;
        }
    }


    // handling messages based on content
    async handle(message){
        let resp = await this.verifyjob(message);
        console.log(resp)
        if (resp){
            if (message.content.includes('aplay')){
                await this.musicManager.play(message, this.identifier, this.managerIp+this.managerPort);
            };
            if (message.content.includes('astop')){
                await this.musicManager.stop(message, this.identifier, this.managerIp+this.managerPort);
            };
    
            if (message.content.includes('askip')){
                await this.musicManager.skip(message, this.identifier);
            };
    
            if (message.content.includes('apause')){
                await this.musicManager.pause();
            };
    
            if (message.content.includes('aresume')){
                await this.musicManager.resume();
            };
        }
    };
};

module.exports = ActionHandler;