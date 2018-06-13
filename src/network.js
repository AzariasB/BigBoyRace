"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const phaser_ce_1 = require("phaser-ce");
const constant_1 = require("./constant");
var Network;
(function (Network) {
    let m_socket;
    let receivers = {};
    Network.onReceive = new phaser_ce_1.Signal();
    function when(key) {
        if (!receivers[key]) {
            let sign = new phaser_ce_1.Signal();
            m_socket.on(key, data => {
                sign.dispatch(key, data);
            });
            receivers[key] = sign;
        }
        return receivers[key];
    }
    Network.when = when;
    function disconnect() {
        m_socket.disconnect();
        m_socket = null;
    }
    Network.disconnect = disconnect;
    function initialize() {
        m_socket = io({ path: constant_1.N_PATH });
    }
    Network.initialize = initialize;
    function send(key, data) {
        m_socket.emit(key, data);
    }
    Network.send = send;
})(Network = exports.Network || (exports.Network = {}));
//# sourceMappingURL=network.js.map