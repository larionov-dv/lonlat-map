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

// checks whether the points in an array are arranged in descending order of X coordinate
const isXDescending = (points: number[][]): boolean => {

	const
		length: number = points.length,
		first: number = points[0][0];
	let
		current: number = 1,
		descending: boolean = points[current++][0] < first;

	while (!descending && current < length && first === points[current][0]) {
		descending = points[current++][0] < first;
	}

	return descending;

};

// calculates SVG paths and other data needed to correctly display the arc
export const makeSVGArcPath = (map: Map, from: number[], to: number[], segments: number = 2): SVGArcData => {

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
		// an index of the middle segment of the arc
		middleSegment: number = Math.floor(segments / 2),
		// a bounding rectangle of the arc
		bounds: Rect = new Rect();
	let
		// a position of the distance label
		labelPosition: number[] = to.slice(),
		// the arc is between 150°E and 150°W and must be displayed twice on the map
		showAdditionalArc: boolean = false;

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
			showAdditionalArc = true; // if the arc has segments beyond the 150th meridian, the arc must be displayed twice
		}
		return coordinate;
	});

	const
		// an X position of the right 180th meridian
		_180degXR: number = map.getPixelXFromLongitude(180.0),
		// a number of pixels in 360 degrees at the current map scale
		_360degToPixels: number = showAdditionalArc ? (_180degXR - map.getPixelXFromLongitude(0.0)) * 2.0 : 0.0,
		// an X position of the left 180th meridian
		_180degXL: number = _180degXR - _360degToPixels;

	// calculate pixels of the arc
	let points: number[][] = coordinates.map((coordinate: number[]): number[] => map.getPixelXYFromLonLat(coordinate));

	// the first and the last point coordinates
	const
		firstPoint: number[] = points[0],
		lastPoint: number[] = points[points.length - 1];

	// rearrange the points of the arc so that their X coordinates ascend from left to right
	if (isXDescending(points)) {
		points.reverse();
	}

	// the arc may have a break on the 180th meridian; to eliminate the break, add 360° to the X coordinate of the point
	let add360: boolean = false;

	// some additional operations on the arc
	points = points.map((point: number[], index: number): number[] => {
		// the previous point
		const prev: number[]|null = index === 0 ? null : points[index - 1];
		// if there are two arcs, the first one goes to the left; the second one will be shown on the right
		if (showAdditionalArc) {
			point[0] -= _360degToPixels;
		}
		// if the arc break is detected, the current point and all subsequent points must be shifted 360° to the right
		if (prev !== null && prev[0] > point[0]) {
			add360 = true;
		}
		if (add360) {
			point[0] += _360degToPixels;
		}
		// find the middle segment of the arc to show the label next to it
		if (index === middleSegment) {
			labelPosition = calculateLabelPosition(point, map.getPixelXYFromLonLat(coordinates[index + 1]));
		}
		// calculate the bounding rectangle of the arc
		if (index === 0) {
			bounds.setZeroSize(point[0], point[1]);
		} else {
			bounds.extend(point[0], point[1]);
		}
		return point;
	});

	// an additional arc (displayed if the main arc is interrupted at the edge of the map)
	const points2: number[][] = showAdditionalArc ? points.map((point: number[]) => [point[0] + _360degToPixels, point[1]]) : [];

	return {
		from: firstPoint,
		to: lastPoint,
		svgPath: makePathFromPoint(points),
		svgPath2: showAdditionalArc ? makePathFromPoint(points2) : undefined,
		bounds: bounds,
		bounds2: showAdditionalArc ? bounds.offset(_360degToPixels, 0.0) : undefined,
		labelPosition: labelPosition,
		_360deg: _360degToPixels
	};

};