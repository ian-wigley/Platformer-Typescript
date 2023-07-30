module Platformer1 {
    export class Level {
        private tiles: Tile[][];
        private layers: HTMLImageElement[];
        private static EntityLayer: number = 2;

        public get Player(): Player {
            return this.player;
        }

        private m_ctrl: Controls;

        private player: Player;
        private gems = [];
        private enemies = [];
        private start: Vector2;
        private exit: Point = Level.InvalidPosition;
        private static InvalidPosition: Point = new Point(-1, -1);
        private loaded: boolean = false;

        public get Score(): number {
            return this.score;
        }
        private score: number = 0;

        public get ReachedExit(): boolean {
            return this.reachedExit;
        }
        private reachedExit: boolean;

        public get TimeRemaining(): TimeSpan {
            return this.timeRemaining;
        }
        private timeRemaining: TimeSpan = new TimeSpan(0);

        private static PointsPerSecond: number = 5;

        public get Content() {
            return this.content;
        }
        private content;

        private exitReachedSound: HTMLAudioElement;

        constructor(serviceProvider, path: string, ctrl: Controls, score?:number) {
            this.timeRemaining = this.timeRemaining.FromMinutes(2.0);
            this.m_ctrl = ctrl;
            if (score) {
                this.score = score;
            }
            this.loaded = false;
            this.LoadTiles(path);
            this.layers = new Array(3);
            for (var i: number = 0; i < this.layers.length; ++i) {
                var segmentIndex: number = Math.floor(Math.random() * 3);
                this.layers[i] = <HTMLImageElement>document.getElementById("Layer" + i + "_" + segmentIndex);
            }
            this.exitReachedSound = <HTMLAudioElement>document.getElementById("ExitReached");
        }

        private LoadTiles(path: string): void {
            var width: number = 5;
            var lines = [];
            var levelBytes;
            var _this = this;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', path, true);
            xhr.responseType = 'text';

            xhr.onload = function (e) {
                levelBytes = this.response;
            };
            xhr.onloadend = function () {
                _this.loaded = true;
                var line = levelBytes.split("\r\n");
                width = line[0].length;
                lines.push(line);
                _this.tiles = [];
                for (var y: number = 0; y < _this.Width; ++y) {
                    _this.tiles.push(new Array(15))
                }
                var length = line[0].length
                for (var y: number = 0; y < _this.Height; ++y) {
                    for (var x: number = 0; x < _this.Width; ++x) {
                        var tileType: string = line[y][x];
                        _this.tiles[x][y] = _this.LoadTile(tileType, x, y);
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
            var index: number = Math.floor(Math.random() * variationCount);
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
            var position: Vector2 = RectangleExtensions.GetBottomCenter(this.GetBounds(x, y));
            this.enemies.push(new Enemy(this, position, spriteSet));
            return new Tile(null, TileCollision.Passable);
        }

        private LoadGemTile(x: number, y: number): Tile {
            var position: Point = this.GetBounds(x, y).Center;
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
                var seconds: number = <number>Math.round(gameTime.ElapsedGameTime.TotalSeconds * 100.0);
                seconds = Math.min(seconds, <number>Math.ceil(this.TimeRemaining.TotalSeconds));
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
            for (var i: number = 0; i < this.gems.length; ++i) {
                var gem: Gem = this.gems[i];
                gem.Update(gameTime);
                if (gem.BoundingCircle.Intersects(this.Player.BoundingRectangle)) {
                    var temp = [];
                    var count = 0;
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
            var _this = this;
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
                for (var i: number = 0; i <= Level.EntityLayer; ++i) {
                    spriteBatch.Draw(this.layers[i], 0, 0);
                }
                this.DrawTiles(spriteBatch);
                this.gems.forEach(function (gem) { gem.Draw(gameTime, spriteBatch); });

                this.enemies.forEach(function (enemy) { enemy.Draw(gameTime, spriteBatch); });
                for (var i: number = Level.EntityLayer + 1; i < this.layers.length; ++i) {
                    spriteBatch.Draw(this.layers[i], 0, 0);
                }
                this.Player.Draw(gameTime, spriteBatch);
            }
        }

        private DrawTiles(spriteBatch: SpriteBatch): void {
            for (var y: number = 0; y < this.Height; ++y) {
                for (var x: number = 0; x < this.Width; ++x) {
                    var texture: HTMLImageElement = this.tiles[x][y].Texture;
                    if (texture != null) {
                        var position: Vector2 = new Vector2(x * Tile.Size.X, y * Tile.Size.Y);
                        spriteBatch.Draw(texture, position.X, position.Y);
                    }
                }
            }
        }

        public get Loaded(): boolean {
            return this.loaded;
        }
    }
}