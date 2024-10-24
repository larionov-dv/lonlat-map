import {Vector} from "./linear_math/Vector";
import {Spherical} from "./linear_math/Spherical";
import {Radians} from "./linear_math/Radians";

export const distanceBetween = (p0: number[], p1: number[]): number => {

	const EARTH_MEAN_RADIUS: number = 6371.0;

	const
		v0: Vector = new Vector(new Spherical(Radians.to(p0[0]), Radians.to(p0[1]))),
		v1: Vector = new Vector(new Spherical(Radians.to(p1[0]), Radians.to(p1[1])));

	return v0.angleBetween(v1) * EARTH_MEAN_RADIUS;

};