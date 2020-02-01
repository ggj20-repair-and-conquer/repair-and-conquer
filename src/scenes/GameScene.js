import 'phaser'
import {Unit} from "../classes/units";
import config from '../config/config.js';

export default class GameScene extends Phaser.Scene {

    constructor() {
        super('Game');
    }

    init() {
        this.aim = null;
        this.lockMovement = true;
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
        this.selectedUnits = [];
    }

    /**
     * Preload Images
     */
    preload() {
        /**
         * Load TileImages and TileSets
         */
        this.load.image("tiles", "assets/tilesets/mountain_landscape.png");
        this.load.tilemapTiledJSON("map", "assets/tilemaps/MountainMap.json");

        this.load.image('base', 'assets/base.png');
        this.load.image('factory', 'assets/factory.png');
        this.load.image('barracks', 'assets/barracks.png');
        this.load.image('airbase', 'assets/airbase.png');

        this.load.image('dialog_small', 'assets/buttons/dialog_small.png');

        this.load.image('soldier', 'assets/soldier.png');
        this.load.image('tank', 'assets/tank.png');
        this.load.image('aircraft', 'assets/aircraft.png');

        this.load.image('icon_dummy', 'assets/icons/icon_dummy.png');
        this.load.image('icon_repair', 'assets/icons/icon_repair.png');
        this.load.image('icon_damage', 'assets/icons/icon_damage.png');
        this.load.image('icon_tank', 'assets/icons/icon_tank.png');
        this.load.image('icon_fighter_jets', 'assets/icons/icon_fighter_jets.png');
        this.load.image('icon_money', 'assets/icons/icon_treasure.png');
    }

    socketHandling() {
        socket.sendToServer({
            type: 'initGame',
            gameId: socket.gameData.gameId,
            playerId: socket.gameData.playerId
        });
        socket.sendToServer({
            type: 'updateGame',
            gameId: socket.gameData.gameId,
            playerId: socket.gameData.playerId
        });

        let that = this;

        socket.getFromServer((data) => {
            if (data.type == 'initGame') {

            } else if (data.type == 'updateGame') {
                for (let buildingId in data.buildings) {
                    let baseSprite = this.physics.add.sprite(0, 0, data.buildings[buildingId].type);
                    baseSprite.setInteractive();
                    baseSprite.on('pointerdown', function(){

                    });

                    var baseText = this.add.text(-25, -25, 'Live: '+data.buildings[buildingId].health, {font: '12px Courier', fill: '#fff'}).setBackgroundColor('#00A66E');
                    var baseContainer = this.add.container(
                        data.buildings[buildingId].x,
                        data.buildings[buildingId].y,
                        [baseText, baseSprite]
                    );
                    this.physics.world.enable(baseContainer);

                }

                this.moneyText.text = '$ ' + data.player.money;
            } else if (data.type == 'updateUnits') {
                for (let unitId in data.units) {
                    let unit = data.units[unitId];

                    if (this.units[unitId]) {
                        //that.units[unitId].x = unit.x;
                        //that.units[unitId].y = unit.y;
                    } else {
                        this.units[unitId] = new Unit(this, unit.x, unit.y, unit.type);
                        this.units[unitId].playerId = unit.playerId;
                        this.units[unitId].unitType = unit.type;
                        this.add.existing(this.units[unitId]);
                    }
                }
            } else if (data.type == 'updateUnitPositions') {
                for (var position of data.positions) {
                    this.units[position[0]].x = position[1];
                    this.units[position[0]].y = position[2];
                }
            }
        });

        setInterval(() => {
            let unitPositions = [];

            for (let unitId in this.units) {
                if (this.units[unitId].playerId == socket.gameData.playerId) {
                    unitPositions.push([unitId, this.units[unitId].x, this.units[unitId].y])
                }
            }

            socket.sendToServer({
                type: 'updateUnitPositions',
                gameId: socket.gameData.gameId,
                playerId: socket.gameData.playerId,
                positions: unitPositions
            });
        }, 50);

        setInterval(() => {
            socket.sendToServer({
                type: 'updateGame',
                gameId: socket.gameData.gameId,
                playerId: socket.gameData.playerId
            });
        }, 2000);
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
         * Map Config
         */
        const mapScale = 1;

        this.map = this.make.tilemap({ key: "map" });
        this.map.setCollisionByProperty({ collides: true });

        // Tileset Config
        const worldTileSet = this.map.addTilesetImage("mountain_landscape", "tiles");

        /**
         * Create Map Layers
         */
        const GroundLayer1 = this.map.createStaticLayer("GroundLayer1", worldTileSet, 0, 0).setScale(mapScale);
        const RockLayer = this.map.createStaticLayer("RockLayer", worldTileSet, 0, 0).setScale(mapScale);
        const GrassLayer = this.map.createStaticLayer("GrassLayer", worldTileSet, 0, 0).setScale(mapScale);
        const ObjectLayer = this.map.createStaticLayer("ObjectLayer", worldTileSet, 0, 0).setScale(mapScale);
        const TreeLayer1 = this.map.createStaticLayer("TreeLayer1", worldTileSet, 0, 0).setScale(mapScale);
        const TreeLayer2 = this.map.createStaticLayer("TreeLayer2", worldTileSet, 0, 0).setScale(mapScale);
        const TreeLayer3 = this.map.createStaticLayer("TreeLayer3", worldTileSet, 0, 0).setScale(mapScale);

        /**
         * Unit Collider
         */
        this.physics.add.collider(this.units, RockLayer);
        this.physics.add.collider(this.units, TreeLayer1);
        this.physics.add.collider(this.units, TreeLayer2);
        this.physics.add.collider(this.units, TreeLayer3);

        /**
         * Camera
         */
        this.physics.world.setBounds(0, 0, 10000, 10000);
        this.minimap = this.cameras.add(1700-300, 900-400, 150, 150).setZoom(0.05).setName('mini');
        this.minimap.setBackgroundColor(0x3e4f3c);
        this.minimap.scrollX = 1400;
        this.minimap.scrollY = 1400;
        // Ignore party of the map to improve performance
        this.minimap.ignore(worldTileSet);
        this.minimap.ignore(GroundLayer1);
        // Create a rectangle as the view border in the minimap which we move in update()
        this.minimapRect = new Phaser.Geom.Rectangle(
            0 - 10,
            0 - 10,
            1720,
            920,
        );
        this.minimapRectGraphics = this.add.graphics();
        this.minimapRectGraphics.lineStyle(20, 0xff0000, 1);
        this.minimapRectGraphics.strokeRectShape(this.minimapRect);

        /*
         * Mouse controller
         */
        this.aim = this.physics.add.image(600, 700, 'aim');
        this.aim.visible = false;
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
                if (this.rectGraphics !== null && typeof this.rectGraphics !== typeof undefined) {
                    this.rectGraphics.destroy();
                    this.selectedUnits = [];
                }

                this.rectGraphics = this.add.graphics();
                this.selectedUnits = [];

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
                    if (this.selector.startX > this.selector.endX) {
                        let temp = this.selector.startX;
                        this.selector.startX = this.selector.endX;
                        this.selector.endX = temp;
                    }

                    if (this.selector.startY > this.selector.endY) {
                        let temp = this.selector.startY;
                        this.selector.startY = this.selector.endY;
                        this.selector.endY = temp;
                    }

                    let findUnits = this.physics.overlapRect(
                        this.selector.startX,
                        this.selector.startY,
                        this.selector.endX - this.selector.startX,
                        this.selector.endY - this.selector.startY
                    );

                    findUnits.forEach((body) => {
                        if (body.gameObject.type === 'Sprite') {
                            this.selectedUnits.push(body.gameObject);
                        }
                    });

                    this.rectGraphics.destroy();
                }
            }
        }, this);

        this.input.on('pointerdown', (pointer) => {
           if (pointer.rightButtonDown()) {
               this.selectedUnits.forEach((unit) => {
                   unit.startMove(this, this.aim.x,this.aim.y);
               });
           }
        });

        /*
         * Overlay
         */

        /*
        socket.sendToServer({
            type: 'build',
            unit: 'tank',
            gameId: socket.gameData.gameId,
            playerId: socket.gameData.playerId
        });
         */


        this.moneyText = this.add.text(0, 0, "Money!", {
            font: '20px Courier',
            fill: '#fff',
            strokeThickness: 6,
            stroke: '#000',
            fontWeight: 'bold'
        });

        // This stay be at the end
        this.socketHandling()
    }

    /*
     * updates current view
     * e.g. mousemovement...
     */
    update(time, delta) {
        if (this.lockMovement) {
            const mouseX = this.aim.x;
            const mouseY = this.aim.y;
            const xThreshold = 1700 / 2.25;
            const yThreshold = 900 / 2.25;
            const deltaScroll = 10;

            if (mouseX > this.cameras.main.midPoint.x + xThreshold) {
                // Move view to the right
                // Only move if we are not too far right
                if (this.cameras.main.midPoint.x < (this.map.widthInPixels - (1700 / 2))) {
                    this.cameras.main.scrollX += deltaScroll;
                    this.aim.x += deltaScroll;
                }
            } else if (mouseX < this.cameras.main.midPoint.x - xThreshold) {
                // Move view to the left
                // Only move if we are not too far left
                if (this.cameras.main.midPoint.x > (1700 / 2)) {
                    this.cameras.main.scrollX -= deltaScroll;
                    this.aim.x -= deltaScroll;
                }
            }


            if(mouseY > this.cameras.main.midPoint.y + yThreshold) {
                // Move view to the bottom
                // Only move if we are not too far at the bottom
                if (this.cameras.main.midPoint.y < (this.map.heightInPixels - (900 / 2))) {
                    this.cameras.main.scrollY += deltaScroll;
                    this.aim.y += deltaScroll;
                }
            } else if (mouseY < this.cameras.main.midPoint.y - yThreshold) {
                // Move view to the top
                // Only move if we are not too far at the top
                if (this.cameras.main.midPoint.y > (900 / 2)) {
                    this.cameras.main.scrollY -= deltaScroll;
                    this.aim.y -= deltaScroll;
                }
            }

            this.moneyText.setPosition(this.cameras.main.scrollX + 1590, this.cameras.main.scrollY + 10);

            // Update the rectangle for the minimap
            this.minimapRect.setPosition(this.cameras.main.scrollX - 10, this.cameras.main.scrollY - 10);
            this.minimapRectGraphics.destroy();
            this.minimapRectGraphics = this.add.graphics();
            this.minimapRectGraphics.lineStyle(20, 0xff0000, 1);
            this.minimapRectGraphics.strokeRectShape(this.minimapRect);
        }
    }
};
