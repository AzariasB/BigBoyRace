
import * as io from 'socket.io-client';
import { Signal } from 'phaser-ce';
import { N_PATH } from './constant';

export namespace Network {
    let m_socket: io.Client;
    let receivers: {[key: string]: Signal} = {};
    export const onReceive = new Signal();

    export function clearListener(key: string) {
        if (!receivers[key]) return;

        m_socket.off(key);
        receivers[key].removeAll();
        delete receivers[key];
    }

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

    export function initialize() {
        m_socket = io({path: N_PATH});
    }

    export function send(key: string, data?: any) {
        if (m_socket) m_socket.emit(key, data);
    }

    export function acknowledge(key: string, data?: any, callback?: Function) {
        if (!m_socket) return;

        m_socket.emit(key, data, callback);
    }
}