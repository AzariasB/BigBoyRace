import { Network } from '../network';
import BackgroundScroller from '../widgets/backgroundScroller';
import * as Assets from '../assets';
import TextButton from '../widgets/TextButton';
import { Carousel, CarouselType } from '../widgets/carousel';


export default class JoiningState extends Phaser.State {

    private static readonly MAX_ROWS = 5;

    create() {
        new BackgroundScroller(this.game);

        this.game.add.text(this.game.world.centerX, 5, 'Joining', {
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 30
        }).anchor.set(0.5, 0);

        this.game.add.existing(new TextButton(this.game, 100, 30, {
            text: 'Menu',
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 20
        }, {callback: () => this.state.start('title')}));

        Network.acknowledge('lobbies', null, lobbies => this.showLobbies(lobbies));
    }

    private addText(y: number, text: string) {
        let txt = this.game.add.text(this.world.centerX, y, text, {
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 15
        });
        txt.anchor.set(0.5);
        return txt;
    }

    private showLobbies(lobbies: any[]) {

        if (lobbies.length === 0) {
            this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'No lobbies found', {
                font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize: 25
            }).anchor.set(0.5, 0.5);
        } else {
            let selectedLobby = lobbies[0];
            console.log(selectedLobby);
            let carousel: Carousel = this.game.add.existing(new Carousel(
                this.game,
                this.world.centerX,
                this.world.centerY - 70,
                CarouselType.Large,
                lobbies.map(l => `Lobby ${l.id}`)
            ));

            let mapNameText = this.addText(this.world.centerY, 'Map : ' + selectedLobby.config.map);
            let players = selectedLobby.config.playersNumber,
                remaining = selectedLobby.remaining;
            let playersText = this.addText(this.world.centerY + mapNameText.height, `Players : ${players - remaining}/${players}`);


            carousel.onChangeSelection = (id => {
                let sel = lobbies[id];
                let players = sel.config.playersNumber, remaining = sel.remaining;
                mapNameText.text = 'Map : ' + lobbies[id].config.map;
                playersText.text = `Players : ${players - remaining}/${players}`;
            });

            this.game.add.existing(new TextButton(this.game, this.world.centerX, 100 + this.world.centerY + mapNameText.height + playersText.height, {
                text: 'Join',
                font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize: 20
            }, {callback: () => this.state.start('lobby', true, false, false, +carousel.selectedValue.split(' ')[1]) }));
        }

    }
}