export class Animation {

    private texture: HTMLImageElement;
    private textureCopy: HTMLImageElement;
    private frameTime: number;
    private isLooping: boolean;

    constructor(texture: HTMLImageElement, frameTime: number, isLooping: boolean) {
        this.texture = texture;
        this.textureCopy = this.FlipImage(texture);
        this.frameTime = frameTime;
        this.isLooping = isLooping;
    }

    private FlipImage(image: any) {
        let canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        let context = canvas.getContext("2d");
        context.save();
        context.scale(-1, 1);
        context.drawImage(image, 0, 0, image.width * -1, image.height);
        context.restore();
        let newImage = new Image();
        newImage.src = canvas.toDataURL("image/png");
        return newImage;
    }

    public get Texture(): HTMLImageElement {
        return this.texture;
    }

    public get TextureCopy(): HTMLImageElement {
        return this.textureCopy;
    }

    public get FrameTime(): number {
        return this.frameTime;
    }

    public get IsLooping(): boolean {
        return this.isLooping;
    }

    public get FrameCount(): number {
        return this.Texture.width / this.FrameWidth;
    }

    public get FrameWidth(): number {
        return this.Texture.height;
    }

    public get FrameHeight(): number {
        return this.Texture.height;
    }
}
