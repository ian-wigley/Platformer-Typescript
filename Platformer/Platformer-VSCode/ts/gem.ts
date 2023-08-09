import { Level } from "./level.js";
import { Tile } from "./tile.js";
import { Circle } from "../ts_lib/circle.js";
import { Vector2 } from "../ts_lib/vector2.js";
import { Player } from "./player.js";
import { Color } from "../ts_lib/color.js";
import { GameTime } from "../ts_lib/gametime.js";
import { SpriteBatch } from "../ts_lib/spritebatch.js";

export class Gem {
    private texture: HTMLImageElement;
    private origin: Vector2;
    private collectedSound: HTMLAudioElement;
    public static PointValue: number = 30;
    public Color: Color = Color.Yellow;
    private basePosition: Vector2 = Vector2.Zero;
    private bounce: number = 0;
    private level: Level;

    constructor(level: Level, position: Vector2) {
        this.level = level;
        this.basePosition = position;
        this.LoadContent();
    }

    public LoadContent(): void {
        this.texture = <HTMLImageElement>document.getElementById("gem");
        this.origin = new Vector2(this.texture.width / 2.0, this.texture.height / 2.0);
        this.collectedSound = <HTMLAudioElement>document.getElementById("GemCollected");
    }

    public Update(gameTime: GameTime): void {
        let BounceHeight: number = 0.18;
        let BounceRate: number = 3.0;
        let BounceSync: number = -0.75;
        let t: number = gameTime.TotalGameTime.TotalSeconds * BounceRate + this.Position.X * BounceSync;
        this.bounce = Math.sin(t) * BounceHeight * this.texture.height;
    }

    public OnCollected(collectedBy: Player): void {
        this.collectedSound.play();
    }

    public Draw(gameTime: GameTime, spriteBatch: SpriteBatch): void {
        spriteBatch.Draw(this.texture, this.Position.X - this.origin.X, this.Position.Y - this.origin.Y);
    }

    public get Level(): Level {
        return this.level;
    }

    public get Position(): Vector2 {
        return new Vector2(this.basePosition.X, this.basePosition.Y + this.bounce);
    }

    public get BoundingCircle(): Circle {
        return new Circle(this.Position, Tile.Width / 3.0);
    }
}
