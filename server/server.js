const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9001 });

let gameData = [];
let gameCounter = 0;

function sendToClient(client, data) {
    client.send(JSON.stringify(data));
}

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        messageObject = JSON.parse(message);

        if (messageObject.type == 'createGame') {
            gameCounter++;
            gameData.push({
                id: gameCounter,
                name: messageObject.name,
                state: "lobby",
            });
        }

        sendToClient(ws, {"ok": 1});
    }).on('close', function close() {

    });
});