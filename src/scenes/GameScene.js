import 'phaser'

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init() {
        this.player = null;
        this.players = new Array();
        this.aim = null;
        this.pointerToggle = false;
        this.lockMovement = false;
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
        this.actionsKeys = this.input.keyboard.addKeys({
            'SPACE': Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        this.input.keyboard.on('keydown_SPACE', (event) => {
            this.lockMovement = !this.lockMovement;
        });

        // Map Tiles
        const mapScale = 2;
        const map = this.make.tilemap({ key: "map" });
        // Collide Option
        map.setCollisionByProperty({ collides: true });
        // Tileset Config
        const tileset = map.addTilesetImage("grass_biome", "tiles");
        // Map World Layer
        const worldLayer = map.createStaticLayer("world", tileset, 0, 0).setScale(mapScale);
        // Create world bounds
        this.physics.world.setBounds(0, 0, 10000, 10000);
        game.input.mouse.disableContextMenu();

        this.aim = this.physics.add.sprite(600, 700, 'aim');

        // Set Player & Aim Properties
        this.aim.setOrigin(0.5, 0.5).setDisplaySize(15, 15).setCollideWorldBounds(true);

        this.input.on('pointermove', (pointer) => {
            this.aim.x = this.input.activePointer.worldX;
            this.aim.y = this.input.activePointer.worldY;

        }, this);
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