const fetch = require("node-fetch");
const discord = require('discord.js');
const fs = require('fs');
const { connect } = require("http2");
const client = new discord.Client()
const um = require("./user_management");

let isPlaying = false
let musicQueue = []
let userList = []
let connection = ''
let dispatcher = ''


client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('T h i n g s', { type: 'LISTENING' });
    userList = um.getUsers(client)
    console.log(userList)
});

client.on('voiceStateUpdate', function(oldMember, newMember){
    if (newMember.channelID != null && userList.includes(newMember.id) === false) {
        console.log(`${client.users.cache.get(newMember.id).username} has joined`)
        userList.push(newMember.id);
    } else if (newMember.channelID === null) {
        console.log(`${client.users.cache.get(newMember.id).username} has left`)
        userList.pop(newMember.id);
    }
    console.log(userList)
});

client.on('message', async message => {
    if (message.content.includes('aplay')) {
        if (isPlaying == false) {
            resp = await getTrack(message)
            if (resp.status == 200) {
                if (message.member.voice.channel) {
                    const respJson = await resp.json();
                    message.channel.send(`Playing ${respJson['track']}`);
                    connection = await message.member.voice.channel.join();
                    await playTrack(message, connection, resp);
                };
            } else {
                connection = await message.member.voice.channel.join();
                await playTrack(message, connection, resp);
            };
        } else {
            trackNameResp = await trackName(message);
            if (trackNameResp.status == 200) {
                musicQueue.push(message);
                const trackNameRespJson = await resp.json();
                message.channel.send(`Queued ${trackNameRespJson['track']}`)
                console.log('new song added to queue');
            } else {
                musicQueue.push(message)
            }
            
        }
    }
    if (message.content.includes('astop')) {
        if (isPlaying != false) {
            isPlaying = false
            musicQueue = []
            connection.disconnect();
        };
    }
    if (message.content.includes('askip')) {
        if (isPlaying != false && musicQueue.length != 0) {
            console.log('skipping current track')
            let nextTrack = musicQueue[0];
            console.log(nextTrack);
            musicQueue.splice(0,1);
            await getTrack(nextTrack);
            await playTrack(message, connection, 200);
        };
    }
    if (message.content.includes('apause')) {
        if (dispatcher != '') {
            console.log('pausing track');
            dispatcher.pause();
            isPlaying = false;
        };
    };
    if (message.content.includes('aresume')) {
        if (dispatcher != '') {
            console.log('resuming track current track');
            dispatcher.resume();
            isPlaying = true;
        };
    };
    if (message.content.includes('asearch')) {
        message.channel.send('Searching for tracks.')
        resp = await searchArtist(message);
        const trackListJson = await resp.json();
        message.channel.send(`Found ${trackListJson['track_list'].length} tracks.`);
        if (isPlaying == false) {
            getTrackResp = await getTrackURL(trackListJson['track_list'][0]);
            if (getTrackResp.status == 200) {
                if (message.member.voice.channel) {
                    let trackName = await trackNameURL(trackListJson['track_list'][0])
                    let trackNameJson = await trackName.json();
                    message.channel.send(`Playing ${trackNameJson['track']}`);
                    connection = await message.member.voice.channel.join();
                    await playTrack(message, connection);
                    isPlaying == true
                    let queueList = trackListJson['track_list'];
                    queueList.shift()
                    for (element of queueList) {
                        musicQueue.push(element);
                    };
                    message.channel.send(`Queued ${queueList.length} songs`);
                    console.log(musicQueue.length);
                    console.log(musicQueue);
                };
            }
        } else {
            let queueList = trackListJson['track_list'];
            for (element of queueList) {
                musicQueue.push(element);
                };
            message.channel.send(`Queued ${trackListJson['track_list'].length} tracks.`);
            message.channel.send(`Queue length ${musicQueue.length}.`)
        };
    };
});

async function getTrack(message) {
    if (typeof(message) == "object") {
        query = message.content;
    } else {
        query = message;
    };
    resp = await fetch("http://localhost:8080/alfred/track", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"link": query},
        )});
    return resp
};

async function getTrackURL(url) {
    resp = await fetch("http://localhost:8080/alfred/track", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"link": url},
        )});
    return resp
};

async function trackName(message) {
    resp = await fetch("http://localhost:8080/alfred/trackname", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"link": message.content},
        )});
    return resp
};

async function trackNameURL(url) {
    resp = await fetch("http://localhost:8080/alfred/trackname", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"link": url},
        )});
    return resp
};

async function searchArtist(message) {
    resp = await fetch("http://localhost:8080/alfred/search", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"link": message.content},
        )});
    return resp
};


async function playTrack(message, connection, resp) {
    if (resp.status == 200) {
        dispatcher = connection.play('track');
        dispatcher.on('start', () => {
            console.log('Music is Playing');
            isPlaying = true;
        });
        dispatcher.on('finish', async () => {
            await nextTrack(message, connection)
        });
    } else {
        dispatcher = connection.play('error.mp3')
        dispatcher.on('start', () => {
            console.log('Error');
            isPlaying = true;
        });
        dispatcher.on('finish', async () => {
            await nextTrack(message, connection)
        });
    };
};


async function nextTrack(message, connection) {
    if (musicQueue.length != 0) {
        console.log('songs exist in queue');
        let nextTrack = musicQueue[0];
        musicQueue.splice(0,1);
        resp = await getTrack(nextTrack);
        await playTrack(message, connection, resp);
    } else {
        console.log('queue is clear');
        isPlaying = false;
        connection.disconnect();
    }
};

client.login(process.env['ALFRED_TEST']);