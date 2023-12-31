import {Sprite} from './sprite.js';

export class Delivery extends Sprite
{
    constructor(scene){
        super(scene);
    }

    create(spriteSheet, offset, position){
        super.create(spriteSheet, offset, position);
        this.sprite = this.scene.add.sprite(0, 0, spriteSheet);
        this.sprite.setVisible(false);

        this.checkEvent = this.scene.time.addEvent({ delay: 10, callback: this.checkPosition, callbackScope: this, loop: true });
        this.playerEvent = this.scene.time.addEvent({ delay: 10, callback: this.playerPosition, callbackScope: this, loop: true });
    }

    draw(destW, destH, destX, destY, spriteScale){
        if (spriteScale * 20000 <= 5) {
            super.draw(destW, destH, destX, destY);
            this.sprite.setDepth(spriteScale * 10000);
            this.sprite.setScale((spriteScale * 20000));
        } else {
            this.disable();
        }
    }

    disable(){
        super.disable();
        this.checkEvent.destroy();
        this.playerEvent.destroy();
    }

    checkPosition(){
        if(this.position - 10 < this.scene.circuit.baseIndex && this.scene.circuit.baseIndex < this.position + 5){
            this.scene.circuit.deliverEvent.paused = false;
            this.checkEvent.destroy();
        }
    }

    playerPosition(){
        this.scene.player.checkDelivery();
    }
}