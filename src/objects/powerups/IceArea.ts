import { Powerup } from './Powerup';
import * as Assets from '../../assets';
import { Player } from '../Player';
import Box from '../Box';
import Game from '../../states/game';
import { EffectArea, EffectName } from '../EffectArea';


export class IceArea extends Powerup {
    private gamestate;

    constructor (private gameState: Game, x: number, y: number) {
    super(gameState.game, x, y, Assets.Images.ImagesIcleblock.getName());
    this.gamestate = gameState;
    this.scale = new Phaser.Point(0.6, 0.6);
    this.anchor.set(0.5, 0.5);
    this.fixedToCamera = true ;
    }
    public makeSound(): void {
    }
    public  activate(player: Player): void {
        let item =  new EffectArea(this.gamestate, player.arcadeBody.position.x,
                player.arcadeBody.position.y,
                Assets.Images.ImagesIcleblock.getName(), EffectName.ice);
        this.gamestate.addItemOnMap(item);
    }
    public effect(player: Player) {
        player.arcadeBody.velocity.x / 2;

    }

}
