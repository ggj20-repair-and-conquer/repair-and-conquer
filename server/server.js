const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9000 });

let gameData = [];
let gameCounter = 0;
let playerCounter = 0;

function sendToClient(client, data) {
    client.send(JSON.stringify(data));
}

function randomNumber()
{
    return Math.floor(100000 + Math.random() * 900000);
}

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        msgObject = JSON.parse(message);

        if (msgObject.type == 'createGame') {
            gameCounter++;
            gameData.push({
                id: randomNumber() + '' + gameCounter,
                name: msgObject.name,
            });

            sendToClient(ws, {type: 'createGame', id: gameCounter});
        } else if (msgObject.type == 'joinGame') {
            playerCounter++;
            //add to gamedata
            sendToClient(ws, {type: 'joinGame', gameId: msgObject.gameId, playerId: randomNumber() + '' + playerCounter});
        }


    }).on('close', function close() {

    });
});