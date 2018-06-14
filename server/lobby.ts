import { N_PLAYERS } from '../src/constant';


export class Lobby {

    public onFull: Function;
    public onOver: Function;
    private clients: SocketIO.Socket[];
    private isFull: boolean;

    constructor(private server: SocketIO.Server) {
        this.clients = [];
        this.server.on('connect', (socket) => {
            if (this.isFull) return;

            socket.on('disconnect', () => this.removeSocket(socket));
            socket.emit('id', this.clients.length);
            this.clients.push(socket);
            if (this.clients.length === N_PLAYERS) {
                this.startGame();
            }
        });
    }

    private removeSocket(socket: SocketIO.Socket) {
        this.clients = this.clients.filter(x => x !== socket);
        if (this.clients.length === 0) {
            if (this.onOver) this.onOver(this);
        }
    }

    private startGame() {
        this.isFull = true;
        if (this.onFull) this.onFull();
        this.clients.map(c => {
            c.on('chat', (data) => this.broadcast('chat', data));
            c.on('update', (data) => this.broadcast('update', data));
        });
        this.broadcast('start');
    }

    private broadcast(key: string, data?: any) {
        this.clients.map(c => c.emit(key, data));
    }

}