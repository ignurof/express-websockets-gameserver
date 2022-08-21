// Required dependency
const express = require("express");
const WebSocket = require('ws');
const gdCom = require('@gd-com/utils');
const { v4 } = require('uuid');

const playerlist = require("./playerlist.js");

// Server Application config
const app = express();
const PORT = 9090;

// Hook up the app.listen to a const so I can hook into it with socket listen
const server = app.listen(PORT, async() => {
    console.log("Server listening on port: " + PORT);
});

// Hook up websocket server to express listen
// Can be usedin routes AKA channels in websocket lingo
const wss = new WebSocket.Server({server: server});


let serverData = {
    "cmd": "null",
    "content": {},
};


wss.on('connection', async (socket) => {
    // Handle initial socket connection (first connect from client)
    let uuid = v4();
    //console.log(`[${uuid}] connected`);

    // Send welcome message to client
    // @gd-com/utils handles the binary serialization for Godot types
    // let welcomeMessageBuffer = gdCom.putVar(`Welcome to the server [${uuid}]`);
    // socket.send(welcomeMessageBuffer);
    serverData.cmd = "joined_server";
    serverData.content = {
        "msg": "Welcome to the server!",
        uuid,
    };
    socket.send(gdCom.putVar(serverData));

    // PlayerList represents all the active players currently joined into the server
    await playerlist.add(uuid);
    let newPlayerData = await playerlist.get(uuid);

    // Spawn Player on local client
    serverData.cmd = "spawn_local_player";
    serverData.content = {
        "msg": "Spawning local (you) player!",
        "player": newPlayerData,
    };
    socket.send(gdCom.putVar(serverData))

    // Tell connected clients about the local client
    serverData.cmd = "spawn_new_player";
    serverData.content = {
        "msg": "Spawning new network player!",
        "player": newPlayerData,
    };
    wss.clients.forEach((client) => {
        // Send to everyone but the local client
        if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(gdCom.putVar(serverData));
        }
    });

    // Spawn NetworkPlayer on local client
    serverData.cmd = "spawn_network_players";
    serverData.content = {
        "msg": "Spawning network players!",
        "players": await playerlist.getAll(),
    };
    socket.send(gdCom.putVar(serverData))

    // When server recieve message from client (socket), run the callback
    socket.on('message', (message) => {
        // Get message
        let messageBuffer = Buffer.from(message);
        let messageVariant = gdCom.getVar(messageBuffer);

        if (messageVariant.value.cmd == "position") {
            // Don't forget to update serverData for any new commands and contents
            serverData.cmd = "update_position";
            serverData.content = {
                uuid,
                "x": messageVariant.value.content.x,
                "y": messageVariant.value.content.y,
            };

            wss.clients.forEach((client) => {
                // Send to everyone but the local client
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(gdCom.putVar(serverData));
                }
            });
        }
    });

    // On client error
    socket.on("error", (err) => {
        console.error(err);
    });

    // When client disconnects
    socket.on("close", (code, reason) => {
        //console.log("Client disconnected - ", code, reason);
    });
});