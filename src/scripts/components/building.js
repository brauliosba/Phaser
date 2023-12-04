import {Sprite} from './sprite.js';

export class Building extends Sprite
{
    constructor(scene){
        super(scene);
    }

    create(spriteSheet, offset){
        super.create(spriteSheet, offset);
        this.sprite = this.scene.add.sprite(0, 0, 'buildings', spriteSheet);
        this.sprite.setVisible(false);
    }

    draw(destW, destH, destX, destY, spriteScale){
        super.draw(destW, destH, destX, destY);
        this.sprite.setDepth(spriteScale);
        this.sprite.setScale((spriteScale * 18000));
    }
}