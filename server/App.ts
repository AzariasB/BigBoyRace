
import Game from './states/game';
import Lobby from './states/lobby';

export default class App  extends Phaser.Game {

  constructor (private socket: SocketIO.Server , config?: Phaser.IGameConfig) {
    super(config);

    this.socket.on('connection', (ws) => {
    });

    this.state.add('lobby', Lobby);
    this.state.add('game', Game);

    this.state.states['lobby'].setServer(this.socket);

    this.state.start('lobby');
  }

}
