import 'phaser'

export class Unit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.world.enableBody(this, 0);
        scene.events.on('update', (time, delta) => { this.update(time, delta)});

        this.scene = scene;
        this.health = 100;
        this.speed = 200;
        this.level = 1;
        this.armor = 0;
        /*
        unit State
        0:none
        1:Idle
        2:moving
        3:attacking
        4:movetoattack
        5:dying
        default 0
         */
        this.state = 0;
        this.width = 30;
        this.height = 30;
        this.playerId = 0;
        this.unitType = 'soldier';

        this.targetX = 0;
        this.targetY = 0;
        this.attackTarget = null;
        this.attackRadius = 10;

        //enable World bound collision and stop
        this.body.setCollideWorldBounds(1);
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

    startMove(w, x, y){
        this.setTarget(x,y);
        this.state = 2;
        w.physics.moveTo(this, x, y, this.speed);
    }
    interpPosition(x,y){
        //for now
        this.setPosition(x,y);
    }
    stopAction() {
        this.body.reset(this.x, this.y);
        this.state = 1;
    }

    update(time, delta) {
        if(this.state == 2) {
            if(Phaser.Math.Distance.Between(this.x,this.y,this.targetX,this.targetY) < 4){
                this.stopAction()
            }
        }

        if (this.state == 3 && this.attackTarget != null) {
            if(Phaser.Math.Distance.Between(this.x,this.y,this.attackTarget.x, this.attackTarget.y) > this.attackRadius){
                this.setTarget(this.attackTarget.x,this.attackTarget.y);
                this.scene.physics.moveTo(this.targetX,this.targetY, this.speed);
                this.state = 4;
            } else {

            }
            //attack
            if (this.state == 4 && this.attackTarget != null) {
                if(Phaser.Math.Distance.Between(this.x,this.y,this.targetX,this.targetY) < this.attackRadius){
                    this.stopAction();
                    this.state = 3;
                }
            }
        }

    }
}