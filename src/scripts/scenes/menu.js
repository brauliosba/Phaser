import {Panel} from '../components/panel.js';

// -------------------------------------------
// Menu Scene
// -------------------------------------------
export class MenuScene extends Phaser.Scene
{
    constructor(){
        super({key: 'MenuScene'})
        this.ready = false;
    }
    
    preload(){
        this.load.image('menuBG', 'src/images/UI/menu_pantalla.png');
        this.load.image('playButton', 'src/images/UI/menu_botones_play.png');
        this.load.image('helpButton', 'src/images/UI/menu_botones_help.png');
        this.load.image('optionsButton', 'src/images/UI/menu_botones_options.png');
        this.load.image('panel', 'src/images/UI/panel.png');
        this.load.atlas('panelUI', 'src/images/UI/panelUI.png', 'src/images/UI/panelUI.json');
        this.load.image('texture', 'src/images/p2.jpg');

        //Plugins
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        this.load.plugin('rextexteditplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js', true);
    }

    create(){
        let dim = 1080;

        this.data.set('screen', dim);
        this.data.set('screen_c', dim/2);
        this.data.set('initialSpeed', 3000);
        this.data.set('horizontalSpeed', 1800);
        this.data.set('acceleration', 28);
        this.data.set('waveDelay', 60);
        this.data.set('scoringTime', 100);
        this.data.set('powerDelay', 20000);
        this.data.set('invulnerability', 250);
        this.data.set('deliverDelay', 10000);

        this.sprBack = this.add.image(dim/2, dim/2, 'menuBG');
        this.sprBack.setDisplaySize(dim, dim);

        this.startButton = this.add.image(dim/2, dim - 200,'playButton').setInteractive();
        this.startButton.setDisplaySize(150, 150);
        this.startButton.on('pointerdown', () => { this.scene.start('MainScene', this.data); });

        window.addEventListener('touchstart', () => {this.data.set('IS_TOUCH', "true"); });
        
        this.helpButton = this.add.image(dim/2 - 150 , dim - 200,'helpButton').setInteractive();
        this.helpButton.setDisplaySize(100, 100);
        this.helpButton.on('pointerdown', () => this.panel.showInstructions());

        this.optionsButton = this.add.image(dim/2 + 150, dim - 200,'optionsButton').setInteractive();
        this.optionsButton.setDisplaySize(100, 100);
        this.optionsButton.on('pointerdown', () => this.panel.showOptions());

        //Audio
        //let music = this.sound.add();
        //music.play({loop: true });
        
        this.panel = new Panel(this);
        this.panel.create(dim);
        this.panel.createInstructionsPanel(dim);
        this.panel.createOptionsPanel(dim);

        this.exposedVariables();
    }

    addVariable(y, label, key){
        var label = this.add.text(200, y, label, {
            color: 'yellow',
            fontSize: '24px',
            fixedWidth: 400,
            fixedHeight: 50,
            backgroundColor: '#333333',
        }).setOrigin(0.5)

        var printText = this.add.text(480, y, this.data.get(key), {
            color: 'yellow',
            fontSize: '24px',
            fixedWidth: 150,
            fixedHeight: 50,
            backgroundColor: '#333333',
        }).setOrigin(0.5)

        this.plugins.get('rextexteditplugin').add(printText, {
            type: 'text',
            onTextChanged: (textObject, text) => { textObject.text = text; this.setData(key, text); },
            selectAll: true,
        });
    }

    exposedVariables(){
        this.addVariable(300, "Velocidad Inicial:", 'initialSpeed');
        this.addVariable(360, "Velocidad Lateral:", 'horizontalSpeed');
        this.addVariable(420, "Aceleración:", 'acceleration');
        this.addVariable(480, "Espacio entre oleadas:", 'waveDelay');
        this.addVariable(540, "Tiempo puntuación en ms:", 'scoringTime');
        this.addVariable(600, "Tiempo cliente en ms:", 'deliverDelay');
        this.addVariable(660, "Tiempo power up en ms:", 'powerDelay');
        this.addVariable(720, "Tiempo de invulnerabilidad:", 'invulnerability');
    }

    setData(key, speed){
        this.data.set(key, parseInt(speed))
    }
}