const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9000 });

let gameData = {};
let gameCounter = 0;
let playerCounter = 0;
let buildingCounter = 0;
let unitCounter = 0;

function sendToClient(client, data) {
    client.send(JSON.stringify(data));
}

function randomNumber()
{
    return Math.floor(100000 + Math.random() * 900000);
}

function randomNumberRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        let msgObject = JSON.parse(message);

        if (msgObject.type == 'createGame') {
            gameCounter++;
            let gameId = randomNumber() + '' + gameCounter;

            gameData[gameId] = {
                name: msgObject.name,
                players: {},
                units: {},
                chat: [],
                started: false,
            };

            sendToClient(ws, {type: 'createGame', id: gameId});
        } else if (msgObject.type == 'joinGame') {
            playerCounter++;
            let gameId = msgObject.gameId;
            let playerId = randomNumber() + '' + playerCounter;
            ws.playerId = playerId;
            gameData[gameId].players[playerId] = {
                name: msgObject.playerName,
                money: 1000,
                lastupdate: null,
            };
            sendToClient(ws, {type: 'joinGame', gameId: gameId, playerId: playerId});
        } else if (msgObject.type == 'listGames') {
            let games = [];

            for (let gameId in gameData) {
                if(!gameData[gameId].started) {
                    games.push({
                        'id': gameId,
                        'gameName': gameData[gameId].name,
                    });
                }
            }

            sendToClient(ws, {type: 'listGames', games: games});
        } else if (msgObject.type == 'getLobby') {
            let players = [];
            let chat = [];
            let gameId = msgObject.gameId;

            for (let playerId in gameData[gameId].players) {
                players.push({
                    'id': playerId,
                    'playerName': gameData[gameId].players[playerId].name
                })
            }

            for (let messageId in gameData[gameId].chat) {
                chat.push({
                    'msg': gameData[gameId].chat[messageId].name + ': ' + gameData[gameId].chat[messageId].msg
                });
            }

            chat.reverse();

            sendToClient(ws, {type: 'getLobby', players: players, chat: chat});
        } else if (msgObject.type == 'chat') {
            let gameId = msgObject.gameId;
            let playerId = msgObject.playerId;

            gameData[gameId].chat.push({
                'name': gameData[gameId].players[playerId].name,
                'msg': msgObject.msg
            });
        } else if (msgObject.type == 'startGame') {
            let gameId = msgObject.gameId;
            gameData[gameId].started = true;
            gameData[gameId].buildings = {};
            let localPlayerCounter = 0;

            for (let playerId in gameData[gameId].players) {
                localPlayerCounter++;
                gameData[gameId].players[playerId].lastupdate = new Date().getTime();

                const array = ["base", "barracks", "factory", "airbase"];
                array.forEach(function (buildingType, index) {
                    buildingCounter++;
                    let buildingId = randomNumber() + '' + buildingCounter;
                    let x;
                    let y;

                    if (localPlayerCounter == 1) {
                        if (index == 0) {
                            x = 200;
                            y = 200;
                        } else if (index == 1) {
                            x = 250;
                            y = 200;
                        } else if (index == 2) {
                            x = 200;
                            y = 300;
                        } else if (index == 3) {
                            x = 250;
                            y = 350;
                        }
                    } else if (localPlayerCounter == 2) {
                        if (index == 0) {
                            x = 800;
                            y = 800;
                        } else if (index == 1) {
                            x = 850;
                            y = 800;
                        } else if (index == 2) {
                            x = 800;
                            y = 900;
                        } else if (index == 3) {
                            x = 850;
                            y = 950;
                        }
                    } else if (localPlayerCounter == 3) {
                    }

                    gameData[gameId].buildings[buildingId] = {
                        x: x,
                        y: y,
                        type: buildingType,
                        playerId: playerId,
                        health: 100
                    };
                });
            }

            wss.clients.forEach(function each(client) {
                if (gameData[gameId].players[client.playerId]) {
                    sendToClient(client, {type: 'startGame'});
                }
            });
        } else if (msgObject.type == 'updateGame') {
            let gameId = msgObject.gameId;
            let playerId = msgObject.playerId;
            let currentTime = new Date().getTime();
            let delta = currentTime - gameData[gameId].players[playerId].lastupdate;
            gameData[gameId].players[playerId].lastupdate = currentTime;
            gameData[gameId].players[playerId].money += Math.round(delta / 100);

            sendToClient(
                ws,
                {
                    type: 'updateGame',
                    buildings: gameData[gameId].buildings,
                    player: {
                        money:  gameData[gameId].players[playerId].money,
                    }
                }
            );
        } else if (msgObject.type == 'initGame') {
            let gameId = msgObject.gameId;
            sendToClient(
                ws,
                {
                    type: 'initGame',
                }
            );
        } else if (msgObject.type == 'build') {
            let gameId = msgObject.gameId;
            let playerId = msgObject.playerId;
            let building = msgObject.building;
            let buildCosts = 500;

            if (gameData[gameId].players[playerId].money - buildCosts <= 0) {
                return;
            }

            unitCounter++;
            let unitId = 'A' + randomNumber() + '' + unitCounter;

            gameData[gameId].units[unitId] = {
                x: building.x,
                y: building.y,
                playerId: playerId,
                health: 100,
                type: msgObject.unit
            };

            gameData[gameId].players[playerId].money = gameData[gameId].players[playerId].money - buildCosts;

            wss.clients.forEach(function each(client) {
                if (gameData[gameId].players[client.playerId]) {
                    sendToClient(client, {type: 'updateUnits', units: gameData[gameId].units});
                }
            });
        } else if (msgObject.type == 'updateUnitPositions') {
            let gameId = msgObject.gameId;

            wss.clients.forEach(function each(client) {
                if (ws != client && gameData[gameId].players[client.playerId]) {
                    sendToClient(client, {type: 'updateUnitPositions', positions:  msgObject.positions});
                }

            });
        }
    }).on('close', function close() {

    });
});
