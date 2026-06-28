import BaseScene from './BaseScene';

class PauseScene extends BaseScene {
    constructor(config) {
        super('PauseScene', config);

        this.menu = [
            {scene: 'PlayScene', text: 'Resume'},
            {scene: 'MenuScene', text: 'Exit'}        
        ];
    }

    create() {
        super.create();
        this.createMenu(this.menu, this.setupMenuEvents.bind(this));
    }

    setupMenuEvents(menuItem) {
        const textGameObject = menuItem.textGameObject;
        textGameObject.setInteractive();

        textGameObject.on('pointerover', () => {
            textGameObject.setStyle({
                fill: '#ff0'
            });
        });

        textGameObject.on('pointerout', () => {
            textGameObject.setStyle({
                fill: '#fff'
            });
        });

        textGameObject.on('pointerup', () => {
            if (!menuItem.scene) {
                return;
            }

            if (menuItem.text === 'Resume') {
                this.scene.stop();
                this.scene.resume(menuItem.scene);
            }

            if (menuItem.text === 'Exit') {
                this.scene.stop('PlayScene');
                this.scene.start('MenuScene');
            }
        });
    }
}

export default PauseScene;