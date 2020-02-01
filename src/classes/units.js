import 'phaser';

export default new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:

    // Constructor
    function gameUnit(scene) {
        Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'unit1');
        this.speed = 1;
        this.live = 100;
        this.amor = 0;
        this.attack = 15;
        this.speed = 1;
        this.setSize(50,50,true);
        this.setScale(0.2);
        this.targetX = 0;
        this.targetY = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.x = 0;
        this.y = 0;
    },

    spawn: function (unit) {
        this.setPosition(unit.x, unit.y); // Init start Position
    },

    setTarget: function (unit, target) {
        this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));
        this.targetX = target.x;
        this.targetY = target.y;

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y) {
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        } else {
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }
    },

    getX: function () {
        return this.x;
    },

    getY: function () {
        return this.y;
    },

    stopMove: function () {
      this.xSpeed = 0;
      this.ySpeed = 0;
      this.targetX = this.x;
      this.targetY = this.y;
    },

    // Updates the position of the unit each cycle
    update: function (time, delta) {

        if ((this.xSpeed > 0 && this.x < this.targetX)
            || (this.xSpeed < 0 && this.x > this.targetX)) {
            this.x += this.xSpeed * delta;
        }

        if ((this.ySpeed > 0 && this.y < this.targetY)
            || (this.ySpeed < 0 && this.y > this.targetY)) {
            this.y += this.ySpeed * delta;
        }

        if (this.live < 1) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
});