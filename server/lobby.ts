
const COLORS = [
    0xFFAD66, // orange
    0xFF6761, // red
    0x6C6BAA, // blue
    0x8BAA60, // green
    0x646464, // black,
    0xE8DB6B, // yellow
    0xAA8DE8 // violet
];


export class Lobby {
    public onFull: Function;
    public onOver: Function;
    private clients: SocketIO.Socket[];
    public isFull: boolean;

    constructor(
        public id: number,
        public config: any) {
        this.clients = [];
    }

    get playersNumber () {
        return this.config.playersNumber;
    }

    public serialize() {
        return {
            id: this.id,
            config: this.config,
            remaining: this.remaining()
        };
    }

    public addSocket(socket: SocketIO.Socket) {
        if (this.isFull) return;
        let nwClientId = this.clients.length;
        // on disconnect => wart the other players
        socket.on('disconnect', () => this.removeSocket(socket, nwClientId));
        socket.on('quit', () => this.removeSocket(socket, nwClientId));

        socket.emit('welcome', {
            id: nwClientId,
            lobbyId: this.id,
            config: this.config,
            remaining: this.remaining()
        });
        this.clients.push(socket);
        if (this.clients.length === this.playersNumber) {
            this.startGame();
        }
    }

    private removeSocket(socket: SocketIO.Socket, id: number) {
        this.clients = this.clients.filter(x => x !== socket);
        this.broadcast('update', {id, left: true});
        this.broadcast('chat', `Server : Player ${id} left`);
        if (this.clients.length === 0) {
            if (this.onOver) this.onOver(this);
        }
    }

    private startGame() {
        this.isFull = true;
        if (this.onFull) this.onFull();
        this.broadcast('start');

        this.clients.map(c => {
            c.on('chat', (data) => this.broadcast('chat', {tint: this.getColor(c), message: data}));
            this.countdown(3);
        });
    }

    private countdown(value: number) {
        this.broadcast('countdown', value);

        if (value === 0) return this.redirectUpdate();
        setTimeout(() => this.countdown(value - 1), 1000);
    }

    private redirectUpdate() {
        this.clients.map(c => {
            c.on('update', (data) => this.broadcast('update', data));
        });
    }

    private remaining() {
        return this.isFull ? 0 : this.playersNumber - this.clients.length;
    }

    private getColor(c: SocketIO.Socket) {
        return COLORS[this.clients.indexOf(c)] || 0xffffff;
    }

    private broadcast(key: string, data?: any) {
        this.clients.map(c => c.emit(key, data));
    }

}