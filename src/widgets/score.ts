import GameState from '../states/gameState';

export default class Score {
    public game: Phaser.Game;
    public state: Phaser.State;
    public group: Phaser.Group;
    private conf: any;
    private dataArr = [];
    private scoreRound = [];

    constructor (game: Phaser.Game, state: GameState) {
        this.game = game;
        this.state = state;
        this.group = this.game.add.group();

        this.conf = {
            R: 10,
            x: this.game.camera.width / 2,
            y: 20,
            margin: {
                x: 0,
                y: 22
            },
            width: 210,
            height: 16,
            color: {
                border: 0x000000,
                rect: 0x1E90FF
            },
            scale: 1,
            label: 'Scoreboard',
            fixToCamera: true,
        };

        this.group.scale.setTo(this.conf.scale);
    }

    public draw() {
        if (this.conf.label !== false) {
            this._drawLabel();
        }
        let offsety = this.conf.y + 30;
        for (let i = 0; i < this.dataArr.length; i += 2) {
            this._drawBox(this.dataArr[i] + ' : ' + this.dataArr[i + 1], offsety);
            offsety += this.conf.height + 5;
        }
    }

    public addScore(player: string, points: number) {
        if (this.scoreRound.indexOf(player) !== -1)
            return;
        let i = this.dataArr.indexOf(player);
        if (i !== -1)
            this.dataArr[i + 1] += points;
        else
            this.dataArr.push(player, points);
        this.scoreRound.push(player);
    }

    public newRound() {
        this.scoreRound = [];
    }

    private _drawLabel() {
        let text = this.game.add.text(this.conf.x, this.conf.y, this.conf.label);
        text.stroke = '#000000';
        text.font = '30px Arial';
        text.strokeThickness = 4;
        text.fill = '#ffffff';
        text.anchor.set(0.5, 0);
        text.fixedToCamera = this.conf.fixToCamera = true;
    }

    private _drawBox(stroke, offsety) {
        let gridSize = 2;
        let boxGr = this.game.add.group();
        boxGr.name = 'drawBox';

        let gr = this.game.add.graphics();
        gr.beginFill(this.conf.color.rect);
        gr.lineStyle(gridSize, this.conf.color.border, 1);
        gr.drawRoundedRect(this.conf.x - this.conf.width / 2, this.conf.y + offsety, this.conf.width, this.conf.height, this.conf.R);
        gr.endFill();
        boxGr.add(gr);

        let text = this.game.add.text(this.conf.x, this.conf.y + offsety, stroke);
        text.anchor.set(0.5, 0);
        text.fontSize = this.conf.height - gridSize;
        boxGr.add(text);

        this.group.add(boxGr);
    }
}