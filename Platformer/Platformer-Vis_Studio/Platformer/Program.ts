module Platformer1 {
    export class Program {

        constructor() {
            var game: PlatformerGame = new PlatformerGame();
            var gameTime = game.Gametime;
            game.RunGame(true);
            setInterval(() => game.Tick(), 13);
        }
    }
}

window.onload = () => {
    var main = new Platformer1.Program();
}