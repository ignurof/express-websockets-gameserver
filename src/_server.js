// Required dependency
const express = require("express");
const WebSocket = require('ws');
const gdCom = require('@gd-com/utils');
const { v4 } = require('uuid');

// Internal dependency
const playerlist = require("./playerlist.js");

// Application
let app = express();
const PORT = 9090;

// Hook up the app.listen to a const so I can hook into it with socket listen aka io
const server = app.listen(PORT, async() => {
    console.log("Server listening on port: " + PORT);
});

// Hook up websocket server to express listen
// Can be usedin routes AKA channels in websocket lingo
const wss = new WebSocket.Server({server: server});

let serverData = {
	"network": {
        "func": "methodName",
        "data": "dataObjHere"
    },
	"movement": {
        "data": playerlist.get(),
        "x": 0,
        "y": 0
    }
}

wss.on('connection', socket => {
    let uuid = v4();
    console.log(`[${uuid}] Connected`);
    // add client to list
    playerlist.add(uuid);
    // Update server obj to send. Here I set the server function to send back to client on its first connection to the server
    serverData.network.func = "clientConnect";
    serverData.network.data = uuid;
    // Send UUID for client id
    let firstBuffer = gdCom.putVar(serverData);
    socket.send(firstBuffer);

    // Tell all clients to spawn in the new player
    serverData.network.func = "spawnPlayers";
    serverData.network.data = playerlist.get();
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(gdCom.putVar(serverData));
            console.log("Spawning in new player on client");
        }
    });
    serverData.network.func = "reset";

    // When server recieve message from client (socket), run the callback
    socket.on('message', (message) => {
        const recieveBuff = Buffer.from(message);
        const recieve = gdCom.getVar(recieveBuff);
        console.log(recieve.value);

        // Recieve movement positions from client, send updates to other clients
        if(recieve.value.network.func === "clientPos"){
            // Update player client positions
            playerlist.update(
                recieve.value.id, 
                recieve.value.movement.x, 
                recieve.value.movement.y, 
                recieve.value.movement.anim, 
                recieve.value.movement.flipH, 
                recieve.value.movement.attacking
            );

            // Refresh clients movement
            serverData.movement.data = playerlist.get();
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(gdCom.putVar(serverData));
                    console.log("Client pos updated");
                }
            });
        }

        if(recieve.value.network.func === "attack"){
            playerlist.attack(recieve.value.network.data);
            // Enable attacking on the client that started attacking
            playerlist.update(
                recieve.value.id, 
                recieve.value.movement.x, 
                recieve.value.movement.y, 
                recieve.value.movement.anim, 
                recieve.value.movement.flipH, 
                recieve.value.movement.attacking
            );

            // Refresh clients
            serverData.movement.data = playerlist.get();
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(gdCom.putVar(serverData));
                    console.log("Client pos updated");
                }
            });

            // Disable attacking on the client that started attacking
            playerlist.update(
                recieve.value.id, 
                recieve.value.movement.x, 
                recieve.value.movement.y, 
                recieve.value.movement.anim, 
                recieve.value.movement.flipH, 
                false // attack
            );

            // Respawn player if it died
            if(playerlist.isDead(recieve.value.network.data)){
                playerlist.heal(recieve.value.network.data);

                // Refresh clients
                serverData.movement.data = playerlist.get();
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(gdCom.putVar(serverData));
                        console.log("Client pos updated");
                    }
                });
            }
        }

        //const buffer = gdCom.putVar(serverData);
        //socket.send(buffer);
    });

    // On client error
    socket.on("error", (err) => {
        console.error(err);
    })

    // When client disconnects
    socket.on("close", (code, reason) => {
        console.log(code, reason);
    })
})