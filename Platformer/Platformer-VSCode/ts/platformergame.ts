import { Game } from "../ts_lib/game"
import { GameTime } from "../ts_lib/gametime";
import { SpriteBatch } from "../ts_lib/spritebatch";
import { TimeSpan } from "../ts_lib/timespan";
import { Vector2 } from "../ts_lib/vector2";
import { Level } from "./level";


namespace Platformer1 {

    export enum Color {
        Black= "#000000",
        CornflowerBlue = "#6495ED",
        Red = "#FF0000",
        White = "#FFFFFF",
        Yellow = "#FFF000"
    }

    export class PlatformerGame extends Game {
        private graphics;
        protected spriteBatch: SpriteBatch;
        private hudFont = "14px Arial";
        private winOverlay: HTMLImageElement;
        private loseOverlay: HTMLImageElement;
        private diedOverlay: HTMLImageElement;
        private levelIndex: number = -1;
        private level: Level;
        private wasContinuePressed: boolean = false;
        private WarningTime: TimeSpan = new TimeSpan(0);
        private TargetFrameRate: number = 60;
        private BackBufferWidth: number = 1280;
        private BackBufferHeight: number = 720;

        private m_ctrl: Controls = new Controls();
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
            this.AddHitListener(this.spriteBatch.Canvas);

            this.winOverlay = <HTMLImageElement>document.getElementById("overlayWin");
            this.loseOverlay = <HTMLImageElement>document.getElementById("overlayLose");
            this.diedOverlay = <HTMLImageElement>document.getElementById("overlayDied");
            var music: HTMLAudioElement = <HTMLAudioElement>document.getElementById("Music");
            music.play();
            this.LoadNextLevel();
        }

        private AddHitListener(element: HTMLElement): void {
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

        private onKeyboardPress(event: Event, touchDevice: boolean) {
            switch (((<number>(<KeyboardEvent>event).keyCode | 0))) {
                case 17:
                    this.m_ctrl.lcontrolPressed = true;
                    break;
                case 37:
                    this.m_ctrl.left = true;
                    break;
                case 38:
                    this.m_ctrl.up = true;
                    break;
                case 39:
                    this.m_ctrl.right = true;
                    break;
                case 40:
                    this.m_ctrl.down = true;
                    break;
                case 13:
                    this.m_ctrl.enterPressed = true;
                    this.m_ctrl.returnPressed = true;
                    break;
                case 32:
                    this.m_ctrl.spacePressed = true;
                    break;
            }
        }

        private onKeyboardRelease(event: Event, touchDevice: boolean) {
            switch (((<number>(<KeyboardEvent>event).keyCode | 0))) {
                case 17:
                    this.m_ctrl.lcontrolPressed = false;
                    break;
                case 37:
                    this.m_ctrl.left = false;
                    break;
                case 38:
                    this.m_ctrl.up = false;
                    break;
                case 39:
                    this.m_ctrl.right = false;
                    break;
                case 40:
                    this.m_ctrl.down = false;
                    break;
                case 13:
                    this.m_ctrl.enterPressed = false;
                    this.m_ctrl.returnPressed = false;
                    break;
                case 32:
                    this.m_ctrl.spacePressed = false;
                    break;
            }
        }

        private HandleInput(): void {
            var continuePressed: boolean = this.m_ctrl.spacePressed;
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
            var levelPath: string;
            this.levelIndex = (this.levelIndex + 1) % 3;
            levelPath = "Content/images/Levels/" + this.levelIndex + ".txt";
            if (this.level) {
                var tempScore = this.level.Score;
            }
            this.level = new Level(null, levelPath, this.m_ctrl, tempScore);
        }

        private ReloadCurrentLevel(): void {
            --this.levelIndex;
            this.LoadNextLevel();
        }

        public Run(gameTime): void {
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
            var hudLocation: Vector2 = new Vector2(0, 20);
            var center: Vector2 = new Vector2(this.spriteBatch.Canvas.width / 2, this.spriteBatch.Canvas.height / 2);
            var currentTime = this.level.TimeRemaining.Minutes.toString();
            if (this.level.TimeRemaining.Minutes > 0) {
                var split = currentTime.split(".");
                var min = split[0];
                var tempSeconds = split[1];
                var sec = tempSeconds.substr(0, 2);
            }
            var timeString: string = "TIME: 0" + min + ":" + sec;
            var timeColor: Color;
            if (this.level.TimeRemaining.MoreThan(this.WarningTime.Ticks) || this.level.ReachedExit || <number>this.level.TimeRemaining.TotalSeconds % 2 == 0) {
                timeColor = Color.Yellow;
            }
            else {
                timeColor = Color.Red;
            }
            this.DrawShadowedString(this.hudFont, timeString, hudLocation, timeColor);
            var timeHeight: number = 40;
            this.DrawShadowedString(this.hudFont, "SCORE: " +  this.level.Score, new Vector2(0.0, timeHeight * 1.2), Color.Yellow);
            var status: HTMLImageElement = null;
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

        private DrawShadowedString(font, value: string, position: Vector2, color: Color): void {
            this.spriteBatch.DrawString(font, value, new Vector2(position.X + 1, position.Y + 1), Color.Black);
            this.spriteBatch.DrawString(font, value, position, color);
        }
    }
}