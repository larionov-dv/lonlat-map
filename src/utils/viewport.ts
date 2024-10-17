export const viewport = {

	get width(): number {
		return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	},

	get height(): number {
		return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
	}

};