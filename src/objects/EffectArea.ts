import Game from '../states/game';
import { Player } from './Player';
import * as Assets from '../assets';

export enum EffectName {
    glue = 'glue',
    boost = 'boost',
    ice = 'ice'
}

export class EffectArea extends Phaser.Sprite {

    private dustParticles: Phaser.Particles.Arcade.Emitter;

    constructor (private gameState: Game, x: number, y: number, image: string, private effet: EffectName) {
        super(gameState.game, x, y, image);
        this.game.physics.arcade.enableBody(this);
        this.scale = new Phaser.Point(1.5, 1.5);
        this.anchor.set(0.5, 0.5);
        this.fixedToCamera = false ;


        switch (this.effet) {
            case EffectName.glue:
                break;
            case EffectName.boost:
                break;
            case EffectName.ice:
                this.height = 4;
                this.dustParticles = this.game.add.emitter( this.position.x - this.width / 2, this.top, 2000);
                this.dustParticles.makeParticles(Assets.Images.ImagesSnowflake.getName());
                this.dustParticles.minParticleSpeed.setTo(-25, 1);
                this.dustParticles.maxParticleSpeed.setTo(25, 10);
                this.dustParticles.gravity.y = -750;
                this.dustParticles.start(false, 4000, 15);
                this.dustParticles.frequency = 20;
                this.dustParticles.minParticleScale = this.dustParticles.maxParticleScale = 0.05;

                this.dustParticles.lifespan = 1500;
                this.game.add.tween(this.dustParticles).to({ x: this.right }, 200, 'Linear', true, 0, -1, true );
                break;

        }

    }


    public Effect(player: Player) {
    switch (this.effet) {
        case EffectName.glue:
            player.arcadeBody.velocity.x /= 1.02;
            break;
        case EffectName.boost:
            player.arcadeBody.velocity.x *= 1.05;
            break;
        case EffectName.ice:
            player.arcadeBody.velocity.x = player.arcadeBody.velocity.x;
            this.dustParticles.on = true;
            break;
        }
    }

    update() {
        super.update();

        switch (this.effet) {
            case EffectName.glue:
                break;
            case EffectName.boost:
                break;
            case EffectName.ice:
                this.dustParticles.y = ( this.top - 60 );
                break;
            }
    }
}