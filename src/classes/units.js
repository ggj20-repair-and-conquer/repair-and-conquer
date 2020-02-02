import 'phaser'

export class Unit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.world.enableBody(this);
        scene.events.on('update', (time, delta) => { this.update(time, delta)});
        this.setActive(true);

        this.attackCallback = null;
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
        // Cooldown in milliseconds
        this.cooldown = 1000;
        this.currentCooldown = this.cooldown;

        //enable World bound collision and stop
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;
        scene.physics.world.on('worldbounds', () => {
            this.body.reset(this.x, this.y);
            this.state = 1;
        });

        switch(this.unitType) {
            case "soldier":
                this.speed = 50;
                break;
            case "tanke":
                this.speed = 75;
                break;
            case "aircraft":
                this.speed = 150;
                break;
            default:
                this.speed = 50;
        }
    }


    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    startMove(w, x, y) {
        this.setTarget(x, y);
        console.log("move to");
        this.state = 2;
        w.physics.moveTo(this, x, y, this.speed);
        this.attackTarget = null;
        this.calcDirectionSprite();
    }

    startMoveToAttack(target) {
        console.log("ATTACK!");
        this.state = 3;
        this.attackTarget = target;
    }

    calcDirectionSprite() {
        if (this.x == this.targetX) {
            return;
        }

        if (this.x < this.targetX) {
            // We move to the right
            this.setTexture(this.unitType + '_to_right');
        } else {
            // We move to the left
            this.setTexture(this.unitType + '_to_left');
        }
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
            this.scene.physics.moveTo(this, this.targetX, this.targetY, this.speed);
            this.calcDirectionSprite();
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
                this.calcDirectionSprite();
            } else {
                this.stopAction();
                this.state = 4;
            }
        }

        //attack
        if (this.state == 4 && this.attackTarget != null) {
            if(this.currentCooldown >= 0) {
                this.currentCooldown -= delta;
            } else {
                console.log("Bier her Bier her");
                socket.sendToServer({
                    type: 'attackBuilding',
                    gameId: socket.gameData.gameId,
                    buildingId: this.attackTarget.buildingId,
                    unitType: this.unitType
                });
                this.currentCooldown += this.cooldown;
            }
        }
    }
}