import { Rectangle } from "../ts_lib/rectangle.js";
import { Tile, TileCollision } from "../ts/tile.js";
import { Controls } from "../ts_lib/controls.js";
import { GameTime } from "../ts_lib/gametime.js";
import { Point } from "../ts_lib/point.js";
import { RectangleExtensions } from "../ts_lib/rectangleextensions.js";
import { SpriteBatch } from "../ts_lib/spritebatch.js";
import { TimeSpan } from "../ts_lib/timespan.js";
import { Vector2 } from "../ts_lib/vector2.js";
import { Enemy } from "./enemy.js";
import { Gem } from "./gem.js";
import { Player } from "./player.js";

export class Level {
    private tiles: Tile[][];
    private layers: HTMLImageElement[];
    private static EntityLayer: number = 2;
    private score: number = 0;
    private m_ctrl: Controls;
    private reachedExit: boolean;
    private player: Player;
    private gems = [];
    private enemies = [];
    private start: Vector2;
    private static InvalidPosition: Point = new Point(-1, -1);
    private exit: Point = Level.InvalidPosition;
    private loaded: boolean = false;
    private timeRemaining: TimeSpan = new TimeSpan(0);
    private static PointsPerSecond: number = 5;
    private content;
    private exitReachedSound: HTMLAudioElement;

    constructor(serviceProvider, path: string, ctrl: Controls, score?: number) {
        this.timeRemaining = this.timeRemaining.FromMinutes(2.0);
        this.m_ctrl = ctrl;
        if (score) {
            this.score = score;
        }
        this.loaded = false;
        this.LoadTiles(path);
        this.layers = new Array(3);
        for (let i: number = 0; i < this.layers.length; ++i) {
            let segmentIndex: number = Math.floor(Math.random() * 3);
            this.layers[i] = <HTMLImageElement>document.getElementById("Layer" + i + "_" + segmentIndex);
        }
        this.exitReachedSound = <HTMLAudioElement>document.getElementById("ExitReached");
    }

    private LoadTiles(path: string): void {
        // let width: number = 5;
        let lines: any = [];
        let levelBytes: string;
        let _this = this;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.responseType = 'text';

        xhr.onload = function (e) {
            levelBytes = this.response;
        };
        xhr.onloadend = function () {
            _this.loaded = true;
            console.log(navigator.userAgent);
            // let line = levelBytes.split("\r\n");
            let line = levelBytes.split("\n");
            // width = line[0].length;
            lines.push(line);
            _this.tiles = [];
            for (let y: number = 0; y < _this.Width; ++y) {
                _this.tiles.push(new Array(15))
            }
            // let length = line[0].length
            for (let y: number = 0; y < _this.Height; ++y) {
                for (let x: number = 0; x < _this.Width; ++x) {
                    let t = "";
                    // TODO remove
                    try {
                        let tileType: string = line[y][x];
                        t = tileType;
                        _this.tiles[x][y] = _this.LoadTile(tileType, x, y);

                    }
                    catch (err) {
                        console.log(t, y);

                    }

                }
            }
            if (_this.Player == null) {
                console.log("A level must have a starting point.");
            }
            if (_this.exit == Level.InvalidPosition) {
                console.log("A level must have an exit.");
            }
        };
        xhr.send();
    }

    private LoadTile(tileType: string, x: number, y: number): Tile {
        switch (tileType) {
            case '.':
                return new Tile(null, TileCollision.Passable);
            case 'X':
                return this.LoadExitTile(x, y);
            case 'G':
                return this.LoadGemTile(x, y);
            case '-':
                return this.LoadTiler("Platform", TileCollision.Platform);
            case 'A':
                return this.LoadEnemyTile(x, y, "MonsterA");
            case 'B':
                return this.LoadEnemyTile(x, y, "MonsterB");
            case 'C':
                return this.LoadEnemyTile(x, y, "MonsterC");
            case 'D':
                return this.LoadEnemyTile(x, y, "MonsterD");
            case '~':
                return this.LoadVarietyTile("BlockB", 2, TileCollision.Platform);
            case ':':
                return this.LoadVarietyTile("BlockB", 2, TileCollision.Passable);
            case '1':
                return this.LoadStartTile(x, y);
            case '#':
                return this.LoadVarietyTile("BlockA", 7 - 1, TileCollision.Impassable);
            default:
                console.log("Unsupported tile type character '{0}' at position {1}, {2}.", tileType, x, y);
        }
    }

    private LoadTiler(name: string, collision: TileCollision): Tile {
        return new Tile(<HTMLImageElement>document.getElementById(name), collision);
    }

    private LoadVarietyTile(baseName: string, variationCount: number, collision: TileCollision): Tile {
        let index: number = Math.floor(Math.random() * variationCount);
        return this.LoadTiler(baseName + index, collision);
    }

    private LoadStartTile(x: number, y: number): Tile {
        if (this.Player != null) {
            console.log("A level may only have one starting point.");
        }
        this.start = RectangleExtensions.GetBottomCenter(this.GetBounds(x, y));
        this.player = new Player(this, this.start, this.m_ctrl);
        return new Tile(null, TileCollision.Passable);
    }

    private LoadExitTile(x: number, y: number): Tile {
        if (this.exit != Level.InvalidPosition) {
            console.log("A level may only have one exit.");
        }
        this.exit = this.GetBounds(x, y).Center;
        return this.LoadTiler("Exit", TileCollision.Passable);
    }

    private LoadEnemyTile(x: number, y: number, spriteSet: string): Tile {
        let position: Vector2 = RectangleExtensions.GetBottomCenter(this.GetBounds(x, y));
        this.enemies.push(new Enemy(this, position, spriteSet));
        return new Tile(null, TileCollision.Passable);
    }

    private LoadGemTile(x: number, y: number): Tile {

        let temp = this.GetBounds(x, y).Center;

        console.log(temp);

        let position: Point = this.GetBounds(x, y).Center;
        this.gems.push(new Gem(this, new Vector2(position.X, position.Y)));
        return new Tile(null, TileCollision.Passable);
    }

    public GetCollision(x: number, y: number): TileCollision {
        if (x < 0 || x >= this.Width) {
            return TileCollision.Impassable;
        }
        if (y < 0 || y >= this.Height) {
            return TileCollision.Passable;
        }
        return this.tiles[x][y].Collision;
    }

    public GetBounds(x: number, y: number): Rectangle {
        return new Rectangle(x * Tile.Width, y * Tile.Height, Tile.Width, Tile.Height);
    }

    public get Width(): number {
        return 20;
    }

    public get Height(): number {
        return 15;
    }

    public Update(gameTime: GameTime): void {
        if (!this.Player.IsAlive || this.TimeRemaining.Ticks == 0) {
            this.Player.ApplyPhysics(gameTime);
        }
        else if (this.ReachedExit) {
            let seconds: number = Math.round(gameTime.ElapsedGameTime.TotalSeconds * 100.0);
            seconds = Math.min(seconds, Math.ceil(this.TimeRemaining.TotalSeconds));
            this.timeRemaining = this.timeRemaining.Subtract(this.timeRemaining.FromSeconds(seconds));
            this.score += seconds * Level.PointsPerSecond;
        }
        else {
            this.timeRemaining = this.timeRemaining.Subtract(gameTime.ElapsedGameTime);

            this.Player.Update(gameTime);
            this.UpdateGems(gameTime);
            if (this.Player.BoundingRectangle.Top >= this.Height * Tile.Height) {
                this.OnPlayerKilled(null);
            }
            this.UpdateEnemies(gameTime);
            if (this.Player.IsAlive && this.Player.IsOnGround && this.Player.BoundingRectangle.Contains(this.exit)) {
                this.OnExitReached();
            }
        }
        if (this.timeRemaining.LessThan(0)) {
            this.timeRemaining.Ticks = 0;
        }
    }

    private UpdateGems(gameTime: GameTime): void {
        for (let i: number = 0; i < this.gems.length; ++i) {
            let gem: Gem = this.gems[i];
            gem.Update(gameTime);
            if (gem.BoundingCircle.Intersects(this.Player.BoundingRectangle)) {
                let temp = [];
                let count: number = 0;
                this.gems.forEach(element => {
                    if (count++ != i) {
                        temp.push(element);
                    }
                });
                this.gems = temp;
                this.OnGemCollected(gem, this.Player);
            }
        }
    }

    private UpdateEnemies(gameTime: GameTime): void {
        let _this = this;
        this.enemies.forEach(function (enemy) {
            enemy.Update(gameTime);
            if (enemy.BoundingRectangle.Intersects(_this.Player.BoundingRectangle)) {
                _this.OnPlayerKilled(enemy);
            }
        });
    }

    private OnGemCollected(gem: Gem, collectedBy: Player): void {
        this.score += Gem.PointValue;
        gem.OnCollected(collectedBy);
    }

    private OnPlayerKilled(killedBy: Enemy): void {
        this.Player.OnKilled(killedBy);
    }

    private OnExitReached(): void {
        this.Player.OnReachedExit();
        this.exitReachedSound.play();
        this.reachedExit = true;
    }

    public StartNewLife(): void {
        this.Player.Reset(this.start);
    }

    public Draw(gameTime: GameTime, spriteBatch: SpriteBatch): void {
        if (this.loaded) {
            for (let i: number = 0; i <= Level.EntityLayer; ++i) {
                spriteBatch.Draw(this.layers[i], 0, 0);
            }
            this.DrawTiles(spriteBatch);
            this.gems.forEach(function (gem) { gem.Draw(gameTime, spriteBatch); });

            this.enemies.forEach(function (enemy) { enemy.Draw(gameTime, spriteBatch); });
            for (let i: number = Level.EntityLayer + 1; i < this.layers.length; ++i) {
                spriteBatch.Draw(this.layers[i], 0, 0);
            }
            this.Player.Draw(gameTime, spriteBatch);
        }
    }

    private DrawTiles(spriteBatch: SpriteBatch): void {
        for (let y: number = 0; y < this.Height; ++y) {
            for (let x: number = 0; x < this.Width; ++x) {
                let texture: HTMLImageElement = this.tiles[x][y].Texture;
                if (texture != null) {
                    let position: Vector2 = new Vector2(x * Tile.Size.X, y * Tile.Size.Y);
                    spriteBatch.Draw(texture, position.X, position.Y);
                }
            }
        }
    }

    public get Score(): number {
        return this.score;
    }
    public get ReachedExit(): boolean {
        return this.reachedExit;
    }
    public get Player(): Player {
        return this.player;
    }
    public get TimeRemaining(): TimeSpan {
        return this.timeRemaining;
    }
    public get Content() {
        return this.content;
    }
    public get Loaded(): boolean {
        return this.loaded;
    }
}