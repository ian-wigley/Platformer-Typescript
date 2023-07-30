module Platformer1 {
    export class AnimationPlayer {
        public get Animation(): Animation {
            return this.animation;
        }

        animation: Animation;
        public get FrameIndex(): number {
            return this.frameIndex;
        }

        frameIndex: number;
        private time: number;
        public get Origin(): Vector2 {
            return new Vector2(this.Animation.FrameWidth / 2.0, this.Animation.FrameHeight);
        }

        public PlayAnimation(animation: Animation): void {
            if (this.Animation == animation)
                return
            this.animation = animation;
            this.frameIndex = 0;
            this.time = 0.0;
        }

        public Draw(gameTime: GameTime, spriteBatch: SpriteBatch, position: Vector2, spriteEffects): void {
            if (this.Animation == null) {
                console.log("No animation is currently playing.");
            }
            this.time += <number>gameTime.ElapsedGameTime.TotalSeconds;
            while (this.time > this.Animation.FrameTime) {
                this.time -= this.Animation.FrameTime;
                if (this.Animation.IsLooping) {
                    this.frameIndex = (this.frameIndex + 1) % this.Animation.FrameCount;
                }
                else {
                    this.frameIndex = Math.min(this.frameIndex + 1, this.Animation.FrameCount - 1);
                }
            }
            var source: Rectangle = new Rectangle(this.FrameIndex * this.Animation.Texture.height, 0, this.Animation.Texture.height, this.Animation.Texture.height);
            if (spriteEffects) {
                spriteBatch.Draw(this.Animation.TextureCopy, source.X, source.Y, source.Width, source.Height, position.X - this.Origin.X, position.Y - this.Origin.Y, 96, 96);
            }
            else {
                spriteBatch.Draw(this.Animation.Texture, source.X, source.Y, source.Width, source.Height, position.X - this.Origin.X, position.Y - this.Origin.Y, 96, 96);
            }
        }
    }
}