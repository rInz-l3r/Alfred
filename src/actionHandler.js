const MusicManager = require("./musicManager")

class ActionHandler {
    #args = [
        'aplay', 
        'astop', 
        'askip', 
        'apause', 
        'aresume'
        ];

    
    // starting bot, getting musicManager
    constructor(client){
        this.musicManager = MusicManager;
        this.bot = client;
        this.bot.login(process.env['ALFRED_TEST']);
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
            if (count > 1){
                return false;
            };
            return true;
        };
        return false;
    }

    // handling messages based on content
    async handle(message){
        if (message.content.includes('aplay')){
            await this.musicManager.play(message)
        };
        if (message.content.includes('astop')){
            await this.musicManager.stop(message)
        };

        if (message.content.includes('askip')){
            await this.musicManager.skip(message);
        };

        if (message.content.includes('apause')){
            await this.musicManager.pause();
        };

        if (message.content.includes('aresume')){
            await this.musicManager.resume();
        };
    };
};

module.exports = ActionHandler;