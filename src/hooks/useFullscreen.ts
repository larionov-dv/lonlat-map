import {useState} from "react";

export default function useFullscreen() {

	const [fullscreen, setFullscreen] = useState<boolean>(false);

	const element: HTMLElement = document.documentElement;

	const fullscreenHandler = () => {
		setFullscreen(document.fullscreenElement !== null);
		element.removeEventListener('fullscreenchange', fullscreenHandler);
	};

	element.addEventListener('fullscreenchange', fullscreenHandler);

	const toggle = () => {
		if (!document.fullscreenElement) {
			element.requestFullscreen();
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	};

	return {fullscreen, toggle};

}