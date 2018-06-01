
import { Images } from '../assets';

export default class BackgroundScroller  {


    public static get BG_NAMES(): string[] {
        return [
            Images.ImagesPlx1.getName(),
            Images.ImagesPlx2.getName(),
            Images.ImagesPlx3.getName(),
            Images.ImagesPlx4.getName(),
            Images.ImagesPlx5.getName()
        ];
    }

    constructor(game: Phaser.Game) {
        for (let i = 0; i < BackgroundScroller.BG_NAMES.length; ++i) {
            let name = BackgroundScroller.BG_NAMES[i];
            let img = game.cache.getImage(name);

            let bg = game.add.tileSprite(0, 0, game.world.width, game.height, name);
            bg.scale.set(game.height / img.height, game.height / img.height);
            bg.autoScroll(-2 * (i + 1), 0);
        }
    }
}