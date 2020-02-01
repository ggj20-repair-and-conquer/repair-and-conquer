
import 'phaser';

export default new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Test() {

    },

    // Updates the position of the bullet each cycle
    update: (time, delta) => {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 5000) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
});