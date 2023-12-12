import {Sprite} from './sprite.js';

export class PickUp extends Sprite
{
    constructor(scene){
        super(scene);
    }

    create(spriteSheet, offset){
        super.create(spriteSheet, offset);
        this.sprite = this.scene.physics.add.sprite(0, 0, spriteSheet);
        this.sprite.disableBody(false, false);
        this.sprite.setVisible(false);
    }

    draw(destW, destH, destX, destY, spriteScale){
        super.draw(destW, destH, destX, destY);

        this.sprite.setDepth(spriteScale * 10000);

        if (spriteScale * 20000 <= 5) {
            this.sprite.setScale((spriteScale * 2400));
            this.sprite.enableBody();
            this.sprite.setVisible(true);
        } else {
            this.disable();
        }    
    }

    disable(){
        super.disable();
        this.sprite.disableBody(false, false);
    }
}