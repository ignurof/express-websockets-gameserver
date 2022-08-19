// Required dependency
const express = require("express");
const WebSocket = require('ws');
const gdCom = require('@gd-com/utils');
const { v4 } = require('uuid');

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


wss.on('connection', socket => {
    // Handle initial socket connection (first connect from client)
    let uuid = v4();
    console.log(`[${uuid}] connected`);

    // Send welcome message to client
    // @gd-com/utils handles the binary serialization for Godot types
    let welcomeMessageBuffer = gdCom.putVar(`Welcome to the server [${uuid}]`);
    socket.send(welcomeMessageBuffer);
    // TODO: Send to client
    // Then just try if it works by creating a fresh Godot client, maybe using WebsocketPeer?


    // When server recieve message from client (socket), run the callback
    socket.on('message', (message) => {
        // Get message
    });

    // On client error
    socket.on("error", (err) => {
        console.error(err);
    });

    // When client disconnects
    socket.on("close", (code, reason) => {
        console.log("Client disconnected - ", code, reason);
    });
});