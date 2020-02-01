import 'phaser'
import {Unit} from "../classes/units";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init() {
        this.aim = null;
        this.lockMovement = false;
        this.selector = {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            visible: false,
        };

        this.rect = null;
        this.rectGraphics = null;
        this.units = [];
        this.controlledUnits = [];
    }

    /**
     * Preload Images
     */
    preload() {
        // load images
        this.load.image("tiles", "assets/tilesets/overworld_tileset_grass.png");
        this.load.tilemapTiledJSON("map", "assets/tilemaps/map.json");
    }



    /**
     * Game Start
     */
    create() {
        // ActionKeys
        game.input.mouse.disableContextMenu();
        this.actionsKeys = this.input.keyboard.addKeys({
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        this.input.keyboard.on('keydown_SPACE', (event) => {
            this.lockMovement = !this.lockMovement;
        });
        /*
         * MAP SETTINGS
         */
        const mapScale = 2;
        const map = this.make.tilemap({ key: "map" });
        map.setCollisionByProperty({ collides: true });
        const tileset = map.addTilesetImage("grass_biome", "tiles");
        const worldLayer = map.createStaticLayer("world", tileset, 0, 0).setScale(mapScale);
        this.physics.world.setBounds(0, 0, 10000, 10000);

        /*
         * Mouse controller
         */
        this.aim = this.physics.add.sprite(600, 700, 'aim');
        this.aim.setOrigin(0.5, 0.5).setDisplaySize(15, 15).setCollideWorldBounds(true);

        this.input.on('pointermove', (pointer) => {
            this.aim.x = this.input.activePointer.worldX;
            this.aim.y = this.input.activePointer.worldY;

            if (this.selector.visible) {
                this.selector.endX = this.aim.x;
                this.selector.endY = this.aim.y;

                this.rect.setEmpty();

                this.rect.setTo(
                    this.selector.startX,
                    this.selector.startY,
                    this.selector.endX - this.selector.startX,
                    this.selector.endY - this.selector.startY
                );


                this.rectGraphics.destroy();
                this.rectGraphics = this.add.graphics();
                this.rectGraphics.fillStyle(0xffffff, 0.1);
                this.rectGraphics.lineStyle(2, 0xff0000, 1);
                this.rectGraphics.fillRectShape(this.rect);
                this.rectGraphics.strokeRectShape(this.rect);
            }
        }, this);

        /*
         * Selector for units
         */

        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.rectGraphics = this.add.graphics();
                this.controlledUnits = [];

                this.selector.startX = this.aim.x;
                this.selector.startY = this.aim.y;
                this.selector.endX = 1;
                this.selector.endY = 1;
                this.selector.visible = true;

                this.rect = new Phaser.Geom.Rectangle(
                    this.selector.startX,
                    this.selector.startY,
                    0,
                    0,
                );
            }
        }, this);

        this.input.on('pointerup', (pointer) => {
            if (pointer.leftButtonReleased()) {
                if (this.rect !== null) {
                    this.selector.visible = false;
                    for (let i = 0; i < this.units.length; i++) {
                        if (this.rect.contains(this.units[i].x, this.units[i].y)) {
                            this.controlledUnits.push(i);
                        }
                    }
                    this.rectGraphics.destroy();
                }
            }
        }, this);

        /*
         * Unit Controller
         */

        for ( let i = 0; i  < 10; i++) {
            let unit = new Unit(this, 500+i*100, 500, '');
            this.add.existing(unit);
            this.units.push(unit);
        }

       // this.physics.add.collider(this.units, worldLayer);

        this.input.on('pointerdown', (pointer) => {
           if (pointer.rightButtonDown()) {
               this.controlledUnits.forEach((i) => {
                   this.physics.moveTo(this.units[i], this.aim.x, this.aim.y);
               });

           }
        });
    }

    /*
     * updates current view
     * e.g. mousemovement...
     */
    update(time, delta) {
        if (this.lockMovement) {
            const mouseX = this.aim.x;
            const mouseY = this.aim.y;
            const xThreshold = 1700 / 3;
            const yThreshold = 900 / 3;
            const deltaScroll = 10;

            if(mouseX > this.cameras.main.midPoint.x + xThreshold) {
                this.cameras.main.scrollX += deltaScroll;
                this.aim.x += deltaScroll;
            } else if (mouseX < this.cameras.main.midPoint.x - xThreshold) {
                this.cameras.main.scrollX -= deltaScroll;
                this.aim.x -= deltaScroll;
            }

            if(mouseY > this.cameras.main.midPoint.y + yThreshold) {
                this.cameras.main.scrollY += deltaScroll;
                this.aim.y += deltaScroll;
            } else if (mouseY < this.cameras.main.midPoint.y - yThreshold) {
                this.cameras.main.scrollY -= deltaScroll;
                this.aim.y -= deltaScroll;
            }
        }
    }
};