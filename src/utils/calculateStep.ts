import {Map} from "ol";

// calculate a suitable step between neighbouring parallels/meridians depending on the map scale
export const calculateStep = (map: Map): number => {

	if (map === null) return 36000.0;

	// a number of pixels per degree at the current zoom level
	const degree: number = Math.abs(map.getPixelXFromLongitude(1) - map.getPixelXFromLongitude(0));

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