import {Sprite} from './sprite.js';

export class Car extends Sprite
{
    constructor(scene){
        super(scene);
    }

    create(spriteSheet, offset, position){
        super.create(spriteSheet, offset, position);
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
        this.sprite.setVisible(false);

        this.b1 = this.scene.physics.add.image();
        this.b1.setDebugBodyColor(0xffff00);

        this.scene.physics.add.overlap(this.sprite, this.scene.player.playerBody, () => 
            { this.scene.player.playerCollision(); this.collisionAnim(); });

        //var closeCall = this.scene.physics.add.overlap(this.b1, this.scene.player.b1, () => 
        //    { closeCall.active = false; this.scene.player.playerCloseCallCollision(this.b1); });

        this.scene.physics.add.overlap(this.b1, this.scene.player.b1);

        this.checkEvent = this.scene.time.addEvent({ delay: 10, callback: this.checkPosition, callbackScope: this, loop: true });
    }

    draw(destW, destH, destX, destY, spriteScale){
        if (this.drawable && spriteScale * 20000 <= 5) {
            super.draw(destW, destH, destX, destY);

            this.sprite.setScale((spriteScale * 2400));
            this.sprite.setDepth(spriteScale * 20000);

            var number = Phaser.Math.RoundTo(destH/20, 0) <= 7 ? Phaser.Math.RoundTo(destH/25, 0) : 7;
            var spriteName = this.spriteSheet + '_0' + number + '.png'; 
            if (this.offset != 0) this.sprite.setTexture(this.spriteSheet, spriteName);

            this.sprite.flipX = (this.offset > 0);
            this.sprite.setVisible(true);

            this.centerBodyOnBody(this.b1.body, this.sprite.body);

            if (this.b1.body.embedded) {
                this.b1.body.touching.none = false;
            }
            
            if (this.b1.body.touching.none && !this.b1.body.wasTouching.none) {
                this.scene.player.playerCloseCallCollision();
            }
        } else{
            this.disable();
        }
    }

    disable(){
        super.disable();
        this.sprite.disableBody(false, false);
        this.b1.disableBody(false, false);
        this.checkEvent.destroy();
        this.drawable = false;
    }

    collisionAnim(){
        if (this.scene.data.get('state') == "game_over") {
            this.scene.anims.pauseAll();
        } 
    }

    checkPosition(){
        if(this.position - 3 < this.scene.circuit.baseIndex && this.scene.circuit.baseIndex - 3 < this.position + 20){
            this.disable();
        }        
    }

    centerBodyOnBody (a, b) {
        a.position.set(b.x, b.y + .7 * b.height);
        a.setSize(b.width, b.height / 10);
    }
}