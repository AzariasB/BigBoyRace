import Game from '../states/game';
import { Player } from './Player';
import * as Assets from '../assets';

export enum EffectName {
    glue = 'glue',
    boost = 'boost',
    ice = 'ice'
}

export class EffectArea extends Phaser.Sprite {

    private static readonly EFFECT_SPRITES = {
        [EffectName.glue]: Assets.Images.ImagesIcleblock,
        [EffectName.boost]: Assets.Images.ImagesBoost,
        [EffectName.ice]: Assets.Images.ImagesGlue
    };

    private particles: Phaser.Particles.Arcade.Emitter;

    constructor (private gameState: Game, x: number, y: number, private effet: EffectName) {
        super(gameState.game, x, y, EffectArea.EFFECT_SPRITES[effet].getName());
        this.game.physics.arcade.enableBody(this);
        this.scale = new Phaser.Point(1.5, 1.5);
        this.anchor.set(0.5, 0.5);
        this.fixedToCamera = false ;


        switch (this.effet) {
            case EffectName.glue:
                this.scale = new Phaser.Point(1.5, 0.7);
                break;
            case EffectName.boost:
                this.height = 4;
                this.particles = this.game.add.emitter( this.position.x - this.width / 2, this.top - 20, 2000);
                this.particles.makeParticles(Assets.Images.ImagesBoost.getName());
                this.particles.minParticleSpeed.setTo(1, 1);
                this.particles.maxParticleSpeed.setTo(200, 1);
                this.particles.gravity.y = -800;
                this.particles.maxRotation = 0;
                this.particles.minRotation = 0;
                this.particles.start(false, 4000, 15);
                this.particles.frequency = 20;
                this.particles.minParticleScale = this.particles.maxParticleScale = 0.1;

                this.particles.lifespan = 700;
                this.game.add.tween(this.particles).to({y: this.bottom + 30 }, 200, 'Linear', true, 0, -1, true );
                break;
            case EffectName.ice:
                this.height = 4;
                this.particles = this.game.add.emitter( this.position.x - this.width / 2, this.top, 2000);
                this.particles.makeParticles(Assets.Images.ImagesSnowflake.getName());
                this.particles.minParticleSpeed.setTo(-25, 1);
                this.particles.maxParticleSpeed.setTo(25, 10);
                this.particles.gravity.y = -750;
                this.particles.start(false, 4000, 15);
                this.particles.frequency = 20;
                this.particles.minParticleScale = this.particles.maxParticleScale = 0.05;

                this.particles.lifespan = 1500;
                this.game.add.tween(this.particles).to({ x: this.right }, 200, 'Linear', true, 0, -1, true );
                break;

        }

    }


    public Effect(player: Player) {
    switch (this.effet) {
        case EffectName.glue:
            player.arcadeBody.velocity.x /= 1.02;
            break;
        case EffectName.boost:
            player.arcadeBody.velocity.x *= 1.04;
            break;
        case EffectName.ice:
            player.arcadeBody.velocity.x = player.arcadeBody.velocity.x;
            this.particles.on = true;
            break;
        }
    }

    update() {
        super.update();

        switch (this.effet) {
            case EffectName.glue:
                break;
            case EffectName.boost:
                this.particles.y = this.top - 60;
                break;
            case EffectName.ice:
                this.particles.y = ( this.top - 60 );
                break;
            }
    }
}