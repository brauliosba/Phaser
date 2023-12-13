import {Sprite} from './sprite.js';

export class Obstacle extends Sprite
{
    constructor(scene){
        super(scene);
    }

    create(spriteSheet, type, offset, position){
        super.create(spriteSheet, offset, position);
        this.type = type;
        this.drawable = true;

        this.sprite = this.scene.physics.add.sprite(0, 0, 'staticObstacles', spriteSheet + '.png');
        this.sprite.body.moves = false;
        this.sprite.body.pushable = false;
        this.sprite.disableBody(false, false);
        this.sprite.setVisible(false);

        this.checkEvent = this.scene.time.addEvent({ delay: 10, callback: this.checkPosition, callbackScope: this, loop: true });
    }

    draw(destW, destH, destX, destY, spriteScale){
        if (this.drawable && spriteScale * 20000 <= 5) {
            super.draw(destW, destH, destX, destY);

            this.sprite.setDepth(spriteScale * 10000);

            if (this.type == 1) this.sprite.setScale((spriteScale * 1800));
            else this.sprite.setScale((spriteScale * 2400));
            this.sprite.enableBody();
            this.sprite.setVisible(true);
        }
        else{
            this.disable();
        }
    }

    disable(){
        super.disable();
        this.sprite.disableBody(false, false);
        this.checkEvent.destroy();
        this.drawable = false;
    }

    collisionAnim()
    {
        console.log(this.spriteSheet);
        this.sprite.play(this.spriteSheet + 'Break');
        this.sprite.on('animationcomplete', () => { this.sprite.setVisible(false); this.scene.anims.pauseAll() });
    }

    checkPosition(){
        if(this.position - 3 < this.scene.circuit.baseIndex && this.scene.circuit.baseIndex - 3 < this.position + 20){
            this.disable();
        }
    }
}