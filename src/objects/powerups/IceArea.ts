import { Powerup } from './Powerup';
import * as Assets from '../../assets';
import { Player } from '../Player';
import Box from '../Box';
import GameState from '../../states/gameState';
import { EffectArea, EffectName } from '../EffectArea';


export class IceArea extends Powerup {

    constructor (private gameState: GameState) {
        super(gameState.game, 0, 0, Assets.Images.ImagesIcleblock.getName());
        this.scale = new Phaser.Point(0.6, 0.6);
        this.anchor.set(0.5, 0.5);
        this.fixedToCamera = true ;
    }

    public makeSound(): void {
    }

    public  activate(player: Player): void {
        this.gameState.addItemOnMap(EffectName.ice,  player.arcadeBody.position);
    }

    public effect(player: Player) {
        player.arcadeBody.velocity.x / 2;

    }

}
