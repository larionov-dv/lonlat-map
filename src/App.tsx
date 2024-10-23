import React, {useEffect, useMemo, useState} from 'react';
import EarthMap from "./components/EarthMap/EarthMap";
import {ls} from "./utils/ls";
import Popup from "./components/ui/Popup/Popup";
import Button from "./components/ui/Button/Button";
import {SVG_PATH_RULER, SVG_PATH_SETTINGS} from "./utils/svgPaths";
import Switch from "./components/ui/Switch/Switch";

const App = () => {

	const [popupVisible, setPopupVisible] = useState<boolean>(false);
	const [showMajorParallels, setShowMajorParallels] = useState<boolean>(ls.options.show_major_parallels);
	const [showCoordinates, setShowCoordinates] = useState<boolean>(ls.options.show_coordinates);
	const [formatCoordinates, setFormatCoordinates] = useState<boolean>(ls.options.format_coordinates);
	const [useMiles, setUseMiles] = useState<boolean>(ls.options.use_miles);
	const [distanceMeasurement, setDistanceMeasurement] = useState<boolean>(false);

	// a vertical position of the buttons container
	const controlsTop = useMemo(() => showCoordinates ? 44 : 20, [showCoordinates]);

	// save settings to local storage
	useEffect(() => {ls.options.format_coordinates = formatCoordinates}, [formatCoordinates]);
	useEffect(() => {ls.options.show_coordinates = showCoordinates}, [showCoordinates]);
	useEffect(() => {ls.options.show_major_parallels = showMajorParallels}, [showMajorParallels]);
	useEffect(() => {ls.options.use_miles = useMiles}, [useMiles]);

	return (
		<div>

			<EarthMap
				id="map"
				center={ls.center}
				zoom={ls.zoom}
				showCoordinates={showCoordinates}
				formatCoordinates={formatCoordinates}
				showMajorParallels={showMajorParallels}
				distanceMeasurement={distanceMeasurement}
				useMiles={useMiles}
			/>

			<div id="buttonContainer" style={{top: controlsTop}}>
				<Button
					onClick={() => setPopupVisible(true)}
					icon={SVG_PATH_SETTINGS}
					hint="Settings"
				/>
				<Button
					onClick={(newState?: boolean) => setDistanceMeasurement(newState === true)}
					icon={SVG_PATH_RULER}
					hint="Distance measurement"
					keepState={true}
					pressed={distanceMeasurement}
				/>
			</div>

			<Popup visible={popupVisible} onClose={() => setPopupVisible(false)} top={controlsTop + 10}>
				<Switch
					text="Show major parallels"
					value={showMajorParallels}
					onSwitch={(newValue: boolean) => setShowMajorParallels(newValue)}
				/>
				<Switch
					text="Show coordinates under cursor"
					value={showCoordinates}
					onSwitch={(newValue: boolean) => setShowCoordinates(newValue)}
				/>
				<Switch
					text="Show coordinates as a real number of degrees"
					value={!formatCoordinates}
					onSwitch={(newValue: boolean) => setFormatCoordinates(!newValue)}
					disabled={!showCoordinates}
				/>
				<Switch
					text="Show distances in miles"
					value={useMiles}
					onSwitch={(newValue: boolean) => setUseMiles(newValue)}
				/>
			</Popup>

		</div>
	);
};

export default App;