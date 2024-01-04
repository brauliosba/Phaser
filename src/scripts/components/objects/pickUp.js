import {Sprite} from './sprite.js';

export class PickUp extends Sprite
{
    constructor(scene){
        super(scene);
    }

    create(spriteSheet, offset, type, position){
        super.create(spriteSheet, offset, position);
        this.sprite = this.scene.physics.add.sprite(0, 0, 'icons', spriteSheet);
        this.sprite.disableBody(false, false);
        this.sprite.setVisible(false);
        this.type = type;
        this.drawable = true;
        if (type == 'power') this.checkEvent = this.scene.time.addEvent({ delay: 10, callback: this.checkPosition, callbackScope: this, loop: true });
    }

    draw(destW, destH, destX, destY, spriteScale){
        if (this.drawable && spriteScale * 20000 <= 5) {
            super.draw(destW, destH, destX, destY);
            this.sprite.setDepth(spriteScale * 10000);
            this.sprite.setScale((spriteScale * 5000));
            this.sprite.enableBody();
            this.sprite.setVisible(true);
        } else {
            this.disable();
        }
    }

    disable(){
        super.disable();
        this.drawable = false;
        this.sprite.disableBody(false, false);
        if (this.type == 'power') this.checkEvent.destroy();
    }

    checkPosition(){
        if(this.position - 10 < this.scene.circuit.baseIndex && this.scene.circuit.baseIndex < this.position + 5){
            this.scene.circuit.powerEvent.paused = false;
            this.checkEvent.destroy();
        }
    }
}