"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Powerup_1 = require("./Powerup");
class EmptyPowerup extends Powerup_1.Powerup {
    makeSound() {
    }
    activate() {
        console.log('activate emptypowerup');
    }
}
exports.EmptyPowerup = EmptyPowerup;
//# sourceMappingURL=EmptyPowerup.js.map