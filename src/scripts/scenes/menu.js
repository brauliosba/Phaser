// -------------------------------------------
// Menu Scene
// -------------------------------------------

export class MenuScene extends Phaser.Scene
{
    constructor(){
        super({key: 'MenuScene'})
    }
    
    preload(){
        this.load.image('menuBG', 'src/images/menu_pantalla.png');
        this.load.image('playButton', 'src/images/menu_botones_play.png');
        this.load.image('helpButton', 'src/images/menu_botones_help.png');
        this.load.image('optionsButton', 'src/images/menu_botones_options.png');
    }

    create(){
        let dim = 1080;

        this.data.set('screen', dim);
        this.data.set('screen_c', dim/2);
        this.data.set('state', "init");

        this.sprBack = this.add.image(dim/2, dim/2, 'menuBG');
        this.sprBack.setDisplaySize(dim, dim);

        this.startButton = this.add.image(dim/2, dim - 200,'playButton').setInteractive();
        this.startButton.setDisplaySize(150, 150);
        this.startButton.on('pointerdown', () => { this.scene.start('MainScene', this.data); });

        window.addEventListener('touchstart', () => {this.data.set('IS_TOUCH', "true"); });

        /*
        this.helpButton = this.add.image(dim/2 - 150 , dim - 200,'helpButton');
        this.helpButton.setDisplaySize(100, 100);

        this.optionsButton = this.add.image(dim/2 + 150, dim - 200,'optionsButton');
        this.optionsButton.setDisplaySize(100, 100);
        */
    }
}