
import TextButton, { ButtonOptions } from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';

export default class TitleState extends Phaser.State {


    public create(): void {
        this.world.setBounds(0, 0, this.game.width, this.game.height);
        new BackgroundScroller(this.game);

        let splashTitle = this.game.add.image(this.world.centerX, 20, Assets.Images.ImagesTitle.getName());
        splashTitle.anchor.set(0.5, 0);
        splashTitle.scale.set(0.5);

        let yPos = 250;
        let tb = this.game.add.existing(new TextButton(this.game, this.game.world.centerX, yPos, {
            text : 'Join',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : () => this.fadeTo('joining')}));
        yPos += tb.height + 10;

        let optionsB = this.add.existing(new TextButton(this.game, this.game.world.centerX, yPos , {
            text : 'Create',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : () => this.fadeTo('create')}));
        yPos += optionsB.height + 10;

        let helpB = this.game.add.existing(new TextButton(this.game, this.game.world.centerX, yPos , {
            text : 'Help',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : () => this.fadeTo('help')}));
        yPos += helpB.height + 10;

        this.game.add.existing(new TextButton(this.game, this.game.world.centerX, yPos, {
            text : 'Credits',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : () => this.fadeTo('credits')}));
    }

    private fadeTo(stateName: string) {
        this.game.camera.onFadeComplete.addOnce(() => this.state.start(stateName), this);
        this.game.camera.fade(0x000000, 500);
    }

}