import { Powerup } from './Powerup';
import * as Assets from '../../assets';
import { Player } from '../Player';
import Box from '../Box';
import Game from '../../states/game';
import { EffectArea, EffectName } from '../EffectArea';


export class GlueArea extends Powerup {

    constructor (private gameState: Game) {
        super(gameState.game, 0, 0, Assets.Images.ImagesWeb.getName());
        this.scale = new Phaser.Point(1.5, 1.5);
        this.anchor.set(0.5, 0.5);
        this.fixedToCamera = true ;

    }
    public makeSound(): void {
    }

    public  activate(player: Player): void {
        this.gameState.addItemOnMap(EffectName.glue, player.arcadeBody.position);
    }

    public effect(player: Player) {
        player.arcadeBody.velocity.x / 2;

    }

}
