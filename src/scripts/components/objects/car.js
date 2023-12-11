import {Sprite} from './sprite.js';

export class Car extends Sprite
{
    constructor(scene){
        super(scene);
    }

    create(spriteSheet, offset, position){
        super.create(spriteSheet, offset);
        this.position = position;
        this.drawable = true;

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
        this.sprite.body.moves = false;
        this.sprite.body.pushable = false;
        this.sprite.disableBody(false, false);
        this.sprite.setVisible(false);

        this.checkEvent = this.scene.time.addEvent({ delay: 10, callback: this.checkPosition, callbackScope: this, loop: true });
    }

    draw(destW, destH, destX, destY, spriteScale){
        if (this.drawable) {
            super.draw(destW, destH, destX, destY);

            this.sprite.setDepth(spriteScale * 20000);

            var number = Phaser.Math.RoundTo(destH/20, 0) <= 7 ? Phaser.Math.RoundTo(destH/25, 0) : 7;
            var spriteName = this.spriteSheet + '_0' + number + '.png'; 
            if (this.offset != 0) this.sprite.setTexture(this.spriteSheet, spriteName);

            this.sprite.setScale((spriteScale * 2400));
            this.sprite.enableBody();

            this.sprite.flipX = (this.offset > 0);
            this.sprite.setVisible(true);
        }
    }

    disable(){
        super.disable();
        this.sprite.disableBody(false, false);
        this.checkEvent.destroy();
        this.drawable = false;
    }

    collisionAnim(){
        this.scene.anims.pauseAll();
        console.log(this.spriteSheet);
    }

    checkPosition(){
        if(this.position - 3 < this.scene.circuit.baseIndex && this.scene.circuit.baseIndex - 3 < this.position + 20){
            this.disable();
        }
    }
}