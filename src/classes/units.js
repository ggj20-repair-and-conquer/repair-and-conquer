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
        this.state = 0;
        this.width = 30;
        this.height = 30;

        this.targetX = 0;
        this.targetY = 0;
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.state = 1;
    }

    update(time, delta) {

    }
}