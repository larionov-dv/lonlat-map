import {Map} from "ol";
import {Radians} from "./linear_math/Radians";
import {Vector} from "./linear_math/Vector";
import {Spherical} from "./linear_math/Spherical";
import {Matrix} from "./linear_math/Matrix";
import {Vector2D} from "./linear_math/Vector2D";
import {Rect} from "./rect";
import {viewport} from "./viewport";
import {RULER_WIDTH} from "./global";

interface SVGArcData {
	from: number[],				// a pixel coordinate of the start point of the arc
	to: number[],				// a pixel coordinate of the end point of the arc
	svgPath: string;			// an SVG path for the main arc
	svgPathL?: string;			// an SVG path for the additional arc
	svgPathR?: string;			// an SVG path for the additional arc
	labelPosition: number[];	// a position of the distance measurement label
	_360deg: number;			// a number of pixels per 360 degrees
	mainArc: boolean;			// a main arc is visible
	additionalArcLeft: boolean;	// an additional arc on the left is visible
	additionalArcRight: boolean;// an additional arc on the right is visible
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

interface MapPoint {
	geodetic: number[];
	pixel: number[];
}

// calculates SVG paths and other data needed to correctly display the arcs
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
		middleSegment: number = Math.ceil(segments / 2),
		// a bounding rectangle of the arc
		bounds: Rect = new Rect();
	let
		// a position of the distance label
		labelPosition: number[] = to.slice();

	// calculate the intermediate vectors
	for (let i = 0; i <= segments; i++) {
		vectors.push(begin.multiply(new Matrix(axis, step * i)));
	}

	// calculate geodetic and screen coordinates of points the arc
	let points: MapPoint[] = vectors.map((v: Vector): MapPoint => {
		const
			spherical: Spherical = v.toSpherical(),
			coordinate: number[] = [Radians.from(spherical.phi), Radians.from(spherical.theta)];
		return {geodetic: coordinate, pixel: map.getPixelXYFromLonLat(coordinate)};
	});

	// a number of pixels in 360 degrees at the current map scale
	const _360degToPixels: number = (map.getPixelXFromLongitude(180.0) - map.getPixelXFromLongitude(0.0)) * 2.0;

	// if the arc crosses the 180th meridian, the part of the arc must be shifted by this value
	let shift: number = 0.0;

	points = points.map((point: MapPoint, index: number): MapPoint => {
		// the previous point
		const prev: MapPoint|null = index === 0 ? null : points[index - 1];
		if (prev !== null) {
			// detect the arc break and set the shift for the points following after the break
			if (shift === 0.0 && Math.abs(point.geodetic[0] - prev.geodetic[0]) > 90.0) {
				if (prev.geodetic[0] > point.geodetic[0]) {
					shift = _360degToPixels;
				} else {
					shift = -_360degToPixels;
				}
			}
		}
		// if the arc break is detected, shift the current point 360° to the left or to the right depending on the arc direction
		point.pixel[0] += shift;
		// find the middle segment of the arc to show the label next to it
		if (index === middleSegment) {
			// prev is never null here, so just use @ts-ignore
			// @ts-ignore
			labelPosition = calculateLabelPosition(prev.pixel, point.pixel);
		}
		// calculate the bounding rectangle of the arc
		if (index === 0) {
			bounds.setZeroSize(point.pixel[0], point.pixel[1]);
		} else {
			bounds.extend(point.pixel[0], point.pixel[1]);
		}
		return point;
	});

	// a bounding rectangle of the map
	const mapRect: Rect = new Rect(0, 0, viewport.width - RULER_WIDTH * 2, viewport.height - RULER_WIDTH * 2);

	const
		// show the additional arc on the left
		leftArc: boolean = mapRect.intersects(bounds.offset(-_360degToPixels, 0.0)),
		// show the additional arc on the right
		rightArc: boolean = mapRect.intersects(bounds.offset(_360degToPixels, 0.0));

	// adds x to pixels X coordinate
	const addX = (p: number[], x: number): number[] => [p[0] + x, p[1]];

	return {
		from: points[0].pixel,
		to: points[points.length - 1].pixel,
		svgPath: makePathFromPoint(points.map(p => p.pixel)),
		svgPathL: leftArc ? makePathFromPoint(points.map(p => addX(p.pixel, -_360degToPixels))) : undefined,
		svgPathR: rightArc ? makePathFromPoint(points.map(p => addX(p.pixel, _360degToPixels))) : undefined,
		labelPosition: labelPosition,
		_360deg: _360degToPixels,
		mainArc: mapRect.intersects(bounds),
		additionalArcLeft: leftArc,
		additionalArcRight: rightArc
	};

};