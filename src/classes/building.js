import 'phaser'

export class Building extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.world.enableBody(this);
        scene.events.on('update', (time, delta) => {
            this.update(time, delta)
        });

        this.playerId = 0;
        this.buildingType = '';
    }

    addText(health) {
        this.add.text(this.x -25, this.y -25, 'Live: '+health, {font: '12px Courier', fill: '#fff'}).setBackgroundColor('#00A66E');
    }
}