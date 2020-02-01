import 'phaser'

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
          [1, 1, 1, 1, 91, 80, 71, 92],
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