class SpriteBatch {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    public get Canvas(): HTMLCanvasElement {
        return this.canvas;
    }

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
    }

    public Draw(texture: HTMLImageElement, sourceX: number, sourceY: number, sourceW?: number, sourceH?: number, canvasOffsetX?: number, canvasOffsetY?: number, canvasImageWidth?: number, canvasImageHeight?: number) {

        if (!sourceW) {
            this.ctx.drawImage(texture, sourceX, sourceY);
        }
        else {
            this.ctx.drawImage(texture, sourceX, sourceY, sourceW, sourceH, canvasOffsetX, canvasOffsetY, canvasImageWidth, canvasImageHeight);
        }
    }

    public DrawString(font, value, position, color) {
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.fillText(value, position.X, position.Y);
    }
}