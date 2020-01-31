import 'phaser';
import config from './config/config';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';

class Game extends Phaser.Game {
    constructor () {
        super(config);
        this.scene.add('Boot', BootScene);
        this.scene.add('Menu', MenuScene);
        this.scene.start('Boot');
    }

    init() {
    }
}

window.game = new Game(config);