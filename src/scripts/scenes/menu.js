// -------------------------------------------
// Menu Scene
// -------------------------------------------
export class MenuScene extends Phaser.Scene
{
    constructor(){
        super({key: 'MenuScene'})
    }
    
    preload(){
        this.load.image('menuBG', 'src/images/UI/menu_pantalla.png');
        this.load.image('playButton', 'src/images/UI/menu_botones_play.png');
        this.load.image('helpButton', 'src/images/UI/menu_botones_help.png');
        this.load.image('optionsButton', 'src/images/UI/menu_botones_options.png');
        this.load.image('panel', 'src/images/UI/panel.png');
        this.load.atlas('panelUI', 'src/images/UI/panelUI.png', 'src/images/UI/panelUI.json');
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
        this.data.set('state', "init");
        this.data.set('initialSpeed', 3000);
        this.data.set('horizontalSpeed', 500);
        this.data.set('acceleration', 10);
        this.data.set('waveDelay', 20);

        this.sprBack = this.add.image(dim/2, dim/2, 'menuBG');
        this.sprBack.setDisplaySize(dim, dim);

        this.startButton = this.add.image(dim/2, dim - 200,'playButton').setInteractive();
        this.startButton.setDisplaySize(150, 150);
        this.startButton.on('pointerdown', () => { this.scene.start('MainScene', this.data); });

        window.addEventListener('touchstart', () => {this.data.set('IS_TOUCH', "true"); });
        
        this.helpButton = this.add.image(dim/2 - 150 , dim - 200,'helpButton').setInteractive();
        this.helpButton.setDisplaySize(100, 100);
        this.helpButton.on('pointerdown', () => this.showInstructions());

        this.optionsButton = this.add.image(dim/2 + 150, dim - 200,'optionsButton').setInteractive();
        this.optionsButton.setDisplaySize(100, 100);
        this.optionsButton.on('pointerdown', () => this.showOptions());

        //Audio
        //let music = this.sound.add();
        //music.play({loop: true });
        
        //Instructions Panel
        this.createInstructionsPanel(dim);

        //OptionsPanel
        this.createOptionsPanel(dim);

        this.exposedVariables();
    }

    exposedVariables(){
        var printText = this.add.text(200, 300, "Velocidad Inicial: " + this.data.get('initialSpeed'), {
            color: 'yellow',
            fontSize: '24px',
            fixedWidth: 400,
            fixedHeight: 50,
            backgroundColor: '#333333',
        }).setOrigin(0.5)

        this.plugins.get('rextexteditplugin').add(printText, {
            type: 'text',
            onTextChanged: (textObject, text) => { textObject.text = text; this.setData('initialSpeed', text); },
            selectAll: true,
        });
        
        var printText2 = this.add.text(200, 360, "Velocidad Lateral: " + this.data.get('horizontalSpeed'), {
            color: 'yellow',
            fontSize: '24px',
            fixedWidth: 400,
            fixedHeight: 50,
            backgroundColor: '#333333',
        }).setOrigin(0.5)

        this.plugins.get('rextexteditplugin').add(printText2, {
            type: 'text',
            onTextChanged: (textObject, text) => { textObject.text = text; this.setData('horizontalSpeed', text); },
            selectAll: true,
        });

        var printText3 = this.add.text(200, 420, "Aceleración: " + this.data.get('acceleration'), {
            color: 'yellow',
            fontSize: '24px',
            fixedWidth: 400,
            fixedHeight: 50,
            backgroundColor: '#333333',
        }).setOrigin(0.5)

        this.plugins.get('rextexteditplugin').add(printText3, {
            type: 'text',
            onTextChanged: (textObject, text) => { textObject.text = text; this.setData('acceleration', text); },
            selectAll: true,
        });

        var printText4 = this.add.text(200, 480, "Espacio entre oleadas: " + this.data.get('waveDelay'), {
            color: 'yellow',
            fontSize: '24px',
            fixedWidth: 400,
            fixedHeight: 50,
            backgroundColor: '#333333',
        }).setOrigin(0.5)

        this.plugins.get('rextexteditplugin').add(printText4, {
            type: 'text',
            onTextChanged: (textObject, text) => { textObject.text = text; this.setData('waveDelay', text); },
            selectAll: true,
        });
    }

    setData(key, speed){
        this.data.set(key, parseInt(speed))
    }

    createInstructionsPanel(dim){
        this.instructionsDesktopContent = ["Flecha izquierda o derecha para moverte.", 
        "Barra espaciadora para recibir/entregar paquetes.", 
        "Evita los obstáculos y sé el mejor repartidor de la ciudad."];
        this.instructionsMobileContent = ["Tap izquierda o derecha para moverte.",
        "Botón de regalo para recibir/entregar paquetes.", 
        "Evita los obstáculos y sé el mejor repartidor de la ciudad."];
        this.instructionIndex = 0;

        var instructionsPanel = this.add.nineslice(dim/2, dim/2, 'panel', 0, 1210, 1230, 200, 200, 200, 200);
        var intructionsTitle = this.add.image(dim/2, 250, 'panelUI', 'cartel_instrucciones.png');
        intructionsTitle.setDisplaySize(560,130);

        var closeImage = this.add.image(dim - 150, 240, 'panelUI', 'close.png').setInteractive();
        closeImage.setDisplaySize(80,80);
        closeImage.on('pointerdown', () => this.hideInstructions());

        var leftArrow = this.add.image(150, dim/2, 'panelUI', 'boton_izq.png').setInteractive();
        leftArrow.setDisplaySize(120,120);
        leftArrow.on('pointerdown', () => this.leftArrowClicked());

        var rightArrow = this.add.image(dim - 150, dim/2, 'panelUI', 'boton_der.png').setInteractive();
        rightArrow.setDisplaySize(120,120);
        rightArrow.on('pointerdown', () => this.rightArrowClicked());

        var okayButton = this.add.image(dim/2, dim - 245, 'panelUI', 'boton_okey.png').setInteractive();
        okayButton.setDisplaySize(340,120);
        okayButton.on('pointerdown', () => this.hideInstructions());

        this.instructionsText = this.add.text(dim/2, dim/2, this.instructionsDesktopContent[this.instructionIndex], { 
            fontSize : 60, fontFamily: 'Montserrat, sans-serif', color: '#FCF4D9', align: 'center' }).setOrigin(0.5);
        this.instructionsText.setStroke('#2D1935', 13);
        this.instructionsText.setShadow(2, 2, '#000000', 2, true, false);
        this.instructionsText.setWordWrapWidth(instructionsPanel.width - 600);

        this.instructionsContainer = this.add.container(0, 0, [instructionsPanel, intructionsTitle, this.instructionsText, closeImage, okayButton, leftArrow, rightArrow]);
        this.instructionsContainer.setVisible(false);
    }

    createOptionsPanel(dim){
        var optionsPanel = this.add.nineslice(dim/2, dim/2, 'panel', 0, 1210, 1230, 200, 200, 200, 200);
        var optionsTitle = this.add.image(dim/2, 250, 'panelUI', 'cartel_opciones.png');
        optionsTitle.setDisplaySize(560,130);

        var closeImage = this.add.image(dim - 150, 240, 'panelUI', 'close.png').setInteractive();
        closeImage.setDisplaySize(80,80);
        closeImage.on('pointerdown', () => this.hideOptions());

        var musicTitle = this.add.text(dim/2, dim/2 - 140, 'Música', { 
            fontSize : 40, fontFamily: 'Montserrat, sans-serif', color: '#FCF4D9', align: 'center' }).setOrigin(0.5);
        musicTitle.setStroke('#2D1935', 13);
        musicTitle.setShadow(2, 2, '#000000', 2, true, false);

        var musicSlider = this.rexUI.add.slider({
            x: dim/2,
            y: dim/2 - 70,
            width: 460,
            height: 70,
            orientation: 'x',
            value:1,

            track: this.add.sprite(0,0,'panelUI','barra_vacia.png'),
            indicator: this.addCropResizeMethod(this.add.sprite(0,0,'panelUI','barra_relleno.png').setDisplaySize(600,35)),
            thumb: this.add.sprite(0,0,'panelUI','thumb.png').setDisplaySize(55,70),

            input: 'drag'|'click',
            valuechangeCallback: function (value) {
                //sound.volume = value; // set volume between 0 - 1
            },

        }).layout();

        var sfxTitle = this.add.text(dim/2, dim/2 + 50, 'Sonido', { 
            fontSize : 40, fontFamily: 'Montserrat, sans-serif', color: '#FCF4D9', align: 'center' }).setOrigin(0.5);
        sfxTitle.setStroke('#2D1935', 13);
        sfxTitle.setShadow(2, 2, '#000000', 2, true, false);
        
        var sfxSlider = this.rexUI.add.slider({
            x: dim/2,
            y: dim/2 + 120,
            width: 460,
            height: 70,
            orientation: 'x',
            value:1,

            track: this.add.sprite(0,0,'panelUI','barra_vacia.png'),
            indicator: this.addCropResizeMethod(this.add.sprite(0,0,'panelUI','barra_relleno.png').setDisplaySize(600,35)),
            thumb: this.add.sprite(0,0,'panelUI','thumb.png').setDisplaySize(55,70),

            input: 'drag'|'click',
            valuechangeCallback: function (value) {
                //sound.volume = value; // set volume between 0 - 1
            },

        }).layout();
        this.optionsContainer = this.add.container(0, 0, [optionsPanel, optionsTitle, closeImage, sfxSlider, sfxTitle, musicTitle, musicSlider]);
        this.optionsContainer.setVisible(false);
    }

    addCropResizeMethod = function (gameObject) {
        gameObject.resize = function (width, height) {
            gameObject.setCrop(0, 0, width, height);
            return gameObject;
        }
    
        return gameObject;
    }

    leftArrowClicked(){
        this.instructionIndex = this.instructionIndex - 1 >= 0 ? this.instructionIndex - 1 : this.instructionsDesktopContent.length - 1;
        this.setInstructionsText();
    }

    rightArrowClicked(){
        this.instructionIndex = this.instructionIndex + 1 < this.instructionsDesktopContent.length  ? this.instructionIndex + 1 : 0;
        this.setInstructionsText();
    }

    setInstructionsText(){
        if(this.data.get('IS_TOUCH')) this.instructionsText.setText(this.instructionsMobileContent[this.instructionIndex]);
        else this.instructionsText.setText(this.instructionsDesktopContent[this.instructionIndex]);
    }

    showInstructions(){
        if(this.data.get('IS_TOUCH')) this.instructionsText.setText(this.instructionsMobileContent[this.instructionIndex]);
        this.instructionsContainer.setVisible(true);
    }

    hideInstructions(){
        this.instructionsContainer.setVisible(false);
    }

    showOptions(){
        this.optionsContainer.setVisible(true);
    }

    hideOptions(){
        this.optionsContainer.setVisible(false);
    }
}