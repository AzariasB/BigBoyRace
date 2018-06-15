import { Spritesheets } from '../assets';


const COLORS = [
    {
        sprite: Spritesheets.HeroOrange,
        tint: 0xFF7647 // orange
    },
    {
        sprite: Spritesheets.HeroRed,
        tint: 0xFF0007, // red
    },
    {
        sprite: Spritesheets.HeroBlue,
        tint: 0x303A7F, // blue
    },
    {
        sprite: Spritesheets.HeroGreen,
        tint: 0x367F33, // green
    },
    {
        sprite: Spritesheets.HeroBlack,
        tint: 0x0E0026 // black
    },
    {
        sprite: Spritesheets.HeroYellow,
        tint: 0xFFDB25, // yellow
    },
    {
        sprite: Spritesheets.HeroViolet,
        tint: 0x3E457F // violet
    }
];


export function getTint(value: number) {
    return value > COLORS.length ? 0xffffff : COLORS[value].tint;
}

export function getSpriteName(value: number) {
    return value > COLORS.length ? Spritesheets.Hero.getName() : COLORS[value].sprite.getName();
}