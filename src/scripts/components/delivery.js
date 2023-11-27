export class Delivery
{
    constructor(scene){
        // reference to the game scene
        this.scene = scene;
    }

    create(spriteSheet, offset){
        this.spriteSheet = spriteSheet;
        this.offset = offset;
        this.sprite = this.scene.add.sprite(0, 0, spriteSheet);
        this.sprite.setVisible(false);
        this.sprite.setDepth(4);
    }

    draw(destW, destH, destX, destY, spriteScale){
        this.sprite.setDisplaySize(destW, destH);
        this.sprite.setDepth(spriteScale * 10);
        this.sprite.setPosition(destX, destY);
        this.sprite.setScale((spriteScale * 20000));

        if (this.offset < 0) this.sprite.flipX = true;
        else this.sprite.flipX = false;
        this.sprite.setVisible(true);
    }

    disable(){
        this.sprite.setVisible(false);
    }

    destroy(){
        this.sprite.destroy();
        this.sprite = null;
    }
}