export class Rect {

	public left: number;
	public top: number;
	public right: number;
	public bottom: number;

	constructor(left: number = 0.0, top: number = 0.0, right: number = 0.0, bottom: number = 0) {
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
	}

	clone(): Rect {
		return new Rect(this.left, this.top, this.right, this.bottom);
	}

	divide(n: number): Rect {
		return new Rect(this.left / n, this.top / n, this.right / n, this.bottom / n);
	}

	extend(x: number, y: number) {
		if (x < this.left) {
			this.left = x;
		}
		if (x > this.right) {
			this.right = x;
		}
		if (y > this.top) {
			this.top = y;
		}
		if (y < this.bottom) {
			this.bottom = y;
		}
	}

	// increases the rectangle so that all its dimensions become integers
	inflateToTheNearestIntegers() {
		this.left = Math.floor(this.left);
		this.top = Math.ceil(this.top);
		this.right = Math.ceil(this.right);
		this.bottom = Math.floor(this.bottom);
	}

	intersects(r: Rect): boolean {
		const r1: Rect = this.normalize(), r2: Rect = r.normalize();
		return !(r1.left > r2.right || r1.right < r2.left || r1.top > r2.bottom || r1.bottom < r2.top);
	}

	multiply(n: number) {
		this.left *= n;
		this.top *= n;
		this.right *= n;
		this.bottom *= n;
	}

	normalize(): Rect {
		let minX, maxX, minY, maxY: number;
		if (this.left < this.right) {
			minX = this.left;
			maxX = this.right;
		} else {
			minX = this.right;
			maxX = this.left;
		}
		if (this.bottom < this.top) {
			minY = this.bottom;
			maxY = this.top;
		} else {
			minY = this.top;
			maxY = this.bottom;
		}
		return new Rect(minX, minY, maxX, maxY);
	}

	offset(dx: number, dy: number): Rect {
		return new Rect(this.left + dx, this.top + dy, this.right + dx, this.bottom + dy);
	}

	setZeroSize(x: number, y: number) {
		this.left = x;
		this.top = y;
		this.right = x;
		this.bottom = y;
	}

	get width(): number {
		return Math.abs(this.right - this.left);
	}

	get height(): number {
		return Math.abs(this.top - this.bottom);
	}

}