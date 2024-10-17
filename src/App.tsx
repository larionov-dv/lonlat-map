import React from 'react';
import EarthMap from "./components/EarthMap/EarthMap";
import {ls} from "./utils/ls";

const App = () => {
	return (
		<div>
			<EarthMap id="map" center={ls.center} zoom={ls.zoom}/>
		</div>
	);
};

export default App;