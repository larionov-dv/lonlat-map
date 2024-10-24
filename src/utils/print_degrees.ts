// format longitude and latitude
export const print_degrees = (value: number): string => {

	const
		HALF_TURN = 648000,					// 180° in arc seconds
		FULL_360 = HALF_TURN * 2;	// 360° in arc seconds

	// clamp the value to range (-180..180]
	if (value <= -HALF_TURN) {
		value += FULL_360;
	}
	if (value > HALF_TURN) {
		value -= FULL_360;
	}

	// do not display the "minus" sign
	value = Math.abs(value);

	// we won't display zero-equal parts, so let's push the parts to array first
	const result: string[] = [];

	// degrees
	result.push(Math.floor(value / 3600.0).toString() + '°');

	// arc minutes
	value = value % 3600;
	const x: number = Math.floor(value / 60.0);
	if (x !== 0.0) result.push(x.toString() + '\'');

	// arc seconds
	value = value % 60;
	if (value !== 0) result.push(value.toString() + '"');

	// finally, join the parts together
	return result.join(' ');

};