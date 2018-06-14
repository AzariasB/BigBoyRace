
import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import { N_PATH } from '../src/constant';
import { Lobby } from './lobby';

const port = +process.env.PORT || 4334;


class Server {
    private static LOBBY_ID = 0;

    private app: express.Application;
    private server: http.Server;
    private io: SocketIO.Server;
    private lobbies: {[key: number]: Lobby} = {};

    nextLobbyId() {
      return ++Server.LOBBY_ID;
    }

    constructor() {
      this.app = express();
      this.app.use(express.static('dist'));
      this.server = http.createServer(this.app);

      this.io = socketIO(this.server, {
        serveClient: false,
        path:  N_PATH
      });
      this.io.on('error', err => {
        console.error(err);
      });

      this.io.on('connection', (socket) => {

        socket.on('lobbies', (_, ack = () => {}) => {
          ack(this.availableLobbies());
          // socket.emit('lobbies', this.lobbies.filter(l => !l.isFull).map(l => ({map: l.mapName, players: l.playersNumber})));
        });

        socket.on('join', (id, ack = _ => {}) => {
          ack(this.joinLobby(id, socket));
        });
        socket.on('create', (data) => this.createLobby(data.map, data.players, socket));

      });

      // this.nwLobby();

      this.server.listen(port, err => {
        if (err) console.error(err);

        console.log(`Http/ws started on port ${port}`);
      });
    }

    /* private nwLobby() {
      let nwL = new Lobby(this.io);
      nwL.onFull = () => this.nwLobby();
      nwL.onOver = (lobby) => this.lobbies = this.lobbies.filter(l => l !== lobby);
      this.lobbies.push(nwL);
    }*/

    private joinLobby(id: number, socket: SocketIO.Socket) {
      if (!this.lobbies[id] || this.lobbies[id].isFull) return false;
      this.lobbies[id].addSocket(socket);
      return true;
    }

    private availableLobbies() {
      return Object.keys(this.lobbies).filter(l => !this.lobbies[l].isFull).map(k => this.lobbies[k].serialize());
    }

    private createLobby(map: string, playersNumber: number, creator: SocketIO.Socket) {
      console.log('creating lobby');
      let id = this.nextLobbyId();
      let nwL = new Lobby(id, map, playersNumber);
      nwL.addSocket(creator);
      nwL.onOver = (lobby) => delete this.lobbies[lobby.id];
      this.lobbies[id] = nwL;
    }
}

const s = new Server();