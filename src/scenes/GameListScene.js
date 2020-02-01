import 'phaser';

var clickedRowIndex = 0;
var scene = '';
var games = '';
var keySpace, keyBackspace, playerNameText, playerName, txtBackgroundPlayer, gridTable, btnJoin;

export default class GameListScene extends Phaser.Scene {

    constructor() {
        super('GameList')
    }

    preload() {
        this.load.image('txt_background', 'assets/buttons/btn_grey.png');
        this.load.image('btn_join', 'assets/buttons/btn_join.png');
        this.load.image('btn_back', 'assets/buttons/btn_back.png');

    }

    joinGame () {
        if (playerName.text == '') {
            return;
        }

        socket.sendToServer({
            type: 'joinGame',
            gameId: games[clickedRowIndex].id,
            playerName: playerName.text,
        });

        socket.getFromServer(function(data) {
            if (data.type == 'joinGame') {
                socket.gameData.gameId = data.gameId;
                socket.gameData.playerId = data.playerId;
                scene.start('GameLobby');
            }
        });
    }

    create() {
        scene = this.scene;
        var rexUI = this.rexUI;
        // Button to go back
        const labelStyle = {
            font: '40px Serif',
            fill: '#ffffff',
            strokeThickness: 6,
            stroke: '#000',
            fontWeight: 'bold'
        }, textStyle = {
            font: '32px Courier',
            fill: '#fff',
            strokeThickness: 6,
            stroke: '#000',
            fontWeight: 'bold'
        };

        this.createGrid(rexUI);

        socket.sendToServer({
            type: 'listGames',
        });

        socket.getFromServer(function(data) {
            if (data.type == 'listGames') {
                games = data.games;
                gridTable.setItems(data.games);
            }
        });

        const btnBack = this.add.image(500, 750, 'btn_back');
        btnBack.setInteractive();
        btnBack.on('pointerdown', () => {
            clickSound.play();
            this.scene.start('Menu');
        }, this);

        btnJoin = this.add.image(1300, 750, 'btn_join');
        btnJoin.setInteractive();
        btnJoin.on('pointerdown', () => {
            clickSound.play();;
            this.joinGame()
        }, this);

        this.add.text(265, 35, 'Select a game', labelStyle);

        txtBackgroundPlayer = this.add.image(1080, 320, 'txt_background');
        txtBackgroundPlayer.setInteractive();

        playerNameText = this.add.text(850, 230, 'Enter your name', labelStyle);
        playerName = this.add.text(850, 300, '', textStyle);
        txtBackgroundPlayer.visible = btnJoin.visible = playerName.visible = playerNameText.visible = false;

        // Get keyboard input
        keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keyBackspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
        let that = this;
        this.input.keyboard.on('keydown', function (event) {

            if (event.keyCode === 8 && playerName.text.length > 0) {
                playerName.text = playerName.text.substr(0, playerName.text.length - 1);
            }
            else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) {
                playerName.text += event.key;
            } else if (event.keyCode === 13) {
                that.joinGame()
            }
        });

    }

    createGrid(rexUI) {
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
                clickedRowIndex = cellIndex;
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
    }
}

