import 'phaser';

export default class CreateGameScene extends Phaser.Scene {
    constructor() {
        super('CreateGame');
    }

    init() {
    }

    preload() {
        this.load.image('txt_background', 'assets/buttons/btn_grey.png');
    }

    createGame() {
        let text = this.keyFocus.text;
        let scene = this.scene;

        socket.sendToServer({
            type: 'createGame',
            name: text,
        });

        socket.getFromServer(function(data) {
            if (data.type == 'createGame') {
                socket.sendToServer({
                    type: 'joinGame',
                    gameId: data.id,
                    name: text,
                });
            } else if (data.type == 'joinGame') {
                socket.gameData.gameId = data.gameId;
                socket.gameData.playerId = data.playerId;
                scene.start('GameList');
            }
        });
    }

    create() {
        this.add.image(820, 400, 'txt_background');
        const btnEnterPlayer = this.add.text(700, 300, 'Player name', {
            font: '32px Courier',
            fill: '#ffffff'
        });

        this.keyFocus = this.add.text(590, 380, '', {
            font: '32px Courier',
            fill: '#ffff00'
        });

        this.input.keyboard.on('keydown', function (event) {
            if (event.keyCode === 8 && this.keyFocus.text.length > 0) {
                this.keyFocus.text = this.keyFocus.text.substr(0, this.keyFocus.text.length - 1);
            } else if (event.keyCode == 13) {
                this.createGame();
            } else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) {
                this.keyFocus.text += event.key;
            }
        }, this);
    }
};