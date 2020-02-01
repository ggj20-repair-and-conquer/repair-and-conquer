import 'phaser';
import config from '../config/config.js';

export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super('Credits');
    }

   preload() {
        this.load.image('dom', 'assets/credits/dom.jpg');
        this.load.image('nih', 'assets/credits/nih.jpg');
        this.load.image('maj', 'assets/credits/maj.jpg');
        this.load.image('tih', 'assets/credits/tih.jpg');
        this.load.image('shs', 'assets/credits/shs.jpg');
        this.load.image('jow', 'assets/credits/jow.jpg');
        this.load.image('jas', 'assets/credits/jas.jpg');
        this.load.image('rum', 'assets/credits/rum.jpg');
        this.load.image('logo', 'assets/logo.png');
    }

    create() {
        
        this.add.image(400, 300, 'dom');
        this.add.image(700, 300, 'maj');
        this.add.image(1000, 300, 'nih');
        this.add.image(1300, 300, 'jow');
        this.add.image(400, 550, 'jas');
        this.add.image(700, 550, 'shs');
        this.add.image(1000, 550, 'tih');
        this.add.image(1300, 550, 'rum');
        

        const creditTextStyle = {
          font: '28px Serif',
          fill: '#ffffff',
          strokeThickness: 3,
          stroke: '#000',
          fontWeight: 'bold',
          align: 'center'
        };

        const attributionStyle = {
          font: '42px Serif',
          fill: '#ffffff',
          strokeThickness: 2,
          stroke: '#000',
          fontWeight: 'bold',
          align: 'center'
        };

        const creditsLinkStyle = {
          font: '14px Serif',
          fill: '#ffffff',
          fontWeight: 'bold',
          align: 'left'
        };


        let creditText = 'This game was made by Dominik Meyer, Martin Jainta, Niklas Heer, Johannes Witt, ' +
        '\nJasbir Singh, Sushanth S Shetty, Thilo Hettmer and Rustam Miyliyev' +
        '\n\nClick here to return to Mainmenu and start the game again.';
       
        const btnStartGame = this.add.text(350, config.height/2 + 250, creditText, creditTextStyle);
        btnStartGame.setInteractive();
        btnStartGame.on('pointerdown', () => {
          this.scene.start('Menu');
        }, this);
       
        let attributionText = '\nThank you for playing ';
        this.add.text(680, 40, attributionText, attributionStyle);

        let creditsLinks ='Assets taken from :- https://opengameart.org/ | ' +
            'https://www.freepik.com/ Designed by macrovector | ' +
            'https://filmmusic.io "Gothamlicious" by Kevin MacLeod (https://incompetech.com) |' +
            'https://freesfx.co.uk | ' +
            'http://soundbible.com | ' +
            'https://freesound.org';
        this.add.text(100, config.height/2 + 420, creditsLinks, creditsLinkStyle);
    }
};
