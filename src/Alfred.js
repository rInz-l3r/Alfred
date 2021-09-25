const discord = require('discord.js');
const client = new discord.Client();
const ActionHandler = require("./actionHandler");
const fetch = require('node-fetch');
const { v1: uuidv1 } = require('uuid');

async function run(identifier) {
    IP = "http://localhost:"
    PORT = "8081"
    PATH = "/manager/child"

    let address = IP+PORT+PATH
    let body = {"instance": identifier}
    const resp = await fetch(address, {method: 'POST',
        body: JSON.stringify(body),
	    headers: {'Content-Type': 'application/json'}})
    if (resp.status === 200) {
        console.log("Manager Active!")
        const ah = new ActionHandler(new discord.Client(), identifier, IP, PORT)
    }

}

run(uuidv1())
