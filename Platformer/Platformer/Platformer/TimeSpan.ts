class TimeSpan {

    private TicksPerMillisecond: number = 10000;
    private MillisecondsPerTick: number = 1.0 / this.TicksPerMillisecond;
    private ticksPerSecond: number = this.TicksPerMillisecond * 1000;
    private SecondsPerTick: number = 1.0 / this.ticksPerSecond;
    private TicksPerMinute: number = this.ticksPerSecond * 60;
    private MinutesPerTick: number = 1.0 / this.TicksPerMinute;
    private TicksPerHour: number = this.TicksPerMinute * 60;
    private HoursPerTick: number = 1.0 / this.TicksPerHour;
    private TicksPerDay: number = this.TicksPerHour * 24;
    private DaysPerTick: number = 1.0 / this.TicksPerDay;
    private MillisPerSecond: number = 1000;
    private MillisPerMinute: number = this.MillisPerSecond * 60;
    private MillisPerHour: number = this.MillisPerMinute * 60;
    private MillisPerDay: number = this.MillisPerHour * 24;

    private MaxValue_Int64: number = 9223372036854775807;
    private MinValue_Int64: number = -9223372036854775808;

    private MaxSeconds: number = this.MaxValue_Int64 / this.ticksPerSecond;
    private MinSeconds: number = this.MinValue_Int64 / this.ticksPerSecond;
    private MaxMilliSeconds: number = this.MaxValue_Int64 / this.TicksPerMillisecond;
    private MinMilliSeconds: number = this.MinValue_Int64 / this.TicksPerMillisecond;
    private TicksPerTenthSecond: number = this.TicksPerMillisecond * 100;
    private MaxValue: TimeSpan;
    private MinValue: TimeSpan;
    private _ticks: number = 0;

    constructor(ticks: number) {
        this._ticks = ticks;
    }

    public get Zero(): TimeSpan {
        return new TimeSpan(0);
    }

    public get Ticks(): number {
        return this._ticks;
    }

    public set Ticks(value: number) {
        this._ticks = value;
    }

    public get TicksPerSecond(): number {
        return this.ticksPerSecond;
    }

    public get Days(): number {
        return <number>(this._ticks / this.TicksPerDay);
    }

    public get Hours(): number {
        return <number>((this._ticks / this.TicksPerHour) % 24);
    }

    public get Milliseconds(): number {
        return <number>((this._ticks / this.TicksPerMillisecond) % 1000);
    }

    public get Minutes(): number {
        return <number>((this._ticks / this.TicksPerMinute) % 60);
    }

    public get Seconds(): number {
        return <number>((this._ticks / this.TicksPerSecond) % 60);
    }

    public get TotalDays(): number {
        return (<number>this._ticks) * this.DaysPerTick;
    }

    public get TotalHours(): number {
        return <number>this._ticks * this.HoursPerTick;
    }

    public get TotalMilliseconds(): number {
        var temp: number = <number>this._ticks * this.MillisecondsPerTick;
        if (temp > this.MaxMilliSeconds)
            return <number>this.MaxMilliSeconds;
        if (temp < this.MinMilliSeconds)
            return <number>this.MinMilliSeconds;
        return temp;
    }

    public get TotalMinutes(): number {
        return <number>this._ticks * this.MinutesPerTick;
    }

    public get TotalSeconds(): number {
        return <number>this._ticks * this.SecondsPerTick;
    }
    public Add(ts: TimeSpan): TimeSpan {
        var result: number = this._ticks + ts.Ticks;
        if ((this._ticks >> 63 == ts.Ticks >> 63) && (this._ticks >> 63 != result >> 63)) {
            console.log("Overflow_TimeSpanTooLong");
        }
        this._ticks = result;
        return new TimeSpan(result);
    }

    public Subtract(ts: TimeSpan): TimeSpan {
        var ticks: number = this._ticks - ts.Ticks;
        if (this._ticks >> 63 != ts.Ticks >> 63 && this._ticks >> 63 != ticks >> 63) {
            console.log("Overflow_TimeSpanTooLong");
        }
        return new TimeSpan(ticks);
    }

    public LessThan(ts: number): boolean {
        if (this._ticks < ts) {
            return true;
        }
        return false;
    }

    public MoreThan(ts: number): boolean {
        if (this._ticks > ts) {
            return true;
        }
        return false;
    }

    public EqualTo(ts: number): boolean {
        if (this._ticks == ts) {
            return true;
        }
        return false;
    }

    public Compare(t1: TimeSpan, t2: TimeSpan): number {
        if (t1._ticks > t2._ticks)
            return 1;
        if (t1._ticks < t2._ticks)
            return -1;
        return 0;
    }

    public CompareTo(value: Object): number {
        if (value == null)
            return 1;
        if (!(value instanceof TimeSpan)) {
            console.log("Arg_MustBeTimeSpan");
        }
        var t: number = (<TimeSpan>value)._ticks;
        if (this._ticks > t) {
            return 1;
        }
        if (this._ticks < t) {
            return -1;
        }
        return 0;
    }

    public FromMinutes(value: number): TimeSpan {
        return this.Interval(value, 60000);
    }

    public FromSeconds(value: number): TimeSpan {
        return this.Interval(value, this.MillisPerSecond);
    }

    private Interval(value: number, scale: number): TimeSpan {
        var tmp: number = value * scale;
        var millis: number = Math.floor((tmp + (value >= 0 ? 0.5 : -0.5)));
        if ((millis > this.MaxValue_Int64 / this.TicksPerMillisecond) || (millis < this.MinValue_Int64 / this.TicksPerMillisecond)) {
            console.log("Overflow_TimeSpanTooLong");
        }
        return new TimeSpan(<number>millis * this.TicksPerMillisecond);
    }

    public SetTicks(value: number): void {
        this._ticks = value;
    }

    public FromTicks(value: number): TimeSpan {
        return new TimeSpan(value);
    }

    public FromMilliseconds(value: number): TimeSpan {
        return this.Interval(value, 1);
    }
}