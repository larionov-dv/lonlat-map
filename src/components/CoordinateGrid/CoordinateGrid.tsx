import React, {FC, useMemo} from 'react';
import cls from './CoordinateGrid.module.scss';
import {viewport} from "../../utils/viewport";
import {Rect} from "../../utils/rect";
import {Map} from "ol";
import {Pixel} from "ol/pixel";
import {fromLonLat} from "ol/proj";
import {projection} from "../../utils/map";

// a definition of a line
export interface LineDef {
	html: string;	// a text label for the line
	pos: number;	// a position of the line in pixels
}

interface Props {
	meridians: LineDef[];
	parallels: LineDef[];
	// the map and the rect are passed through props so the component can decide whether to draw the major parallels or not
	map: Map;
	rect: Rect;
	// defines whether to show the polar circles and the tropics
	showMajorParallels?: boolean;
}

/*
	A component for displaying the coordinate grid.

	The reasons why I use my own SVG grid instead of using OpenLayers features are the following:
		1. The custom SVG grid works significantly faster than drawing the lines using OpenLayers (I guess it draws them on a <canvas>);
		2. All parallels and meridians in the Mercator projection are straight lines intersecting at right angles, so no curves needed;
		3. SVG is easier to work with than OpenLayers.
*/
const CoordinateGrid: FC<Props> = ({meridians, parallels, map, rect, showMajorParallels}) => {

	const
		POLAR_CIRCLE: number = 239624,	// polar circle latitude (66° 33' 44") in arc seconds
		TROPIC: number = 84374;			// tropic latitude (23° 26' 14") in arc seconds

	// recalculate positions of the polar circles and the tropics when the view rect changes
	const polarCircleN: number|null = useMemo(() => {
		const pixel: Pixel|null = map.getPixelFromCoordinate(fromLonLat([0, POLAR_CIRCLE / 3600.0], projection));
		return pixel === null ? null : pixel[1];
	}, [rect]);

	const polarCircleS: number|null = useMemo(() => {
		const pixel: Pixel|null = map.getPixelFromCoordinate(fromLonLat([0, -POLAR_CIRCLE / 3600.0], projection));
		return pixel === null ? null : pixel[1];
	}, [rect]);

	const tropicN: number|null = useMemo(() => {
		const pixel: Pixel|null = map.getPixelFromCoordinate(fromLonLat([0, TROPIC / 3600.0], projection));
		return pixel === null ? null : pixel[1];
	}, [rect]);

	const tropicS: number|null = useMemo(() => {
		const pixel: Pixel|null = map.getPixelFromCoordinate(fromLonLat([0, -TROPIC / 3600.0], projection));
		return pixel === null ? null : pixel[1];
	}, [rect]);

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={viewport.width - 40}
			height={viewport.height - 40}
			viewBox={`0 0 ${viewport.width - 40} ${viewport.height - 40}`}
			className={cls.coordinateGrid}
		>
			{meridians.map(lon => <line key={lon.pos} x1={lon.pos} y1={0} x2={lon.pos} y2={viewport.height - 40}/>)}
			{parallels.map(lon => <line key={lon.pos} x1={0} y1={lon.pos} x2={viewport.width - 40} y2={lon.pos}/>)}
			{showMajorParallels === true && polarCircleN !== null && rect.top > POLAR_CIRCLE && rect.bottom < POLAR_CIRCLE &&
				<line x1={0} y1={polarCircleN} x2={viewport.width - 40} y2={polarCircleN} strokeDasharray={5}/>
			}
			{showMajorParallels === true && polarCircleS !== null && rect.top > -POLAR_CIRCLE && rect.bottom < -POLAR_CIRCLE &&
				<line x1={0} y1={polarCircleS} x2={viewport.width - 40} y2={polarCircleS} strokeDasharray={5}/>
			}
			{showMajorParallels === true && tropicN !== null && rect.top > TROPIC && rect.bottom < TROPIC &&
				<line x1={0} y1={tropicN} x2={viewport.width - 40} y2={tropicN} strokeDasharray={5}/>
			}
			{showMajorParallels === true && tropicS !== null && rect.top > -TROPIC && rect.bottom < -TROPIC &&
				<line x1={0} y1={tropicS} x2={viewport.width - 40} y2={tropicS} strokeDasharray={5}/>
			}
		</svg>
	);
};

export default CoordinateGrid;