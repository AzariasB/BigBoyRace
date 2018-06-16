import GameState from '../states/gameState';
import {Network} from '../network';
import { Keyboard } from 'phaser-ce';

export default class Chat {

    private static readonly ACCEPTABLE_CHARS = /^[ -~àâäôéèëêïîçùûüÿæœÀÂÄÔÉÈËÊÏÎŸÇÙÛÜÆŒáíñóúÁÍÑÓÚìòÌÒąćęłńśźżĄĆĘŁŃŚŹŻößÖẞ]$/;

    public inputText: Phaser.Text;
    public messages: Phaser.Text;
    public inputBackground: Phaser.Graphics;
    public game: Phaser.Game;
    private focused: boolean = false;
    private maxlength = 75;

    constructor (private state: GameState) {
        this.game = state.game;

        this.inputBackground = this.game.add.graphics(0, this.state.camera.height - 15);
        this.inputText = this.game.add.text(0, 0, '',
            { font: '12px Arial', fill: '#ffffff', align: 'right', backgroundColor: '#444444'});
        this.messages = this.game.add.text(0, 0, '<Enter> to use chat',
            { font: '12px Arial', fill: '#ffffff', align: 'left', wordWrapWidth: 300, wordWrap: true, boundsAlignV: 'bottom'  });
        this.inputText.fixedToCamera = true;
        this.inputText.setTextBounds(0, this.state.camera.height - 15, 50);
        this.messages.fixedToCamera = true;
        this.messages.lineSpacing = -5;
        this.messages.setTextBounds(0, this.state.camera.height - 115, 300, 100);
        this.game.input.keyboard.callbackContext = this;
        this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(Chat.prototype.processEnter, this);
        this.inputBackground.fixedToCamera = true;
        Network.when('chat').add((_, message) => this.addMessage(message));
    }

    public addMessage(message: string): void {
        this.messages.setText(this.messages.text + '\n' + message);

        let chars = this.messages.text.split('');
        if (chars.filter(x => x === '\n').length > 5) {
            this.messages.setText(this.messages.text.substr(chars.indexOf('\n') + 1));
        }
    }

    public processEnter() {
        if (!this.focused) {
            this.focused = true;
            this.game.input.keyboard.onDownCallback = this.updateInputText;
            this.state.pauseCapture = true;
            this.game.input.keyboard.clearCaptures();
            this.inputBackground.beginFill(0x444444);
            this.inputBackground.drawRect(0, 0, 100, 15);
            this.inputBackground.endFill();
        } else {
            this.focused = false;
            this.game.input.keyboard.onPressCallback = null;
            this.state.pauseCapture = false;
            if (this.inputText.text.length > 1) {
                let m = this.inputText.text.split('');
                for (let i = 0, c = 1; i < m.length ; i++, c++) {
                    if (m[i] === ' ')
                        c = 0;
                    if (c === 30) {
                        m.splice(i, 0, '\n');
                        c = 0;
                    }
                }
                let message = m.join('');
                Network.send('chat', message);
            }
            this.inputText.setText('');
            this.inputBackground.clear();
        }
    }

    public updateInputText(c: KeyboardEvent) {
        if (Chat.ACCEPTABLE_CHARS.test(c.key) && this.inputText.text.length < this.maxlength) {
            this.inputText.setText(this.inputText.text + c.key);
        } else if (c.key === 'Backspace') {
            this.inputText.setText(this.inputText.text.substr(0, this.inputText.text.length - 1));
        }
    }
}