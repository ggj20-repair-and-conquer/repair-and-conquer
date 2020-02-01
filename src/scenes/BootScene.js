import 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.audio('backgroundSound', 'assets/sounds/menu_music.mp3');
        this.load.audio('clickSound', 'assets/sounds/click.mp3');    
        this.load.audio('victorySound', 'assets/sounds/winning.wav');    
        this.load.audio('gameOverSound', 'assets/sounds/game_over.wav');    
    }

    create() {
        backgroundSound = this.sound.add('backgroundSound');
        clickSound = this.sound.add('clickSound');
        victorySound = this.sound.add('victorySound');
        gameOverSound = this.sound.add('gameOverSound');
        backgroundSound.play();

        this.time.delayedCall(100, () => {
            this.scene.start('Menu');
        }, [], this);
    }
};