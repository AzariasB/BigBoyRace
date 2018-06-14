
export class Lobby {

    public onFull: Function;
    public onOver: Function;
    private clients: SocketIO.Socket[];
    public isFull: boolean;

    constructor(
        public id: number,
        public mapName: string,
        public playersNumber: number) {
        this.clients = [];
    }

    public serialize() {
        return {
            id: this.id,
            mapName: this.mapName,
            playersNumber: this.playersNumber,
            remaining: this.remaining()
        };
    }

    public addSocket(socket: SocketIO.Socket) {
        if (this.isFull) return;

        // on disconnect => wart the other players
        socket.on('disconnect', () => this.removeSocket(socket));
        socket.on('quit', () => this.removeSocket(socket));

        socket.emit('welcome', {
            id: this.clients.length,
            lobbyId: this.id,
            map: this.mapName,
            playersNumber: this.playersNumber,
            remaining: this.remaining()
        });
        this.clients.push(socket);
        if (this.clients.length === this.playersNumber) {
            this.startGame();
        }
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
        this.clients.map(c => c.on('update', (data) => this.broadcast('update', data)));
        this.broadcast('start');
    }

    private remaining() {
        return this.isFull ? 0 : this.playersNumber - this.clients.length;
    }

    private broadcast(key: string, data?: any) {
        this.clients.map(c => c.emit(key, data));
    }

}