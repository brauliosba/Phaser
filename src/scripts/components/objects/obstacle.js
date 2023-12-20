import {Sprite} from './sprite.js';

export class Obstacle extends Sprite
{
    constructor(scene){
        super(scene);
        this.scales = [1800, 2400, 2800, 2800, 3500, 3500]
    }

    create(spriteSheet, type, offset, position){
        super.create(spriteSheet, offset, position);
        this.type = type;
        this.drawable = true;

        this.sprite = this.scene.physics.add.sprite(0, 0, 'staticObstacles', spriteSheet + '.png');
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
            this.sprite.setDepth(spriteScale * 10000);
            this.sprite.setScale(spriteScale * this.scales[this.type - 1]);
            this.sprite.setVisible(true);

            this.centerBodyOnBody(this.b1.body, this.sprite.body);

            if (this.b1.body.embedded) {
                this.b1.body.touching.none = false;
            }
            
            if (this.b1.body.touching.none && !this.b1.body.wasTouching.none) {
                this.scene.player.playerCloseCallCollision();
            }
        }else{
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

    collisionAnim()
    {
        if (this.spriteSheet == 'obstacle1') {
            this.sprite.setDepth(5);
            this.sprite.setScale(.5);
            this.sprite.setPosition(this.sprite.x - 70, this.sprite.y - 70)
        }
        this.sprite.play(this.spriteSheet + 'Break');
        this.sprite.on('animationcomplete', () => 
            { 
                if (this.scene.data.get('state') == "game_over") {
                    this.sprite.setVisible(false); 
                    this.scene.anims.pauseAll();
                } 
            });
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