import {MainScene} from './scripts/scenes/main.js';
import {MenuScene} from './scripts/scenes/menu.js';
import {BootScene} from './scripts/scenes/boot.js';

// -------------------------------------------
// Initializing Phaser Game
// -------------------------------------------

// game configuration
var config = {
    type: Phaser.AUTO,
    parent: 'phaser',
    width: 1080,
    height: 1080,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
        createContainer: true
    },
    scene: [BootScene, MenuScene, MainScene],

    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y:0},
            debug: false,
            fps: 300,
        }
    },

    fps: { forceSetTimeOut: true, target: 120 }
}

// gama instance
var game = new Phaser.Game(config);