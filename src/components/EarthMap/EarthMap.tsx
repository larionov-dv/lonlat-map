import React, {FC, useEffect, useMemo, useState} from 'react';
import cls from './EarthMap.module.scss';
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import {Map, View} from "ol";
import {fromLonLat, Projection, toLonLat} from "ol/proj";
import {Rect} from "../../utils/rect";
import {getBottomLeft, getTopRight} from "ol/extent";
import {viewport} from "../../utils/viewport";
import {Pixel} from "ol/pixel";
import {defaults, MousePosition} from "ol/control";
import {Coordinate, createStringXY} from "ol/coordinate";
import {ls} from "../../utils/ls";

interface Props {
	id: string;
	center: number[];
	zoom: number;
}

// a definition of a line
interface LineDef {
	html: string;	// a text label for the line
	pos: number;	// a position of the line in pixels
}

const EarthMap: FC<Props> = ({id, center, zoom}) => {

	const projection: Projection = new Projection({code: 'EPSG:3857'}); // the Mercator projection

	const
		POLAR_CIRCLE: number = 239624,	// polar circle latitude in arc seconds
		TROPIC: number = 84374;			// tropic latitude in arc seconds

	const [map, setMap] = useState<Map|null>(null);
	const [rect, setRect] = useState<Rect>(new Rect());			// an extent of the map
	const [meridians, setMeridians] = useState<LineDef[]>([]);	// the definitions of meridians
	const [parallels, setParallels] = useState<LineDef[]>([]);	// the definitions of parallels

	const updateRect = () => {
		if (map !== null) {
			const
				view: View = map.getView(),
				extent: number[] = view.calculateExtent(map.getSize()),
				bottomLeft: number[] = toLonLat(getBottomLeft(extent)),
				topRight: number[] = toLonLat(getTopRight(extent)),
				r: Rect = new Rect(bottomLeft[0], topRight[1], topRight[0], bottomLeft[1]);
			r.multiply(3600);
			r.inflateToTheNearestIntegers();
			setRect(r);
		}
	};

	useEffect(() => {
		// create a map if it hasn't been created yet
		if (map === null) {
			const mouse_position: HTMLElement|null = document.getElementById('mouse_position');
			if (mouse_position === null) return;
			const mpc: MousePosition = new MousePosition({
				coordinateFormat: createStringXY(6),
				projection: 'EPSG:4326',
				className: cls.earthMap__mousePositionLabel,
				target: mouse_position
			});
			setMap(new Map({
				controls: defaults().extend([mpc]),
				layers: [
					new TileLayer({
						source: new OSM()
					})
				],
				target: id,
				view: new View({
					center: fromLonLat(center, projection),
					extent: [...fromLonLat([-210, -83], projection), ...fromLonLat([210, 83], projection)],
					maxZoom: 20.0, // remove this line if you wanna see every single atom of the Earth's surface on the map
					minZoom: 3.0,
					zoom
				})
			}));
		}
	});

	useEffect(() => {
		// attach and detach map event listeners
		if (map !== null) {
			updateRect();
			map.getView().on('change:center', updateRect);
		}
		return () => {
			if (map !== null) {
				map.getView().un('change:center', updateRect);
			}
		};
	}, [map]);

	// format longitude and latitude
	const print_degrees = (value: number): string => {
		if (value <= -648000) {
			value += 1296000;
		}
		if (value > 648000) {
			value -= 1296000;
		}
		value = Math.abs(value);
		const result: string[] = [];
		result.push(Math.floor(value / 3600.0).toString() + '°');
		value = value % 3600;
		const x: number = Math.floor(value / 60.0);
		if (x !== 0.0) result.push(x.toString() + '\'');
		value = value % 60;
		if (value !== 0.0) result.push(value.toString() + '"');
		return result.join(' ');
	};

	// calculate a suitable step between neighbouring parallels/meridians depending on the map scale
	const calculateStep = (): number => {
		if (map === null) return 36000.0;
		const
			pixel0: Pixel|null = map.getPixelFromCoordinate(fromLonLat([0, 0], projection)),
			pixel1: Pixel|null = map.getPixelFromCoordinate(fromLonLat([1, 0], projection));
		if (pixel0 === null || pixel1 === null) return 36000.0;
		const degree: number = Math.abs(pixel1[0] - pixel0[0]);
		if (degree >= 180000.0) return 1.0;
		if (degree >= 90000.0) return 2.0;
		if (degree >= 60000.0) return 3.0;
		if (degree >= 45000.0) return 4.0;
		if (degree >= 36000.0) return 5.0;
		if (degree >= 18000.0) return 10.0;
		if (degree >= 12000.0) return 15.0;
		if (degree >= 9000.0) return 20.0;
		if (degree >= 6000.0) return 30.0;
		if (degree >= 3000.0) return 60.0;
		if (degree >= 1500.0) return 120.0;
		if (degree >= 1000.0) return 180.0;
		if (degree >= 750.0) return 240.0;
		if (degree >= 600.0) return 300.0;
		if (degree >= 500.0) return 360.0;
		if (degree >= 300.0) return 600.0;
		if (degree >= 200.0) return 900.0;
		if (degree >= 100.0) return 1800.0;
		if (degree >= 50.0) return 3600.0;
		if (degree >= 10.0) return 18000.0;
		return 36000.0;
	};

	useEffect(() => {
		if (map !== null) {
			// build a list of parallels and meridians
			const newStep: number = calculateStep();
			const mer: LineDef[] = [], par: LineDef[] = [];
			let
				from = -300 * 3600 + 1,
				to = 300 * 3600;
			const r: Rect = rect.clone();
			if (r.left > r.right) {
				if (r.left > 324000.0) r.left -= 1296000.0;
				if (r.right < -324000.0) r.right += 1296000.0;
			}
			for (let i = from; i <= to; i++) {
				if (i < r.left || i > r.right || i % newStep !== 0) continue;
				const pixel: Pixel|null = map.getPixelFromCoordinate(fromLonLat([i / 3600.0, 0], projection));
				if (pixel === null) return;
				mer.push({
					html: print_degrees(i),
					pos: pixel[0]
				});
			}
			for (let i = -298800; i <= 298800; i++) {
				if (i < r.bottom || i > r.top || i % newStep !== 0) continue;
				const pixel: Pixel|null = map.getPixelFromCoordinate(fromLonLat([0, i / 3600.0], projection));
				if (pixel === null) return;
				par.push({
					html: print_degrees(i),
					pos: pixel[1]
				});
			}
			setMeridians(mer);
			setParallels(par);
			// save some settings to the local storage
			const view: View = map.getView();
			const center: Coordinate|undefined = view.getCenter();
			if (center !== undefined) {
				ls.center = toLonLat(center);
			}
			ls.zoom = view.getZoom();
		}
	}, [rect]);

	// recalculate positions of the polar circles and the tropics when the view rect changes
	const polarCircleN = useMemo(() => {
		if (map === null) return -100;
		const pixel: Pixel|null = map.getPixelFromCoordinate(fromLonLat([0, POLAR_CIRCLE / 3600.0], projection));
		return pixel === null ? -100 : pixel[1];
	}, [rect]);

	const polarCircleS = useMemo(() => {
		if (map === null) return -100;
		const pixel: Pixel|null = map.getPixelFromCoordinate(fromLonLat([0, -POLAR_CIRCLE / 3600.0], projection));
		return pixel === null ? -100 : pixel[1];
	}, [rect]);

	const tropicN = useMemo(() => {
		if (map === null) return -100;
		const pixel: Pixel|null = map.getPixelFromCoordinate(fromLonLat([0, TROPIC / 3600.0], projection));
		return pixel === null ? -100 : pixel[1];
	}, [rect]);

	const tropicS = useMemo(() => {
		if (map === null) return -100;
		const pixel: Pixel|null = map.getPixelFromCoordinate(fromLonLat([0, -TROPIC / 3600.0], projection));
		return pixel === null ? -100 : pixel[1];
	}, [rect]);

	return (
		<div className={cls.earthMap}>
			<div id={id} className={cls.earthMap__map}></div>
			<div className={cls.earthMap__ruler + ' ' + cls.earthMap__rulerTop}>
				{meridians.map(line => <span key={line.pos} style={{left: line.pos}}>{line.html}</span>)}
			</div>
			<div className={cls.earthMap__ruler + ' ' + cls.earthMap__rulerBottom}>
				{meridians.map(line => <span key={line.pos} style={{left: line.pos}}>{line.html}</span>)}
			</div>
			<div className={cls.earthMap__ruler + ' ' + cls.earthMap__rulerLeft}>
				{parallels.map(line => <span key={line.pos} style={{top: line.pos}}>{line.html}</span>)}
			</div>
			<div className={cls.earthMap__ruler + ' ' + cls.earthMap__rulerRight}>
				{parallels.map(line => <span key={line.pos} style={{top: line.pos}}>{line.html}</span>)}
			</div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={viewport.width - 40}
				height={viewport.height - 40}
				viewBox={`0 0 ${viewport.width - 40} ${viewport.height - 40}`}
				className={cls.earthMap__overlay}
			>
				{meridians.map(lon => <line key={lon.pos} x1={lon.pos} y1={0} x2={lon.pos} y2={viewport.height - 40}/>)}
				{parallels.map(lon => <line key={lon.pos} x1={0} y1={lon.pos} x2={viewport.width - 40} y2={lon.pos}/>)}
				{rect.top > POLAR_CIRCLE && rect.bottom < POLAR_CIRCLE && <line x1={0} y1={polarCircleN} x2={viewport.width - 40} y2={polarCircleN} strokeDasharray={5}/>}
				{rect.top > -POLAR_CIRCLE && rect.bottom < -POLAR_CIRCLE && <line x1={0} y1={polarCircleS} x2={viewport.width - 40} y2={polarCircleS} strokeDasharray={5}/>}
				{rect.top > TROPIC && rect.bottom < TROPIC && <line x1={0} y1={tropicN} x2={viewport.width - 40} y2={tropicN} strokeDasharray={5}/>}
				{rect.top > -TROPIC && rect.bottom < -TROPIC && <line x1={0} y1={tropicS} x2={viewport.width - 40} y2={tropicS} strokeDasharray={5}/>}
			</svg>
			<div id="mouse_position" className={cls.earthMap__mousePosition}></div>
		</div>
	);
};

export default EarthMap;