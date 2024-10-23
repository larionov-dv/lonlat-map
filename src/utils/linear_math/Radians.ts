export class Radians {

	// FROM radians to degrees
	public static from(radians: number): number {
		return radians * 180.0 / Math.PI;
	}

	// from degrees TO radians
	public static to(degrees: number): number {
		return degrees * Math.PI / 180.0;
	}

}