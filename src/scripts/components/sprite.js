export class Sprite
{
    constructor(scene){
        // reference to the game scene
        this.scene = scene;
    }

    create(spriteSheet, offset){
        this.spriteSheet = spriteSheet;
        this.offset = offset;
        
    }

    draw(destW, destH, destX, destY){
        this.sprite.setDisplaySize(destW, destH);
        this.sprite.setPosition(destX, destY);

        if (this.offset > 0) this.sprite.flipX = true;
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