
import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import { N_PATH } from '../src/constant';
import { Lobby } from './lobby';

const port = +process.env.PORT || 4334;


class Server {
    private app: express.Application;
    private server: http.Server;
    private io: SocketIO.Server;
    private lobbies: Lobby[];

    constructor() {
      this.app = express();
      this.app.use(express.static('dist'));
      this.server = http.createServer(this.app);
      this.lobbies = [];

      this.io = socketIO(this.server, {
        serveClient: false,
        path:  N_PATH
      });
      this.io.on('error', err => {
        console.error(err);
      });

      this.nwLobby();

      this.server.listen(port, err => {
        if (err) console.error(err);

        console.log(`Http/ws started on port ${port}`);
      });
    }

    private nwLobby() {
      let nwL = new Lobby(this.io);
      nwL.onFull = () => this.nwLobby();
      nwL.onOver = (lobby) => this.lobbies = this.lobbies.filter(l => l !== lobby);
      this.lobbies.push(nwL);
    }
}

const s = new Server();