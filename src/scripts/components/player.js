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
        this.havePackage = false;
        this.currentRoadPos = 1;
        this.playerState = 'idle';
        this.score = 0;
        this.shielded = false;
    }

    init(){
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.playerBody = this.scene.physics.add.sprite(1000, 1000, 'playerRun').play('idle');
        this.playerBody.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'receive', function () {
            this.playerBody.play('idle');
        }, this);
        this.playerBody.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'send', function () {
            this.playerBody.play('idle');
        }, this);

        this.playerBox = this.scene.add.sprite(1000, 1000, 'playerBoxRun').play('boxIdle');
        this.playerBox.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'boxReceive', function () {
            this.playerBox.play('boxIdle');
        }, this);
        this.playerBox.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'boxSend', function () {
            this.playerBox.play('boxIdle');
        }, this);

        // set the player screen size
        this.screen.w = this.playerBody.width;
        this.screen.h = this.playerBody.height;
        
        // set the player screen position
        this.screen.x = this.scene.data.get('screen_c');
        this.screen.y = this.scene.data.get('screen') - this.screen.h/5 - 50;

        this.playerBody.setDepth(3.2);
        this.playerBody.setDisplaySize(this.screen.w/3, this.screen.h/3);
        this.playerBody.body.setSize(150,150,true);
        this.playerBody.setVisible(false);

        this.playerBox.setDepth(3.2);
        this.playerBox.setDisplaySize(this.screen.w/3, this.screen.h/3);
        this.playerBox.setVisible(false);

        this.limitBound = this.screen.w/8;

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
            this.leftButton.on('pointerdown', () => { this.playerState = 'left', console.log("izq")});
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

        this.deliveryText = this.scene.add.text(100, 50, 'Tienes un paquete', { font: '600 50px Montserrat' });
        this.deliveryText.setVisible(false);

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
        var circuit = this.scene.circuit;

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
            if (this.playerState != 'receive') this.playerState = 'idle';
        }

        if (this.playerState == 'idle') { this.playerBody.play('idle', true); this.playerBox.play('boxIdle', true); }
        else if(this.playerState == 'left') this.movePlayerLeft(dt);
        else if(this.playerState == 'right') this.movePlayerRight(dt);

        //if (!this.scene.data.get('IS_TOUCH')) this.playerState = 'idle';
    }

    movePlayerLeft(dt){
        var newPosX = this.screen.x - this.horizontalSpeed * dt;
        if (this.playerBody.anims.getName() != 'receive' && this.playerBody.anims.getName() != 'send'){ 
            this.playerBody.setFlipX(false);
            this.playerBody.play('tack', true);
            this.playerBox.setFlipX(false);
            this.playerBox.play('boxTack', true);
        }
        this.screen.x = (newPosX > this.limitBound ) ?  newPosX : this.limitBound;
    }

    movePlayerRight(dt){
        var newPosX = this.screen.x + this.horizontalSpeed * dt;
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
            duration: 500,
            yoyo: true,
            repeat: 1,
            alpha: {
                getStart: () => 1,
                getEnd: () => 0.3
            },
        });
        this.scene.time.addEvent({ delay: 500, callback: () => this.playerBody.enableBody() , callbackScope: this,});
    }

    playerPowerUp(){
        this.shielded = true;
        console.log('shielded');
    }

    playerDelivery(){
        console.log('green');
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
                    this.playDeliveryAnimation(delivery.alignment);
                    this.score += 30;
                    this.havePackage = !this.havePackage;
                }
                else if (delivery.zone == "orange"){
                    this.playDeliveryAnimation(delivery.alignment);
                    this.score += 20;
                    this.havePackage = !this.havePackage;
                }
                else if (delivery.zone == "orange2"){
                    this.playDeliveryAnimation(delivery.alignment);
                    this.score += 10;
                    this.havePackage = !this.havePackage;
                }

                if (delivery.zone != "undone") delivery.zone = "done";

                this.deliveryText.setVisible(this.havePackage);
            }
        }
    }

    playDeliveryAnimation(alignment){
        if (this.havePackage) {
            this.playerBody.setFlipX(alignment > 0);
            this.playerBody.play('send', true);
            this.playerBox.play('boxSend', true);
            this.playerState = 'receive';
        } else {
            this.playerBody.play('receive', true);
            this.playerBox.play('boxReceive', true);
            this.playerState = 'receive';
        }
    }

    pause(isPaused){
        this.scoreEvent.paused = isPaused;
        this.speedEvent.paused = isPaused;
    }
}