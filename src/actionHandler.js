const MusicManager = require("./musicManager")
const fetch = require('node-fetch');

class ActionHandler {
    #multiArgs = [
        'aplay', 
        ];

    #singleArgs =[
        'astop', 
        'askip', 
        'apause', 
        'aresume'
    ]

    #managers = []

    
    // starting bot, getting musicManager
    constructor(client){
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

        // if the message doesnt come from the bot...
        if (message.author.bot != true){
            // tokenize for iteration
            let params = message.content.split(' ');

            // check the first arg to reduce iteration
            if (this.#multiArgs.includes(params[0]) || this.#singleArgs.includes(params[0])){
                // iterate through the args
                for (const p of params){
                    // if a single command
                    if (this.#singleArgs.includes(p) && params.length == 1){
                        console.log("Meets SingleArg Requirements")
                        return true;
                    }
                    // if a command that requires additional information
                    if (this.#multiArgs.includes(p) && params.length > 1) {
                        console.log("Meets MultiArg Requirements")
                        return true;
                    }
                }
            }
        } else {
            return false
        }
    }

    async createMusicManager(message){
        console.log(`Creating new MusicManager for ${message.member.guild.id}`)
        let manager = new MusicManager(message.member.guild.id, message)
        manager.handle(message);
        this.#managers.push(manager)
    }


    // handling messages based on content
    async handle(message){
        let manager = '';
        // check if there are managers
        if (this.#managers.length > 0){
            // if there are managers, check and see if there is one for the guild
            for (let i = 0; i < this.#managers.length; i++) {
                if (this.#managers[i].getGuild() == message.member.guild.id){
                    manager = this.#managers[i]
                    console.log(`${manager.getID()} is associated with ${manager.getGuild()}`)
                }
            }

            if (manager != '') {
                console.log('Sending Command!')
                manager.handle(message);
            } else {
                this.createMusicManager(message);
            };
        } else {
            this.createMusicManager(message);
        };
    };
};

module.exports = ActionHandler;