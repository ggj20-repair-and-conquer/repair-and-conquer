import 'phaser';
import config from '../config/config.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
        this.hudTable;
    }

   preload() {
        this.load.image('background', 'assets/buttons/background.png');
        this.load.image('btn_create', 'assets/buttons/btn_create.png');
        this.load.image('btn_join', 'assets/buttons/btn_join.png');
        this.load.image('logo', 'assets/logo.png');
        this.load.image('icon_dummy', 'assets/icons/icon_dummy.png');
    }

    create() {
        const logo = this.add.image(config.width/2, config.height/2 - 150, 'logo');
        logo.setInteractive();

        const btnCreateGame = this.add.image(400, 700, 'btn_create');
        btnCreateGame.setInteractive();
        btnCreateGame.on('pointerdown', () => {
            clickSound.play();
            this.scene.start('CreateGame');
        }, this);

        const btnJoinGame = this.add.image(1300, 700, 'btn_join');
        btnJoinGame.setInteractive();
        btnJoinGame.on('pointerdown', () => {
            clickSound.play();
            this.scene.start('GameList');
        }, this);

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
        this.createHud(data);
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
        this.hudTable = rexUI.add.gridTable({
            x: (1700/2),
            y: 830,
            background: rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x2D3C2C, 0.8),
            table: {
                width: 1000,
                height: 100,
                cellWidth: 200,
                cellHeight: 100,
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
        this.hudTable.on('cell.over', function (cellContainer, cellIndex) {
            cellContainer.getElement('background')
                .setStrokeStyle(1, 0xffffff)
                .setDepth(1);
        }, this).on('cell.out', function (cellContainer, cellIndex) {
            cellContainer.getElement('background')
                .setStrokeStyle(2, 0x455a43)
                .setDepth(0);
        }, this).on('cell.click', function (cellContainer, cellIndex) {
            console.log(data);
            data[cellIndex].clickCallback();
        }, this);
    }
};