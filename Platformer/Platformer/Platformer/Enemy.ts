module Platformer1 {

    export enum FaceDirection {
        Left = -1,
        Right = 1
    }
    export class Enemy {

        public get Level(): Level {
            return this.level;
        }

        level: Level;
        public get Position(): Vector2 {
            return this.position;
        }

        position: Vector2;
        private localBounds: Rectangle;

        public get BoundingRectangle(): Rectangle {
            var left: number = <number>Math.round(this.Position.X - this.sprite.Origin.X) + this.localBounds.X;
            var top: number = <number>Math.round(this.Position.Y - this.sprite.Origin.Y) + this.localBounds.Y;
            return new Rectangle(left, top, this.localBounds.Width, this.localBounds.Height);
        }

        private runAnimation: Animation;
        private idleAnimation: Animation;
        private sprite: AnimationPlayer;
        private direction: FaceDirection = FaceDirection.Left;
        private waitTime: number;
        private static MaxWaitTime: number = 0.5;
        private static MoveSpeed: number = 128.0;

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
            var width: number = <number>(this.idleAnimation.FrameWidth * 0.35);
            var left: number = (this.idleAnimation.FrameWidth - width) / 2;
            var height: number = <number>(this.idleAnimation.FrameWidth * 0.7);
            var top: number = this.idleAnimation.FrameHeight - height;
            this.localBounds = new Rectangle(left, top, width, height);
        }

        public Update(gameTime): void {
            var elapsed: number = <number>gameTime.ElapsedGameTime.TotalSeconds;
            var posX: number = this.Position.X + this.localBounds.Width / 2 * <number>this.direction;
            var tileX: number = <number>Math.floor(posX / Tile.Width) - <number>this.direction;
            var tileY: number = <number>Math.floor(this.Position.Y / Tile.Height);
            if (this.waitTime > 0) {
                this.waitTime = Math.max(0.0, this.waitTime - <number>gameTime.ElapsedGameTime.TotalSeconds);
                if (this.waitTime <= 0.0)
                {
                    this.direction = <FaceDirection>(-<number>this.direction);
                }
            }
            else {
                if (this.Level.GetCollision(tileX + <number>this.direction, tileY - 1) == TileCollision.Impassable || this.Level.GetCollision(tileX + <number>this.direction, tileY) == TileCollision.Passable) {
                    this.waitTime = Enemy.MaxWaitTime;
                }
                else {
                    var velocity: Vector2 = new Vector2(<number>this.direction * Enemy.MoveSpeed * elapsed, 0.0);
                    this.position = new Vector2(this.position.X + velocity.X, this.position.Y + velocity.Y);
                }
            }
        }

        public Draw(gameTime, spriteBatch): void {
            var t = new TimeSpan(0);
            if (!this.Level.Player.IsAlive || this.Level.ReachedExit || this.Level.TimeRemaining == t /*TimeSpan.Zero*/ || this.waitTime > 0) {
                this.sprite.PlayAnimation(this.idleAnimation);
            }
            else {
                this.sprite.PlayAnimation(this.runAnimation);
            }
            var flip = this.direction > 0 ? SpriteEffects.FlipHorizontally : SpriteEffects.None;
            this.sprite.Draw(gameTime, spriteBatch, this.Position, flip);
        }
    }
}