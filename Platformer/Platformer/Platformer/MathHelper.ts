module Platformer1 {
    export class MathHelper {
        public static Clamp(value: number, min: number, max: number): number {
            value = (value > max) ? max : value;
            value = (value < min) ? min : value;
            return value;
        }
    }
}