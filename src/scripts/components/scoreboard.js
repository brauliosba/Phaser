export class Scoreboard
{
    constructor(scene){
        // reference to the main scene
        this.scene = scene;
        this.score = 0;
        this.startCounter = 3;
        this.timedEvent = undefined;
        this.startAnim = true;
    }

    create(){
        this.scoreText = this.scene.add.text(this.scene.data.get('screen') - 400, 50, 'Puntaje: ', { fontSize : 50, fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
        this.scoreText.setFill("black");
        this.scoreText.setDepth(5);

        this.startText = this.scene.add.text(0, 0, this.startCounter, { fontSize : 400, fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
        this.startText.setPosition(this.scene.data.get('screen_c') - this.startText.width/2, this.scene.data.get('screen_c') - this.startText.height/1.5);
        this.startText.setFill("black");
        this.startText.setDepth(5);

        //Each 1000 ms call onEvent
        this.timedEvent = this.scene.time.addEvent({ delay: 1000, callback: this.startAnimation, callbackScope: this, loop: true });
    }

    update(){
        this.scoreText.setText('Puntaje: ' + this.score);
        if (this.scoreText.width > 350) 
            this.scoreText.setPosition(this.scene.data.get('screen') - this.scoreText.width - 50, 50);
    }

    startAnimation(){
        this.startCounter -= 1;

        if (this.startCounter == 0){ 
            this.startText.setFontSize(250);
            this.startText.setText('Corre!');
            this.startText.setPosition(this.scene.data.get('screen_c') - this.startText.width/2, this.scene.data.get('screen_c') - this.startText.height/1.5);
        }
        else if (this.startCounter > 0){
            this.startText.setText(this.startCounter);
        }
        else{
            this.startText.setVisible(false);
            this.startAnim = false;
            this.timedEvent.destroy();
            this.timedEvent = undefined;
        }
    }
}