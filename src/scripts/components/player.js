export class Player
{
    constructor(scene){
        // reference to the main scene
        this.scene = scene;

        // player world coordinates
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;

        // player screen coordinates
        this.screen = {x:0, y:0, w:0, h:0};

        // max speed (to avoid moving for more than 1 road segment, assuming fps = 60)
        //this.maxSpeed = (scene.circuit.segmentLength / 2) / (1/60);
        this.maxSpeed = 3000;
        console.log(this.maxSpeed);
        // driving contorl parameters
        this.speed = 0;
        this.horizontalSpeed = 500;

        this.playerBody;
        this.score = 0;
        this.havePackage = false;
        this.currentRoadPos = 1;
        this.playerState = 'idle';
    }

    init(){
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.keyLeft = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);

        this.playerBody = this.scene.physics.add.sprite(1000, 1000, 'runAnim').play('idle');

        // set the player screen size
        this.screen.w = this.playerBody.width;
        this.screen.h = this.playerBody.height;
        
        // set the player screen position
        this.screen.x = this.scene.data.get('screen_c');
        this.screen.y = this.scene.data.get('screen') - this.screen.h/4 - 50;

        this.playerBody.setDepth(4.5);
        this.playerBody.setDisplaySize(this.screen.w/3, this.screen.h/3);
        this.playerBody.body.setSize(150,150,true);
        this.playerBody.setVisible(false);

        this.limitBound = this.screen.w/3.2;

        //mobile contorls
        if (this.scene.data.get('IS_TOUCH')) {
            this.deliveryButton = this.scene.add.image(0, 0,'deliveryButton').setInteractive();
            this.deliveryButton.setDisplaySize(100, 100);
            this.deliveryButton.setPosition(this.screen.x, this.scene.data.get('screen') - this.deliveryButton.height/2);
            this.deliveryButton.on('pointerdown', () => this.checkDelivery());
            this.deliveryButton.setDepth(5);
           
            this.leftButton = this.scene.add.image(0, 0,'imgBack').setInteractive();
            this.leftButton.setDisplaySize(500, 500);
            this.leftButton.setPosition(this.screen.x / 2, this.scene.data.get('screen') - 250);
            this.leftButton.on('pointerdown', () => this.playerState = 'left');
            this.leftButton.on('pointerup', () => this.playerState = 'idle');
            this.leftButton.setDepth(4.9);
            this.leftButton.alpha = 0.001;

            this.rightButton = this.scene.add.image(0, 0,'imgBack').setInteractive();
            this.rightButton.setDisplaySize(500, 500);
            this.rightButton.setPosition(3 * this.screen.x / 2, this.scene.data.get('screen') - 250);
            this.rightButton.on('pointerdown', () => this.playerState = 'right');
            this.rightButton.on('pointerup', () => this.playerState = 'idle');
            this.rightButton.setDepth(4.9);
            this.rightButton.alpha = 0.001;  
            /*
            this.scene.input.on('pointerdown', function(pointer){
                if (Math.floor(pointer.x/(this.scene.data.get('screen')/2)) === 1) this.playerState = 'right';
                if (Math.floor(pointer.x/(this.scene.data.get('screen')/2)) === 0) this.playerState = 'left';
            }, this);
            this.scene.input.on('pointerup', () => this.playerState = 'idle');
            */
        }
    }

    restart (){
        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.speed = this.maxSpeed;
        this.totalCircuitSegments = this.scene.circuit.total_segments;

        //Each 1000 ms call onEvent
        this.timedEvent = this.scene.time.addEvent({ delay: 1000, callback: this.updateScore, callbackScope: this, loop: true });
    }

    updateScore(){
        this.scene.scoreboard.score += 1;
    }

    update(dt){
        var circuit = this.scene.circuit;
        this.playerState = 'idle';

        this.z += this.speed * dt;
        if (this.z >= circuit.roadLength) {this.z -= circuit.roadLength; this.currentRoadPos = 1; circuit.addRandomSprites(2 * this.totalCircuitSegments / 3, this.totalCircuitSegments);}
        if (this.z >= 30000 && this.currentRoadPos == 2) {this.currentRoadPos = 3; circuit.addRandomSprites(this.totalCircuitSegments / 3, 2 * this.totalCircuitSegments / 3);}
        if (this.z >= 15000 && this.currentRoadPos == 1) {this.currentRoadPos = 2; circuit.addRandomSprites(0, this.totalCircuitSegments / 3);}

        if (this.cursors.left.isDown){
            this.playerState = 'left';
        }
        else if (this.cursors.right.isDown){
            this.playerState = 'right';
        }
        
        if (this.cursors.left.isUp && this.cursors.right.isUp)
        {
            if (this.playerBody.anims.getName() != 'idle') this.playerBody.play('idle');
        }

        if(this.playerState == 'left') this.movePlayerLeft(dt);
        else if(this.playerState == 'right') this.movePlayerRight(dt);
    }

    movePlayerLeft(dt){
        var newPosX = this.screen.x - this.horizontalSpeed * dt;
        if (this.playerBody.anims.getName() != 'leftTack') this.playerBody.play('leftTack');
        this.screen.x = (newPosX > this.limitBound ) ?  newPosX : this.limitBound;
    }

    movePlayerRight(dt){
        var newPosX = this.screen.x + this.horizontalSpeed * dt;
        if (this.playerBody.anims.getName() != 'rightTack') this.playerBody.play('rightTack');
        this.screen.x = (newPosX < this.scene.data.get('screen') - this.limitBound) ?  newPosX : this.scene.data.get('screen') - this.limitBound;
    }

    playerCollision(){
        this.speed = 0;
        this.playerBody.stop();
        this.scene.data.set('state', "game_over");
        //console.log("colisiono");
    }

    checkDelivery(){
        var delivery = this.scene.circuit.currentDelivery
        if (delivery.zone != "lost") 
        {
            var rightConditional = this.screen.x >= this.scene.data.get('screen') - this.limitBound - this.screen.w/4
            var leftConditional = this.screen.x <= this.limitBound + this.screen.w/4
            var inPos = delivery.alignment > 0 ?  rightConditional : leftConditional

            if (inPos)
            {
                if (delivery.zone == "green"){
                    this.scene.scoreboard.score += 30;
                    this.havePackage = !this.havePackage;
                }
                else if (delivery.zone == "orange"){
                    this.scene.scoreboard.score += 20;
                    this.havePackage = !this.havePackage;
                }

                if (delivery.zone != "undone") delivery.zone = "done";
            }
        }
    }
}