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
    },
    map: {
        hill: [
            [1, 1, 1, 1, 91, 80, 80, 92],
            [1, 1, 91, 80, 81, 108, 96, 67],
            [139, 92, 144, 120, 96, 91, 80, 81],
            [1, 142, 1, 108, 108, 144, 1, 1]
        ],
    }
};