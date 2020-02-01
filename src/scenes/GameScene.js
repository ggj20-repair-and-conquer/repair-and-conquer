import 'phaser'

export default class GameScene extends Phaser.Scene {

    constructor() {
        super('Game');
        // variables for the hud
        this.hudTable;
        this.hudHovered = false;
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
    }

    /**
     * Preload Images
     */
    preload() {
        /**
         * Load TileImages and TileSets
         */
        this.load.image("tiles", "assets/tilesets/overworld_tileset_grass.png");
        this.load.tilemapTiledJSON("map", "assets/tilemaps/mapTemplate.json");
        // @todo Dummy for the HUD, replace this
        this.load.image('icon_dummy', 'assets/icons/icon_dummy.png');
        this.load.audio('hoverSound', 'assets/sounds/hud_hover.wav');
    }

    socketHandling() {
        socket.sendToServer({
            type: 'updateGame',
            gameId: socket.gameData.gameId,
            playerId: socket.gameData.playerId
        });

        let that = this;

        socket.getFromServer(function(data) {
            if (data.type == 'updateGame') {
                for (let buildingId in data.buildings) {
                    let baseSprite = that.physics.add.sprite(0, 0, 'base');
                    var baseText = that.add.text(-25, -25, 'Live: '+data.buildings[buildingId].health, {font: '12px Courier', fill: '#fff'}).setBackgroundColor('#00A66E');
                    var baseContainer = that.add.container(data.buildings[buildingId].x, data.buildings[buildingId].y, [baseText, baseSprite]);
                    that.physics.world.enable(baseContainer);
                }

                console.log(data.player.money);
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
        this.actionsKeys = this.input.keyboard.addKeys({
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        this.input.keyboard.on('keydown_SPACE', (event) => {
            this.lockMovement = !this.lockMovement;
        });

        /**
         * Map Config
         */
        const mapScale = 2;

        const map = this.make.tilemap({ key: "map" });

        // Collide Option
        map.setCollisionByProperty({ collides: true });

        // Tileset Config
        const worldTileSet = map.addTilesetImage("grass_biome", "tiles");

        /**
         * Create Map with Objects
         */
        // Map World Layer
        const worldLayer = map.createDynamicLayer("World", worldTileSet, 0, 0).setScale(mapScale);
        const collisionLayer = map.createBlankDynamicLayer("Collision", worldTileSet, 0, 0).setScale(mapScale);

        // File with Assets should be in another file
        const testHill = [
          [1, 1, 1, 1, 91, 80, 80, 92],
          [1, 1, 91, 80, 81, 108, 96, 67],
          [139, 92, 144, 120, 96, 91, 80, 81],
          [1, 142, 1, 108, 108, 144, 1, 1]
        ];

        // Add all map objects to map TODO: coords from server and loop
        collisionLayer.putTilesAt(testHill, 20, 20);

        /**
         * Camera
         */
        // Create world bounds
        this.physics.world.setBounds(0, 0, 10000, 10000);
        game.input.mouse.disableContextMenu();

        this.aim = this.physics.add.sprite(600, 700, 'aim');

        // Set Player & Aim Properties
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
                    this.rectGraphics.destroy();
                }
            }
        }, this);

        // Generate Hud data and create initial Hud
        // @todo Replace data with data from the server or hard coded controls
        let data = [{
            icon: 'icon_dummy',
            text: '$ Rep Unit',
            clickCallback: () => {
                alert('Clicked Item 1');
            }
        },{
            icon: 'icon_dummy',
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
            icon: 'icon_dummy',
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

            // Update hudTable coordinates since this.cameras.main.x and y is 0 always and we therefore cannot attach to it.
            this.hudTable.x = this.cameras.main.scrollX + (1700/2);
            this.hudTable.y = this.cameras.main.scrollY + 810;
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
            y: this.cameras.main.scrollY + 810,
            background: rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x2D3C2C, 0.8),
            table: {
                width: 1000,
                height: 120,
                cellWidth: 200,
                cellHeight: 120,
                columns: 5,
            },
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                table: 10,
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
                    background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, 0x455a43),
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
            // Call the callback we get via data
            console.log(data);
            data[cellIndex].clickCallback();
        }, this);

        return hudTable
    }
};
