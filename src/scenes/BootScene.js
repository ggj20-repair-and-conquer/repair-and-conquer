import 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.audio('backgroundSound', 'assets/sounds/menu_music.mp3');
        this.load.audio('clickSound', 'assets/sounds/click.mp3');
    }

    create() {
        backgroundSound = this.sound.add('backgroundSound');
        clickSound = this.sound.add('clickSound');
        backgroundSound.play();

        this.time.delayedCall(100, () => {
            this.scene.start('Game');
        }, [], this);
    }
};