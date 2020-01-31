import 'phaser'

export default class GameScene extends Phase.Scene {

    constructor() {
        super('Game');
    }

    init() {
        this.player;
        this.players = new Array();
        this.playersText = new Array();
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
        /**
         * Map Creation
         */
        // Map Tiles
        const map = this.make.tilemap({ key: "map" });
        // Collide Option
        map.setCollisionByProperty({ collides: true });
        // Tileset Config
        const tileset = map.addTilesetImage("grass_biome", "tiles");
        // Map World Layer
        const worldLayer = map.createStaticLayer("world", tileset, 0, 0).setScale(mapScale);
        // Create world bounds
        this.physics.world.setBounds(0, 0, 10000, 10000);

    }
};