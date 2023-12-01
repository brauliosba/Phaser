export class Panel
{
    constructor(scene){
        // reference to the game scene
        this.scene = scene;
    }

    create(dim){
        let bg = this.scene.add.image(dim/2, dim/2, 'panel').setInteractive();
        bg.setTint('0x000000');
        bg.setAlpha(0.1);
        bg.setScale(2);

        this.panel = this.scene.add.nineslice(dim/2, dim/2, 'panel', 0, 1210, 1230, 200, 200, 200, 200);

        this.panelContainer = this.scene.add.container(0, 0, [bg, this.panel]);
        this.panelContainer.setDepth(10);
        this.panelContainer.setVisible(false);

        this.pauseContainer;
    }

    createPausePanel(dim){
        var pauseTitle = this.scene.add.image(dim/2, 250, 'panelUI', 'cartel_pausa.png');
        pauseTitle.setDisplaySize(560,130);

        var closeImage = this.scene.add.image(dim - 150, 240, 'panelUI', 'close.png').setInteractive();
        closeImage.setDisplaySize(80,80);
        closeImage.on('pointerdown', () => { this.scene.pauseGame(); });

        var continueButton = this.scene.add.image(dim/2, dim/2-125, 'panelUI', 'boton_continuar.png').setInteractive();
        continueButton.setDisplaySize(560,120);
        continueButton.on('pointerdown', () => { this.scene.pauseGame(); });

        var optionsButton = this.scene.add.image(dim/2, dim/2+15, 'panelUI', 'boton_opciones.png').setInteractive();
        optionsButton.setDisplaySize(560,120);
        optionsButton.on('pointerdown', () => { this.hidePause(); this.showOptions(); });

        var exitButton = this.scene.add.image(dim/2, dim/2+155, 'panelUI', 'boton_salir.png').setInteractive();
        exitButton.setDisplaySize(560,120);
        exitButton.on('pointerdown', () => { this.scene.scene.start('MenuScene', this.data); });

        this.pauseContainer = this.scene.add.container(0, 0, [pauseTitle, closeImage, continueButton, optionsButton, exitButton]);
        this.pauseContainer.setVisible(false);
        this.pauseContainer.setDepth(10);
    }

    createInstructionsPanel(dim){
        this.instructionsDesktopContent = ["Flecha izquierda o derecha para moverte.", 
        "Barra espaciadora para recibir/entregar paquetes.", 
        "Evita los obstáculos y sé el mejor repartidor de la ciudad."];
        this.instructionsMobileContent = ["Tap izquierda o derecha para moverte.",
        "Botón de regalo para recibir/entregar paquetes.", 
        "Evita los obstáculos y sé el mejor repartidor de la ciudad."];
        this.instructionIndex = 0;
  
        var intructionsTitle = this.scene.add.image(dim/2, 250, 'panelUI', 'cartel_instrucciones.png');
        intructionsTitle.setDisplaySize(560,130);

        var closeImage = this.scene.add.image(dim - 150, 240, 'panelUI', 'close.png').setInteractive();
        closeImage.setDisplaySize(80,80);
        closeImage.on('pointerdown', () => this.hideInstructions());

        var leftArrow = this.scene.add.image(150, dim/2, 'panelUI', 'boton_izq.png').setInteractive();
        leftArrow.setDisplaySize(120,120);
        leftArrow.on('pointerdown', () => this.leftArrowClicked());

        var rightArrow = this.scene.add.image(dim - 150, dim/2, 'panelUI', 'boton_der.png').setInteractive();
        rightArrow.setDisplaySize(120,120);
        rightArrow.on('pointerdown', () => this.rightArrowClicked());

        var okayButton = this.scene.add.image(dim/2, dim - 245, 'panelUI', 'boton_okey.png').setInteractive();
        okayButton.setDisplaySize(340,120);
        okayButton.on('pointerdown', () => this.hideInstructions());

        this.instructionsText = this.scene.add.text(dim/2, dim/2, this.instructionsDesktopContent[this.instructionIndex], { 
            font: '600 60px Montserrat', color: '#FCF4D9', align: 'center' }).setOrigin(0.5);
        this.instructionsText.setStroke('#2D1935', 13);
        this.instructionsText.setShadow(2, 2, '#000000', 2, true, false);
        this.instructionsText.setWordWrapWidth(this.panel.width - 600);

        this.instructionsContainer = this.scene.add.container(0, 0, [intructionsTitle, closeImage, this.instructionsText, okayButton, leftArrow, rightArrow]);
        this.instructionsContainer.setVisible(false);
        this.instructionsContainer.setDepth(10);
    }

    createOptionsPanel(dim){
        var optionsTitle = this.scene.add.image(dim/2, 250, 'panelUI', 'cartel_opciones.png');
        optionsTitle.setDisplaySize(560,130);

        var closeImage = this.scene.add.image(dim - 150, 240, 'panelUI', 'close.png').setInteractive();
        closeImage.setDisplaySize(80,80);
        closeImage.on('pointerdown', () => this.hideOptions());

        var musicTitle = this.scene.add.text(dim/2, dim/2 - 140, 'Música', { 
            font: '800 40px Montserrat', color: '#FCF4D9', align: 'center' }).setOrigin(0.5);
        musicTitle.setStroke('#2D1935', 13);
        musicTitle.setShadow(2, 2, '#000000', 2, true, false);

        var musicSlider = this.scene.rexUI.add.slider({
            x: dim/2,
            y: dim/2 - 70,
            width: 460,
            height: 70,
            orientation: 'x',
            value:1,

            track: this.scene.add.sprite(0,0,'panelUI','slider_bg.png'),
            indicator: this.addCropResizeMethod(this.scene.add.sprite(0,0,'panelUI','slider_relleno.png').setDisplaySize(600,35)),
            thumb: this.scene.add.sprite(0,0,'panelUI','thumb.png').setDisplaySize(55,70),

            input: 'drag'|'click',
            valuechangeCallback: function (value) {
                //sound.volume = value; // set volume between 0 - 1
            },

        }).layout();

        var sfxTitle = this.scene.add.text(dim/2, dim/2 + 50, 'Sonido', { 
            font: '800 40px Montserrat', color: '#FCF4D9', align: 'center' }).setOrigin(0.5);
        sfxTitle.setStroke('#2D1935', 13);
        sfxTitle.setShadow(2, 2, '#000000', 2, true, false);
        
        var sfxSlider = this.scene.rexUI.add.slider({
            x: dim/2,
            y: dim/2 + 120,
            width: 460,
            height: 70,
            orientation: 'x',
            value:1,

            track: this.scene.add.sprite(0,0,'panelUI','slider_bg.png'),
            indicator: this.addCropResizeMethod(this.scene.add.sprite(0,0,'panelUI','slider_relleno.png').setDisplaySize(600,35)),
            thumb: this.scene.add.sprite(0,0,'panelUI','thumb.png').setDisplaySize(55,70),

            input: 'drag'|'click',
            valuechangeCallback: function (value) {
                //sound.volume = value; // set volume between 0 - 1
            },

        }).layout();
        this.optionsContainer = this.scene.add.container(0, 0, [optionsTitle, closeImage, sfxSlider, sfxTitle, musicTitle, musicSlider]);
        this.optionsContainer.setVisible(false);
        this.optionsContainer.setDepth(10);
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
        if(this.scene.data.get('IS_TOUCH')) this.instructionsText.setText(this.instructionsMobileContent[this.instructionIndex]);
        else this.instructionsText.setText(this.instructionsDesktopContent[this.instructionIndex]);
    }

    showInstructions(){
        if(this.scene.data.get('IS_TOUCH')) this.instructionsText.setText(this.instructionsMobileContent[this.instructionIndex]);
        this.instructionsContainer.setVisible(true);
        this.panelContainer.setVisible(true);
    }

    hideInstructions(){
        this.instructionsContainer.setVisible(false);
        this.panelContainer.setVisible(false);
    }

    showOptions(){
        this.optionsContainer.setVisible(true);
        this.panelContainer.setVisible(true);
    }

    hideOptions(){
        this.optionsContainer.setVisible(false);
        this.panelContainer.setVisible(false);

        if (this.pauseContainer!= null) this.showPause();
    }

    showPause(){
        this.pauseContainer.setVisible(true);
        this.panelContainer.setVisible(true);
    }

    hidePause(){
        this.pauseContainer.setVisible(false);
        this.panelContainer.setVisible(false);
    }
}