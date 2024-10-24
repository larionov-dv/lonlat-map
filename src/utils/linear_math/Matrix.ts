export class Matrix {

	public elements: number[];

	constructor(axis?: {x: number, y: number, z: number}, angle?: number) {
		if (axis === undefined || angle === undefined) {
			// identity matrix
			this.elements = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0];
		} else {
			// rotation matrix
			const
				c: number = Math.cos(angle),
				s: number = Math.sin(angle),
				t: number = 1.0 - c,
				x: number = axis.x,
				y: number = axis.y,
				z: number = axis.z,
				tx: number = t * x,
				ty: number = t * y;
			this.elements = [
				tx * x + c, tx * y + s * z, tx * z - s * y, 0.0,
				tx * y - s * z, ty * y + c, ty * z + s * x, 0.0,
				tx * z + s * y, ty * z - s * x, t * z * z + c, 0.0,
				0.0, 0.0, 0.0, 1.0
			];
		}
	}

}