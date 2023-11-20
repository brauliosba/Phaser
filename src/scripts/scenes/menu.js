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
        this.load.image('panel', 'src/images/panel_bg.png');
        this.load.image('close', 'src/images/close.png');
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
        var instructionsPanel = this.add.nineslice(dim/2, dim/2, 'panel', 0, 800, 900, 50, 50, 50, 50);
        var instructionsText = this.add.text(instructionsPanel.width/2, 150, '¿Cómo jugar?', { fontSize : 50, fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
        var closeImage = this.add.image(dim - 170, 120, 'close').setInteractive();
        closeImage.setDisplaySize(80,80);
        closeImage.on('pointerdown', () => this.hideInstructions());

        this.instructionsDesktopContent = "- Flecha izquierda o derecha para moverte.\n\n- Barra espaciadora para recibir/entregar paquetes.\n\n- Evita los obstáculos y sé el mejor repartidor de la ciudad."
        this.instructionsMobileContent = "- Tap izquierda o derecha para moverte.\n\n- Botón de regalo para recibir/entregar paquetes.\n\n- Evita los obstáculos y sé el mejor repartidor de la ciudad."
        this.instructionsText2 = this.add.text(200, 250, this.instructionsDesktopContent, { fontSize : 50, fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
        this.instructionsText2.setWordWrapWidth(instructionsPanel.width - 100);

        this.instructionsContainer = this.add.container(0, 0, [instructionsPanel, instructionsText, this.instructionsText2, closeImage]);
        this.instructionsContainer.setVisible(false);
    }

    showInstructions(){
        if(this.data.get('IS_TOUCH')) this.instructionsText2.setText(this.instructionsMobileContent);
        this.instructionsContainer.setVisible(true);
    }

    hideInstructions(){
        this.instructionsContainer.setVisible(false);
    }
}