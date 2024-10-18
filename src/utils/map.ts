import {fromLonLat, Projection} from "ol/proj";
import {defaults, MousePosition} from "ol/control";
import {createStringXY} from "ol/coordinate";
import cls from "../components/EarthMap/EarthMap.module.scss";
import {Map, View} from "ol";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";

// the Mercator projection
export const projection: Projection = new Projection({code: 'EPSG:3857'});

// add some custom methods to the Map object to make the coding more convenient
function getPixelXFromLongitude(longitude: number): number {
	// @ts-ignore
	return this.getPixelFromCoordinate(fromLonLat([longitude, 0], projection))[0];
}

function getPixelYFromLatitude(latitude: number): number {
	// @ts-ignore
	return this.getPixelFromCoordinate(fromLonLat([0, latitude], projection))[1];
}

declare module "ol" {
	interface Map {
		getPixelXFromLongitude(longitude: number): number;
		getPixelYFromLatitude(latitude: number): number;
	}
}

Map.prototype.getPixelXFromLongitude = getPixelXFromLongitude;
Map.prototype.getPixelYFromLatitude = getPixelYFromLatitude;

// create a map
export const createMap = (
	id: string,							// an ID of the element, in which the map will be embedded
	center: number[],					// geodetic coordinates of the initial center for the view
	zoom: number,						// an initial zoom value
	mousePosCtrlId: string|null = null	// an ID of the element for displaying coordinates under the mouse cursor
): Map => {

	let mousePositionControl: MousePosition|null = null;

	if (mousePosCtrlId !== null) {
		const mouse_position: HTMLElement|null = document.getElementById('mouse_position');
		if (mouse_position !== null) {
			mousePositionControl = new MousePosition({
			coordinateFormat: createStringXY(6),
			projection: 'EPSG:4326',
			className: cls.earthMap__mousePositionLabel,
			target: mouse_position
		});
		}
	}

	const
		MAX_LONGITUDE = 210,	// the value is greater than 180° so that the Pacific ocean can be displayed as a whole
		MAX_LATITUDE = 83;		// at large latitudes, the Mercator projection is practically unusable, because the linear scale becomes infinitely large at the poles

	return new Map({
		controls: mousePositionControl === null ? defaults() : defaults().extend([mousePositionControl]),
		layers: [
			new TileLayer({
				source: new OSM()
			})
		],
		target: id,
		view: new View({
			center: fromLonLat(center, projection),
			extent: [...fromLonLat([-MAX_LONGITUDE, -MAX_LATITUDE], projection), ...fromLonLat([MAX_LONGITUDE, MAX_LATITUDE], projection)],
			maxZoom: 20.0, // remove this line if you wanna see every single atom of the Earth's surface on the map :D
			minZoom: 3.0,
			zoom
		})
	});

};