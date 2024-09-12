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

const app = require("express")();
app.get("/", (req, res)=>res.sendFile(__dirname + "/index.html"))
app.listen(9091, ()=>console.log("Listening on http port 9091"))

const websocketServer = require("websocket").server
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening... on 9090"))

//hashmap
const clients = {};
const games = {};

const wsServer = new websocketServer({
    "httpServer": httpServer
})
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
            const gameId = generateUUID();
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
            //loop through all clients and tell them that people have joined
            //game.clients.forEach((v, k) => {
            //    console.log(v);
            //    clients[v.clientId].connection.send(JSON.stringify(payLoad));
            //})

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