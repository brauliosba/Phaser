import {Circuit} from '../components/circuit.js';
import {Camera} from '../components/camera.js';
import {Player} from '../components/player.js';
import {Scoreboard} from '../components/scoreboard.js';
import {Panel} from '../components/panel.js';

// -------------------------------------------
// Main Scene
// -------------------------------------------

export class MainScene extends Phaser.Scene
{
    constructor(){
        super({key: 'MainScene'})
    }
    
    preload(){
        this.load.image('imgBack', 'src/images/img_back.png');
        this.load.spritesheet('playerAnim', 'src/images/playerAnim.png', { frameWidth: 754, frameHeight: 816});

        //UI
        this.load.image('deliveryButton', 'src/images/UI/boton_regalo.png');
        this.load.image('panel', 'src/images/UI/panel.png');
        this.load.atlas('panelUI', 'src/images/UI/panelUI.png', 'src/images/UI/panelUI.json');

        //Buildings
        this.load.atlas('buildings', 'src/images/buildings.png', 'src/images/buildings.json');
        this.load.image('buildTemp', 'src/images/casa1.png');

        //Obstacles
        this.load.atlas('carA', 'src/images/obstacles/car_A.png', 'src/images/obstacles/car_A.json');
        this.load.spritesheet('carACentral', 'src/images/obstacles/car_A_Central.png', { frameWidth: 741, frameHeight: 597});

        //Plugins
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    init(data){
        this.data = data;
    }

    create(){
        // backgrounds
        this.sprBack = this.add.image(this.data.get('screen_c'), this.data.get('screen_c'), 'imgBack');

        // array of sprites that will be "manually" drawn on a rendering texture
        // (that's why they must invisible after the creation)
        this.sprites = [
        ]

        // inputs
        this.keyDelivery = this.input.keyboard.addKey('SPACE');
        this.keyPause = this.input.keyboard.addKey('ESC');

        //Player animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('playerAnim', { start: 3, end: 5, first: 0 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'leftTack',
            frames: this.anims.generateFrameNumbers('playerAnim', { start: 6, end: 8, first: 0 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'rightTack',
            frames: this.anims.generateFrameNumbers('playerAnim', { start: 0, end: 2, first: 0 }),
            frameRate: 20,
            repeat: -1
        });

        //Obstacles animations
        this.anims.create({
            key: 'carIdle',
            frames: this.anims.generateFrameNumbers('carACentral', { start: 0, end: 2, first: 0 }),
            frameRate: 20,
            repeat: -1
        });
        
        this.isPaused = false;

        // instances
        this.circuit = new Circuit(this);
        this.camera = new Camera(this);
        this.player = new Player(this);
        this.scoreboard = new Scoreboard(this);
        this.panel = new Panel(this);
    }

    update(time, deltaTime){
        if (!this.isPaused){
            switch(this.data.get('state')){
                case "init":
                    this.camera.init();
                    this.player.init();
                    this.data.set('state', "restart");
                    break;
                case "restart":
                    if (this.scoreboard.timedEvent == undefined && this.scoreboard.startAnim){
                        this.circuit.create();
                        this.scoreboard.create();
                        this.circuit.render3D();

                        this.panel.create(this.data.get('screen'));
                        this.panel.createPausePanel(this.data.get('screen'));
                        this.panel.createOptionsPanel(this.data.get('screen'));
                    }
                    if (!this.scoreboard.startAnim) {
                        this.player.restart();
                        this.data.set('state', "play");
                    }
                    break;
                case "play":
                    var dt = Math.min(1, deltaTime/1000);
                    this.player.update(dt);
                    this.scoreboard.update();
                    this.camera.update();
                    this.circuit.render3D();
                    break;
                case "game_over":
                    this.anims.pauseAll();
                    this.isPaused = true;
                    break;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyDelivery)){
            this.player.checkDelivery();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyPause)){
            this.pauseGame();
        }
    }

    pauseGame(){
        this.isPaused = !this.isPaused
        this.player.pause(this.isPaused);

        if (this.isPaused){
            this.anims.pauseAll();
            this.panel.showPause();
        }
        else{ 
            this.anims.resumeAll();
            this.panel.hidePause();
        }
    }
}