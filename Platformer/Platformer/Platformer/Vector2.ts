class Vector2 {

    static Zero: any = new Vector2(0, 0);
    private m_x: number;
    private m_y: number;

    constructor(x: number, y: number) {
        this.m_x = x;
        this.m_y = y;
    }

    public get X(): number {
        return this.m_x;
    }

    public set X(value:number) {
        this.m_x = value;
    }

    public get Y(): number {
        return this.m_y;
    }

    public set Y(value: number) {
        this.m_y = value;
    }

    public get Zero(): Vector2 {
        return new Vector2(0, 0);
    }

    public LengthSquared(): number {
        return (this.m_x * this.m_x) + (this.m_y * this.m_y);
    }
}