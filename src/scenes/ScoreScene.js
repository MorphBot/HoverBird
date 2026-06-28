import BaseScene from './BaseScene';

class ScoreScene extends BaseScene {
    constructor(config) {
        super('ScoreScene', {...config, canGoBack: true});
    }

    create() {
        super.create();
        this.showBestScore();
    }

    showBestScore() {
      const bestScoreText = localStorage.getItem('bestScore');
      const bestScore = bestScoreText && parseInt(bestScoreText, 10);

      this.add.text(...this.screenCenter, `Best Score: ${bestScore || 0}`, this.fontOptions).setOrigin(0.5, 1);
    }
}

export default ScoreScene;