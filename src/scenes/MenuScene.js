import 'phaser';
import config from '../config/config.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

   preload() {
        this.load.image('background', 'assets/buttons/background.png');
        this.load.image('btn_create', 'assets/buttons/btn_create.png');
        this.load.image('btn_join', 'assets/buttons/btn_join.png');
        this.load.image('logo', 'assets/logo.png');
    }

    create() {
        const logo = this.add.image(config.width/2, config.height/2 - 150, 'logo');
        logo.setInteractive();

        const btnCreateGame = this.add.image(400, 700, 'btn_create');
        btnCreateGame.setInteractive();
        btnCreateGame.on('pointerdown', () => {
            this.scene.start('CreateGame');
        }, this);

        const btnJoinGame = this.add.image(1300, 700, 'btn_join');
        btnJoinGame.setInteractive();
        btnJoinGame.on('pointerdown', () => {
            this.scene.start('GameList');
        }, this);
    }
};