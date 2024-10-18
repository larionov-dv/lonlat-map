import {calculateStep} from "./calculateStep";
import {LineDef} from "../components/CoordinateGrid/CoordinateGrid";
import {Rect} from "./rect";
import {print_degrees} from "./print_degrees";
import {Map} from "ol";

// build a list of parallels and meridians
export const buildLinesLists = (map: Map, rect: Rect): {meridians: LineDef[], parallels: LineDef[]} => {

	const
		// arc seconds per degree
		ASPD: number = 3600,

		// some various angles
		DEG_90: number = ASPD * 90,
		DEG_360: number = ASPD * 360,

		// a number of arc seconds between two adjacent parallels or meridians
		step: number = calculateStep(map),

		// meridians and parallels
		meridians: LineDef[] = [],
		parallels: LineDef[] = [],

		// the map extent
		r: Rect = rect.clone();

	// fix the extent rectangle if the 180° meridian is visible
	if (r.left > r.right) {
		if (r.left > DEG_90) r.left -= DEG_360;
		if (r.right < -DEG_90) r.right += DEG_360;
	}

	// build the list of the meridians
	for (let i = r.left; i <= r.right; i++) {
		if (i % step !== 0) continue;
		meridians.push({
			html: print_degrees(i),
			pos: map.getPixelXFromLongitude(i / ASPD)
		});
	}

	// build the list of the parallels
	for (let i = r.bottom; i <= r.top; i++) {
		if (i % step !== 0) continue;
		parallels.push({
			html: print_degrees(i),
			pos: map.getPixelYFromLatitude(i / ASPD)
		});
	}

	return {meridians, parallels};

};