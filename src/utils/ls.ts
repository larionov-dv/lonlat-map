export const ls = {

	DEFAULT_CENTER: [10.0, 25.0],
	DEFAULT_ZOOM: 3.0,

	get center(): number[] {
		const value: string|null = localStorage.getItem('center');
		if (value === null) return this.DEFAULT_CENTER;
		return value.split(',').map(x => Number(x));
	},

	set center(value: number[]|undefined) {
		if (value === undefined) {
			localStorage.removeItem('center');
		} else {
			if (isNaN(value[0]) || isNaN(value[1])) return;
			localStorage.setItem('center', value.join(','));
		}
	},

	get zoom(): number {
		const value: string|null = localStorage.getItem('zoom');
		return value === null ? this.DEFAULT_ZOOM : Number(value);
	},

	set zoom(value: number|undefined) {
		if (value === undefined) {
			localStorage.removeItem('zoom');
		} else {
			localStorage.setItem('zoom', value.toString());
		}
	}

};