
import * as express from 'express';
import * as http from 'http';
import * as socketIO from 'socket.io';
import './phaser';
import App from './App';
import { N_PORT, N_PATH } from '../src/constant';

const port = +process.env.PORT || 4334;


class Server {
    private app: express.Application;
    private server: http.Server;
    private io: SocketIO.Server;
    private game: App;

    constructor() {
      this.server = http.createServer();

      this.io = socketIO(this.server, {
        serveClient: false,
        path:  N_PATH
      });
      this.io.on('error', err => {
        console.error(err);
      });

      this.game = new App(this.io);
      this.server.listen(port, err => {
        if (err) console.error(err);

        console.log(`Http/ws started on port ${port}`);
      });
    }
}

const s = new Server();