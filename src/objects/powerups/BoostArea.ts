import { Powerup } from './Powerup';
import * as Assets from '../../assets';
import { Player } from '../Player';
import GameState from '../../states/gameState';
import { EffectArea, EffectName } from '../EffectArea';


export class BoostArea extends Powerup {
    constructor (private gameState: GameState) {
        super(gameState.game, 0, 0, Assets.Images.ImagesArrow.getName());
        this.scale = new Phaser.Point(0.2, 0.5);
        this.anchor.set(0.5, 0.5);
        this.fixedToCamera = true ;
    }
    public makeSound(): void {
    }

    public  activate(player: Player): void {
        this.gameState.addItemOnMap(EffectName.boost, player.arcadeBody.position);
    }

    public effect(player: Player) {
        player.arcadeBody.velocity.x / 2;

    }

}
