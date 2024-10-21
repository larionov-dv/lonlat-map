export const ls = {

	DEFAULT_CENTER: [10.0, 25.0],
	DEFAULT_FORMAT_COORDINATES: false,
	DEFAULT_SHOW_COORDINATES: true,
	DEFAULT_SHOW_MAJOR_PARALLELS: true,
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
	},

	options: {

		get format_coordinates(): boolean {
			const value: string|null = localStorage.getItem('format_coordinates');
			return value === null ? ls.DEFAULT_FORMAT_COORDINATES : value === '1';
		},

		set format_coordinates(value: boolean) {
			localStorage.setItem('format_coordinates', value ? '1' : '0');
		},

		get show_coordinates(): boolean {
			const value: string|null = localStorage.getItem('show_coordinates');
			return value === null ? ls.DEFAULT_SHOW_COORDINATES : value === '1';
		},

		set show_coordinates(value: boolean) {
			localStorage.setItem('show_coordinates', value ? '1' : '0');
		},

		get show_major_parallels(): boolean {
			const value: string|null = localStorage.getItem('show_major_parallels');
			return value === null ? ls.DEFAULT_SHOW_MAJOR_PARALLELS : value === '1';
		},

		set show_major_parallels(value: boolean) {
			localStorage.setItem('show_major_parallels', value ? '1' : '0');
		}

	}

};