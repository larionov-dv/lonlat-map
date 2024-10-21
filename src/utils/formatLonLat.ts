import {Coordinate} from "ol/coordinate";

interface Parts {
	deg: number;
	min: number;
	sec: number;
}

// decomposes a real number of degrees to integer numbers of degrees and arc minutes and a real number of arc seconds
const decompose = (degrees: number): Parts => ({
	deg: Math.floor(degrees),
	min: Math.floor(degrees * 60 % 60),
	sec: degrees * 3600 % 60
});

export const formatLonLat = (coord: Coordinate): string => {

	const
		WE: string = coord[0] < 0.0 ? 'W' : 'E',	// West of East
		NS: string = coord[1] < 0.0 ? 'S' : 'N',	// North or South

		lon: Parts = decompose(Math.abs(coord[0])),
		lat: Parts = decompose(Math.abs(coord[1]));

	return [
		lon.deg + '°',
		lon.min + '\'',
		lon.sec.toFixed(1) + '"' + WE + ', ',
		lat.deg + '°',
		lat.min + '\'',
		lat.sec.toFixed(1) + '"' + NS
	].join('');
};