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

        let creditText = 'This game was made by Dominik Meyer, Martin Jainta, Niklas Heer, Johannes Witt, ' +
        '\nJasbir Singh, Sushanth S Shetty, Thilo Hettmer and Rustam Miyliyev' +
        '\n\nClick here to return to Mainmenu and start the game again.';
       
        const btnStartGame = this.add.text(350, config.height/2 + 250, creditText, creditTextStyle);
        btnStartGame.setInteractive();
        btnStartGame.on('pointerdown', () => {
          this.scene.start('Menu');
        }, this);
       
        let attributionText = '\nThank you for playing ' +
            '\n\nSources for sprites used in the game: \n' +
            'https://opengameart.org/\n' +
            'https://www.freepik.com/ Designed by macrovector\n' +
            '\n' +
            'Music and sounds: \n' +
            'https://filmmusic.io "Gothamlicious" by Kevin MacLeod (https://incompetech.com)\n' +
            'https://freesfx.co.uk\n' +
            'http://soundbible.com\n' +
            'https://freesound.org\n' +
            'https://freesound.org/people/EFlexMusic/sounds/396270/\n' +
            'https://freesound.org/people/LittleRobotSoundFactory/sounds/270403/\n' +
            'https://freesound.org/people/rezyma/sounds/475148/\n' +
            'https://freesound.org/people/theuncertainman/sounds/402020/\n' +
            'https://freesound.org/people/josecruz98/sounds/393019/\n' +
            'https://freesound.org/people/Ashowal/sounds/171222/';
        this.add.text(680, 40, attributionText, attributionStyle);
    }
};
