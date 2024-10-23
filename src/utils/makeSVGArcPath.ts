import {Map} from "ol";
import {Radians} from "./linear_math/Radians";
import {Vector} from "./linear_math/Vector";
import {Spherical} from "./linear_math/Spherical";
import {Matrix} from "./linear_math/Matrix";
import {Vector2D} from "./linear_math/Vector2D";
import {Rect} from "./rect";

interface SVGArcData {
	from: number[],				// a pixel coordinate of the start point of the arc
	to: number[],				// a pixel coordinate of the end point of the arc
	svgPath: string;			// an SVG path for the main arc
	svgPath2?: string;			// an SVG path for the additional arc
	bounds: Rect;				// a bounding rectangle of the main arc
	bounds2?: Rect;				// a bounding rectangle of the additional arc
	labelPosition: number[];	// a position of the distance measurement label
	_360deg: number;			// a number of pixels per 360 degrees
}

// turns an array of points to an SVG path string
const makePathFromPoint = (points: number[][]): string => {
	const path: string[] = points.map((pixel: number[]): string => 'L' + pixel[0].toFixed(6) + ' ' + pixel[1].toFixed(6));
	return 'M' + path.join('').substr(1).replace(/ -/g, '-');
};

// calculates an optimal position of the distance label relative to the arc
const calculateLabelPosition = (p0: number[], p1: number[]): number[] => {

	const origin: Vector2D = new Vector2D(p0);
	let position: Vector2D = (new Vector2D(p1)).subtract(origin).normalize().rotate90CCW();

	if (position.y > 0.0) {
		position = position.negate();
	}

	position.length = 30.0;

	return position.add(origin).toArray();

};

// calculates SVG paths and other data needed to correctly display the arc
export const makeSVGArcPath = (map: Map, from: number[], to: number[], segments: number = 1): SVGArcData => {

	if (segments < 2) segments = 2; // because the arc must have a center point

	const
		// the first point vector
		begin: Vector = new Vector(new Spherical(Radians.to(from[0]), Radians.to(from[1]))),
		// the last point vector
		end: Vector = new Vector(new Spherical(Radians.to(to[0]), Radians.to(to[1]))),
		// a vector's rotation axis
		axis: Vector = begin.cross(end).normalize(),
		// an angle to rotate the vector by at each iteration
		step: number = begin.angleBetween(end) / segments,
		// intermediate vectors
		vectors: Vector[] = [],
		// a number of the middle segment of the arc
		middleSegment: number = Math.floor(segments / 2),
		// a bounding rectangle of the arc
		bounds: Rect = new Rect();
	let
		// a position of the distance label
		labelPosition: number[] = to.slice(),
		// the arc is between 150°E and 150°W and must be displayed twice on the map
		closeTo180: boolean = false;

	// calculate the intermediate vectors
	for (let i = 0; i <= segments; i++) {
		vectors.push(begin.multiply(new Matrix(axis, step * i)));
	}

	// calculate geodetic coordinates of the arc
	const coordinates: number[][] = vectors.map((v: Vector): number[] => {
		const
			spherical: Spherical = v.toSpherical(),
			coordinate: number[] = [Radians.from(spherical.phi), Radians.from(spherical.theta)];
		if (Math.abs(coordinate[0]) >= 150.0) {
			closeTo180 = true; // if the arc has segments beyond the 150th meridian, the arc must be displayed twice
		}
		return coordinate;
	});

	// a number of pixels in 360 degrees at the current map scale
	const _360degToPixels: number = closeTo180 ? (map.getPixelXFromLongitude(180.0) - map.getPixelXFromLongitude(0.0)) * 2.0 : 0.0;

	// calculate pixels of the arc
	const points: number[][] = coordinates.map((coordinate: number[], index: number): number[] => {
		const point: number[] = map.getPixelXYFromLonLat(coordinate);
		if (closeTo180 && coordinate[0] > 0.0) {
			point[0] -= _360degToPixels;
		}
		if (index === middleSegment) {
			labelPosition = calculateLabelPosition(point, map.getPixelXYFromLonLat(coordinates[index + 1]));
		}
		if (index === 0) {
			bounds.setZeroSize(point[0], point[1]);
		} else {
			bounds.extend(point[0], point[1]);
		}
		return point;
	});

	// an additional arc (displayed if the main arc is interrupted at the edge of the map)
	const points2: number[][] = closeTo180 ? points.map((point: number[]) => [point[0] + _360degToPixels, point[1]]) : [];

	return {
		from: points[0],
		to: points[points.length - 1],
		svgPath: makePathFromPoint(points),
		svgPath2: closeTo180 ? makePathFromPoint(points2) : undefined,
		bounds: bounds,
		bounds2: closeTo180 ? bounds.offset(_360degToPixels, 0.0) : undefined,
		labelPosition: labelPosition,
		_360deg: _360degToPixels
	};

};