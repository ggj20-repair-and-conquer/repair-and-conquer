import 'phaser';

export default class CreateGameScene extends Phaser.Scene {
    constructor() {
        super('CreateGame');
    }

    init() {
    }

    preload() {
        this.load.image('txt_background', 'assets/buttons/btn_grey.png');
        this.load.image('btn_create', 'assets/buttons/btn_create.png');
        this.load.image('btn_back', 'assets/buttons/btn_back.png');
    }

    createGame(gameRoomText, playerNameText) {
        if (gameRoomText.text == '' || playerNameText.text == '') {
            return;
        }

        let scene = this.scene;

        socket.sendToServer({
            type: 'createGame',
            name: gameRoomText.text,
        });

        socket.getFromServer(function(data) {
            if (data.type == 'createGame') {
                socket.sendToServer({
                    type: 'joinGame',
                    gameId: data.id,
                    playerName: playerNameText.text,
                });
            } else if (data.type == 'joinGame') {
                socket.gameData.gameId = data.gameId;
                socket.gameData.playerId = data.playerId;
                scene.start('GameLobby');
            }
        });
    }

    create() {
        /*
         * game-name
         */
        const gameText = this.add.text(640, 150, 'Game room name', {
            font: '48px Serif',
            fill: '#ffffff',
            strokeThickness: 6,
            stroke: '#000',
            fontWeight: 'bold'
        });
        gameText.setInteractive();
        gameText.on('pointerdown', () => {
            this.keyFocus = gameRoomText;
        }, this);

        const gameBackground = this.add.image(820, 250, 'txt_background');
        gameBackground.setInteractive();
        gameBackground.on('pointerdown', () => {
            this.keyFocus = gameRoomText;
        }, this);

        /*
         * player-name
         */
        const playerText = this.add.text(700, 350, 'Player name', {
            font: '48px Serif',
            fill: '#ffffff',
            strokeThickness: 6,
            stroke: '#000',
            fontWeight: 'bold'
        });
        playerText.setInteractive();
        playerText.on('pointerdown', () => {
            this.keyFocus = playerNameText;
        }, this);

        const playerBackground = this.add.image(820, 450, 'txt_background')
        playerBackground.setInteractive();
        playerBackground.on('pointerdown', () => {
            this.keyFocus = playerNameText;
        }, this);

        /*
         * back button
         */
        const btnBack = this.add.image(400, 700, 'btn_back');
        btnBack.setInteractive();
        btnBack.on('pointerdown', () => {
            clickSound.play();
            this.scene.start('Menu');
        }, this);

        /*
         * create button
         */
        const btnCreate = this.add.image(1300, 700, 'btn_create');
        btnCreate.setInteractive();
        btnCreate.on('pointerdown', () => {
            clickSound.play();
            if (gameRoomText.text == '' || playerNameText.text == '') {
            	const errorText = this.add.text(700, 550, 'Please fill the inputs', {
		            font: '32px Serif',
		            fill: 'red',
		            strokeThickness: 6,
		            stroke: '#000',
		            fontWeight: 'bold'
		        });
            }
            this.createGame(gameRoomText, playerNameText);
        }, this);

        let gameRoomText = this.add.text(590, 230, '', {
            font: '32px Courier',
            fill: '#fff',
            strokeThickness: 6,
            stroke: '#000',
            fontWeight: 'bold',
            wordWrap: true
        });

        let playerNameText = this.add.text(590, 430, '', {
            font: '32px Courier',
            fill: '#fff',
            strokeThickness: 6,
            stroke: '#000',
            fontWeight: 'bold'
        });

        this.keyFocus = gameRoomText;

        this.input.keyboard.on('keydown', function (event) {
            if (event.keyCode === 8 && this.keyFocus.text.length > 0) {
                this.keyFocus.text = this.keyFocus.text.substr(0, this.keyFocus.text.length - 1);
            } else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) {
                this.keyFocus.text += event.key;
            }
        }, this);
    }
};