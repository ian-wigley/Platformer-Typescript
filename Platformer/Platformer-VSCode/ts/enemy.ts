import { TimeSpan } from "../ts_lib/timespan.js";
import { Vector2 } from "../ts_lib/vector2.js";
import { AnimationPlayer } from "./animationplayer.js";
import { Animation } from "./animation.js";
import { Level } from "./level.js";
import { SpriteEffects } from "./player.js";
import { Tile, TileCollision } from "./tile.js";
import { Rectangle } from "../ts_lib/rectangle.js";
import { GameTime } from "../ts_lib/gametime.js";
import { SpriteBatch } from "../ts_lib/spritebatch.js";

export enum FaceDirection {
    Left = -1,
    Right = 1
}

export class Enemy {

    private runAnimation: Animation;
    private idleAnimation: Animation;
    private sprite: AnimationPlayer;
    private direction: FaceDirection = FaceDirection.Left;
    private waitTime: number;
    private static MaxWaitTime: number = 0.5;
    private static MoveSpeed: number = 128.0;
    private level: Level;
    private position: Vector2;
    private localBounds: Rectangle;

    constructor(level: Level, position: Vector2, spriteSet: string) {
        this.level = level;
        this.position = position;
        this.LoadContent(spriteSet);
    }

    public LoadContent(spriteSet: string): void {
        this.runAnimation = new Animation(<HTMLImageElement>document.getElementById(spriteSet + "Run"), 0.1, true);
        this.idleAnimation = new Animation(<HTMLImageElement>document.getElementById(spriteSet + "Idle"), 0.15, true);
        this.sprite = new AnimationPlayer();
        this.sprite.PlayAnimation(this.idleAnimation);
        let width: number = (this.idleAnimation.FrameWidth * 0.35);
        let left: number = (this.idleAnimation.FrameWidth - width) / 2;
        let height: number = (this.idleAnimation.FrameWidth * 0.7);
        let top: number = this.idleAnimation.FrameHeight - height;
        this.localBounds = new Rectangle(left, top, width, height);
    }

    public Update(gameTime: GameTime): void {
        let elapsed: number = gameTime.ElapsedGameTime.TotalSeconds;
        let posX: number = this.Position.X + this.localBounds.Width / 2 * this.direction;
        let tileX: number = Math.floor(posX / Tile.Width) - this.direction;
        let tileY: number = Math.floor(this.Position.Y / Tile.Height);
        if (this.waitTime > 0) {
            this.waitTime = Math.max(0.0, this.waitTime - gameTime.ElapsedGameTime.TotalSeconds);
            if (this.waitTime <= 0.0) {
                this.direction = <FaceDirection>(-<number>this.direction);
            }
        }
        else {
            if (this.Level.GetCollision(tileX + <number>this.direction, tileY - 1) == TileCollision.Impassable || this.Level.GetCollision(tileX + <number>this.direction, tileY) == TileCollision.Passable) {
                this.waitTime = Enemy.MaxWaitTime;
            }
            else {
                let velocity: Vector2 = new Vector2(<number>this.direction * Enemy.MoveSpeed * elapsed, 0.0);
                this.position = new Vector2(this.position.X + velocity.X, this.position.Y + velocity.Y);
            }
        }
    }

    public Draw(gameTime: GameTime, spriteBatch: SpriteBatch): void {
        let t = new TimeSpan(0);
        if (!this.Level.Player.IsAlive || this.Level.ReachedExit || this.Level.TimeRemaining == t /*TimeSpan.Zero*/ || this.waitTime > 0) {
            this.sprite.PlayAnimation(this.idleAnimation);
        }
        else {
            this.sprite.PlayAnimation(this.runAnimation);
        }
        let flip = this.direction > 0 ? SpriteEffects.FlipHorizontally : SpriteEffects.None;
        this.sprite.Draw(gameTime, spriteBatch, this.Position, flip);
    }

    public get Level(): Level {
        return this.level;
    }

    public get Position(): Vector2 {
        return this.position;
    }

    public get BoundingRectangle(): Rectangle {
        let left: number = Math.round(this.Position.X - this.sprite.Origin.X) + this.localBounds.X;
        let top: number = Math.round(this.Position.Y - this.sprite.Origin.Y) + this.localBounds.Y;
        return new Rectangle(left, top, this.localBounds.Width, this.localBounds.Height);
    }
}
