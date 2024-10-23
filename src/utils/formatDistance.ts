export const formatDistance = (km: number, useMiles: boolean = false): string => {

	const KILOMETERS_PER_MILE: number = 1.609344;

	const value: number = km / (useMiles ? KILOMETERS_PER_MILE : 1.0);

	let digits: number = 0;

	if (value < 1) {
		digits = 4;
	} else if (value < 10) {
		digits = 3;
	} else if (value < 100) {
		digits = 2;
	} else if (value < 1000) {
		digits = 1;
	}

	return value.toFixed(digits).replace(/\.0+$/, '') + ' ' + (useMiles ? 'mi' : 'km');

};