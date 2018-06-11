
import * as io from 'socket.io-client';

interface CallbackRegister { [key: string]: Function[]; }

export namespace Network {
    let m_socket: io.Client;
    let allTimeReceiver: CallbackRegister = {};
    let oneTimeReceiver: CallbackRegister = {};


    function receivedData(key: string, data: any) {
        if (allTimeReceiver[key]) {
            allTimeReceiver[key].map(callback => callback(key, data));
        }

        if (oneTimeReceiver[key]) {
            oneTimeReceiver[key].map(callback => callback(key, data));
            oneTimeReceiver[key] = [];
        }
    }

    function assertKeyExist(obj: CallbackRegister, key: string): CallbackRegister {
        let other = obj === allTimeReceiver ? oneTimeReceiver : allTimeReceiver;
        if (!obj[key] && !other[key]) {
            m_socket.on(key, d => receivedData(key, d));
        }
        if (!obj[key])obj[key] = [];
        return obj;
    }


    export function disconnect() {
        m_socket.disconnect();
        m_socket = null;
    }

    export function initialize() {
        m_socket = io({ path : '/grace/socket' });
    }

    export function send(key: string, data: Float32Array) {
        m_socket.emit(key, data);
    }

    export function onReceive(key: string, callback: Function) {
        assertKeyExist(allTimeReceiver, key)[key].push(callback);
    }

    export function onReceiveOnce(key: string, callback: Function) {
        assertKeyExist(oneTimeReceiver, key)[key].push(callback);
    }
}