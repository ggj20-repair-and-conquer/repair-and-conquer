import 'phaser';
import config from './config/config';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import CreateGameScene from './scenes/CreateGameScene';
import GameListScene from './scenes/GameListScene';
import GameLobbyScene from './scenes/GameLobbyScene';
import GameScene from './scenes/GameScene';
import CreditsScene from './scenes/CreditsScene';
import VictoryScene from './scenes/VictoryScene';


class Game extends Phaser.Game {
    constructor () {
        super(config);
        this.scene.add('Boot', BootScene);
        this.scene.add('Menu', MenuScene);
        this.scene.add('CreateGame', CreateGameScene);
        this.scene.add('GameList', GameListScene);
        this.scene.add('GameLobby', GameLobbyScene);
        this.scene.add('Game', GameScene);
        this.scene.add('Credits', CreditsScene);
        this.scene.add('Victory', VictoryScene);
        this.scene.start('Boot');
    }

    init() {
    }
}

window.game = new Game(config);