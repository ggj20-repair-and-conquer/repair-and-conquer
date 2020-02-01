import 'phaser'
import {Unit} from "../classes/units";
import config from '../config/config.js';

export default class GameScene extends Phaser.Scene {

    constructor() {
        super('Game');
        // variables for the hud
        this.hudTable;
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
        this.load.image('soldier', 'assets/soldier.png');
        this.load.image('tank', 'assets/tank.png');
        this.load.image('aircraft', 'assets/aircraft.png');

        this.load.image('icon_dummy', 'assets/icons/icon_dummy.png');
        this.load.image('icon_repair', 'assets/icons/icon_repair.png');
        this.load.image('icon_damage', 'assets/icons/icon_damage.png');
        this.load.image('icon_tank', 'assets/icons/icon_tank.png');
        this.load.image('icon_fighter_jets', 'assets/icons/icon_fighter_jets.png');
        this.load.image('icon_money', 'assets/icons/icon_treasure.png');
        this.load.audio('hoverSound', 'assets/sounds/hud_hover.wav');
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

        socket.getFromServer(function(data) {
            if (data.type == 'initGame') {
                for (var m of data.map) {
                    that.collisionLayer.putTilesAt(config.map[m[0]], m[1], m[2]);
                }
            } else if (data.type == 'updateGame') {
                for (let buildingId in data.buildings) {
                    let baseSprite = that.physics.add.sprite(0, 0, 'base');
                    var baseText = that.add.text(-25, -25, 'Live: '+data.buildings[buildingId].health, {font: '12px Courier', fill: '#fff'}).setBackgroundColor('#00A66E');
                    var baseContainer = that.add.container(data.buildings[buildingId].x, data.buildings[buildingId].y, [baseText, baseSprite]);
                    that.physics.world.enable(baseContainer);
                }
            } else if (data.type == 'updateUnits') {
                for (let unitId in data.units) {
                    let unit = data.units[unitId];

                    if (that.units[unitId]) {
                        //that.units[unitId].x = unit.x;
                        //that.units[unitId].y = unit.y;
                    } else {
                        that.units[unitId] = new Unit(that, unit.x, unit.y, unit.type);
                        that.units[unitId].playerId = unit.playerId;
                        that.units[unitId].unitType = unit.type;
                        that.add.existing(that.units[unitId]);
                    }
                }
            } else if (data.type == 'updateUnitPositions') {
                for (var position of data.positions) {
                    that.units[position[0]].x = position[1];
                    that.units[position[0]].y = position[2];
                }
            }
        });

        setInterval(() => {
            let unitPositions = [];

            for (let unitId in that.units) {
                if (that.units[unitId].playerId == socket.gameData.playerId) {
                    unitPositions.push([unitId, that.units[unitId].x, that.units[unitId].y])
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
         * MAP SETTINGS
         */
        /**
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
      
        // Generate Hud data and create initial Hud
        // @todo Replace data with data from the server or hard coded controls
        let data = [{
            icon: 'icon_damage',
            text: 'Soldier',
            clickCallback: () => {
                socket.sendToServer({
                    type: 'build',
                    unit: 'soldier',
                    gameId: socket.gameData.gameId,
                    playerId: socket.gameData.playerId
                });
            }
        },{
            icon: 'icon_repair',
            text: 'Repair',
            clickCallback: () => {
                socket.sendToServer({
                    type: 'build',
                    unit: 'tank',
                    gameId: socket.gameData.gameId,
                    playerId: socket.gameData.playerId
                });
            }
        },{
            icon: 'icon_fighter_jets',
            text: 'Aircraft',
            clickCallback: () => {
                socket.sendToServer({
                    type: 'build',
                    unit: 'aircraft',
                    gameId: socket.gameData.gameId,
                    playerId: socket.gameData.playerId
                });
            }
        },{
            icon: 'icon_tank',
            text: 'Tank',
            clickCallback: () => {
                alert('Clicked Item 4');
            }
        },{
            icon: 'icon_money',
            text: '$$$ Money',
            clickCallback: () => {
                alert('Clicked Item 5. $$$DOLLARS$$$');
            }
        }];
        this.hudTable = this.createHud(data);
        this.minimap.ignore(this.hudTable);

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

            // Update hudTable coordinates since this.cameras.main.x and y is 0 always and we therefore cannot attach to it.
            this.hudTable.x = this.cameras.main.scrollX + (1700/2);
            this.hudTable.y = this.cameras.main.scrollY + 850;

            // Update the rectangle for the minimap
            this.minimapRect.setPosition(this.cameras.main.scrollX - 10, this.cameras.main.scrollY - 10);
            this.minimapRectGraphics.destroy();
            this.minimapRectGraphics = this.add.graphics();
            this.minimapRectGraphics.lineStyle(20, 0xff0000, 1);
            this.minimapRectGraphics.strokeRectShape(this.minimapRect);
        }
    }

    /**
     * Creates the HUD in this.hudTable with the given data.
     *
     * @param {*} data Should have following keys
     *      icon: Path for an icon to show, displayed on the left.
     *      text: The text to show.
     *      clickCallback: A function called when the cell gets clicked.
     */
    createHud(data) {
        var rexUI = this.rexUI;
        var data = data;
        let hoverSound = this.sound.add('hoverSound');

        let hudTable = rexUI.add.gridTable({
            x: this.cameras.main.scrollX + (1700/2),
            y: this.cameras.main.scrollY + 850,
            background: rexUI.add.roundRectangle(0, 0, 20, 10, 0, 0x4e634c),
            table: {
                width: 1700,
                height: 100,
                cellWidth: 200,
                cellHeight: 100,
                columns: 8,
            },
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                table: 0,
            },
            items: data,
            createCellContainerCallback: function (cell) {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item;
                let iconImg = scene.add.image(0, 0, item.icon);
                return scene.rexUI.add.label({
                    width: width,
                    height: height,
                    background: rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, 0x455a43),
                    icon: iconImg,
                    text: scene.add.text(0, 0, item.text),
                    space: {
                        icon: 10,
                        left: 15
                    },
                    data: {
                        'clickCallback': item.clickCallback
                    }
                }).setOrigin(0).layout();
            }
        }).layout()
        .on('cell.over', function (cellContainer, cellIndex) {
            cellContainer.getElement('background')
                .setStrokeStyle(1, 0xffffff)
                .setDepth(1);
            hoverSound.play();
        }, this).on('cell.out', function (cellContainer, cellIndex) {
            cellContainer.getElement('background')
                .setStrokeStyle(2, 0x455a43)
                .setDepth(0);
        }, this).on('cell.click', function (cellContainer, cellIndex) {
            data[cellIndex].clickCallback();
        }, this);

        return hudTable
    }
};
