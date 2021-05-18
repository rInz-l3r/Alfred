const fetch = require("node-fetch");

musicQueue = [];
isPlaying = false;
connection = false;
dispatcher = false;

// entry point to playing audio
async function play(message){
    if (isPlaying){
        trackName = await getTrackName(message.content)
        musicQueue.push(message);
        message.channel.send(`Adding ${trackName} to the queue.`);
    } else {
        connection = await message.member.voice.channel.join();
        await playTrack(message, connection, await download(message.content))
    };
    return true;
    
}

// stopping all music, clearing queue.
async function stop(message){
    musicQueue = [];
    connection.disconnect();
    isPlaying = false;
    message.channel.send("Queue Cleared.");
};

// skipping track, calling next track
async function skip(message){
    nextTrack(message, connection);
};

// pause track
async function pause(message){
    if (dispatcher){
        dispatcher.pause();
    }
};

// resume track
async function resume(message){
    if (dispatcher){
        dispatcher.resume();
    }
};

// download track using python package
async function download(content){
    resp = await fetch("http://localhost:8080/alfred/track", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"link": content},
        )});
    return resp;
};

// get track name
async function getTrackName(content){
    resp = await fetch("http://localhost:8080/alfred/trackname", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"link": content},
        )});
    respJson = await resp.json();
    return respJson['track'];
};

// connect to message originating guild channel, play if 200 status from
// python downloader.
async function playTrack(message, connection, resp) {
    console.log(process.cwd())
    if (resp.status == 200) {
        respJson = await resp.json()
        dispatcher = connection.play('../track');
        dispatcher.on('start', () => {
            message.channel.send(`Playing ${respJson['track']}`);
            console.log('Music is Playing');
            isPlaying = true;
        });
        dispatcher.on('finish', async () => {
            await nextTrack(message, connection)
        });
    } else {
        dispatcher = connection.play('audio/error.mp3')
        dispatcher.on('start', () => {
            console.log('Error');
            isPlaying = true;
        });
        dispatcher.on('finish', async () => {
            await nextTrack(message, connection)
        });
    };
};

// check music queue length, if there is another track to play download
// it and play it.
async function nextTrack(message, connection) {
    if (musicQueue.length != 0) {
        console.log('songs exist in queue');
        let nextTrack = musicQueue[0];
        musicQueue.splice(0,1);
        await playTrack(message, connection, await download(nextTrack.content));
    } else {
        console.log('queue is clear');
        isPlaying = false;
        connection.disconnect();
    };
};

module.exports = {play, stop, skip, pause, resume};