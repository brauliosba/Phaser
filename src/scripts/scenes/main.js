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
        this.load.spritesheet('playerRun', 'src/images/playerRun.png', { frameWidth: 1500, frameHeight: 1000});
        this.load.spritesheet('playerTack', 'src/images/playerTack.png', { frameWidth: 1500, frameHeight: 1000});
        this.load.spritesheet('playerReceive', 'src/images/playerReceive.png', { frameWidth: 1500, frameHeight: 1000});
        this.load.spritesheet('playerSend', 'src/images/playerSend.png', { frameWidth: 1500, frameHeight: 1000});

        //UI
        this.load.image('deliveryButton', 'src/images/UI/boton_regalo.png');
        this.load.image('pauseButton', 'src/images/UI/boton_pausa.png');
        this.load.image('panel', 'src/images/UI/panel.png');
        this.load.atlas('panelUI', 'src/images/UI/panelUI.png', 'src/images/UI/panelUI.json');

        //Buildings
        this.load.atlas('buildings', 'src/images/buildings.png', 'src/images/buildings.json');
        this.load.image('buildTemp', 'src/images/casa1.png');

        //Obstacles
        this.load.atlas('obstacle0', 'src/images/obstacles/obstacle_A.png', 'src/images/obstacles/obstacle_A.json');
        this.load.spritesheet('obstacle0Central', 'src/images/obstacles/obstacle_A_Central.png', { frameWidth: 741, frameHeight: 597});
        this.load.atlas('staticObstacles', 'src/images/obstacles/staticObstacles.png', 'src/images/obstacles/staticObstacles.json');


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
        this.data.set('state', "init");
        this.dim = this.data.get('screen');

        // backgrounds
        let sprBack = this.add.image(this.dim/2, this.dim/2, 'imgBack');
        let pauseButton = this.add.image(this.dim - 100, 130, 'pauseButton').setInteractive();
        pauseButton.on('pointerdown', () => this.pauseGame());
        pauseButton.setDepth(9)
        pauseButton.setDisplaySize(50, 50);

        // inputs
        this.keyDelivery = this.input.keyboard.addKey('SPACE');
        this.keyPause = this.input.keyboard.addKey('ESC');
        this.keyRestart = this.input.keyboard.addKey('R');

        //Player animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('playerRun', { start: 0, end: 2, first: 0 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'tack',
            frames: this.anims.generateFrameNumbers('playerTack', { start: 0, end: 2, first: 0 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'receive',
            frames: this.anims.generateFrameNumbers('playerReceive', { start: 0, end: 2, first: 0 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.anims.create({
            key: 'send',
            frames: this.anims.generateFrameNumbers('playerSend', { start: 0, end: 2, first: 0 }),
            frameRate: 10,
            repeat: 0
        });

        //Obstacles animations
        this.anims.create({
            key: 'carIdle',
            frames: this.anims.generateFrameNumbers('obstacle0Central', { start: 0, end: 2, first: 0 }),
            frameRate: 20,
            repeat: -1
        });
        
        this.isPaused = false;
        this.startAnim = true;
        this.startEvent = null;

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
                    if (this.startEvent == undefined && this.startAnim){
                        this.circuit.create();
                        this.scoreboard.create();
                        this.circuit.render3D();

                        this.start(this.dim);

                        this.panel.create(this.dim);
                        this.panel.createPausePanel(this.dim);
                        this.panel.createOptionsPanel(this.dim);
                    }
                    if (!this.startAnim) {
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
        if (Phaser.Input.Keyboard.JustDown(this.keyPause) && !this.startAnim){
            this.pauseGame();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyRestart)){
            this.scene.start('MainScene', this.data);
        }
    }

    start(){
        this.startCounter = 3;

        this.startText = this.add.text(0, 0, this.startCounter, { font: '600 400px Montserrat' });
        this.startText.setPosition(this.dim/2 - this.startText.width/2, this.dim/2 - this.startText.height/1.5);
        this.startText.setFill("black");
        this.startText.setDepth(11);

        this.startBG = this.add.image(this.dim/2,this.dim/2, 'imgBack').setInteractive();
        this.startBG.setAlpha(0.01);
        this.startBG.setDepth(11);
        this.startBG.setDisplaySize(this.dim, this.dim);

        //Each 1000 ms call onEvent
        this.startEvent = this.time.addEvent({ delay: 1000, callback: this.startAnimation, callbackScope: this, loop: true });
    }

    startAnimation(){
        this.startCounter -= 1;

        if (this.startCounter == 0){ 
            this.startText.setFontSize(250);
            this.startText.setText('Corre!');
            this.startText.setPosition(this.dim/2 - this.startText.width/2, this.dim/2 - this.startText.height/1.5);
        }
        else if (this.startCounter > 0){
            this.startText.setText(this.startCounter);
        }
        else{
            this.startText.setVisible(false);
            this.startBG.setVisible(false);
            this.startAnim = false;
            this.startEvent.destroy();
            this.startEvent = undefined;
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