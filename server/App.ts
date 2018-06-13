
import Game from './states/game';
import Lobby from './states/lobby';
import * as ws  from 'ws';

export default class App  extends Phaser.Game {

  constructor (private socket: ws.Server , config?: Phaser.IGameConfig) {
    super(config);

    this.socket.on('connection', (ws) => {
        console.log(ws);
        console.log('client connected !');
    });

    this.state.add('lobby', Lobby);
    this.state.add('game', Game);

    this.state.start('lobby');
  }

}
