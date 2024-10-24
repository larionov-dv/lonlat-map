import {Spherical} from "./Spherical";
import {Matrix} from "./Matrix";

export class Vector {

	public x: number;	// right (0°N 0°E; the intersection of the prime meridian and the equator)
	public y: number;	// up (90°N 0°E; up through the North Pole)
	public z: number;	// forward (0°N 90°E)

	constructor(x: number|Spherical = 0.0, y: number = 0.0, z: number = 0.0) {
		if (x instanceof Spherical) {
			const cosTheta: number = Math.cos(x.theta);
			this.x = Math.cos(x.phi) * cosTheta;
			this.y = Math.sin(x.theta);
			this.z = Math.sin(x.phi) * cosTheta;
		} else {
			this.x = x;
			this.y = y;
			this.z = z;
		}
	}

	public angleBetween(v: Vector): number {
		const denominator: number = Math.sqrt(this.length2 * v.length2);
		if (denominator === 0.0) return Math.PI * 0.5;
		return Math.acos(this.dot(v) / denominator);
	}

	public copy(): Vector {
		return new Vector(this.x, this.y, this.z);
	}

	public cross(v: Vector): Vector {
		const
			ax: number = this.x, ay: number = this.y, az: number = this.z,
			bx: number = v.x, by: number = v.y, bz: number = v.z;
		return new Vector(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
	}

	public divide(n: number): Vector {
		return this.multiply(1.0 / n);
	}

	public dot(v: Vector): number {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}

	public get length(): number {
		return Math.sqrt(this.length2);
	}

	public set length(value: number) {
		this.normalizeItself();
		this.multiplyItself(value);
	}

	public get length2(): number {
		return this.dot(this);
	}

	public multiply(m: Matrix|number): Vector {
		if (m instanceof Matrix) {
			const
				x: number = this.x,
				y: number = this.y,
				z: number = this.z,
				e: number[] = m.elements,
				w: number = 1.0 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
			return new Vector(
				(e[0] * x + e[4] * y + e[8] * z + e[12]) * w,
				(e[1] * x + e[5] * y + e[9] * z + e[13]) * w,
				(e[2] * x + e[6] * y + e[10] * z + e[14]) * w
			);
		} else {
			return new Vector(this.x * m, this.y * m, this.z * m);
		}
	}

	private multiplyItself(n: number): void {
		this.x *= n;
		this.y *= n;
		this.z *= n;
	}

	public negate(): Vector {
		return new Vector(-this.x, -this.y, -this.z);
	}

	private normalizeItself(): void {
		const length = this.length;
		if (length !== 0.0) {
			this.multiplyItself(1.0 / length);
		}
	}

	public normalize(): Vector {
		const length = this.length;
		return length === 0.0 ? this.copy() : this.divide(length);
	}

	public toSpherical(): Spherical {
		return new Spherical(Math.atan2(this.z, this.x), Math.asin(this.y));
	}

}