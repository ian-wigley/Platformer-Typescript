class GameClock {
    private baseRealTime: number = 0;
    private lastRealTime: number = 0;
    private lastRealTimeValid: boolean = false;
    private suspendCount: number = 0;
    private suspendStartTime: number = 0;
    private timeLostToSuspension: number = 0;
    private lastRealTimeCandidate: number = 0;
    private currentTimeOffset: TimeSpan = new TimeSpan(0);
    private currentTimeBase: TimeSpan = new TimeSpan(0);
    private elapsedTime: TimeSpan = new TimeSpan(0);
    private elapsedAdjustedTime: TimeSpan = new TimeSpan(0);

    public get CurrentTime(): TimeSpan {
        return this.currentTimeBase.Add(this.currentTimeOffset);
    }

    public get ElapsedTime(): TimeSpan {
        return this.elapsedTime;
    }

    public get ElapsedAdjustedTime(): TimeSpan {
        return this.elapsedAdjustedTime;
    }

    constructor() {
        this.Reset();
    }

    public Reset(): void {
        this.currentTimeBase.Zero;
        this.currentTimeOffset.Zero;
        this.baseRealTime = GameClock.Counter;
        this.lastRealTimeValid = false;
    }

    public UpdateElapsedTime(): void {
        var counter: number = GameClock.Counter;
        if (!this.lastRealTimeValid) {
            this.lastRealTime = counter;
            this.lastRealTimeValid = true;
        }
        try {
            this.currentTimeOffset = GameClock.CounterToTimeSpan(counter - this.baseRealTime);
        }
        catch (ex1) {
             this.baseRealTime = this.lastRealTime;
            try {
                this.currentTimeOffset = GameClock.CounterToTimeSpan(counter - this.baseRealTime);
            }
            catch (ex2) {
                this.baseRealTime = counter;
                this.currentTimeOffset.Zero;
            }
        }

        try {
            this.elapsedTime = GameClock.CounterToTimeSpan(counter - this.lastRealTime);
        }
        catch (ex) {
            this.elapsedTime.Zero;
        }

        try {
            var num: number = this.lastRealTime + this.timeLostToSuspension;
            this.elapsedAdjustedTime = GameClock.CounterToTimeSpan(counter - num);
        }
        catch (ex) {
            this.elapsedAdjustedTime.Zero;
        }

        this.lastRealTimeCandidate = counter;
    }

    public AdvanceFrameTime(): void {
        this.lastRealTime = this.lastRealTimeCandidate;
        this.timeLostToSuspension = 0;
    }

    public Suspend(): void {
        ++this.suspendCount;
        if (this.suspendCount != 1)
            return
        this.suspendStartTime = GameClock.Counter;
    }

    public Resume(): void {
        --this.suspendCount;
        if (this.suspendCount > 0)
            return
        this.timeLostToSuspension += GameClock.Counter - this.suspendStartTime;
        this.suspendStartTime = 0;
    }

    public static get Counter(): number {
        return Date.now();
    }

    public static get Frequency(): number {
        return 10000000;
    }

    private static CounterToTimeSpan(delta: number): TimeSpan {
        var num: number = 10000000;
        return this.FromTicks((delta * num) / GameClock.Frequency);
    }

    public static FromTicks(value: number): TimeSpan {
        return new TimeSpan(value);
    }
}