import { Vector2 } from "../ts_lib/vector2.js";

export enum TileCollision {
    Passable = 0,
    Impassable = 1,
    Platform = 2
}

export class Tile {
    public Texture: HTMLImageElement;
    public Collision: TileCollision;
    public static Width: number = 64;
    public static Height: number = 48;
    public static Size: Vector2 = new Vector2(Tile.Width, Tile.Height);

    constructor(texture: HTMLImageElement, collision: TileCollision) {
        this.Texture = texture;
        this.Collision = collision;
    }
}
