import 'phaser';
import config from '../config/config.js';

export default class LoserScene extends Phaser.Scene {
    constructor() {
        super('Loser');
    }

    preload() {
        this.load.image('sorry', 'assets/sorry.png');
    }
    
    create() {
        gameOverSound.play();
        const win = this.add.image(config.width/2, config.height/2, 'sorry');
        win.setInteractive();
        this.time.delayedCall(3000, () => {
            this.scene.start('Credits');
        }, [], this);
    }
};