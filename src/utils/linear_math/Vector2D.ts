export class Vector2D {

	public x: number;
	public y: number;

	constructor(x: number|number[] = 0.0, y: number = 0.0) {
		if (Array.isArray(x)) {
			this.x = x[0];
			this.y = x[1];
		} else {
			this.x = x;
			this.y = y;
		}
	}

	public add(v: Vector2D): Vector2D {
		return new Vector2D(this.x + v.x, this.y + v.y);
	}

	public divide(n: number): Vector2D {
		return new Vector2D(this.x / n, this.y / n);
	}

	get length(): number {
		return Math.sqrt(this.length2);
	}

	set length(value: number) {
		const tmp: Vector2D = this.normalize().multiply(value);
		this.x = tmp.x;
		this.y = tmp.y;
	}

	get length2(): number {
		return this.x * this.x + this.y * this.y;
	}

	public multiply(n: number): Vector2D {
		return new Vector2D(this.x * n, this.y * n);
	}

	public negate(): Vector2D {
		return new Vector2D(-this.x, -this.y);
	}

	public normalize(): Vector2D {
		return this.divide(this.length || 1.0);
	}

	public rotate90CCW(): Vector2D {
		return new Vector2D(this.y, -this.x);
	}

	public subtract(v: Vector2D): Vector2D {
		return new Vector2D(this.x - v.x, this.y - v.y);
	}

	public toArray(): number[] {
		return [this.x, this.y];
	}

}