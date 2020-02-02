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
        this.buildings = [];
        this.selectedUnits = [];

        // The current id of the selected building, null if none selected
        this.selectedBuilding = null;

        this.controllingSprites = [];
        // All current action containers
        this.actionContainers = [];
        this.actionContainerOpen = false;
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
                    if (this.buildings[buildingId]) {

                    } else {
                        let buildType = data.buildings[buildingId].type;
                        let unitType = '';

                        if (buildType == 'barracks') {
                            unitType = 'soldier';
                        } else if (buildType == 'factory') {
                            unitType = 'tank';
                        } else if (buildType == 'airbase') {
                            unitType = 'aircraft';
                        }

                        let baseSprite = this.physics.add.sprite(0, 0, buildType);
                        baseSprite.setInteractive();

                        if (unitType && data.buildings[buildingId].playerId == socket.gameData.playerId) {
                            baseSprite.on('pointerdown', this.actionButton([
                                {
                                    text: 'Build',
                                    callback: () => {
                                        socket.sendToServer({
                                            type: 'build',
                                            unit: unitType,
                                            gameId: socket.gameData.gameId,
                                            playerId: socket.gameData.playerId,
                                            building: data.buildings[buildingId]
                                        });
                                    }
                                }
                            ], buildingId), this);
                        } else {
                            // Clear containers if we click the base since it has no actions
                            baseSprite.on('pointerdown', () => this.clearActionContainers());
                        }

                        var baseText = this.add.text(-25, -25, 'Live: '+data.buildings[buildingId].health, {font: '12px Courier', fill: '#fff'}).setBackgroundColor('#00A66E');
                        var baseContainer = this.add.container(
                            data.buildings[buildingId].x,
                            data.buildings[buildingId].y,
                            [baseText, baseSprite]
                        );
                        this.physics.world.enable(baseContainer);
                        this.buildings[buildingId] = data.buildings[buildingId];

                        if (this.buildings[buildingId].playerId == socket.gameData.playerId) {
                            this.cameras.main.scrollX = this.buildings[buildingId].x - 850;
                            this.cameras.main.scrollY = this.buildings[buildingId].y - 450;
                        }
                    }
                }

                this.moneyText.text = '$ ' + data.player.money;
                socket.gameData.playerMoney = data.player.money;
            } else if (data.type == 'updateUnits') {
                for (let unitId in data.units) {
                    let unit = data.units[unitId];

                    if (!this.units[unitId]) {
                        this.units[unitId] = new Unit(that, unit.x, unit.y, unit.type);
                        this.units[unitId].playerId = unit.playerId;
                        this.units[unitId].unitType = unit.type;
                        this.add.existing(this.units[unitId]);
                        for (let val in this.units) {
                            this.physics.add.collider(this.units[unitId], this.units[val], (a, b) => {
                                if( a.state == 2) {
                                    b.detectCollition();
                                }
                                if (b.state == 2) {
                                    a.detectCollition();
                                }
                            });
                        }

                        this.physics.add.collider(this.units[unitId], this.RockLayer, () => {

                        });
                        this.physics.add.collider(this.units[unitId], this.TreeLayer1);
                        this.physics.add.collider(this.units[unitId], this.TreeLayer2);
                        this.physics.add.collider(this.units[unitId], this.TreeLayer3);
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

            this.physics.add.collider(this.units, this.units);
         }, 50);

        setInterval(() => {
            socket.sendToServer({
                type: 'updateGame',
                gameId: socket.gameData.gameId,
                playerId: socket.gameData.playerId
            });

            this.physics.add.collider(this.units, this.units);
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
        this.worldTileSet = this.map.addTilesetImage("mountain_landscape", "tiles");

        /**
         * Create Map Layers
         */
        this.GroundLayer1 = this.map.createStaticLayer("GroundLayer1", this.worldTileSet, 0, 0).setScale(mapScale);
        this.RockLayer = this.map.createStaticLayer("RockLayer", this.worldTileSet, 0, 0).setScale(mapScale);
        this.GrassLayer = this.map.createStaticLayer("GrassLayer", this.worldTileSet, 0, 0).setScale(mapScale);
        this.ObjectLayer = this.map.createStaticLayer("ObjectLayer", this.worldTileSet, 0, 0).setScale(mapScale);
        this.TreeLayer1 = this.map.createStaticLayer("TreeLayer1", this.worldTileSet, 0, 0).setScale(mapScale);
        this.TreeLayer2 = this.map.createStaticLayer("TreeLayer2", this.worldTileSet, 0, 0).setScale(mapScale);
        this.TreeLayer3 = this.map.createStaticLayer("TreeLayer3", this.worldTileSet, 0, 0).setScale(mapScale);

        /**
         * Camera
         */
        this.physics.world.setBounds(0, 0, 10000, 10000);
        this.minimap = this.cameras.add(0, 720, 180, 180).setZoom(0.05).setName('mini');
        this.minimap.setBackgroundColor(0x3e4f3c);
        this.minimap.scrollX = this.map.widthInPixels/2;
        this.minimap.scrollY = this.map.heightInPixels/2;
        // Ignore party of the map to improve performance

        this.minimap.ignore(this.worldTileSet);
        this.minimap.ignore(this.GroundLayer1);
        this.minimap.ignore(this.GrassLayer);
        this.minimap.ignore(this.ObjectLayer);

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
                        if (typeof body.gameObject.unitType !== typeof undefined
                            && body.gameObject.playerId == socket.gameData.playerId
                        ) {
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
         * Destroy every actionContainer on a new click on the map.
         * This wont trigger if clicked on a sprite etc.
         */
        this.input.on('pointerdown', (pointer, gameObject) => {
            if (Object.keys(gameObject).length === 0 && this.actionContainerOpen == true) {
                this.clearActionContainers();
                this.actionContainerOpen = false;
            }
        });


        this.moneyText = this.add.text(0, 0, "Money!", {
            font: '20px Courier',
            fill: '#fff',
            strokeThickness: 6,
            stroke: '#000',
            fontWeight: 'bold'
        });
        this.minimap.ignore(this.moneyText);

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

    /**
     * Adds an action button which shows when clicking on a building.
     *
     * @param action An array of objects containing a "text" and "callback" key.
     *        text The text to write on the button
     *        callback A callback to call on click on the action button.
     * @param buildingId The buildingId of the building. Used to set which building is selected currently.
     */
    actionButton(actions, buildingId) {
        return function(pointer){
            // Clear containers so we can create new ones for a newly clicked building
            this.clearActionContainers();
            // Use a container so we can destroy all UI elements with one call.
            let actionContainer = this.add.container(
                this.aim.x,
                this.aim.y
            );
            this.actionContainers.push(actionContainer);
            actions.forEach((action, index) => {
                let baseY = index * 40;
                const btnBuild = this.add.image(0, baseY, 'dialog_small').setOrigin(0, 0);
                const textBuild = this.add.text(0 + 25, baseY + 15, action.text, {
                    font: '17px Courier',
                    fill: '#fff',
                    strokeThickness: 3,
                    stroke: '#000',
                    fontWeight: 'bold'
                });
                actionContainer.add(btnBuild);
                actionContainer.add(textBuild);
                btnBuild.setInteractive();
                btnBuild.on('pointerdown', () => {
                    // Call the given callback function, free next building selection and clear created objects.
                    action.callback();
                    actionContainer.destroy();
                }, this);
            });
            this.actionContainerOpen = true;
        };
    }

    clearActionContainers() {
        this.actionContainers.forEach((container) => container.destroy());
    }
};
