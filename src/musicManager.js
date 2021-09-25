const fetch = require("node-fetch");

musicQueue = [];
isPlaying = false;
connection = false;
dispatcher = false;

async function verifyAvailable(identifier, managerPath){
    console.log(" ## I am free for jobs...")
    let resp = await fetch(managerPath+"/manager/available", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "instance": identifier
            },
        )});
    if (resp.status === 200){
        return true;
    };
    return false;
}

// entry point to playing audio
async function play(message, identifer, managerPath){
    if (isPlaying){
        trackName = await getTrackName(message.content)
        musicQueue.push(message);
        message.channel.send(`Adding ${trackName} to the queue.`);
        console.log(`Adding ${trackName} to the queue.`)
    } else {
        connection = await message.member.voice.channel.join();
        await playTrack(message, connection, identifer, managerPath, await download(message.content))
    };
    return true;
    
}

// stopping all music, clearing queue.
async function stop(message, identifier, managerPath){
    musicQueue = [];
    connection.disconnect();
    isPlaying = false;
    message.channel.send(`Alfred#${identifier} disconnecting...`);
    console.log("Queue Cleared.")
    await verifyAvailable(identifier, managerPath)
};

// skipping track, calling next track
async function skip(message, identifier){
    nextTrack(message, connection, identifier);
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
async function playTrack(message, connection, identifier, managerPath, resp) {
    console.log(process.cwd())
    if (resp.status == 200) {
        respJson = await resp.json()
        track = respJson['track']
        console.log(`playing ${track}`)
        dispatcher = connection.play(`music/${track}`,  {bitrate: 256000 /* 192kbps */});
        dispatcher.on('start', () => {
            message.channel.send(`Alfred#${identifier} playing ${respJson['track']}`);
            console.log('Music is Playing');
            isPlaying = true;
        });
        dispatcher.on('finish', async () => {
            await nextTrack(message, connection, identifier, managerPath)
        });
    } else {
        dispatcher = connection.play('audio/error.mp3')
        dispatcher.on('start', () => {
            console.log('Error');
            isPlaying = true;
        });
        dispatcher.on('finish', async () => {
            await nextTrack(message, connection, identifier, managerPath)
        });
    };
};

// check music queue length, if there is another track to play download
// it and play it.
async function nextTrack(message, connection, identifier, managerPath) {
    if (musicQueue.length != 0) {
        console.log('songs exist in queue');
        let nextTrack = musicQueue[0];
        musicQueue.splice(0,1);
        // !!! Need to fix to actually display track name !!!
        message.channel.send(`Alfred#${identifier} attempting to fetch track in queue.`);
        await playTrack(message, connection, identifier, managerPath, await download(nextTrack.content));
    } else {
        console.log('queue is clear');
        stop(message, identifier, managerPath)
    };
};



module.exports = {play, stop, skip, pause, resume};