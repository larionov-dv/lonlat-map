import React, {FC, useEffect, useState} from 'react';
import cls from './EarthMap.module.scss';
import {Map, View} from "ol";
import {toLonLat} from "ol/proj";
import {Rect} from "../../utils/rect";
import {getBottomLeft, getTopRight} from "ol/extent";
import {Coordinate} from "ol/coordinate";
import {ls} from "../../utils/ls";
import {createMap} from "../../utils/map";
import CoordinateGrid, {LineDef} from "../CoordinateGrid/CoordinateGrid";
import {buildLinesLists} from "../../utils/buildLinesLists";
import Ruler, {RulerType} from "../Ruler/Ruler";

interface Props {
	id: string;
	center: number[];
	zoom: number;
}

const EarthMap: FC<Props> = ({id, center, zoom}) => {

	const [map, setMap] = useState<Map|null>(null);
	const [rect, setRect] = useState<Rect>(new Rect());			// an extent of the map
	const [meridians, setMeridians] = useState<LineDef[]>([]);	// the definitions of meridians
	const [parallels, setParallels] = useState<LineDef[]>([]);	// the definitions of parallels

	/*	The Map.getPixelFromCoordinate() method returns null until the map is initialized. But this method
		is needed to calculate the grid step. So we set 'initialized' to true in the map's 'postrender'
		event to know when the Map.getPixelFromCoordinate() becomes available. */
	const [initialized, setInitialized] = useState<boolean>(false);

	const MOUSE_POSITION_CONTROL_ID: string = 'mouse_position';

	// update the map extent when the map is moving or the scale is changing
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
			setMap(createMap(id, center, zoom, () => setInitialized(true), MOUSE_POSITION_CONTROL_ID));
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

	useEffect(() => {
		if (map !== null) {
			// build a list of parallels and meridians
			const {meridians, parallels} = buildLinesLists(map, rect);
			setMeridians(meridians);
			setParallels(parallels);
			// save some settings to the local storage
			const view: View = map.getView();
			const center: Coordinate|undefined = view.getCenter();
			if (center !== undefined) {
				ls.center = toLonLat(center);
			}
			ls.zoom = view.getZoom();
		}
	}, [rect, initialized]);

	return (
		<div className={cls.earthMap}>
			<div id={id} className={cls.earthMap__map}></div>
			<Ruler items={meridians} type={RulerType.TOP}/>
			<Ruler items={meridians} type={RulerType.BOTTOM}/>
			<Ruler items={parallels} type={RulerType.LEFT}/>
			<Ruler items={parallels} type={RulerType.RIGHT}/>
			{map !== null && <CoordinateGrid map={map} rect={rect} meridians={meridians} parallels={parallels} showMajorParallels={true}/>}
			<div id={MOUSE_POSITION_CONTROL_ID} className={[cls.earthMap__textBlock, cls.earthMap__mousePosition].join(' ')}></div>
			<div className={[cls.earthMap__textBlock, cls.earthMap__osmContributors].join(' ')}>© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.</div>
		</div>
	);
};

export default EarthMap;