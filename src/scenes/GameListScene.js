import 'phaser';

var games = [];
var scene = '';
var keySpace, keyBackspace, playerNameText, playerName, txtBackgroundPlayer, gridTable, btnJoin;

export default class GameListScene extends Phaser.Scene {

    constructor() {
        super('GameList')
    }

    preload() {
        this.load.image('txt_background', 'assets/buttons/txt_background.png');
        this.load.image('btn_join', 'assets/buttons/btn_join.png');
        this.load.image('btn_back', 'assets/buttons/btn_back.png');
    }

    create() {
        scene = this.scene;
        var rexUI = this.rexUI;
        // Button to go back
        const labelStyle = {
            font: '32px Courier',
            fill: '#ffffff'
        }, textStyle = {
            font: '44px Courier',
            fill: '#ffff00'
        };

        createGrid(rexUI);

        // Dummy data
        games = [
            {
                'id': '1',
                'gameName': 'game 1',
                'playerName': 'dom'
            },
            {
                'id': '2',
                'gameName': 'game 2',
                'playerName': 'dom'
            },
            {
                'id': '3',
                'gameName': 'game 3',
                'playerName': 'dom'
            },
        ];
        gridTable.setItems(games)

        socket.onmessage = function(msg) {
          var obj = JSON.parse(msg.data);

          if (obj.type == 'getGames') {
            games = []
            for (var gameKey in obj.data.games) {
              games.push({
                'id': gameKey,
                'gameName': obj.data.games[gameKey].name,
                'playerName': 'dom'
              })
            }
            gridTable.setItems(games)
          } else if (obj.type == 'joinGame') {
            gameData.playerHash = obj.data.playerhash;
            scene.start('GameLobby');
          }
        }

        socket.send(JSON.stringify({type: 'getGames'}));

        const btnBack = this.add.image(400, 750, 'btn_back');
        btnBack.setInteractive();
        btnBack.on('pointerdown', () => {
            // @todo add sound
            //   clickSound.play();
            this.scene.start('Menu');
        }, this);

        btnJoin = this.add.image(1300, 750, 'btn_join');
        btnJoin.setInteractive();
        btnJoin.on('pointerdown', () => {
            // @todo add sound
            //   clickSound.play();
            joinGame()
        }, this);

        this.add.text(265, 35, 'Select a game', labelStyle);

        txtBackgroundPlayer = this.add.image(1000, 320, 'txt_background');
        txtBackgroundPlayer.setInteractive();

        playerNameText = this.add.text(850, 230, 'Enter your name', labelStyle);

        playerName = this.add.text(850, 300, '', textStyle);

        txtBackgroundPlayer.visible = btnJoin.visible = playerName.visible = playerNameText.visible = false;

        // Get keyboard input
        keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keyBackspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);

        this.input.keyboard.on('keydown', function (event) {

            if (event.keyCode === 8 && playerName.text.length > 0) {
                playerName.text = playerName.text.substr(0, playerName.text.length - 1);
            }
            else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) {
                playerName.text += event.key;
            } else if (event.keyCode === 13) {
                joinGame()
            }

            console.log(playerName.text);

        });

    }

    update() {
    }
}

var createGrid = function (rexUI) {
    gridTable = rexUI.add.gridTable({
        x: 400,
        y: 300,
        background: rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x4e342e),
        table: {
            width: 250,
            height: 400,
            cellWidth: 250,
            cellHeight: 60,
            columns: 1,
        },
        slider: {
            track: rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x260e04),
            thumb: rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0x7b5e57),
        },
        space: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
            table: 10,
        },
        createCellContainerCallback: function (cell) {
            var scene = cell.scene,
                width = cell.width,
                height = cell.height,
                item = cell.item;
            return scene.rexUI.add.label({
                width: width,
                height: height,
                background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, 0x260e04),
                icon: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, item.color),
                text: scene.add.text(0, 0, item.gameName),
                space: {
                    icon: 10,
                    left: 15
                }
            }).setOrigin(0).layout();
        }
    }).layout()

    gridTable
        .on('cell.click', function (cellContainer, cellIndex) {
            btnJoin.visible = txtBackgroundPlayer.visible = playerName.visible = playerNameText.visible = true
            // @todo add sound
            // clickSound.play();
            gameData.gameHash = games[cellIndex].id;
        }, this)
        .on('cell.over', function (cellContainer, cellIndex) {
            cellContainer.getElement('background')
                .setStrokeStyle(1, 0xffffff)
                .setDepth(1);
        }, this)
        .on('cell.out', function (cellContainer, cellIndex) {
            cellContainer.getElement('background')
                .setStrokeStyle(2, 0x260e04)
                .setDepth(0);
        }, this);
}, joinGame = function () {
    // @todo add sound
    // clickSound.play();
    if (!playerName.text) {
        alert('Enter your name')
        return false;
    }

    let joinData = JSON.stringify({
        type: 'joinGame',
        data: {
            'identifier': gameData.gameHash,
            'name': playerName.text
        }
    });
    socket.send(joinData);
}