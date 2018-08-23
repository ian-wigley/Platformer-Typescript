module Platformer1 {
    export class Circle {
        public Center: Vector2;
        public Radius: number;

        constructor(position: Vector2, radius: number) {
            this.Center = position;
            this.Radius = radius;
        }

        public Intersects(rectangle: Rectangle): boolean {
            var v: Vector2 = new Vector2(MathHelper.Clamp(this.Center.X, rectangle.Left, rectangle.Right), MathHelper.Clamp(this.Center.Y, rectangle.Top, rectangle.Bottom));
            var direction: Vector2 = new Vector2(this.Center.X - v.X, this.Center.Y - v.Y);
            var distanceSquared: number = direction.LengthSquared();
            return ((distanceSquared > 0) && (distanceSquared < this.Radius * this.Radius));
        }
    }
}