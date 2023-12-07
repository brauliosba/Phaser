import {Sprite} from './sprite.js';

export class Car extends Sprite
{
    constructor(scene){
        super(scene);
    }

    create(spriteSheet, offset){
        super.create(spriteSheet, offset);

        if (offset != 0) {
            this.sprite = this.scene.physics.add.sprite(0, 0, spriteSheet, spriteSheet + '_00.png');
            if (offset > 0) this.sprite.body.setOffset(50, 0);
            else this.sprite.body.setOffset(30, 0);
        }
        else {
            this.sprite = this.scene.physics.add.sprite(0, 0, spriteSheet + 'Central').play('carIdle');
            this.sprite.body.setOffset(70, 0);
        }

        this.sprite.body.setCircle(300);
        this.sprite.disableBody(false, false);
        this.sprite.setVisible(false);
    }

    draw(destW, destH, destX, destY, spriteScale){
        super.draw(destW, destH, destX, destY);

        this.sprite.setDepth(spriteScale * 20000);

        if (spriteScale * 20000 <= 5) {
            var number = Phaser.Math.RoundTo(destH/20, 0) <= 7 ? Phaser.Math.RoundTo(destH/25, 0) : 7;
            var spriteName = this.spriteSheet + '_0' + number + '.png'; 
            if (this.offset != 0) this.sprite.setTexture(this.spriteSheet, spriteName);

            this.sprite.setScale((spriteScale * 2400));
            this.sprite.enableBody();

            this.sprite.flipX = (this.offset > 0);
            this.sprite.setVisible(true);
        } else {
            this.disable();
        }    
    }

    disable(){
        super.disable();
        this.sprite.disableBody(false, false);
    }

    collisionAnim(){
        
    }
}