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
        this.load.image('instructionsTitle', 'src/images/UI/cartel_instrucciones.png');
        this.load.image('optionsTitle', 'src/images/UI/cartel_opciones.png');
        this.load.image('panel', 'src/images/UI/panel.png');
        this.load.image('close', 'src/images/UI/close.png');
        this.load.atlas('panelUI', 'src/images/UI/panelUI.png', 'src/images/UI/panelUI.json');
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
        
        this.helpButton = this.add.image(dim/2 - 150 , dim - 200,'helpButton').setInteractive();
        this.helpButton.setDisplaySize(100, 100);
        this.helpButton.on('pointerdown', () => this.showInstructions());

        /*
        this.optionsButton = this.add.image(dim/2 + 150, dim - 200,'optionsButton');
        this.optionsButton.setDisplaySize(100, 100);
        */

        //Instructions Panel
        this.instructionsDesktopContent = ["Flecha izquierda o derecha para moverte.", 
        "Barra espaciadora para recibir/entregar paquetes.", 
        "Evita los obstáculos y sé el mejor repartidor de la ciudad."];
        this.instructionsMobileContent = ["Tap izquierda o derecha para moverte.",
        "Botón de regalo para recibir/entregar paquetes.", 
        "Evita los obstáculos y sé el mejor repartidor de la ciudad."];
        this.instructionIndex = 0;

        var instructionsPanel = this.add.nineslice(dim/2, dim/2, 'panel', 0, 1200, 1200, 200, 200, 200, 200);
        var intructionsTitle = this.add.image(dim/2, 250, 'panelUI', 'cartel_instrucciones.png');
        intructionsTitle.setDisplaySize(500,117);

        var closeImage = this.add.image(dim - 170, 250, 'panelUI', 'close.png').setInteractive();
        closeImage.setDisplaySize(70,70);
        closeImage.on('pointerdown', () => this.hideInstructions());

        var leftArrow = this.add.image(150, dim/2, 'panelUI', 'boton_izq.png').setInteractive();
        leftArrow.setDisplaySize(100,100);
        leftArrow.on('pointerdown', () => this.leftArrowClicked());

        var rightArrow = this.add.image(dim - 150, dim/2, 'panelUI', 'boton_der.png').setInteractive();
        rightArrow.setDisplaySize(100,100);
        rightArrow.on('pointerdown', () => this.rightArrowClicked());

        var okayButton = this.add.image(dim/2, dim - 250, 'panelUI', 'boton_okey.png').setInteractive();
        okayButton.setDisplaySize(300,106);
        okayButton.on('pointerdown', () => this.hideInstructions());

        this.instructionsText = this.add.text(dim/2, dim/2, this.instructionsDesktopContent[this.instructionIndex], { 
            fontSize : 60, fontFamily: 'Montserrat, sans-serif', color: '#FCF4D9', align: 'center' }).setOrigin(0.5);
        this.instructionsText.setStroke('#2D1935', 13);
        this.instructionsText.setShadow(2, 2, '#000000', 2, true, false);
        this.instructionsText.setWordWrapWidth(instructionsPanel.width - 600);

        this.instructionsContainer = this.add.container(0, 0, [instructionsPanel, intructionsTitle, this.instructionsText, closeImage, okayButton, leftArrow, rightArrow]);
        this.instructionsContainer.setVisible(false);
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
}