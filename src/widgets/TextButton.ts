
import { PhaserTextStyle } from 'phaser-ce';
import { Atlases } from '../assets';

export interface ButtonOptions {
    key?: string;
    callback?: Function;
    callbackContext?: any;
    over?: string;
    out?: string;
    down?: string;
    up?: string;
}

let defaultButton: ButtonOptions = {
    key : Atlases.AtlasesBlueSheet.getName(),
    over : Atlases.AtlasesBlueSheet.Frames.BlueButton04,
    out : Atlases.AtlasesBlueSheet.Frames.BlueButton00,
    down : Atlases.AtlasesBlueSheet.Frames.BlueButton02
};

interface TextOptions extends PhaserTextStyle {
    text: string;
}

export default class TextButton extends Phaser.Group {

    private button: Phaser.Button;
    private text: Phaser.Text;


    constructor (game: Phaser.Game, x: number, y: number, text: TextOptions, options: ButtonOptions = {}) {
        super(game);

        Object.keys(defaultButton).map(k => {
            if (!options[k])options[k] = defaultButton[k];
        });

        this.button = this.add(new Phaser.Button(
            game,
            x,
            y,
            options.key,
            options.callback,
            options.callbackContext,
            options.over,
            options.out,
            options.down,
            options.up
        ));
        this.button.anchor.set(0.5, 0.5);

        this.text = this.add(new Phaser.Text(
            game,
            x,
            y,
            text.text,
            text
        ));
        this.text.anchor.set(0.5, 0.5);


    }
}