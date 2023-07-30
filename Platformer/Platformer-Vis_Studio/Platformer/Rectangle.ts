class Rectangle {

    public X: number;
    public Y: number;
    public Width: number;
    public Height: number;

    public static get Empty(): Rectangle {
        return new Rectangle(0, 0, 0, 0);
    }
    public get Left(): number {
        return this.X;
    }
    public get Right(): number {
        return (this.X + this.Width);
    }
    public get Top(): number {
        return this.Y;
    }
    public get Bottom(): number {
        return (this.Y + this.Height);
    }

    constructor(x: number, y: number, width: number, height: number) {
        this.X = x;
        this.Y = y;
        this.Width = width;
        this.Height = height;
    }

    public get Center(): Point {
        return new Point(this.X + (this.Width / 2), this.Y + (this.Height / 2));
    }

    public Contains(value: Point): boolean {
        if (this.X <= value.X && value.X < this.X + this.Width && this.Y <= value.Y) {
            return value.Y < this.Y + this.Height;
        }
        return false;
    }

    public Intersects(value: Rectangle): boolean {
        if (value.X < this.X + this.Width && this.X < value.X + value.Width && value.Y < this.Y + this.Height)
            return this.Y < value.Y + value.Height;
        return false;
    }
}