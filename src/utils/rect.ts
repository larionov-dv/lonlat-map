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

	// increases the rectangle so that all its dimensions become integers
	inflateToTheNearestIntegers() {
		this.left = Math.floor(this.left);
		this.top = Math.ceil(this.top);
		this.right = Math.ceil(this.right);
		this.bottom = Math.floor(this.bottom);
	}

	multiply(n: number) {
		this.left *= n;
		this.top *= n;
		this.right *= n;
		this.bottom *= n;
	}

	get width(): number {
		return Math.abs(this.right - this.left);
	}

	get height(): number {
		return Math.abs(this.top - this.bottom);
	}

}