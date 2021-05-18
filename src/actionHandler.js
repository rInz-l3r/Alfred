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
                this.handle(message);
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
    handle(message){
        if (message.content.includes('aplay')){
            this.musicManager.play(message)
        };
        if (message.content.includes('astop')){
            this.musicManager.stop(message)
        };

        if (message.content.includes('askip')){
            this.musicManager.skip(message);
        };

        if (message.content.includes('apause')){
            this.musicManager.pause();
        };

        if (message.content.includes('aresume')){
            this.musicManager.resume();
        };
    };
};

module.exports = ActionHandler;