import {MainScene} from './scripts/scenes/main.js';
import {MenuScene} from './scripts/scenes/menu.js';

// -------------------------------------------
// Initializing Phaser Game
// -------------------------------------------

// game configuration
var config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 1080,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    scene: [MenuScene, MainScene],

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y:0},
            debug: false
        }
    }
}

// gama instance
var game = new Phaser.Game(config);