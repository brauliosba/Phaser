import {Sprite} from './sprite.js';

export class Obstacle extends Sprite
{
    constructor(scene){
        super(scene);
    }

    create(spriteSheet, type, offset){
        super.create(spriteSheet, offset);
        this.type = type;
        this.sprite = this.scene.physics.add.sprite(0, 0, 'staticObstacles', spriteSheet + '.png');
        this.sprite.body.moves = false;
        this.sprite.body.pushable = false;
        this.sprite.disableBody(false, false);
        this.sprite.setVisible(false);
    }

    draw(destW, destH, destX, destY, spriteScale){
        super.draw(destW, destH, destX, destY);

        this.sprite.setDepth(spriteScale * 10000);

        if (spriteScale * 20000 <= 5) {
            if (this.type == 1) this.sprite.setScale((spriteScale * 1800));
            else this.sprite.setScale((spriteScale * 2400));
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

    collisionAnim()
    {
        console.log(this.spriteSheet);
        this.sprite.play(this.spriteSheet + 'Break');
        this.sprite.on('animationcomplete', () => { this.sprite.setVisible(false); this.scene.anims.pauseAll() });
    }
}