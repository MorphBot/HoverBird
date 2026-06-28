import Phaser from 'phaser';
import PlayScene from './scenes/PlayScene';
import MenuScene from './scenes/MenuScene';
import PreloadScene from './scenes/PreloadScene';
import ScoreScene from './scenes/ScoreScene';
import PauseScene from './scenes/PauseScene';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const GAME_DEBUG = false;

const START_POSITION = {
  X: GAME_WIDTH * 0.1,
  Y: GAME_HEIGHT / 2,
}

const SHARED_CONFIG = {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  startPosition: START_POSITION,
}

const Scenes = [
  PreloadScene, MenuScene, PlayScene, ScoreScene, PauseScene
];
const createScene = Scene => new Scene(SHARED_CONFIG);
const initScenes = () => Scenes.map(createScene);

const gameConfig = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: GAME_DEBUG
    }
  },
  scene: initScenes()
}

new Phaser.Game(gameConfig);