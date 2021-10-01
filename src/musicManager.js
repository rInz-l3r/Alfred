const fetch = require("node-fetch");
const { v4: uuidv4 } = require('uuid');

class MusicManager {
    #guild = '';
    #id = '';
    #musicQueue = [];
    #isPlaying = false;
    #connection = false;
    #dispacher = false;

    constructor(guild, message) {
        this.#guild = guild;
        this.#id = uuidv4().split('-')[0]
        this.sendInitial(message)
    }

    getGuild(){
        return this.#guild;
    }

    getID(){
        return this.#id;
    }

    sendInitial(message) {
        message.channel.send(`Alfred#${this.#id} ALPHA has been created!`);
    }

    // entry point to playing audio
    async play(message){
        if (this.#isPlaying){
            let trackName = await this.getTrackName(message.content)
            this.#musicQueue.push(message);
            message.channel.send(`Adding ${trackName} to the queue.`);
            console.log(`Adding ${trackName} to the queue.`)
        } else {
            this.#connection = await message.member.voice.channel.join();
            console.log(`connection ${this.#connection}`)
            await this.playTrack(message, await this.download(message.content))
        };
        return true;
        
    }

    // stopping all music, clearing queue.
    async stop(){
        this.#musicQueue = [];
        this.#connection.disconnect();
        this.#isPlaying = false;
        console.log("Queue Cleared.")
    };

    // skipping track, calling next track
    async skip(message){
        await this.nextTrack(message);
    };

    // pause track
    async pause(){
        if (this.#dispacher){
            this.#dispacher.pause();
        }
    };

    // resume track
    async resume(){
        if (this.#dispacher){
            this.#dispacher.resume(true);
        }
    };

    // download track using python package
    async download(content){
        let resp = await fetch("http://localhost:8080/alfred/track", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"link": content},
            )});
        return resp;
    };

    // get track name
    async getTrackName(content){
        let resp = await fetch("http://localhost:8080/alfred/trackname", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"link": content},
            )});
        let respJson = await resp.json();
        return respJson['track'];
    };

    // connect to message originating guild channel, play if 200 status from
    // python downloader.
    async playTrack(message, resp) {
        console.log(process.cwd())
        console.log(`Resp from server is ${resp.status}`)
        if (resp.status == 200) {
            
            let respJson = await resp.json()
            let track = respJson['track']
            console.log(`playing ${track}`)
            this.#dispacher = this.#connection.play(`src/music/${track}`,  {bitrate: 256000 /* 192kbps */});
            this.#dispacher.on('start', () => {
                message.channel.send(`Alfred#${this.getID()} playing ${respJson['track']}`);
                console.log('Music is Playing');
                this.#isPlaying = true;
            });
            this.#dispacher.on('finish', async () => {
                await this.nextTrack(message)
            });
        } else {
            this.#dispacher = this.#connection.play('src/audio/error.mp3')
            this.#dispacher.on('start', () => {
                console.log('Error');
                this.#isPlaying = true;
            });
            this.#dispacher.on('finish', async () => {
                await this.nextTrack(message)
            });
        };
    };

    // check music queue length, if there is another track to play download
    // it and play it.
    async nextTrack(message) {
        if (this.#musicQueue.length != 0) {
            console.log('songs exist in queue');
            let nextTrack = this.#musicQueue[0];
            this.#musicQueue.splice(0,1);
            // !!! Need to fix to actually display track name !!!
            message.channel.send(`Alfred#${this.getID()} attempting to fetch track in queue.`);
            await this.playTrack(message, await this.download(nextTrack.content));
        } else {
            console.log('queue is clear');
            this.stop(message)
        };
    };

    async handle(message){
        if (message.content.includes('aplay')){
            this.play(message);
        };
        if (message.content.includes('astop')){
            this.stop(message);
        };

        if (message.content.includes('askip')){
            this.skip(message);
        };

        if (message.content.includes('apause')){
            this.pause(message);
        };

        if (message.content.includes('aresume')){
            this.resume(message);
        };
    }


};

module.exports = MusicManager;