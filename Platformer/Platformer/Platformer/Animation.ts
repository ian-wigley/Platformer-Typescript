module Platformer1 {
    export class Animation {

        public get Texture(): HTMLImageElement {
            return this.texture;
        }
        private texture: HTMLImageElement;

        public get TextureCopy(): HTMLImageElement {
            return this.textureCopy;
        }
        private textureCopy: HTMLImageElement;

        public get FrameTime(): number {
            return this.frameTime;
        }
        private frameTime: number;

        public get IsLooping(): boolean {
            return this.isLooping;
        }
        private isLooping: boolean;

        public get FrameCount(): number {
            return this.Texture.width / this.FrameWidth;
        }

        public get FrameWidth(): number {
            return this.Texture.height;
        }

        public get FrameHeight(): number {
            return this.Texture.height;
        }

        constructor(texture: HTMLImageElement, frameTime: number, isLooping: boolean) {
            this.texture = texture;
            this.textureCopy = this.FlipImage(texture);
            this.frameTime = frameTime;
            this.isLooping = isLooping;
        }

        private FlipImage(image) {
            var canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            var context = canvas.getContext("2d");
            context.save();
            context.scale(-1, 1);
            context.drawImage(image, 0, 0, image.width * -1, image.height);
            context.restore();
            var newImage = new Image();
            newImage.src = canvas.toDataURL("image/png");
            return newImage;
        }
    }
}