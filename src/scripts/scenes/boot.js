export class BootScene extends Phaser.Scene {
    constructor() {
      super({ key: 'BootScene'})
      this.ready = false;
    }
    preload() {      
        //font
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');       
    }

    async create(){
        WebFont.load({
            google: {
                families: ['Montserrat:100,200,300,400,500,600,700,800,900' ]
            },
            active: () => {
                // This is required for asnyc loading
                this.ready = true
            }
        })
    }

    // Launch game when all assets are loaded
    update() {
      if (this.load.isReady() && this.ready) {
        this.scene.start('MenuScene')
      }
    }
  }