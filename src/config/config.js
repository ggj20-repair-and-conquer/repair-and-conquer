import 'phaser';
import UIPlugin from '../../plugins/rexuiplugin.min';

export default {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: 1700,
    height: 900,
    backgroundColor: '#2D3C2C',
    position: 'center',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        extend: {
        }
    },
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: UIPlugin,
            mapping: 'rexUI'
        }],
    }
};