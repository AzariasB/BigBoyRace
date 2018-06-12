
import Game from './states/game';
import Lobby from './states/lobby';

export default class App  extends Phaser.Game {
  public express;

  constructor (config?: Phaser.IGameConfig) {
    super(config);

    this.state.add('lobby', Lobby);
    this.state.add('game', Game);

    this.state.start('lobby');

  }

}
