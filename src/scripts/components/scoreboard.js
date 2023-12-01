export class Scoreboard
{
    constructor(scene){
        // reference to the main scene
        this.scene = scene;
    }

    create(){
        this.scoreText = this.scene.add.text(this.scene.data.get('screen') - 400, 30, 'Puntaje: ', { fontSize : 50, fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
        this.scoreText.setFill("black");
        this.scoreText.setDepth(5);
    }

    update(){
        this.scoreText.setText('Puntaje: ' + this.scene.player.score);
        if (this.scoreText.width > 350) 
            this.scoreText.setPosition(this.scene.data.get('screen') - this.scoreText.width - 50, 50);
    }
}