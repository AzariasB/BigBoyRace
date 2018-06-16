import GameState from '../states/gameState';
import {Network} from '../network';
import { Keyboard } from 'phaser-ce';

export default class Chat {

    private static readonly MAX_MESSAGES = 10;
    private static readonly ACCEPTABLE_CHARS = /^[ -~àâäôéèëêïîçùûüÿæœÀÂÄÔÉÈËÊÏÎŸÇÙÛÜÆŒáíñóúÁÍÑÓÚìòÌÒąćęłńśźżĄĆĘŁŃŚŹŻößÖẞ]$/;

    public inputText: Phaser.Text;
    public messages: Phaser.Text[] = [];
    public inputBackground: Phaser.Graphics;
    public game: Phaser.Game;
    private focused: boolean = false;
    private maxlength = 75;

    constructor (private state: GameState) {
        this.game = state.game;

        this.inputBackground = this.game.add.graphics(0, this.state.camera.height - 15);
        this.inputText = this.game.add.text(0, 0, '',
            { font: '12px Arial', fill: '#ffffff', align: 'right', backgroundColor: '#444444'});
        let enterText = this.game.add.text(0, 0, '<Enter> to use chat',
            { font: '12px Arial', fill: '#ffffff', align: 'left', boundsAlignV: 'bottom'  });
        enterText.fixedToCamera = true;
        enterText.setTextBounds(0, this.state.camera.height - 15, 50);
        enterText.lineSpacing = -5;
        this.inputText.setTextBounds(0, this.state.camera.height - 15, 300, 100);
        this.inputText.fixedToCamera = true;
        this.inputText.lineSpacing = -5;
       /* this.messages.fixedToCamera = true;
        this.messages.lineSpacing = -5;
        this.messages.setTextBounds(0, this.state.camera.height - 115, 300, 100); */
        this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(() => this.processEnter());
        this.inputBackground.fixedToCamera = true;
        Network.when('chat').add((_, message) => this.addMessage(message));
    }

    public addMessage(data: string|any): void {
        let nwText: Phaser.Text = null;
        if ((typeof data) === 'string') {
            nwText = this.game.add.text(0, this.state.camera.height, data,
                {font: '12px Arial', fill: '#ffffff', wordWrap: true, wordWrapWidth: 200});
        } else {
            nwText = this.game.add.text(0, this.state.camera.height, data.message,
                {font: '12px Arial', fill: '#ffffff', wordWrap: true, wordWrapWidth: 200});
            nwText.tint = data.tint;
        }
        nwText.fixedToCamera = true;
        nwText.cameraOffset.y -= nwText.height + 40;
        this.messages.map(m => m.cameraOffset.y -= nwText.height - 5);

        if (this.messages.length === Chat.MAX_MESSAGES) {
            let last = this.messages.pop();
            this.game.add.tween(last).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true).onComplete.add(() => last.destroy());
        }
        this.messages.unshift(nwText);
    }

    public processEnter() {
        if (!this.focused) {
            this.game.input.keyboard.onDownCallback = (ev) => this.updateInputText(ev);
            this.game.input.keyboard.clearCaptures();
            this.inputBackground.beginFill(0x444444);
            this.inputBackground.drawRect(0, 0, 100, 15);
            this.inputBackground.endFill();
        } else {
            this.game.input.keyboard.onDownCallback = null;
            if (this.inputText.text.length > 0) {
                Network.send('chat', this.inputText.text);
            }
            this.inputText.setText('');
            this.inputBackground.clear();
        }
        this.focused = !this.focused;
        this.state.pauseCapture = this.focused;
    }

    public updateInputText(c: KeyboardEvent) {
        if (Chat.ACCEPTABLE_CHARS.test(c.key) && this.inputText.text.length < this.maxlength) {
            this.inputText.text += c.key;
        } else if (c.key === 'Backspace') {
            this.inputText.setText(this.inputText.text.substr(0, this.inputText.text.length - 1));
        }
    }
}