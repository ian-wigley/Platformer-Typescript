module Platformer1 {

    export enum SpriteEffects {
        None = 0,
        FlipHorizontally = 1,
        FlipVertically = 2
    }

    export class Player {
        private idleAnimation: Animation;
        private runAnimation: Animation;
        private jumpAnimation: Animation;
        private celebrateAnimation: Animation;
        private dieAnimation: Animation;
        private flip: SpriteEffects = SpriteEffects.None;
        private sprite: AnimationPlayer;
        private killedSound: HTMLAudioElement;
        private jumpSound: HTMLAudioElement;
        private fallSound: HTMLAudioElement;

        public get Level(): Level {
            return this.level;
        }
        level: Level;

        public get IsAlive(): boolean {
            return this.isAlive;
        }
        isAlive: boolean = true;

        public get Position(): Vector2 {
            return this.position;
        }

        public set Position(value: Vector2) {
            this.position = value;
        }
        position: Vector2;

        private previousBottom: number = 0;

        public get Velocity(): Vector2 {
            return this.velocity;
        }

        public set Velocity(value: Vector2) {
            this.velocity = value;
        }
        velocity: Vector2 = Vector2.Zero;

        private static MoveAcceleration: number = 14000.0;
        private static MaxMoveSpeed: number = 2000.0;
        private static GroundDragFactor: number = 0.58;
        private static AirDragFactor: number = 0.65;
        private static MaxJumpTime: number = 0.35;
        private static JumpLaunchVelocity: number = -4000.0;
        private static GravityAcceleration: number = 3500.0;
        private static MaxFallSpeed: number = 600.0;
        private static JumpControlPower: number = 0.14;
        private static MoveStickScale: number = 1.0;
        private static JumpButton;

        public get IsOnGround(): boolean {
            return this.isOnGround;
        }

        isOnGround: boolean = true;
        private movement: number = 0;
        private isJumping: boolean = false;
        private wasJumping: boolean = false;
        private jumpTime: number = 1;
        private localBounds: Rectangle;
        private m_ctrl: Controls;

        public get BoundingRectangle(): Rectangle {
            var left: number = <number>Math.round(this.Position.X - this.sprite.Origin.X) + this.localBounds.X;
            var top: number = <number>Math.round(this.Position.Y - this.sprite.Origin.Y) + this.localBounds.Y;
            return new Rectangle(left, top, this.localBounds.Width, this.localBounds.Height);
        }

        constructor(level: Level, position: Vector2, ctrl: Controls) {
            this.level = level;
            this.m_ctrl = ctrl;
            this.LoadContent();
            this.Reset(position);
        }

        public LoadContent(): void {
            this.idleAnimation = new Animation(<HTMLImageElement>document.getElementById("playerIdle"), 0.1, true);
            this.runAnimation = new Animation(<HTMLImageElement>document.getElementById("playerRun"), 0.1, true);
            this.jumpAnimation = new Animation(<HTMLImageElement>document.getElementById("playerJump"), 0.1, true);
            this.celebrateAnimation = new Animation(<HTMLImageElement>document.getElementById("playerCelebrate"), 0.1, true);
            this.dieAnimation = new Animation(<HTMLImageElement>document.getElementById("playerDie"), 0.1, true);
            var width: number = Math.round(<number>(this.idleAnimation.FrameWidth * 0.4));
            var left: number = Math.round((this.idleAnimation.FrameWidth - width) / 2);
            var height: number = Math.round(<number>(this.idleAnimation.FrameWidth * 0.8));
            var top: number = Math.round(this.idleAnimation.FrameHeight - height);
            this.localBounds = new Rectangle(left, top, width, height);
            this.killedSound = <HTMLAudioElement>document.getElementById("PlayerKilled");
            this.jumpSound = <HTMLAudioElement>document.getElementById("PlayerJump");
            this.fallSound = <HTMLAudioElement>document.getElementById("PlayerFall");
        }

        public Reset(position: Vector2): void {
            this.Position = position;
            this.Velocity = Vector2.Zero;
            this.isAlive = true;
            this.sprite = new AnimationPlayer();
            this.sprite.PlayAnimation(this.idleAnimation);
        }

        public Update(gameTime: GameTime): void {
            this.GetInput();
            this.ApplyPhysics(gameTime);
            if (this.IsAlive && this.IsOnGround) {
                if (Math.abs(this.Velocity.X) - 0.02 > 0) {
                    this.sprite.PlayAnimation(this.runAnimation);
                }
                else {
                    this.sprite.PlayAnimation(this.idleAnimation);
                }
            }
            this.movement = 0.0;
            this.isJumping = false;
        }

        private GetInput(): void {
            if (Math.abs(this.movement) < 0.5)
                this.movement = 0.0;
            if (this.m_ctrl.left) {
                this.movement = -1.0;
            }
            if (this.m_ctrl.right) {
                this.movement = 1.0;
            }
            this.isJumping = this.m_ctrl.lcontrolPressed;
            if (this.isJumping) {
                var stopHere = true;
            }
        }

        public ApplyPhysics(gameTime: GameTime): void {
            var elapsed: number = <number>gameTime.ElapsedGameTime.TotalSeconds;
            var previousPosition: Vector2 = new Vector2(this.Position.X, this.Position.Y);
            this.velocity.X += this.movement * Player.MoveAcceleration * elapsed;
            this.velocity.Y = MathHelper.Clamp((this.velocity.Y + Player.GravityAcceleration * elapsed), -Player.MaxFallSpeed, Player.MaxFallSpeed);
            this.velocity.Y = this.DoJump(this.velocity.Y, gameTime);
            if (this.IsOnGround) {
                this.velocity.X *= Player.GroundDragFactor;
            }
            else {
                this.velocity.X *= Player.AirDragFactor;
            }
            this.velocity.X = MathHelper.Clamp(this.velocity.X, -Player.MaxMoveSpeed, Player.MaxMoveSpeed);
            this.Position.X += this.velocity.X * elapsed;
            this.Position.Y += this.velocity.Y * elapsed;
            this.Position = new Vector2(<number>Math.round(this.Position.X), <number>Math.round(this.Position.Y));
            this.HandleCollisions();
            if (this.Position.X == previousPosition.X)
                this.velocity.X = 0;
            if (this.Position.Y == previousPosition.Y)
                this.velocity.Y = 0;
        }

        private DoJump(velocityY: number, gameTime: GameTime): number {
            if (this.isJumping) {
                if ((!this.wasJumping && this.IsOnGround) || this.jumpTime > 0.0) {
                    if (this.jumpTime == 0.0) {
                        this.jumpSound.play();
                    }
                    this.jumpTime += <number>gameTime.ElapsedGameTime.TotalSeconds;
                    this.sprite.PlayAnimation(this.jumpAnimation);
                }
                if (0.0 < this.jumpTime && this.jumpTime <= Player.MaxJumpTime) {
                    velocityY = Player.JumpLaunchVelocity * (1.0 - <number>Math.pow(this.jumpTime / Player.MaxJumpTime, Player.JumpControlPower));
                }
                else {
                    this.jumpTime = 0.0;
                }
            }
            else {
                this.jumpTime = 0.0;
            }
            this.wasJumping = this.isJumping;
            return velocityY;
        }
        private HandleCollisions(): void {
            var bounds: Rectangle = this.BoundingRectangle;
            var leftTile: number = <number>Math.floor(<number>bounds.Left / Tile.Width);
            var rightTile: number = <number>Math.ceil((<number>bounds.Right / Tile.Width)) - 1;
            var topTile: number = <number>Math.floor(<number>bounds.Top / Tile.Height);
            var bottomTile: number = <number>Math.ceil((<number>bounds.Bottom / Tile.Height)) - 1;
            this.isOnGround = false;
            for (var y: number = topTile; y <= bottomTile; ++y) {
                for (var x: number = leftTile; x <= rightTile; ++x) {
                    var collision: TileCollision = this.Level.GetCollision(x, y);
                    if (collision != TileCollision.Passable) {
                        var tileBounds: Rectangle = this.Level.GetBounds(x, y);
                        var depth: Vector2 = RectangleExtensions.GetIntersectionDepth(bounds, tileBounds);
                        if (depth != Vector2.Zero) {
                            var absDepthX: number = Math.abs(depth.X);
                            var absDepthY: number = Math.abs(depth.Y);
                            if (absDepthY < absDepthX || collision == TileCollision.Platform) {
                                if (this.previousBottom <= tileBounds.Top)
                                    this.isOnGround = true;
                                if (collision == TileCollision.Impassable || this.IsOnGround) {
                                    this.Position = new Vector2(this.Position.X, this.Position.Y + depth.Y);
                                    bounds = this.BoundingRectangle;
                                }
                            }
                            else if (collision == TileCollision.Impassable) {
                                this.Position = new Vector2(this.Position.X + depth.X, this.Position.Y);
                                bounds = this.BoundingRectangle;
                            }
                        }
                    }
                }
            }
            this.previousBottom = bounds.Bottom;
        }

        public OnKilled(killedBy: Enemy): void {
            this.isAlive = false;
            if (killedBy != null) {
                this.killedSound.play();
            }
            else {
                this.fallSound.play();
            }
            this.sprite.PlayAnimation(this.dieAnimation);
        }

        public OnReachedExit(): void {
            this.sprite.PlayAnimation(this.celebrateAnimation);
        }

        public Draw(gameTime: GameTime, spriteBatch): void {
            if (this.Velocity.X > 0) {
                this.flip = SpriteEffects.FlipHorizontally;
            }
            else if (this.Velocity.X < 0) {
                this.flip = SpriteEffects.None;
            }
            this.sprite.Draw(gameTime, spriteBatch, this.Position, this.flip);
        }
    }
}