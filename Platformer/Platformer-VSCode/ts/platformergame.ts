import { Game } from "../ts_lib/game.js"
import { SpriteBatch } from "../ts_lib/spritebatch.js";
import { Level } from "../ts/level.js"
import { TimeSpan } from "../ts_lib/timespan.js";
import { Vector2 } from "../ts_lib/vector2.js";
import { GameTime } from "../ts_lib/gametime.js";
import { Color } from "../ts_lib/color.js";
import { Controls } from "../ts_lib/controls.js";


export class PlatformerGame extends Game {
    private graphics: any;
    private spriteBatch: SpriteBatch | undefined;
    private hudFont = "14px Arial";
    private winOverlay: HTMLImageElement | undefined;
    private loseOverlay: HTMLImageElement | undefined;
    private diedOverlay: HTMLImageElement | undefined;
    private levelIndex: number = -1;
    private level: Level | undefined;
    private wasContinuePressed: boolean = false;
    private WarningTime: TimeSpan = new TimeSpan(0);
    private TargetFrameRate: number = 60;
    private BackBufferWidth: number = 1280;
    private BackBufferHeight: number = 720;
    private keyPressed: Controls = new Controls();
    private m_gameTime: GameTime;

    public get Gametime(): GameTime {
        return this.m_gameTime;
    }

    constructor() {
        super();
        this.WarningTime.FromSeconds(30);
        // Framerate differs between platforms.
        this.TargetElapsedTime.SetTicks(this.TargetElapsedTime.TicksPerSecond / this.TargetFrameRate);
        this.m_gameTime = new GameTime();
        this.LoadContent();
    }

    protected LoadContent(): void {
        this.spriteBatch = new SpriteBatch();
        this.AddHitListener();

        this.winOverlay = <HTMLImageElement>document.getElementById("overlayWin");
        this.loseOverlay = <HTMLImageElement>document.getElementById("overlayLose");
        this.diedOverlay = <HTMLImageElement>document.getElementById("overlayDied");
        let music: HTMLAudioElement = <HTMLAudioElement>document.getElementById("Music");
        music.play();
        this.LoadNextLevel();
    }

    private AddHitListener(): void {
        window.addEventListener("keydown", (event) => {
            this.onKeyPress(event);
            return null;
        });

        window.addEventListener("keyup", (event) => {
            this.onKeyUp(event);
            return null;
        });
    }

    private onKeyPress(event: KeyboardEvent) {
        event.preventDefault();
        this.onKeyboardPress(event, false);
    }

    private onKeyUp(event: KeyboardEvent) {
        event.preventDefault();
        this.onKeyboardRelease(event, false);
    }

    private onKeyboardPress(event: KeyboardEvent, touchDevice: boolean) {
        switch (event.code) {
            case "ControlLeft":
                this.keyPressed.lcontrolPressed = true;
                break;
            case "ArrowLeft":
                this.keyPressed.left = true;
                break;
            case "ArrowUp":
                this.keyPressed.up = true;
                break;
            case "ArrowRight":
                this.keyPressed.right = true;
                break;
            case "ArrowDown":
                this.keyPressed.down = true;
                break;
            case "Enter":
                this.keyPressed.enterPressed = true;
                this.keyPressed.returnPressed = true;
                break;
            case "Space":
                this.keyPressed.spacePressed = true;
                break;
        }
    }

    private onKeyboardRelease(event: KeyboardEvent, touchDevice: boolean) {
        switch (event.code) {
            case "ControlLeft":
                this.keyPressed.lcontrolPressed = false;
                break;
            case "ArrowLeft":
                this.keyPressed.left = false;
                break;
            case "ArrowUp":
                this.keyPressed.up = false;
                break;
            case "ArrowRight":
                this.keyPressed.right = false;
                break;
            case "ArrowDown":
                this.keyPressed.down = false;
                break;
            case "Enter":
                this.keyPressed.enterPressed = false;
                this.keyPressed.returnPressed = false;
                break;
            case "Space":
                this.keyPressed.spacePressed = false;
                break;
        }
    }

    private HandleInput(): void {
        let continuePressed: boolean = this.keyPressed.spacePressed;
        if (!this.wasContinuePressed && continuePressed) {
            if (!this.level.Player.IsAlive) {
                this.level.StartNewLife();
            }
            else //if (this.level.TimeRemaining == TimeSpan.Zero) {
                if (this.level.ReachedExit) {
                    this.LoadNextLevel();
                }
                else {
                    this.ReloadCurrentLevel();
                }
        }
        //}
        this.wasContinuePressed = continuePressed;
    }

    private LoadNextLevel(): void {
        let levelPath: string;
        this.levelIndex = (this.levelIndex + 1) % 3;
        levelPath = "Content/images/Levels/" + this.levelIndex + ".txt";
        let tempScore: number = 0;
        if (this.level) {
            tempScore = this.level.Score;
        }
        this.level = new Level(null, levelPath, this.keyPressed, tempScore);
    }

    private ReloadCurrentLevel(): void {
        --this.levelIndex;
        this.LoadNextLevel();
    }

    public Run(gameTime: any): void {
        if (this.level.Loaded) {
            this.level.Update(gameTime);
            this.Draw(gameTime);
        }
    }

    protected Update(gameTime: GameTime): void {
        this.HandleInput();
        if (this.level.Loaded) {
            this.level.Update(gameTime);
        }
        super.Update(gameTime);
    }

    protected Draw(gameTime: GameTime): void {
        if (this.level.Loaded) {
            this.level.Draw(gameTime, this.spriteBatch);
            this.DrawHud();
        }
    }

    private DrawHud(): void {
        let hudLocation: Vector2 = new Vector2(0, 20);
        let center: Vector2 = new Vector2(this.spriteBatch.Canvas.width / 2, this.spriteBatch.Canvas.height / 2);
        let currentTime = this.level.TimeRemaining.Minutes.toString();
        let min: string = "";
        let sec: string = "";
        if (this.level.TimeRemaining.Minutes > 0) {
            let split = currentTime.split(".");
            min = split[0];
            let tempSeconds = split[1];
            sec = tempSeconds.substring(0, 2);
        }
        let timeString: string = "TIME: 0" + min + ":" + sec;
        let timeColor: Color;
        if (this.level.TimeRemaining.MoreThan(this.WarningTime.Ticks) || this.level.ReachedExit || this.level.TimeRemaining.TotalSeconds % 2 == 0) {
            timeColor = Color.Yellow;
        }
        else {
            timeColor = Color.Red;
        }
        this.DrawShadowedString(this.hudFont, timeString, hudLocation, timeColor);
        const timeHeight: number = 40;
        this.DrawShadowedString(this.hudFont, "SCORE: " + this.level.Score, new Vector2(0.0, timeHeight * 1.2), Color.Yellow);
        let status: HTMLImageElement = null;
        if (this.level.TimeRemaining.Ticks == 0) {
            if (this.level.ReachedExit) {
                status = this.winOverlay;
            }
            else {
                status = this.loseOverlay;
            }
        }
        else if (!this.level.Player.IsAlive) {
            status = this.diedOverlay;
        }
        if (status != null) {
            let statusSize: Vector2 = new Vector2(status.width, status.height);
            this.spriteBatch.Draw(status, center.X - statusSize.X / 2, center.Y - statusSize.Y / 2);
        }
    }

    private DrawShadowedString(font: any, value: string, position: Vector2, color: Color): void {
        this.spriteBatch.DrawString(font, value, new Vector2(position.X + 1, position.Y + 1), Color.Black);
        this.spriteBatch.DrawString(font, value, position, color);
    }
}

// export enum Color {
//     Black = "#000000",
//     CornflowerBlue = "#6495ED",
//     Red = "#FF0000",
//     White = "#FFFFFF",
//     Yellow = "#FFF000"
// }
