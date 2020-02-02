import 'phaser'

export class Unit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.world.enableBody(this);
        scene.events.on('update', (time, delta) => { this.update(time, delta)});
        this.setActive(true);

        this.scene = scene;
        this.health = 100;
        this.speed = 200;
        this.level = 1;
        this.armor = 0;
        /*
         * unit States
         * 0:none
         * 1:Idle
         * 2:moving
         * 3:attacking
         * 4:movetoattack
         * 5:dying
         * default 0
         */
        this.state = 0;
        this.width = 30;
        this.height = 30;
        this.playerId = 0;
        this.unitType = 'soldier';

        this.targetX = 0;
        this.targetY = 0;
        this.attackTarget = null;
        this.attackRadius = 100;
        this.hitTimer = 0;

        //enable World bound collision and stop
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;
        scene.physics.world.on('worldbounds', () => {
            this.body.reset(this.x, this.y);
            this.state = 1;
        });
    }


    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    startMove(w, x, y) {
        this.setTarget(x, y);
        this.state = 2;
        w.physics.moveTo(this, x, y, this.speed);
        this.attackTarget = null;
    }

    startMoveToAttack(target) {
        this.state = 4;
        this.attackTarget = target;
    }

    interpPosition(x, y) {
        //for now
        this.setPosition(x, y);
    }

    stopAction() {
        this.body.reset(this.x, this.y);
        this.state = 1;
    }

    detectCollition(w) {
        this.hitTimer = 25;
        let bounceX = this.body.bounce.x;
        let bounceY = this.body.bounce.y;

        console.log("X: " + this.body.bounce.x);
        console.log("Y: " + this.body.bounce.y);

        if (Math.abs(bounceX) > Math.abs(bounceY)) {
            this.body.setBounce(0, bounceX * -1);
        } else {
            this.body.setBounce(bounceY * -1, 0);
        }
    }

    update(time, delta) {
        if(this.hitTimer > 1) {
            this.hitTimer--;
        } else if (this.hitTimer == 1 ) {
            this.body.reset(this.x, this.y);
            this.scene.physics.moveTo(this, this.targetX, this.targetY, this.speed / 2);
            this.setTarget(this.targetX, this.targetY);
            this.hitTimer = 0;
            this.state = 2;
        }

        if(this.state == 2) {
            if(Phaser.Math.Distance.Between(this.x,this.y,this.targetX,this.targetY) < 4){
                this.stopAction()
            }
        }

        if (this.state == 3 && this.attackTarget != null) {
            if (Phaser.Math.Distance.Between(this.x, this.y, this.attackTarget.x, this.attackTarget.y) > this.attackRadius) {
                this.setTarget(this.attackTarget.x, this.attackTarget.y);
                this.scene.physics.moveTo(this, this.targetX, this.targetY, this.speed);
            } else {
                this.stopAction();
                this.state = 4;
            }
        }

        //attack
        if (this.state == 4 && this.attackTarget != null) {
            console.log("do some dmgio");
        }
    }
}