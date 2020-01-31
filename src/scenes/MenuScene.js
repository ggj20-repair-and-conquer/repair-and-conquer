import 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    preload() {
    }

    create() {
        const btnCreateGame = this.add.image(400, 750, 'btn_create');
        btnCreateGame.setInteractive();
        btnCreateGame.on('pointerdown', () => {
            this.scene.start('CreateGame');
        }, this);

        const btnJoinGame = this.add.image(1300, 750, 'btn_join');
        btnJoinGame.setInteractive();
        btnJoinGame.on('pointerdown', () => {
            this.scene.start('GameList');
        }, this);
    }
};