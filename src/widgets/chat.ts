
export default class Chat extends Phaser.Graphics {

    public create(): void {

        let text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'Text', { font: '65px Arial', fill: '#ff0044', align: 'center' });

    }
}