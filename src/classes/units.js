import 'phaser'

export class Unit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.world.enableBody(this, 0);

        this.health = 100;
        this.speed = 1;
        this.level = 1;
        this.armor = 0;
    }
}