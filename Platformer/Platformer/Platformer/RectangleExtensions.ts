module Platformer1 {
    export class RectangleExtensions {

        public static GetIntersectionDepth(rectA: Rectangle, rectB: Rectangle): Vector2 {
            var halfWidthA: number = rectA.Width / 2.0;
            var halfHeightA: number = rectA.Height / 2.0;
            var halfWidthB: number = rectB.Width / 2.0;
            var halfHeightB: number = rectB.Height / 2.0;
            var centerA: Vector2 = new Vector2(rectA.Left + halfWidthA, rectA.Top + halfHeightA);
            var centerB: Vector2 = new Vector2(rectB.Left + halfWidthB, rectB.Top + halfHeightB);
            var distanceX: number = centerA.X - centerB.X;
            var distanceY: number = centerA.Y - centerB.Y;
            var minDistanceX: number = halfWidthA + halfWidthB;
            var minDistanceY: number = halfHeightA + halfHeightB;
            if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) >= minDistanceY)
                return Vector2.Zero;
            var depthX: number = distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
            var depthY: number = distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;
            return new Vector2(depthX, depthY);
        }

        public static GetBottomCenter(rect: Rectangle): Vector2 {
            return new Vector2(rect.X + rect.Width / 2.0, rect.Bottom);
        }
    }
}