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
            font: '36px Serif',
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

        const txtBackgroundPlayer = this.add.image(840, 615, 'txt_background');
        const txtPlayer = this.add.text(620, 600, '', textStyle);
        const btnEnterPlayer = this.add.text(500, 595, 'Chat:', labelStyle);

        btnEnterPlayer.setInteractive();
        btnEnterPlayer.on('pointerdown', () => {
            this.keyFocus = txtPlayer;
        }, this);

        txtBackgroundPlayer.setInteractive();
        txtBackgroundPlayer.on('pointerdown', () => {
            btnEnterPlayer.keyFocus = txtPlayer;
        }, this);

        this.add.text(310, 45, 'Players List', labelStyle);
        this.add.text(1050, 45, 'Chat Room', labelStyle);

        this.keyFocus = txtPlayer;

        this.input.keyboard.on('keydown', function (event) {
            if (event.keyCode === 8 && this.keyFocus.text.length > 0) {
                this.keyFocus.text = this.keyFocus.text.substr(0, this.keyFocus.text.length - 1);
            } else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) {
                this.keyFocus.text += event.key;
            } else if (event.keyCode == 13) {
                if (this.keyFocus.text != '') {
                    clickSound.play();
                    socket.sendToServer({
                        type: 'chat',
                        gameId: socket.gameData.gameId,
                        playerId: socket.gameData.playerId,
                        msg: this.keyFocus.text
                    });
                    this.keyFocus.text = '';
                }
            }
        }, this);

        const btnBack = this.add.image(400, 750, 'btn_back');
        btnBack.setInteractive();
        btnBack.on('pointerdown', () => {
            clickSound.play();
            clearInterval(refreshIntervalId);
            this.scene.start('CreateGame');
        }, this);

        const btnStartGame = this.add.image(1300, 750, 'btn_start');
        btnStartGame.setInteractive();
        btnStartGame.on('pointerdown', () => {
            clickSound.play();
            socket.sendToServer({
                type: 'startGame',
                gameId: socket.gameData.gameId,
            });
            clearInterval(refreshIntervalId);
        }, this);


        var gridTable = rexUI.add.gridTable({
            x: 400,
            y: 300,
            background: rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0xFFFFFF),
            table: {
                width: 250,
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
                    text: scene.add.text(0, 0, item.playerName, {font: '24px Serif', fill: '#000'}),
                    space: {
                        icon: 10,
                        left: 5
                    }
                }).setOrigin(0).layout();
            }
        }).layout()

        var gridTableChat = rexUI.add.gridTable({
            x: 1110,
            y: 309,
            background: rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0xFFFFFF),
            table: {
                width: 950,
                height: 400,
                cellWidth: 450,
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
                    text: scene.add.text(0, 0, item.msg, {font: '24px Serif', fill: '#000'}),
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

