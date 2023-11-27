import {Obstacle} from './obstacle.js';
import {Building} from './building.js';
import {Delivery} from './delivery.js';

export class Circuit
{
    constructor(scene){
        // reference to the game scene
        this.scene = scene;

        // graphics to draw the road of polygons on it
        this.graphics = scene.add.graphics(0,0);

        // array of road segments
        this.segments = [];

        // single segment lengt
        this.segmentLength = 300;

        // total number of road segments
        this.total_segments = null;

        // number of visible segments to be drawn
        this.visible_segments = 120;

        // number of segments that forms a sidewalk strip
        this.sidewalk_segments = 3;

        // number of road lanes
        this.roadLanes = 2;

        // road width (actually half of the road)
        this.roadWidth = 4000;

        // total road length
        this.roadLength = null;

        // exponential fog density
        this.fogDensity = 20;

        this.currentDelivery = {alignment: 0, zone : "done", lastSegment: 0};

        this.buildings = [
            {name: 'building1.png', offset1: 4, offset2: -2.5}, 
            {name: 'building2.png', offset1: 4.1, offset2: -2.2},
            {name: 'building3.png', offset1: 4.1, offset2: -2.5},
            {name: 'building4.png', offset1: 4.1, offset2: -1.8}
        ]

        this.carOffsets = [-1, 0, 1]
    }

    create(){
        // clear arrays
        this.segments = []

        // create a road
        this.createRoad();

        // colorize last segments in a finishing color
        for (var i=0; i<this.sidewalk_segments; i++){
            this.segments[this.segments.length-1-(i+this.sidewalk_segments)].color.grass =  this.segments[i].color.sidewalk;
            //this.segments[this.segments.length-1-(i+this.sidewalk_segments)].color.sidewalk = this.segments[i].color.sidewalk;
            this.segments[0+i].color.grass = this.segments[i].color.sidewalk;
            //this.segments[0+i].color.sidewalk = this.segments[i].color.sidewalk;

            this.segments[this.segments.length-1-i].color.road = this.segments[i].color.road;
            this.segments[this.segments.length-1-i].color.grass = this.segments[i].color.road;
            this.segments[this.segments.length-1-i].color.sidewalk = this.segments[i].color.road;
            this.segments[this.segments.length-1-i].color.rumble = this.segments[i].color.road;
        }
    }

    createRoad(){
        this.createSection(150);
        this.addRandomSprites(0, 150);
    }

    createSection(nSegments){
        for (var i=0; i<nSegments; i++){
            this.createSegment();
        }

        // store the total number of segments
        this.total_segments = this.segments.length;

        // calculate the road length
        this.roadLength = this.total_segments * this.segmentLength;
    }

    createSegment(){
        //define colors
        const COLORS = {
            LIGHT: {road: '0x888888', grass: '0x666666', sidewalk: '0x857979', rumble: '0xFFE599'},
            DARK: {road: '0x888888', grass: '0x666666', sidewalk: '0x857979', rumble: '0xFFE599', lane: '0xFFFFFF'},
        };
        
        // get the current number of the segments
        var n = this.segments.length;
        
        // add new segment
        this.segments.push({
            index: n,

            point:{
                world: {x: 0, y:0, z:n*this.segmentLength},
                screen: {x:0, y:0, w:0},
                scale: -1
            },
            
            sprites: [],

            delivery: [false, '0x429352'],

            color: Math.floor(n/this.sidewalk_segments)%2? COLORS.DARK : COLORS.LIGHT
        });
    }

    addSegmentSprite(n, spriteKey, offset){
        //let sprite = this.scene.add.sprite(0, 0, 'buildings', spriteKey);
        let building = new Building(this.scene);
        building.create(spriteKey, offset);
        this.segments[n].sprites.push({ object: building, type: "bg" });
        this.segments[n].delivery = false;
    }

    addSegmentDelivery(n, spriteKey, offset){
        let delivery = new Delivery(this.scene);
        delivery.create(spriteKey, offset);
        this.segments[n].sprites.push({ object: delivery, type: "delivery" });
        this.currentDelivery.alignment = offset;
        this.currentDelivery.zone = "undone";
        this.currentDelivery.lastSegment = n+4;

        for (var i = n-4; i <= n+4; i++){
            if (i < n-1)
                this.segments[i].delivery = [true,'0xF6B26B']
            else if (i > n+1)
                this.segments[i].delivery = [true,'0xF8C189'];
            else
                this.segments[i].delivery = [true,'0x429352'];
        }
               
        for (var i = n - 5; i <= n+5; i++){
            for (var j = 0; j < this.segments[i].sprites.length; j++){
                if (this.segments[i].sprites[j].type == "obstacle"){
                    if (this.segments[i].sprites[j].object.offset > 0 == offset > 0){
                        this.segments[i].sprites[j].object.offset = this.currentDelivery.alignment > 0 ? this.carOffsets[0] : this.carOffsets[2];
                    }
                }
            }
        }
    }

    addSegmentObstacle(n, spriteKey, offset){
        let obstacle = new Obstacle(this.scene);
        obstacle.create(spriteKey, offset);
        var obstacleCollider = this.scene.physics.add.collider(obstacle.sprite, this.scene.player.playerBody, () => this.scene.player.playerCollision());
        this.segments[n].sprites.push({ object: obstacle, type: "obstacle", collider: obstacleCollider});
    }

    addRandomSprites(start, limit){
        for (var i = start; i < limit; i++){
            for (var j = 0; j < this.segments[i].sprites.length; j++){
                this.segments[i].sprites[j].object.destroy();
                this.segments[i].sprites[j].object = null;
            }
            this.segments[i].sprites = [];
            this.segments[i].delivery = [false, '0x429352'];
        }

        if(limit == this.total_segments / 3) this.generateRandomDelivery(limit);
        this.generateRandomBuildings(start == 0 ? start + 40 : start, limit);
        this.generateRandomObstacles(start == 0 ? start + 20 : start, limit);
    }
    
    generateRandomBuildings(start, limit){
        var value = 0;
        
        for (var i = limit - 5; i >= start; i-=5){
            value = Phaser.Math.Between(0, 3);
            //this.addSegmentSprite(i, this.buildings[value].name, this.buildings[value].offset1);
            this.addSegmentSprite(i, 'buildTemp2', 4.3);
            value = Phaser.Math.Between(0, 3);
            //this.addSegmentSprite(i, this.buildings[value].name, this.buildings[value].offset2);
            this.addSegmentSprite(i, 'buildTemp2', -3.2);
        }
        /*
        this.addSegmentSprite(30, 'building1.png', 4);
        this.addSegmentSprite(30, 'building2.png', -2.2);
        this.addSegmentSprite(20, 'building4.png', -1.8);
        this.addSegmentSprite(20, 'building3.png', 4.1);
        this.addSegmentSprite(10, 'building4.png', 4.1);
        this.addSegmentSprite(10, 'building1.png', -4.3);
        */
        this.addSegmentSprite(40, 'buildTemp2', 4.3);
        this.addSegmentSprite(40, 'buildTemp2', -3.2);
        this.addSegmentSprite(30, 'buildTemp2', 4.3);
        this.addSegmentSprite(30, 'buildTemp2', -3.2);
        this.addSegmentSprite(20, 'buildTemp2', 4.3);
        this.addSegmentSprite(20, 'buildTemp2', -3.2);
        this.addSegmentSprite(10, 'buildTemp2', 4.3);
        this.addSegmentSprite(10, 'buildTemp2', -3.2);
        this.addSegmentSprite(45, 'buildTemp2', 4.3);
        this.addSegmentSprite(45, 'buildTemp2', -3.2);
        this.addSegmentSprite(35, 'buildTemp2', 4.3);
        this.addSegmentSprite(35, 'buildTemp2', -3.2);
        this.addSegmentSprite(25, 'buildTemp2', 4.3);
        this.addSegmentSprite(25, 'buildTemp2', -3.2);
        this.addSegmentSprite(15, 'buildTemp2', 4.3);
        this.addSegmentSprite(15, 'buildTemp2', -3.2);
    }

    generateRandomDelivery(limit){
        var position = Phaser.Math.Between(limit + 40, this.total_segments - 10);
        var offset = position % 2 == 0 ? 2 : -2;
        this.addSegmentDelivery(position, 'sprites_09.png', offset)
    }

    generateRandomObstacles(start, limit){
        for (var i = 0; i < 3; i++){
            var position = Phaser.Math.Between(start, limit - 10);
            var randomOff = Phaser.Math.Between(0, 2);
            var offset = this.carOffsets[randomOff];
            var deliveryZone = this.currentDelivery.lastSegment;
            
            if (position < deliveryZone - 8 && position > deliveryZone){
                if (offset != 0)
                    this.addSegmentObstacle(position, 'carA', this.currentDelivery.alignment > 0 ? this.carOffsets[0] : this.carOffsets[2]);
            }
            else{
                this.addSegmentObstacle(position, 'carA', offset);
            }
        }
    }

    getSegment(positionZ){
        if (positionZ<0) positionZ += this.roadLength;
        var index = Math.floor(positionZ / this.segmentLength) % this.total_segments;
        return this.segments[index];
    }

    project3D(point, cameraX, cameraY, cameraZ, cameraDepth){
        // translating world coordinates to camera coordinates
        var transX = point.world.x - cameraX;
        var transY = point.world.y - cameraY;
        var transZ = point.world.z - cameraZ;
        
        // scaling factor
        point.scale = cameraDepth/transZ;
        
        // projecting camera coordinates onto a normalized projection plane
        var projectedX = point.scale * transX;
        var projectedY = point.scale * transY;
        var projectedW = point.scale * this.roadWidth;

        // scaling projected coordinates to the screen coordinates
        point.screen.x = Math.round((1 + projectedX) * this.scene.data.get('screen_c'));
        point.screen.y = Math.round((1 - projectedY) * this.scene.data.get('screen_c'));
        point.screen.w = Math.round(projectedW * this.scene.data.get('screen_c'));
    }

    render3D(){
        this.graphics.clear();

        // define the clipping botton line to render only segments above it
        var clipBottomLine = this.scene.data.get('screen');

        // get the camera
        var camera = this.scene.camera;

        // get the base segment
        var baseSegment = this.getSegment(camera.z);
        var baseIndex = baseSegment.index;

        for (var i=0; i<this.visible_segments; i++){
            // get the current segment
            var currIndex = (baseIndex + i) % this.total_segments;
            var currSegment = this.segments[currIndex];

            currSegment.fog = this.exponentialFog(i / this.visible_segments, this.fogDensity);
            currSegment.clip = clipBottomLine;

            // get the camera offset-Z to loop back the road
            var offsetZ = (currIndex < baseIndex) ? this.roadLength : 0;

            // project the segment to the screen space
            this.project3D(currSegment.point, camera.x, camera.y, camera.z-offsetZ, camera.distToPlane);

            // draw this segment only if it is above the clipping bottom line
            var currBottomLine = currSegment.point.screen.y;

            if (i>0 && currBottomLine < clipBottomLine){
                var prevIndex = (currIndex>0) ? currIndex-1 : this.total_segments-1;
                var prevSegment = this.segments[prevIndex];

                var p1 = prevSegment.point.screen;
                var p2 = currSegment.point.screen;
                
                this.drawSegment(
                    p1.x, p1.y, p1.w,
                    p2.x, p2.y, p2.w,
                    currSegment.fog,
                    currSegment.color,
                    currSegment.delivery,
                    currIndex
                )

                // draw player
                var player = this.scene.player;
                player.playerBody.setPosition(player.screen.x, player.screen.y);
                player.playerBody.setVisible(true); 
                  
                // move the clipping bottom line up
                clipBottomLine = currBottomLine;
            }
        }

        for (var i=this.visible_segments; i>0; i--){
            // get the current segment
            var currIndex = (baseIndex + i) % this.total_segments;
            var currSegment = this.segments[currIndex];

            // render roadside sprites
            for (var j = 0 ; j < currSegment.sprites.length ; j++){
                var sprite = currSegment.sprites[j];
                var spriteScale = currSegment.point.scale;
                var spriteX = currSegment.point.screen.x + (spriteScale * sprite.object.offset * this.roadWidth * this.scene.data.get('screen')/2);
                var spriteY = currSegment.point.screen.y;
                
                var destW  = (sprite.object.sprite.width * spriteScale * this.scene.data.get('screen')/2) * (0.00375 * this.roadWidth);
                var destH  = (sprite.object.sprite.height * spriteScale * this.scene.data.get('screen')/2) * (0.00375 * this.roadWidth);

                var destX = spriteX + (destW * ((sprite.object.offset < 0 ? -1 : 0) || 0));
                var destY = spriteY + (destH * (-1 || 0));
                
                var clipH = currSegment.clip ? Math.max(0, destY+destH-currSegment.clip) : 0;
                if (clipH < destH) {
                    if (sprite.type == "obstacle"){
                        sprite.object.draw(destW, destH, spriteX, spriteY, spriteScale);
                    }
                    else {
                        sprite.object.draw(destW, destH, destX, destY, spriteScale);
                    }
                }
                else{
                    sprite.object.disable();
                }
            }
        }
    }

    drawSegment(x1, y1, w1, x2, y2, w2, fog, color, delivery, segmentIndex){
        // draw grass
        this.graphics.fillStyle(color.grass, 1);
        this.graphics.fillRect(0, y2, this.scene.data.get('screen'), y1 - y2);

        // draw road
        this.drawPolygon(x1-w1, y1, x1+w1, y1, x2+w2, y2, x2-w2, y2, color.road);

        // draw sidewalk strips
        var sidewalk_w1 = w1/1.5;
        var sidewalk_w2 = w2/1.5;
        // left
        this.drawPolygon(x1-w1-sidewalk_w1, y1, x1-w1, y1, x2-w2, y2, x2-w2-sidewalk_w2, y2, color.sidewalk);
        // right
        this.drawPolygon(x1+w1+sidewalk_w1, y1, x1+w1, y1, x2+w2, y2, x2+w2+sidewalk_w2, y2, color.sidewalk);

        // draw rumble strips
        var rumble_w1 = w1 / 10;
        var rumble_w2 = w2 / 10;
        // left
        var newX1 = x1-w1-rumble_w1-rumble_w1/4;
        var newX2 = x1-w1-rumble_w1/4;
        var newX3 = x2-w2-rumble_w2/4;
        var newX4 = x2-w2-rumble_w2-rumble_w2/4;
        this.drawPolygon(newX1, y1, newX2, y1, newX3, y2, newX4, y2, color.rumble);
        // right
        newX1 = x1+w1+rumble_w1+rumble_w1/4;
        newX2 = x1+w1+rumble_w1/4;
        newX3 = x2+w2+rumble_w2/4;
        newX4 = x2+w2+rumble_w2+rumble_w2/4;
        this.drawPolygon(newX1, y1, newX2, y1, newX3, y2, newX4, y2, color.rumble);

        /*
        //draw lanes
        if (color.lane){
            var line_w1 = (w1/20);
            var line_w2 = (w2/20);

            var lane_w1 = (w1*2) / this.roadLanes;
            var lane_w2 = (w2*2) / this.roadLanes;

            var lane_x1 = x1 - w1;
            var lane_x2 = x2 - w2;

            for(var i=1; i<this.roadLanes; i++){
                lane_x1 += lane_w1;
                lane_x2 += lane_w2;

                this.drawPolygon(
                    lane_x1-line_w1, y1,
                    lane_x1+line_w1, y1,
                    lane_x2+line_w2, y2,
                    lane_x2-line_w2, y2,
                    color.lane,
                );
            }
        }
        */

        if (delivery[0]){
            var playerScreenPosY = this.scene.player.screen.y + this.scene.player.screen.h/2;

            if (this.currentDelivery.zone != "done") {
                if (playerScreenPosY >= y2 &&  playerScreenPosY <= y1){       
                    if (delivery[1] == '0x429352') this.currentDelivery.zone = "green";
                    else if (delivery[1] == '0xF6B26B') this.currentDelivery.zone = "orange";
                    else if (delivery[1] == '0xF8C189') this.currentDelivery.zone = "orange2";
                }
            }

            if (segmentIndex == this.currentDelivery.lastSegment){
                if (y1 > playerScreenPosY + 400) this.currentDelivery.zone = "lost";
            }
            
            if (this.currentDelivery.alignment > 0)
                this.drawPolygon(x1+w1/1.5, y1, x1+w1, y1, x2+w2, y2, x2+w2/1.5, y2, delivery[1]);
            else 
                this.drawPolygon(x1-w1/1.5, y1, x1-w1, y1, x2-w2, y2, x2-w2/1.5, y2, delivery[1]);
            
        }

        this.drawFog(0, y1, this.scene.data.get('screen'), y2-y1, fog)
    }

    drawPolygon(x1, y1, x2, y2, x3, y3, x4, y4, color){
        this.graphics.fillStyle(color, 1);
        this.graphics.beginPath();

        this.graphics.moveTo(x1, y1);
        this.graphics.lineTo(x2, y2);
        this.graphics.lineTo(x3, y3);
        this.graphics.lineTo(x4, y4);

        this.graphics.closePath();
        this.graphics.fill();
    }

    drawFog(x, y, width, height, fog){
        if (fog < 1) {
            this.drawRect(x, y, width, height, '0x4b692f', 1 - fog)
        }
    }

    drawRect(x, y, width, height, color, fog) {
        let rect = new Phaser.Geom.Rectangle(x, y, width, height, color);
        this.graphics.fillStyle(color, fog);
        this.graphics.fillRectShape(rect);
    }

    exponentialFog(distance, density){
        return 1 / (Math.pow(Math.E, (distance * distance * density)));
    }
}