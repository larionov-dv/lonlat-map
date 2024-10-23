export class Spherical {

	public phi: number;		// a rotation around the vertical axis (longitude)
	public theta: number;	// a tilt relative to the horizontal plane (latitude)

	constructor(phi: number = 0.0, theta: number = 0.0) {
		this.phi = phi;
		this.theta = theta;
	}

}