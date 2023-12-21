import {Sprite} from './sprite.js';

export class Building extends Sprite
{
    constructor(scene){
        super(scene);

        this.buildings = [
            {name: 'casa_1.png', offset1: 2.85, offset2: -1.55}, 
            {name: 'casa_2.png', offset1: 2.85, offset2: -1.65},
            {name: 'casa_3.png', offset1: 2.60, offset2: -1.25},
            {name: 'casa_4.png', offset1: 2.65, offset2: -1.35},
            {name: 'casa_5.png', offset1: 2.65, offset2: -1.30},
        ]
    }

    create(value, offset, position){
        var spriteKey = this.buildings[value].name;
        var buildingOffset = offset == 0 ? this.buildings[value].offset1 :this.buildings[value].offset2;
        super.create(spriteKey, buildingOffset, position);
        this.sprite = this.scene.add.sprite(0, 0, 'buildings', spriteKey);
        this.sprite.setVisible(false);
    }

    draw(destW, destH, destX, destY, spriteScale){
        super.draw(destW, destH, destX, destY);
        this.sprite.setDepth(spriteScale);
        this.sprite.setScale((spriteScale * 18000));
        this.sprite.flipX = (this.offset < 0);
    }
}