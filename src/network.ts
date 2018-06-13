
import * as io from 'socket.io-client';
import { Signal } from 'phaser-ce';
import { N_PATH } from './constant';

export namespace Network {
    let m_socket: io.Client;
    let receivers: {[key: string]: Signal} = {};
    export const onReceive = new Signal();


    export function when(key: string): Signal {
        if (!receivers[key]) {
            let sign = new Signal();
            m_socket.on(key, data => {
                sign.dispatch(key, data);
            });
            receivers[key] = sign;

        }
        return receivers[key];
    }

    export function disconnect() {
        m_socket.disconnect();
        m_socket = null;
    }

    export function initialize() {
        m_socket = io({path: N_PATH});
    }

    export function send(key: string, data: Int8Array) {
        m_socket.emit(key, data);
    }
}