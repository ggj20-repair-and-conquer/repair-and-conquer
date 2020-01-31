import 'phaser';
import config from './config/config';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import GameListScene from './scenes/GameListScene';

class Game extends Phaser.Game {
    constructor () {
        super(config);
        this.scene.add('Boot', BootScene);
        this.scene.add('Menu', MenuScene);
        this.scene.add('Game', GameScene);
        this.scene.add('GameList', GameListScene);
        this.scene.start('Boot');
    }

    init() {
    }
}

window.game = new Game(config);