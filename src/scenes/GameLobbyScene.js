import 'phaser';

export default class GameLobbyScene extends Phaser.Scene {
    constructor() {
        super('GameLobby')
    }
    preload() {
        this.load.image('txt_background', 'assets/buttons/btn_grey.png');
        this.load.image('btn_back', 'assets/buttons/btn_back.png');
        this.load.image('btn_start', 'assets/buttons/btn_start.png');
    }
    create() {
        var rexUI = this.rexUI;

        const labelStyle = {
            font: '32px Courier',
            fill: '#ffffff'
        }, textStyle = {
            font: '32px Courier',
            fill: '#ffff00'
        };

        const txtBackgroundPlayer = this.add.image(840, 580, 'txt_background');
        const txtPlayer = this.add.text(620, 565, '', textStyle);
        const btnEnterPlayer = this.add.text(465, 560, 'Chat:', labelStyle);

        btnEnterPlayer.setInteractive();
        btnEnterPlayer.on('pointerdown', () => {
            this.keyFocus = txtPlayer;
        }, this);

        txtBackgroundPlayer.setInteractive();
        txtBackgroundPlayer.on('pointerdown', () => {
            btnEnterPlayer.keyFocus = txtPlayer;
        }, this);

        this.add.text(250, 45, 'Player-List', labelStyle);
        this.add.text(590, 45, 'Chat Room', labelStyle);

        this.keyFocus = txtPlayer;

        this.input.keyboard.on('keydown', function (event) {
            if (event.keyCode === 8 && this.keyFocus.text.length > 0) {
                this.keyFocus.text = this.keyFocus.text.substr(0, this.keyFocus.text.length - 1);
            } else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) {
                this.keyFocus.text += event.key;
            } else if (event.keyCode == 13) {
                socket.sendToServer({
                    type: 'chat',
                    gameId: socket.gameData.gameId,
                    playerId: socket.gameData.playerId,
                    msg: this.keyFocus.text
                });
                this.keyFocus.text = '';
            }
        }, this);

        const btnBack = this.add.image(400, 750, 'btn_back');
        btnBack.setInteractive();
        btnBack.on('pointerdown', () => {
            clearInterval(refreshIntervalId);
            this.scene.start('Menu');
        }, this);

        const btnStartGame = this.add.image(1300, 750, 'btn_start');
        btnStartGame.setInteractive();
        btnStartGame.on('pointerdown', () => {
            socket.sendToServer({
                type: 'startGame',
                gameId: socket.gameData.gameId,
            });
            clearInterval(refreshIntervalId);
        }, this);


        var gridTable = rexUI.add.gridTable({
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
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
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
                    text: scene.add.text(0, 0, item.playerName),
                    space: {
                        icon: 10,
                        left: 15
                    }
                }).setOrigin(0).layout();
            }
        }).layout()
        gridTable.on('cell.over', function (cellContainer, cellIndex) {
            cellContainer.getElement('background')
                .setStrokeStyle(1, 0xffffff)
                .setDepth(1);
        }, this).on('cell.out', function (cellContainer, cellIndex) {
            cellContainer.getElement('background')
                .setStrokeStyle(2, 0x260e04)
                .setDepth(0);
        }, this);

        var gridTableChat = rexUI.add.gridTable({
            x: 850,
            y: 309,
            background: rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x4e342e),
            table: {
                width: 450,
                height: 400,
                cellWidth: 450,
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
                    text: scene.add.text(0, 0, item.msg),
                    space: {
                        icon: 10,
                        left: 15
                    }
                }).setOrigin(0).layout();
            }
        }).layout();

        var refreshIntervalId = setInterval(function(){
            socket.sendToServer({
                type: 'getLobby',
                gameId: socket.gameData.gameId,
            });}, 1000);

        socket.sendToServer({
            type: 'getLobby',
            gameId: socket.gameData.gameId,
        });

        let scene = this.scene;

        socket.getFromServer(function(data) {
            if (data.type == 'getLobby') {
                gridTable.setItems(data.players);
                gridTableChat.setItems(data.chat);
            } else if (data.type == 'startGame') {
                scene.start('Game');
            }
        });
    }
}

