
class ActionHandler {
    #args = ['aplay', 'astop', 'askip', 'apause', 'aresume'];
    
    constructor(messageContent, client){
        this.bot = client;
        this.valid = this.deconflict(messageContent);
    }


    deconflict(messageContent){
        let count = 0;
        for (const e in this.#args){
            if (messageContent.includes(this.#args[e])){
                count++                
            }

        }
        if (count > 1){
            return false;
        }
        return true;
    }

    handle(messageContent){
        if (messageContent.includes('aplay')){
            return 'play'
        }
        if (messageContent.includes('astop')){
            return 'stop'
        }

        if (messageContent.includes('askip')){
            return 'skip'
        }

        if (messageContent.includes('apause')){
            return 'pause'
        }

        if (messageContent.includes('aresume')){
            return 'resume'
        }
    }
};

module.exports = ActionHandler;