import 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    preload() {
    }

    create() {
        alert('menü');
    }
};