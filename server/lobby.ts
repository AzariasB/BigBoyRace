
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
        this.broadcast('start');

        this.clients.map(c => {
            c.on('chat', (data) => this.broadcast('chat', this.getColor(c) + ' : ' + data));
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
        let index = this.clients.indexOf(c);
        let color = '';
        switch (index) {
            case 1:
                color = 'Blue';
                break;
            case 2:
                color = 'Red';
                break;
            case 3:
                color = 'Green';
                break;
            case 4:
                color = 'Yellow';
                break;
            case 5:
                color = 'Purple';
                break;
            default:
                color = 'White';
                break;
        }
        return color;
    }

    private broadcast(key: string, data?: any) {
        this.clients.map(c => c.emit(key, data));
    }

}