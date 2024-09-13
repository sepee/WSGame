const colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

const { response } = require("express");
const http = require("http");
const { client } = require("websocket");

console.log("PORT : " + process.env.PORT);
PORT =  Number(process.env.PORT);
PORT = 8080;
WS_PORT = 8080

/// express hosting

//const express = require('express')
//const webserver = express()
//
//webserver.listen(PORT, () => {
//    console.log(`Server is running on port ${PORT}`);
//});
//
//webserver.get("/", (req, res) => {
//    res.sendFile('/Client/index.html', { root: __dirname });
//});
//
//webserver.use(express.static(__dirname + "/Client/"));

/// end express hosting

const websocketServer = require("websocket").server
const httpServer = http.createServer();
httpServer.listen(WS_PORT, () => console.log("Listening on " + WS_PORT))

const wsServer = new websocketServer({
    "httpServer": httpServer
})

//hashmap
const clients = {};
const games = {};

SendClientGames = function(clientId)
{
    const payLoad = {
        "method": "gamesList",
        "games" : games
    }
    clients[clientId].connection.send(JSON.stringify(payLoad));
}


wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => console.log("closed!"))
    connection.on("message", message => {
        //I have recieved a message from the client

        const result = JSON.parse(message.utf8Data)

        // a user wants to create a new game
        if(result.method === "create"){
            const clientId = result.clientId;
            const gameId = result.gameId;
            
            games[gameId] = {
                "id": gameId,
                "clients": {}
            }
            const payLoad = {
                "method":"create",
                "game": games[gameId]
            }

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad));
            console.log("Game Created : " + gameId);

            for(let c in clients){
                SendClientGames(c);
            }
        }

        // a user wants to join a game
        if(result.method === "join"){
            const clientId = result.clientId;
            const gameId = result.gameId;
            const game = games[gameId];
            if(game.clients.length >= 8)
            {
                console.log("max players reached")
                return;
            }
            console.log("Client joined : " + clientId);
            const color = colorArray[game.clients.length]
            game.clients[clientId] = ({
                "clientId": clientId,
                "color": color,
                "x" : 0,
                "y" : 0
            })
            
            const payLoad = {
                "method": "join",
                "game": game
            }

            // loop through all players in game and notify them of a new player
            for(let c in game.clients){
                clients[c].connection.send(JSON.stringify(payLoad));
            }
        }

        if(result.method === "move"){
            game = games[result.gameId];

            game.clients[result.clientId].x = result.x;
            game.clients[result.clientId].y = result.y;

            // broadcast move to all players
            const payLoad = {
                "method": "move",
                "game": game
            }
            //loop through all clients and tell them that someone has moved
            for(let c in game.clients){
                clients[c].connection.send(JSON.stringify(payLoad));
            }
        }
    })

    // generate a new clientID
    const clientId = generateUUID()
    clients[clientId] = {
        "connection": connection
    }

    const payLoad = {
        "method": "connect",
        "clientId": clientId
    }

    //send back the client connect
    connection.send(JSON.stringify(payLoad))
    SendClientGames(clientId);
})

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}