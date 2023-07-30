class GameTime {

    public set TotalGameTime(value: TimeSpan) {
        this.totalGameTime = value;
    }

    public get TotalGameTime(): TimeSpan {
        return this.totalGameTime;
    }

    public set ElapsedGameTime(value: TimeSpan) {
        this.elapsedGameTime = value;
    }

    public get ElapsedGameTime(): TimeSpan {
        return this.elapsedGameTime;
    }

    public set IsRunningSlowly(value: boolean) {
        this.isRunningSlowly = value;
    }

    public get IsRunningSlowly(): boolean {
        return this.isRunningSlowly;
    }

    public totalGameTime: TimeSpan;
    public elapsedGameTime: TimeSpan;
    public isRunningSlowly: boolean;

    constructor() {
        this.totalGameTime = new TimeSpan(0);
        this.ElapsedGameTime = new TimeSpan(0);
        this.IsRunningSlowly = false;
    }
}