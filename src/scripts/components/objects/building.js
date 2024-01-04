import {Sprite} from './sprite.js';

export class Building extends Sprite
{
    constructor(scene){
        super(scene);

        this.buildings = [
            {name: 'casa_1.png', offset1: 3.05, offset2: -1.43}, 
            {name: 'casa_2.png', offset1: 3.01, offset2: -1.52},
            {name: 'casa_3.png', offset1: 2.74, offset2: -1.05},
            {name: 'casa_4.png', offset1: 2.70, offset2: -1.05},
            {name: 'casa_5', offset1: 2.82, offset2: -1.20},
        ]
    }

    create(value, offset, position){
        this.flip = !(value + 1 == this.buildings.length);
        var spriteKey = this.buildings[value].name;
        if (value + 1 == this.buildings.length) spriteKey += offset == 0 ? '_R.png' : '_L.png';
        var buildingOffset = offset == 0 ? this.buildings[value].offset1 :this.buildings[value].offset2;
        super.create(spriteKey, buildingOffset, position);
        this.sprite = this.scene.add.sprite(0, 0, 'buildings', spriteKey);
        this.sprite.setVisible(false);
    }

    draw(destW, destH, destX, destY, spriteScale){
        super.draw(destW, destH, destX, destY);
        this.sprite.setDepth(spriteScale);
        this.sprite.setScale((spriteScale * 18000));
        if (this.flip) this.sprite.flipX = (this.offset < 0);
    }
}