export class Obstacle
{
    constructor(scene){
        // reference to the game scene
        this.scene = scene;
    }

    create(spriteSheet, offset){
        this.spriteSheet = spriteSheet;
        this.offset = offset;
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

    draw(destW, destH, spriteX, spriteY, spriteScale){
        this.sprite.setDisplaySize(destW, destH);
        this.sprite.setDepth(spriteScale * 20000);
        this.sprite.setPosition(spriteX, spriteY);

        var number = Phaser.Math.RoundTo(destH/20, 0) <= 7 ? Phaser.Math.RoundTo(destH/25, 0) : 7;
        var spriteName = this.spriteSheet + '_0' + number + '.png'; 
        if (this.offset != 0) this.sprite.setTexture('carA', spriteName);

        this.sprite.setScale((spriteScale * 2400));
        this.sprite.enableBody();

        if (this.offset > 0) this.sprite.flipX = true;
        else this.sprite.flipX = false;
        this.sprite.setVisible(true);
    }

    disable(){
        this.sprite.disableBody(false, false);
        this.sprite.setVisible(false);
    }

    destroy(){
        this.sprite.destroy();
        this.sprite = null;
    }
}