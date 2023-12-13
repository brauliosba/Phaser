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
        this.maxSpeed = ((scene.circuit.segmentLength / 2) / (1/60));
        this.playerSpeeds = [this.maxSpeed/3, 2*this.maxSpeed/3, this.maxSpeed, 2*this.maxSpeed, 3*this.maxSpeed]
        this.currentSpeed = 0;

        // driving contorl parameters
        this.speed = 0;
        this.acceleration = this.scene.data.get('acceleration');
        this.horizontalSpeed = this.scene.data.get('horizontalSpeed');

        this.playerBody;
        this.currentRoadPos = 1;
        this.playerState = 'idle';
        this.score = 0;
        this.shielded = false;
        this.invulnerabilityTime = this.scene.data.get('invulnerability');
    }

    init(){
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        //Player
        this.playerBody = this.scene.physics.add.sprite(1000, 1000, 'playerIdle').play('idle');
        this.playerBody.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'receive', function () {
            this.playerBody.play('run');
        }, this);
        this.playerBody.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'send', function () {
            this.playerBody.play('run');
        }, this);

        this.playerBox = this.scene.add.sprite(1000, 1000, 'playerBoxRun').play('boxIdle');
        this.playerBox.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'boxReceive', function () {
            this.playerBox.play('boxRun');
        }, this);
        this.playerBox.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'boxSend', function () {
            this.playerBox.play('boxRun');
        }, this);

        // set the player screen size
        this.screen.w = this.playerBody.width;
        this.screen.h = this.playerBody.height;
        
        // set the player screen position
        this.screen.x = this.scene.data.get('screen_c');
        this.screen.y = this.scene.data.get('screen') - this.screen.h/5 - 50;

        this.playerBody.setDepth(4);
        this.playerBody.setDisplaySize(this.screen.w/3, this.screen.h/3);
        this.playerBody.body.setSize(150,150,true);
        this.playerBody.setVisible(false);

        this.playerBox.setDepth(4);
        this.playerBox.setDisplaySize(this.screen.w/3, this.screen.h/3);
        this.playerBox.setVisible(false);

        this.limitBound = this.screen.w/10;

        //mobile contorls
        if (this.scene.data.get('IS_TOUCH')) {          
            this.leftButton = this.scene.add.image(0, 0,'imgBack').setInteractive();
            this.leftButton.setDisplaySize(500, 500);
            this.leftButton.setPosition(this.screen.x / 2, this.scene.data.get('screen') - 250);
            this.leftButton.on('pointerdown', () => { this.playerState = 'left', console.log("izq")});
            this.leftButton.on('pointerup', () => this.playerState = 'run');
            this.leftButton.setDepth(4.9);
            this.leftButton.alpha = 0.001;

            this.rightButton = this.scene.add.image(0, 0,'imgBack').setInteractive();
            this.rightButton.setDisplaySize(500, 500);
            this.rightButton.setPosition(3 * this.screen.x / 2, this.scene.data.get('screen') - 250);
            this.rightButton.on('pointerdown', () => this.playerState = 'right');
            this.rightButton.on('pointerup', () => this.playerState = 'run');
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

        //UI
        this.packageImage = this.scene.add.image(80, 80, 'deliveryButton');
        this.packageImage.setDisplaySize(80,80);
        this.packageImage.setDepth(5);
        this.packageText = this.scene.add.text(150, 50, 'x0', { font: '600 50px Montserrat' });
        this.packageText.setDepth(5);

        this.speedText = this.scene.add.text(50, 200, 'Velocidad actual: ' + this.speed, { fontSize : 30, color: '0x000000' });
        this.speedText.setDepth(5);
        var txt = this.scene.add.text(50, 230, 'Velocidad horizontal: ' + this.horizontalSpeed, { fontSize : 30, color: '0x000000' });
        txt.setDepth(5);
        txt = this.scene.add.text(50, 260, 'Espacio entre oleadas: ' + this.scene.data.get('waveDelay'), { fontSize : 30, color: '0x000000' });
        txt.setDepth(5);
    }

    restart (){
        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.speed = this.scene.data.get('initialSpeed');
        console.log('Velocidad Inicial: ' + this.speed);
        console.log('Velocidad Horizotal: ' + this.horizontalSpeed);
        this.totalCircuitSegments = this.scene.circuit.total_segments;
        let scoringTime = this.scene.data.get('scoringTime');
        this.playerBody.play('run', true);
        this.playerState = 'run';
        this.packageCounter = 0;

        //Each 1000 ms call onEvent
        this.scoreEvent = this.scene.time.addEvent({ delay: scoringTime, callback: this.updateScore, callbackScope: this, loop: true });
        //Each 100 ms call onEvent
        this.speedEvent = this.scene.time.addEvent({ delay: 100, callback: this.updateSpeed, callbackScope: this, loop: true });
    }

    updateScore(){
        this.score += 1;
    }

    updateSpeed(){
        this.speed += this.acceleration;
        this.speedText.setText('Velocidad actual: ' + this.speed);
    }

    update(dt){
        let circuit = this.scene.circuit;

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
            if (this.playerState != 'receive') this.playerState = 'run';
        }

        if (this.playerState == 'run') { this.playerBody.play('run', true); this.playerBox.play('boxRun', true); }
        else if(this.playerState == 'left') this.movePlayerLeft(dt);
        else if(this.playerState == 'right') this.movePlayerRight(dt);

        //if (!this.scene.data.get('IS_TOUCH')) this.playerState = 'idle';
    }

    movePlayerLeft(dt){
        let newPosX = this.screen.x - this.horizontalSpeed * dt;
        if (this.playerBody.anims.getName() != 'receive' && this.playerBody.anims.getName() != 'send'){ 
            this.playerBody.setFlipX(false);
            this.playerBody.play('tack', true);
            this.playerBox.setFlipX(false);
            this.playerBox.play('boxTack', true);
        }
        this.screen.x = (newPosX > this.limitBound ) ?  newPosX : this.limitBound;
    }

    movePlayerRight(dt){
        let newPosX = this.screen.x + this.horizontalSpeed * dt;
        if (this.playerBody.anims.getName() != 'receive' && this.playerBody.anims.getName() != 'send'){ 
            this.playerBody.setFlipX(true); 
            this.playerBody.play('tack', true); 
            this.playerBox.setFlipX(true);
            this.playerBox.play('boxTack', true);
        }
        this.screen.x = (newPosX < this.scene.data.get('screen') - this.limitBound) ?  newPosX : this.scene.data.get('screen') - this.limitBound;
    }

    playerCollision(){
        if (!this.shielded) {
            this.scene.data.set('state', "game_over");
            this.speed = 0;
            this.playerBody.stop();
            this.playerBox.stop();
            this.playerBody.disableBody(false, false);
            this.speedEvent.remove(false);
            this.scoreEvent.remove(false);
            console.log('colisiono')
        } else{
            this.shildBreak();
        }
    }

    shildBreak(){
        this.shielded = false;
        this.playerBody.disableBody(false, false);
        this.scene.tweens.add({
            targets: this.playerBody,
            ease: 'sine.inout',
            duration: this.invulnerabilityTime,
            yoyo: true,
            repeat: 1,
            alpha: {
                getStart: () => 1,
                getEnd: () => 0.3
            },
        });
        this.scene.time.addEvent({ delay: this.invulnerabilityTime, callback: () => this.playerBody.enableBody() , callbackScope: this});
    }

    playerPowerUpCollision(){
        this.shielded = true;
        console.log('shielded');
    }

    playerPackageCollision(){
        this.playPickAnimation();
        this.packageCounter++;
        this.packageText.setText('x' + this.packageCounter);
    }

    checkDeliveryZone(delivery){
        let segment = this.scene.circuit.currentDelivery.lastSegment;

        if (segment > 0) {
            let yPos = this.scene.circuit.segments[segment].point.screen.y;
            if (yPos >= 910) delivery.zone = 'lost';
            else if (yPos >= 660) delivery.zone = 'green';
        }
    }

    checkDelivery(){
        let delivery = this.scene.circuit.currentDelivery;
        if (delivery.zone != 'lost' && this.packageCounter > 0){
            this.checkDeliveryZone(delivery)
            if (delivery.zone == "green") 
            {
                let rightConditional = this.screen.x == this.scene.data.get('screen') - this.limitBound;
                let leftConditional = this.screen.x == this.limitBound;
                let inPos = delivery.alignment > 0 ?  rightConditional : leftConditional

                if (inPos)
                {
                    delivery.zone == "done";
                    this.deliverPackages(delivery.alignment);
                }
            }
        }
    }

    deliverPackages(alignment){
        this.playDeliverAnimation(alignment);
        let points = 10 * this.packageCounter * this.packageCounter;
        this.score += points;
        this.packageCounter = 0;
        this.packageText.setText('x' + this.packageCounter);
    }

    playDeliverAnimation(alignment){
        this.playerBody.setFlipX(alignment > 0);
        this.playerBox.setFlipX(alignment > 0);
        this.playerBody.play('send', true);
        this.playerBox.play('boxSend', true);
        this.playerState = 'receive';
    }

    playPickAnimation(){
        this.playerBody.play('receive', true);
        this.playerBox.play('boxReceive', true);
        this.playerState = 'receive';
    }

    pause(isPaused){
        this.scoreEvent.paused = isPaused;
        this.speedEvent.paused = isPaused;
    }
}