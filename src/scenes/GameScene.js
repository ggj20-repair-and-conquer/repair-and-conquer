import 'phaser'
import {Unit} from "../classes/units";
import config from '../config/config.js';

export default class GameScene extends Phaser.Scene {

    constructor() {
        super('Game');
        // variables for the hud
        this.hudTable;
        this.hudHovered = false;
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
        this.controlledUnits = [];
    }

    /**
     * Preload Images
     */
    preload() {
        /**
         * Load TileImages and TileSets
         */
        this.load.image("tiles", "assets/tilesets/mountain_landscape.png");
        this.load.tilemapTiledJSON("map", "assets/tilemaps/mountainMapTemplate.json");
        // @todo Dummy for the HUD, replace this
        this.load.image('icon_dummy', 'assets/icons/icon_dummy.png');
        this.load.image('icon_repair', 'assets/icons/icon_repair.png');
        this.load.image('icon_damage', 'assets/icons/icon_damage.png');
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
                    let unitX = data.units[unitId].x;
                    let unitY = data.units[unitId].y;

                    if (that.units[unitId]) {
                        that.units[unitId].x = unitX;
                        that.units[unitId].y = unitY;
                    } else {
                        that.units[unitId] = new Unit(that, unitX, unitY, '');
                        that.add.existing(that.units[unitId]);
                    }
                }
            }
        });

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

        const map = this.make.tilemap({ key: "map" });
        map.setCollisionByProperty({ collides: true });

        // Tileset Config
        const worldTileSet = map.addTilesetImage("mountain_landscape", "tiles");

        /**
         * Create Map with Objects
         */
        // Map World Layer
        const worldLayer = map.createDynamicLayer("World", worldTileSet, 0, 0).setScale(mapScale);
        this.collisionLayer = map.createBlankDynamicLayer("Collision", worldTileSet, 0, 0).setScale(mapScale);

        /**
         * Camera
         */
        this.physics.world.setBounds(0, 0, 10000, 10000);
        this.minimap = this.cameras.add(1700-300, 900-300, 300, 300).setZoom(0.05).setName('mini');
        this.minimap.setBackgroundColor(0x002244);
        this.minimap.scrollX = 2800;
        this.minimap.scrollY = 2800;
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
                            this.controlledUnits.push(body.gameObject);
                        }
                    });

                    this.rectGraphics.destroy();
                }
            }
        }, this);

        this.input.on('pointerdown', (pointer) => {
           if (pointer.rightButtonDown()) {
               this.controlledUnits.forEach((unit) => {
                   this.physics.moveTo(unit, this.aim.x, this.aim.y);
               });
           }
        });

        this.physics.add.overlap(this.units, worldLayer, (units) => {
            console.log("units");
            console.log(units);
        });
        /*
         * Overlay
         */
      
        // Generate Hud data and create initial Hud
        // @todo Replace data with data from the server or hard coded controls
        let data = [{
            icon: 'icon_repair',
            text: 'Build Soldier',
            clickCallback: () => {
                socket.sendToServer({
                    type: 'build',
                    unit: 'soldier',
                    gameId: socket.gameData.gameId,
                    playerId: socket.gameData.playerId
                });
            }
        },{
            icon: 'icon_damage',
            text: '$ Dmg Unit',
            clickCallback: () => {
                alert('Clicked Item 2');
            }
        },{
            icon: 'icon_dummy',
            text: '$ DEV Unit',
            clickCallback: () => {
                alert('Clicked Item 3');
            }
        },{
            icon: 'icon_dummy',
            text: '$ OP Unit',
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

        // This stay be at the end
        this.socketHandling()
    }

    /*
     * updates current view
     * e.g. mousemovement...
     */
    update(time, delta) {
        // this.hudHovered manages stop scrolling if the hud gets hovered
        if (this.lockMovement && !this.hudHovered) {
            const mouseX = this.aim.x;
            const mouseY = this.aim.y;
            const xThreshold = 1700 / 3;
            const yThreshold = 900 / 3;
            const deltaScroll = 10;

            if (mouseX > this.cameras.main.midPoint.x + xThreshold) {
                this.cameras.main.scrollX += deltaScroll;
                this.aim.x += deltaScroll;
            } else if (mouseX < this.cameras.main.midPoint.x - xThreshold) {
                this.cameras.main.scrollX -= deltaScroll;
                this.aim.x -= deltaScroll;
            }


            if(mouseY > this.cameras.main.midPoint.y + yThreshold - 100) {
                this.cameras.main.scrollY += deltaScroll;
                this.aim.y += deltaScroll;
            } else if (mouseY < this.cameras.main.midPoint.y - yThreshold) {
                // Move camera upwards
                this.cameras.main.scrollY -= deltaScroll;
                this.aim.y -= deltaScroll;
            }

            // Update hudTable coordinates since this.cameras.main.x and y is 0 always and we therefore cannot attach to it.
            this.hudTable.x = this.cameras.main.scrollX + (1700/2);
            this.hudTable.y = this.cameras.main.scrollY + 850;
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
            this.hudHovered = true;
        }, this).on('cell.out', function (cellContainer, cellIndex) {
            cellContainer.getElement('background')
                .setStrokeStyle(2, 0x455a43)
                .setDepth(0);
            this.hudHovered = false;
        }, this).on('cell.click', function (cellContainer, cellIndex) {
            data[cellIndex].clickCallback();
        }, this);

        return hudTable
    }
};
