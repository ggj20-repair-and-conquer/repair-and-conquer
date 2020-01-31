import 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
    }

    create() {
        this.time.delayedCall(100, () => {
            this.scene.start('Menu');
        }, [], this);
    }
};