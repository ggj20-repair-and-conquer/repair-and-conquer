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
        this.load.image('logo', 'assets/logo.png');
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

        const logo = this.add.image(1150, 300, 'logo');
        logo.setInteractive();

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

        const btnBack = this.add.image(400, 700, 'btn_back');
        btnBack.setInteractive();
        btnBack.on('pointerdown', () => {
            clickSound.play();
            this.scene.start('Menu');
        }, this);

        btnJoin = this.add.image(1300, 700, 'btn_join');
        btnJoin.setInteractive();
        btnJoin.on('pointerdown', () => {
            clickSound.play();
            if (playerName.text == '') {
                const errorText = this.add.text(1200, 590, 'Please enter name', {
                    font: '32px Serif',
                    fill: 'red',
                    strokeThickness: 6,
                    stroke: '#000',
                    fontWeight: 'bold'
                });
            }
            this.joinGame()
        }, this);

        this.add.text(265, 60, 'Select a game', labelStyle);

        txtBackgroundPlayer = this.add.image(1300, 520, 'txt_background');
        txtBackgroundPlayer.setInteractive();

        playerNameText = this.add.text(750, 490, 'Enter your name', labelStyle);
        playerName = this.add.text(1100, 500, '', textStyle);
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
            y: 350,
            background: rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0xFFFFFF),
            table: {
                width: 300,
                height: 400,
                cellWidth: 250,
                cellHeight: 60,
                columns: 1,
            },
            slider: {
                track: rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x2D3C2C),
                thumb: rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0x576356),
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
                    background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(1, 0x2D3C2C),
                    icon: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, item.color),
                    text: scene.add.text(0, 0, item.gameName, {font: '24px Serif', fill: '#000'}),
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
                    .setStrokeStyle(1, 0x576356)
                    .setDepth(1);
            }, this)
            .on('cell.out', function (cellContainer, cellIndex) {
                cellContainer.getElement('background')
                    .setStrokeStyle(2, 0x576356)
                    .setDepth(0);
            }, this);
    }
}

