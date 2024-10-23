import React, {CSSProperties, FC, useEffect, useMemo, useState} from 'react';
import cls from './DistanceMeasurement.module.scss';
import {Map} from "ol";
import {viewport} from "../../utils/viewport";
import {Rect} from "../../utils/rect";
import {makeSVGArcPath} from "../../utils/makeSVGArcPath";
import {distanceBetween} from "../../utils/distanceBetween";
import {formatDistance} from "../../utils/formatDistance";
import {RULER_WIDTH} from "../../utils/global";
import {toLonLat} from "ol/proj";

// a state of the distance measurement
export enum MeasurementState {
	MS_NONE,			// the distance measuring mode is off
	MS_STARTED,			// the distance measuring mode has just been turned on and no points have been placed yet
	MS_FIRST_POINT_SET,	// the first point has been placed
	MS_LAST_POINT_SET	// the last point has been placed and the distance is displayed
}

interface Props {
	map: Map;
	rect: Rect;
	state: MeasurementState;
	from: number[],
	to: number[];
	useMiles?: boolean;
	onPointMove: (coord: number[], first: boolean) => void;
}

const DistanceMeasurement: FC<Props> = ({map, rect, state, from, to, useMiles, onPointMove}) => {

	const cached = useMemo(() => {
		return {
			distance: formatDistance(distanceBetween(from, to), useMiles === true), // measuring the distance
			...makeSVGArcPath(map, from, to, 100)									// making an arc between the first and last points
		};
	}, [rect, from, to, useMiles]);

	// declare some constants to make the code more concise
	const
		twoArcs: boolean = cached.svgPath2 !== undefined,					// two arcs must be drawn
		onePoint: boolean = state > MeasurementState.MS_STARTED,			// the first point must be drawn
		twoPoints: boolean = state === MeasurementState.MS_LAST_POINT_SET;	// the last point must be drawn

	const [mousePressed, setMousePressed] = useState<boolean>(false);			// whether the mouse button is pressed
	const [firstPointMoving, setFirstPointMoving] = useState<boolean>(false);	// which point is moving

	// mouse events
	const mouse = {
		down: (e: React.MouseEvent<HTMLElement>) => {
			setFirstPointMoving((e.target as HTMLElement).classList.contains('first'));
			setMousePressed(true);
		},
		move: (e: MouseEvent) => {
			if (mousePressed) {
				onPointMove(toLonLat(map.getCoordinateFromPixel([e.clientX - RULER_WIDTH, e.clientY - RULER_WIDTH])), firstPointMoving);
			}
		},
		up: (e: MouseEvent) => {
			mouse.move(e);
			setMousePressed(false);
		}
	};

	// attach/detach global mouse events
	useEffect(() => {
		window.addEventListener('mousemove', mouse.move);
		window.addEventListener('mouseup', mouse.up);
		return () => {
			window.removeEventListener('mousemove', mouse.move);
			window.removeEventListener('mouseup', mouse.up);
		};
	}, [mousePressed]);

	// a size of the SVG
	const size = {x: viewport.width - RULER_WIDTH * 2, y: viewport.height - RULER_WIDTH * 2};

	// makes CSS properties for different elements of the component
	const css = (p: number[], move360: boolean = false, limit: boolean = false): CSSProperties => {
		let
			left: number = p[0] + (move360 ? cached._360deg : 0.0),
			top: number = p[1];
		if (limit) {
			const MX: number = 30, MY: number = 10;
			left = left < MX ? MX : left > size.x - MX ? size.x - MX : left;
			top = top < MY ? MY : top > size.y - MY ? size.y - MY : top;
		}
		return {left, top};
	};

	const
		boundRect: Rect = new Rect(0, 0, size.x, size.y),
		visible: boolean = boundRect.intersects(cached.bounds),										// the main arc is visible
		visible2: boolean = cached.bounds2 !== undefined && boundRect.intersects(cached.bounds2);	// the additional arc is visible

	return (
		<div className={cls.distanceMeasurement}>
			{twoPoints &&
				// the main arc
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width={size.x}
					height={size.y}
					viewBox={`0 0 ${size.x} ${size.y}`}
					className={cls.distanceMeasurement__arc}
				>
					<path d={cached.svgPath}/>
				</svg>
			}
			{twoPoints && twoArcs &&
				// the additional arc (shown if the main arc begins west of the 180th meridian and ends east of it)
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width={size.x}
					height={size.y}
					viewBox={`0 0 ${size.x} ${size.y}`}
					className={cls.distanceMeasurement__arc}
				>
					<path d={cached.svgPath2}/>
				</svg>
			}
			{onePoint && visible &&
				// the first point
				<div className={cls.distanceMeasurement__point + ' first'} style={css(cached.from)} onMouseDown={mouse.down}></div>
			}
			{twoPoints && visible &&
				// the last point
				<div className={cls.distanceMeasurement__point} style={css(cached.to)} onMouseDown={mouse.down}></div>
			}
			{onePoint && twoArcs && visible2 &&
				// a duplicate of the first point (for the secondary arc)
				<div className={cls.distanceMeasurement__point + ' first'} style={css(cached.from, true)} onMouseDown={mouse.down}></div>
			}
			{twoPoints && twoArcs && visible2 &&
				// a duplicate of the last point (for the secondary arc)
				<div className={cls.distanceMeasurement__point} style={css(cached.to, true)} onMouseDown={mouse.down}></div>
			}
			{twoPoints && visible &&
				// a distance label
				<div className={cls.distanceMeasurement__distance} style={css(cached.labelPosition, false, true)}>{cached.distance}</div>
			}
			{twoPoints && twoArcs && visible2 &&
				// a duplicate of the distance label (for the secondary arc)
				<div className={cls.distanceMeasurement__distance} style={css(cached.labelPosition, true, true)}>{cached.distance}</div>
			}
		</div>
	);
};

export default DistanceMeasurement;