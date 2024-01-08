import {Obstacle} from './objects/obstacle.js';
import {PerspectiveObstacle} from './objects/perspectiveObstacle.js';
import {Car} from './objects/car.js';
import {Building} from './objects/building.js';
import {Delivery} from './objects/delivery.js';
import {PickUp} from './objects/pickUp.js';

export class Circuit
{
    constructor(scene){
        // reference to the game scene
        this.scene = scene;

        // graphics to draw the road of polygons on it
        this.graphics = scene.add.graphics(0,0);
        this.graphics.setDepth(0.00003);
        
        // array of road segments
        this.segments = [];

        // single segment lengt
        this.segmentLength = 300;

        // total number of road segments
        this.total_segments = null;

        // number of visible segments to be drawn
        this.visible_segments = 150;

        // number of segments that forms a sidewalk strip
        this.sidewalk_segments = 3;

        // number of road lanes
        this.roadLanes = 3;

        // road width (actually half of the road)
        this.roadWidth = 4000;

        // total road length
        this.roadLength = null;

        // exponential fog density
        this.fogDensity = 20;

        this.buildingLeftBlock = false;
        this.previousLeftBuild = 0;
        this.buildingRightBlock = false;
        this.previousRightBuild = 0;

        this.currentDelivery = {alignment: 0, zone : "done", lastSegment: 0};

        this.waveDelay = this.scene.data.get('waveDelay');

        this.powerDelay = this.scene.data.get('powerDelay');
        this.powersOffsets = [-0.7, 0, 0.7];
        this.powerTypes = ['shield', 'double', 'slow'];
        this.createPower = false;

        this.deliverDelay = this.scene.data.get('deliverDelay');
        this.createDeliver = false;
    }

    create(){
        // clear arrays
        this.segments = []

        // create a road
        this.createRoad();

        /*
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
        */

        this.powerEvent = this.scene.time.addEvent({ delay: this.powerDelay, callback: () => 
            { this.powerEvent.paused = true; this.createPower = true; }, callbackScope: this, loop: true });
        this.deliverEvent = this.scene.time.addEvent({ delay: this.deliverDelay, callback: () => 
            { this.deliverEvent.paused = true; this.createDeliver = true; }, callbackScope: this, loop: true });

        /*
        this.plane = this.scene.add.plane(this.scene.data.get('screen')/2, this.scene.data.get('screen')/2 + 200, 'menuBG');
        this.plane.viewPosition.z = 1.6;
        this.plane.rotateX = 95;
        this.plane.setScale(3.5);
        */
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

    addRandomSprites(start, limit){
        for (var i = start; i < limit; i++){
            for (var j = 0; j < this.segments[i].sprites.length; j++){
                this.segments[i].sprites[j].object.destroy();
                this.segments[i].sprites[j].object = null;
            }
            this.segments[i].sprites = [];
            this.segments[i].delivery = [false, '0x429352'];
        }

        this.generateRandomBuildings(start, limit);
        this.generateRandomObstacles(start == 0 ? start + 10 : start, limit);
    }
    
    generateRandomBuildings(start, limit){
        for (var i = start; i <= limit - 5; i+=4){
            if (!this.buildingRightBlock) {
                var value = Phaser.Math.Between(0, 4);
                if (value == this.previousRightBuild) value = value - 1 >= 0 ? value - 1 : 4;
                if (value > 1) this.buildingRightBlock = true;
                this.previousRightBuild = value;
                this.addSegmentSprite(i, value, 0);
            } else {
                this.buildingRightBlock = false;
            }
            
            if (!this.buildingLeftBlock){
                value = Phaser.Math.Between(0, 4);
                if (value == this.previousLeftBuild) value = value - 1 >= 0 ? value - 1 : 4;
                if (value > 1) this.buildingLeftBlock = true;
                this.previousLeftBuild = value;
                this.addSegmentSprite(i, value, 1);
            } 
            else {
                this.buildingLeftBlock = false;
            }
        }
    }

    addSegmentSprite(n, value, offset){
        let building = new Building(this.scene);
        building.create(value, offset, n);
        this.segments[n].sprites.push({ object: building, type: "bg" });
        this.segments[n].delivery = false;
    }

    generateRandomDelivery(position){
        let random =  Phaser.Math.Between(0, 1);
        let offset = random == 0 ? -2 : 2;
        this.addSegmentDelivery(position, 'sjj', offset)
    }

    addSegmentDelivery(n, spriteKey, offset){
        let delivery = new Delivery(this.scene);
        delivery.create(spriteKey, offset, n);
        this.segments[n].sprites.push({ object: delivery, type: "delivery" });
        this.currentDelivery.alignment = offset;
        this.currentDelivery.zone = "undone";
        this.currentDelivery.lastSegment = n+2;

        for (var i = n-2; i <= n+2; i++){
            this.segments[i].delivery = [true,'0x429352'];
        }
    }

    generateRandomObstacles(start, limit){
        for (var i = start; i < limit - 1; i+=this.waveDelay){
            var position = i;
            var waveType = Phaser.Math.Between(0, 1);
            var createPackage = this.scene.player.packageCounter < 10 ? Phaser.Math.Between(0, 99) : 99;
            switch (waveType) {
                case 0:
                    var lane = Phaser.Math.Between(0, 2);

                    if (this.checkExistingDelivery(position)){
                        if (this.currentDelivery.alignment > 0) {
                            lane = Phaser.Math.Between(0, 1);
                        } else {
                            lane = Phaser.Math.Between(1, 2);
                        }
                    }
                    this.addSegmentObstacle(position, 'obstacle', lane);

                    if (this.createPower || createPackage <= 34){
                        var myArray = [0,1,2];
                        var index = myArray.indexOf(lane);
                        myArray.splice(index, 1);
                        var powerOffset = Phaser.Math.RND.pick(myArray);
                        if(this.createPower) { 
                            this.createPower = false;
                            this.generatePickUp(position, powerOffset, 'power');
                        }

                        index = myArray.indexOf(powerOffset);
                        myArray.splice(index, 1);
                        var packageOffset = myArray[0];

                        if(createPackage <= 34) this.generatePickUp(position, packageOffset, 'package');
                    }
                    break;
                case 1:
                    var lane = Phaser.Math.Between(0, 2);
                    if (this.checkExistingDelivery(position)){
                        if (this.currentDelivery.alignment > 0) {
                            lane = 2;
                        }else{
                            lane = 0;
                        }
                    }
                    for (var j = 0; j < 3; j++){
                        if (j != lane) this.addSegmentObstacle(position, 'obstacle', j);
                    }

                    if (this.createPower>this.powerDelay){
                        this.createPower = false;
                        this.generatePickUp(position, lane, 'power');
                    } else if (createPackage <= 34) {
                        this.generatePickUp(position, lane, 'package');
                    }
                    break;
                default:
                    break;
            }

            if (this.createDeliver){
                this.createDeliver = false;
                this.generateRandomDelivery(position + 15 >= this.total_segments ? position - 15 : position + 15)
            }
        }
    }

    checkExistingDelivery(position){
        var deliveryZone = this.currentDelivery.lastSegment;
        if (position < deliveryZone - 5 && position > deliveryZone){
            return true
        }
        return false
    }

    addSegmentObstacle(n, spriteKey, offset){
        let obstacle;
        var type = Phaser.Math.Between(0, 8);
        if (type != 0) {
            obstacle = (type <= 6) ? new Obstacle(this.scene) : new PerspectiveObstacle(this.scene);       
            obstacle.create(spriteKey+type, type - 1, offset, n);
        }
        else {
            obstacle = new Car(this.scene);
            obstacle.create(spriteKey+type, offset, n);
        }
        
        this.segments[n].sprites.push({ object: obstacle, type: "obstacle"});
    }

    generatePickUp(position, offset, type){
        this.powerCounter = 0;
        if (type == 'power'){
            let powerLimit = this.scene.player.speed == this.scene.player.maxSpeed ? 2 : 1;
            let powerIndex = Phaser.Math.Between(0, powerLimit);
            let powerType = this.powerTypes[powerIndex];
            this.addSegmentPower(position, this.powersOffsets[offset], type, powerType);
        }else{
            this.addSegmentPackage(position, 'package', this.powersOffsets[offset], type);
        }
    }

    addSegmentPower(n, offset, type, powerType){
        var pickUp = new PickUp(this.scene);
        pickUp.create(powerType, offset, type, n);
        var overlap = this.scene.physics.add.overlap(pickUp.sprite, this.scene.player.playerBody, () => 
            { overlap.active = false; pickUp.disable(); this.scene.player.playerPowerUpCollision(powerType); });
        this.segments[n].sprites.push({ object: pickUp, type: "pickUp"});
    }

    addSegmentPackage(n, spriteKey, offset, type){
        var pickUp = new PickUp(this.scene);
        pickUp.create(spriteKey, offset, type, n);
        var overlap = this.scene.physics.add.overlap(pickUp.sprite, this.scene.player.playerBody, () => 
            { overlap.active = false; pickUp.disable(); this.scene.player.playerPackageCollision(); });
        this.segments[n].sprites.push({ object: pickUp, type: "pickUp"});
    }

    getSegment(positionZ){
        if (positionZ<0) positionZ += this.roadLength;
        let index = Math.floor(positionZ / this.segmentLength) % this.total_segments;
        return this.segments[index];
    }

    project3D(point, cameraX, cameraY, cameraZ, cameraDepth){
        // translating world coordinates to camera coordinates
        let transX = point.world.x - cameraX;
        let transY = point.world.y - cameraY;
        let transZ = point.world.z - cameraZ;
        
        // scaling factor
        point.scale = cameraDepth/transZ;
        
        // projecting camera coordinates onto a normalized projection plane
        let projectedX = point.scale * transX;
        let projectedY = point.scale * transY;
        let projectedW = point.scale * this.roadWidth;

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
        this.baseIndex = baseSegment.index;

        for (var i=0; i<this.visible_segments-80; i++){
            // get the current segment
            var currIndex = (this.baseIndex + i) % this.total_segments;
            var currSegment = this.segments[currIndex];

            currSegment.fog = this.exponentialFog(i / this.visible_segments, this.fogDensity);
            currSegment.clip = clipBottomLine;

            // get the camera offset-Z to loop back the road
            var offsetZ = (currIndex < this.baseIndex) ? this.roadLength : 0;

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
                  
                // move the clipping bottom line up
                clipBottomLine = currBottomLine;
            }

            // draw player       
            this.scene.player.updatePosition();
        }

        for (var i=this.visible_segments; i>0; i--){
            // get the current segment
            var currIndex = (this.baseIndex + i) % this.total_segments;
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
                if (clipH < destH && (currIndex >= this.baseIndex || this.baseIndex >= currIndex + 10)) {
                    if (sprite.type == "obstacle" || sprite.type == "pickUp"){
                        sprite.object.draw(destW, destH, spriteX, spriteY, spriteScale);
                    }
                    else {
                        sprite.object.draw(destW, destH, destX, destY, spriteScale);
                    }
                }
            }
        }
    }

    drawSegment(x1, y1, w1, x2, y2, w2, fog, color, delivery, segmentIndex){
        /*
        // draw grass
        this.graphics.fillStyle(color.grass, 1);
        this.graphics.fillRect(0, y2, this.scene.data.get('screen'), y1 - y2);

        // draw road
        this.drawPolygon(x1-w1, y1, x1+w1, y1, x2+w2, y2, x2-w2, y2, color.road);

        // draw sidewalk strips
        let sidewalk_w1 = w1/1.2;
        let sidewalk_w2 = w2/1.2;
        // left
        this.drawPolygon(x1-w1-sidewalk_w1, y1, x1-w1, y1, x2-w2, y2, x2-w2-sidewalk_w2, y2, color.sidewalk);
        // right
        this.drawPolygon(x1+w1+sidewalk_w1, y1, x1+w1, y1, x2+w2, y2, x2+w2+sidewalk_w2, y2, color.sidewalk);
        

        // draw rumble strips
        let rumble_w1 = w1 / 10;
        let rumble_w2 = w2 / 10;
        // left
        let newX1 = x1-w1-rumble_w1-rumble_w1/4;
        let newX2 = x1-w1-rumble_w1/4;
        let newX3 = x2-w2-rumble_w2/4;
        let newX4 = x2-w2-rumble_w2-rumble_w2/4;
        this.drawPolygon(newX1, y1, newX2, y1, newX3, y2, newX4, y2, color.rumble);
        // right
        newX1 = x1+w1+rumble_w1+rumble_w1/4;
        newX2 = x1+w1+rumble_w1/4;
        newX3 = x2+w2+rumble_w2/4;
        newX4 = x2+w2+rumble_w2+rumble_w2/4;
        this.drawPolygon(newX1, y1, newX2, y1, newX3, y2, newX4, y2, color.rumble);
        
        // draw fog
        this.drawFog(0, y1, this.scene.data.get('screen'), y2-y1, fog)
        */
        
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
        

        //drawing delivery zone
        if (delivery[0]){
            if (this.currentDelivery.alignment > 0)
                this.drawPolygon(x1+w1/1.5, y1, x1+w1, y1, x2+w2, y2, x2+w2/1.5, y2, delivery[1]);
            else 
                this.drawPolygon(x1-w1/1.5, y1, x1-w1, y1, x2-w2, y2, x2-w2/1.5, y2, delivery[1]);
        }
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

    pause(isPaused){
        this.powerEvent.paused = isPaused;
        this.deliverEvent.paused = isPaused;
    }
}