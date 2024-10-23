import React, {FC, useEffect, useMemo, useState} from 'react';
import cls from './EarthMap.module.scss';
import {Map, MapBrowserEvent, View} from "ol";
import {toLonLat} from "ol/proj";
import {Rect} from "../../utils/rect";
import {getBottomLeft, getTopRight} from "ol/extent";
import {Coordinate, createStringXY} from "ol/coordinate";
import {ls} from "../../utils/ls";
import {createMap, getMousePositionControl} from "../../utils/map";
import CoordinateGrid, {LineDef} from "../CoordinateGrid/CoordinateGrid";
import {buildLinesLists} from "../../utils/buildLinesLists";
import Ruler, {RulerType} from "../Ruler/Ruler";
import {MousePosition} from "ol/control";
import {formatLonLat} from "../../utils/formatLonLat";
import DistanceMeasurement, {MeasurementState} from "../DistanceMeasurement/DistanceMeasurement";
import {RULER_WIDTH} from "../../utils/global";

interface Props {
	id: string;
	center: number[];
	zoom: number;
	showCoordinates?: boolean;		// show coordinates under the mouse cursor
	formatCoordinates?: boolean;	// true - show formatted coordinates; false - show just a real number of degrees
	showMajorParallels?: boolean;	// show the polar circles and the tropics
	useMiles?: boolean;				// display distances in miles instead of kilometers
	distanceMeasurement?: boolean;	// distance measurement mode on/off
}

const EarthMap: FC<Props> = ({id, center, zoom, showCoordinates, formatCoordinates, showMajorParallels, useMiles, distanceMeasurement}) => {

	const [map, setMap] = useState<Map|null>(null);
	const [rect, setRect] = useState<Rect>(new Rect());			// an extent of the map
	const [meridians, setMeridians] = useState<LineDef[]>([]);	// the definitions of meridians
	const [parallels, setParallels] = useState<LineDef[]>([]);	// the definitions of parallels
	const [measurementState, setMeasurementState] = useState<MeasurementState>(MeasurementState.MS_NONE);	// the current state of distance measurement
	const [dmFrom, setDmFrom] = useState<number[]>([0.0, 0.0]);	// a start point of distance measurement
	const [dmTo, setDmTo] = useState<number[]>([0.0, 0.0]);		// an end point of distance measurement
	const [lastClickCoord, setLastClickCoord] = useState<number[]>([0.0, 0.0]);	// the last mouse click coordinate

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

	const formatCoordCallback = (coord: Coordinate | undefined): string => coord === undefined ? '' : formatLonLat(coord);

	useEffect(() => {
		if (map !== null) {
			const mpControl: MousePosition|null = getMousePositionControl(map);
			if (mpControl !== null) {
				// change the coordinates format
				mpControl.setCoordinateFormat(formatCoordinates ? formatCoordCallback : createStringXY(6));
			}
		}
	}, [formatCoordinates]);

	useEffect(() => {
		// create a map if it hasn't been created yet
		if (map === null) {
			setMap(createMap(id, center, zoom, () => setInitialized(true), MOUSE_POSITION_CONTROL_ID, formatCoordinates ? formatCoordCallback : createStringXY(6)));
		}
	});

	const mapSingleClick = (e: MapBrowserEvent<any>) => {
		if (map !== null) {
			setLastClickCoord(toLonLat(map.getCoordinateFromPixel([e.originalEvent.clientX - RULER_WIDTH, e.originalEvent.clientY - RULER_WIDTH])));
		}
	};

	// switch the distance measurement states when user clicks the map
	useEffect(() => {
		if (measurementState === MeasurementState.MS_STARTED) {
			setDmFrom(lastClickCoord);
			setMeasurementState(MeasurementState.MS_FIRST_POINT_SET);
		} else if (measurementState === MeasurementState.MS_FIRST_POINT_SET) {
			setDmTo(lastClickCoord);
			setMeasurementState(MeasurementState.MS_LAST_POINT_SET);
		} else {
			setMeasurementState(MeasurementState.MS_STARTED);
		}
	}, [lastClickCoord]);

	useEffect(() => {
		// attach and detach map event listeners
		if (map !== null) {
			updateRect();
			map.getView().on('change:center', updateRect);
			map.on('singleclick', mapSingleClick);
		}
		return () => {
			if (map !== null) {
				map.un('singleclick', mapSingleClick);
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

	useEffect(() => {
		setMeasurementState(distanceMeasurement ? MeasurementState.MS_STARTED : MeasurementState.MS_NONE);
	}, [distanceMeasurement]);

	// move the start/end point of the distance measurement line
	const pointMoved = (coord: number[], first: boolean) => {
		if (first) {
			setDmFrom(coord);
		} else {
			setDmTo(coord);
		}
	};

	// the extent of the map in degrees
	const rectDegrees = useMemo(() => rect.divide(3600.0), [rect]);

	return (
		<div className={cls.earthMap}>

			<div id={id} className={cls.earthMap__map}></div>

			<Ruler items={meridians} type={RulerType.TOP}/>
			<Ruler items={meridians} type={RulerType.BOTTOM}/>
			<Ruler items={parallels} type={RulerType.LEFT}/>
			<Ruler items={parallels} type={RulerType.RIGHT}/>

			{map !== null &&
				<CoordinateGrid map={map} rect={rect} meridians={meridians} parallels={parallels} showMajorParallels={showMajorParallels}/>
			}
			{map !== null && distanceMeasurement === true &&
				<DistanceMeasurement map={map} rect={rectDegrees} state={measurementState} from={dmFrom} to={dmTo} useMiles={useMiles} onPointMove={pointMoved}/>
			}

			<div
				id={MOUSE_POSITION_CONTROL_ID}
				className={[cls.earthMap__textBlock, cls.earthMap__mousePosition].join(' ')}
				style={{display: showCoordinates !== false ? 'block' : 'none'}}
			></div>

			<div className={[cls.earthMap__textBlock, cls.earthMap__osmContributors].join(' ')}>© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.</div>

		</div>
	);
};

export default EarthMap;