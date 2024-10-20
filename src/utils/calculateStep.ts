import {Map} from "ol";

// calculate a suitable step between neighbouring parallels/meridians depending on the map scale
export const calculateStep = (map: Map): number => {

	const
		DEFAULT_STEP: number = 36000.0,
		x0: number = map.getPixelXFromLongitude(0),
		x1: number = map.getPixelXFromLongitude(1);

	if (x0 === 0 || x1 === 0) return DEFAULT_STEP;

	// a number of pixels per degree at the current zoom level
	const degree: number = Math.abs(x1 - x0);

	if (degree >= 180000.0) return 1.0;
	if (degree >= 90000.0) return 2.0;
	if (degree >= 60000.0) return 3.0;
	if (degree >= 45000.0) return 4.0;
	if (degree >= 36000.0) return 5.0;
	if (degree >= 18000.0) return 10.0;
	if (degree >= 12000.0) return 15.0;
	if (degree >= 9000.0) return 20.0;
	if (degree >= 6000.0) return 30.0;
	if (degree >= 3000.0) return 60.0;	// 1'
	if (degree >= 1500.0) return 120.0;	// 2'
	if (degree >= 1000.0) return 180.0;	// 3'
	if (degree >= 750.0) return 240.0;	// 4'
	if (degree >= 600.0) return 300.0;	// 5'
	if (degree >= 500.0) return 360.0;	// 6'
	if (degree >= 300.0) return 600.0;	// 10'
	if (degree >= 200.0) return 900.0;	// 15'
	if (degree >= 100.0) return 1800.0;	// 30'
	if (degree >= 50.0) return 3600.0;	// 1°
	if (degree >= 25.0) return 7200.0;	// 2°
	if (degree >= 10.0) return 18000.0;	// 5°
	return DEFAULT_STEP;
};