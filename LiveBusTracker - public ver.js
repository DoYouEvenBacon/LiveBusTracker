/*
LiveBusTracker Web App created by Alan J. Tan - GitHub/DoYouEvenBacon, 2019
*/

const AT_APIKey = ''; //your Auckland Transport API Key here

let aucklandMap;
let vectorSource = new ol.source.Vector({
	features: []
}); 
let stopVectorSource = new ol.source.Vector({
	features: []
}); 
let positionVectorSource = new ol.source.Vector({
	features: []
});
let nearbyStopsVectorSource = new ol.source.Vector({
	features: []
});
let routeVectorSource = new ol.source.Vector({
	features: []
});
let busPopupOverlay;
let stopPopupOverlay;

//https://developers.google.com/transit/gtfs-realtime/guides/vehicle-positions
let occupancyCategories = ['Empty', 'Many seats available', 'Few seats available', 'Standing room only', 'Crushed standing room only', 'Full', 'Not accepting passengers'];

let autoUpdate = false;
let updateInterval;

const createMap = () =>{
	aucklandMap = new ol.Map({
		target: 'mapContainer',
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM()
			}),
			new ol.layer.Vector({
				name: 'routeLineVector',
				source: routeVectorSource
			}),
			new ol.layer.Vector({
				name: 'busMarkerVector',
				source: vectorSource
			}),			
			new ol.layer.Vector({
				name: 'stopMarkerVector',
				source: stopVectorSource
			}),			
			new ol.layer.Vector({
				name: 'nearbyStopsMarkerVector',
				source: nearbyStopsVectorSource
			}),			
			new ol.layer.Vector({
				name: 'positionMarkerVector',
				source: positionVectorSource
			})
		],
		view: new ol.View({
			center: ol.proj.fromLonLat([174.75, -36.8617074]),
			zoom: 11
		})
	});

	//openlayers overlay for the popup boxes
	busPopupOverlay = new ol.Overlay({
		element: busPopup,
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
	});	
	stopPopupOverlay = new ol.Overlay({
		element: stopPopup,
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
	});
	aucklandMap.addOverlay(busPopupOverlay);
	aucklandMap.addOverlay(stopPopupOverlay);
	
	//'x' button functionality
	document.getElementById('busPopup-closer').onclick = function(){
		busPopupOverlay.setPosition(undefined);
		document.getElementById('busPopup-closer').blur();
	};	
	document.getElementById('stopPopup-closer').onclick = function(){
		stopPopupOverlay.setPosition(undefined);
		document.getElementById('stopPopup-closer').blur();
	};

	aucklandMap.on('singleclick', function(event){
		let coordinate = event.coordinate;
		console.log(coordinate);

		if(aucklandMap.hasFeatureAtPixel(event.pixel)){
			console.log(aucklandMap.getFeaturesAtPixel(event.pixel));
			let feature = aucklandMap.getFeaturesAtPixel(event.pixel)[0].values_
			
			if(feature.markerType === 'Bus'){ //set the bus popup info
				stopPopupOverlay.setPosition(undefined);
				document.getElementById('stopPopup-closer').blur();	
				let popupLatitude = feature.latitude;
				let popupLongitude = feature.longitude; //lat and long passed so a line from bus to stop can be drawn on the map
				let popupTripID = feature.tripID;
				let popupRouteNum = feature.routeNum;
				let popupRouteName = feature.routeName;
				let popupOccupancy = feature.occupancyStatus;
				
				document.getElementById('busPopupContent').innerHTML = `<img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Bus-logo.svg" style="width:8%"> ${popupRouteNum} ${popupRouteName} <br><img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Aiga_toiletsq_men.svg" style="width:8%"> Occupancy: ${popupOccupancy} <br><br>`;
				busPopupOverlay.setPosition(coordinate); 
				getStopTimesByTrip(popupTripID, popupLatitude, popupLongitude); //call Stop Times by Trip and calculate the next stop and plot the location on the map
			}
			else if(feature.markerType === 'Stop'){ //set the stop popup info
				let popupStopName = feature.stopName;
				let popupStopCode = feature.stopCode;
				
				document.getElementById('stopPopupContent').innerHTML = `Stop Info:<br>${popupStopCode} - ${popupStopName}`;
				stopPopupOverlay.setPosition(coordinate); 
			}
			else if(feature.markerType === 'nearbyStop'){ //alter side box timetable and get the timetable automatically
				document.getElementById('timetableInput').value = feature.stopCode;
				searchTimetable();
			}
		}
		else{ //close popups when clicking on the map
			busPopupOverlay.setPosition(undefined);
			document.getElementById('busPopup-closer').blur();
			stopPopupOverlay.setPosition(undefined);
			document.getElementById('stopPopup-closer').blur();
		}
	});	
	
	//change the cursor style depending on action
	aucklandMap.on('pointermove', function(event){
		if(aucklandMap.hasFeatureAtPixel(event.pixel)){
			aucklandMap.getTargetElement().style.cursor = 'pointer';
		}
		else{
			aucklandMap.getTargetElement().style.cursor = 'default';
		}
	});
	aucklandMap.on('pointerdrag', function(event){
		aucklandMap.getTargetElement().style.cursor = 'all-scroll';
	});	
	aucklandMap.on('moveend', function(event){
		aucklandMap.getTargetElement().style.cursor = 'default';
	});	
};

const plotRouteBusToStop = (busLat, busLong, stopLat, stopLong) =>{ //draw a line from bus location to its next stop	
	let polyline = new ol.Feature({
		geometry: new ol.geom.LineString([ol.proj.fromLonLat([busLong, busLat]), ol.proj.fromLonLat([stopLong, stopLat])]),
	});
	polyline.setStyle(new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: [75, 154, 204],
			width: 10
		})
	}));
	routeVectorSource.addFeature(polyline);	
};

const plotPositionMarker = (posLatitude, posLongitude) =>{
	let positionSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" version="1.1" viewBox="-12 -12 24 24">'
	+ '<circle r="9" style="stroke:#fff;stroke-width:3;fill:#2A93EE;fill-opacity:1;opacity:1;"/>'
	+ '</svg>';
	let positionMarker = new ol.Feature({
		geometry: new ol.geom.Point(ol.proj.fromLonLat([posLongitude, posLatitude])),
	});
	positionMarker.setProperties({'markerType':'userPosition', 'latitude':posLatitude, 'longitude':posLongitude});
	positionMarker.setStyle(new ol.style.Style({
		image: new ol.style.Icon(({
			src: 'data:image/svg+xml;utf8,' + encodeURIComponent(positionSVG),
			scale: 1,
			opacity: 1
		}))
	}));	
	positionVectorSource.addFeature(positionMarker);
};

const plotNearbyStops = (res) =>{
	for(let i = 0; i < res.response.length; i++){
		if(res.response[i].location_type === 0){
			let stopLongitude = res.response[i].stop_lon;
			let stopLatitude = res.response[i].stop_lat;
			let nearbyMarker = new ol.Feature({
				geometry: new ol.geom.Point(ol.proj.fromLonLat([stopLongitude, stopLatitude])),
			});
			nearbyMarker.setProperties({'markerType':'nearbyStop', 'latitude':stopLatitude, 'longitude':stopLongitude, 'stopName':res.response[i].stop_name, 'stopCode':res.response[i].stop_code});
			nearbyMarker.setStyle(new ol.style.Style({
				image: new ol.style.Icon(({
					src: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Marker_location.png',
					scale: 1
				}))
			}));			
			nearbyStopsVectorSource.addFeature(nearbyMarker);
		}
	};
};

const plotStopMarker = (stopLatitude, stopLongitude, stopName, stopCode) =>{
	let stopMarker = new ol.Feature({
		geometry: new ol.geom.Point(ol.proj.fromLonLat([stopLongitude, stopLatitude])),
	});
	stopMarker.setProperties({'markerType':'Stop', 'latitude':stopLatitude, 'longitude':stopLongitude, 'stopName':stopName, 'stopCode':stopCode});
	stopMarker.setStyle(new ol.style.Style({
		image: new ol.style.Icon(({
			/*src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bus_stop_symbol.svg/261px-Bus_stop_symbol.svg.png',
			scale: 0.2*/
			src: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/TransLink-op-head-bus-right.svg'
		}))
	}));	
	stopVectorSource.addFeature(stopMarker);
};

const addMarker = (latitude, longitude, tripID, routeNum, routeName, occupancyStatus) =>{
	let busMarker = new ol.Feature({
		geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude])),
	});
	busMarker.setProperties({'markerType':'Bus', 'latitude':latitude, 'longitude':longitude, 'tripID':tripID, 'routeNum':routeNum, 'routeName':routeName, 'occupancyStatus': occupancyCategories[occupancyStatus]});
	busMarker.setStyle(new ol.style.Style({
		image: new ol.style.Icon(({
			src: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Bus-logo.svg',
			scale: 0.1
		}))
	}));
	vectorSource.addFeature(busMarker);
};

const showLiveLocation = (liveResults, busNumberResults) =>{
	vectorSource.clear(); //remove active bus locations from the map when performing another search
	stopVectorSource.clear();
	routeVectorSource.clear();
	
	for(let i = 0; i < liveResults.response.entity.length; i++){
		for(let j = 0; j < busNumberResults.response.length; j++){
			if(liveResults.response.entity[i].vehicle.trip['route_id'] === busNumberResults.response[j].route_id){ //compare route_id's of live buses and route_id's of a bus number
				const locationLatitude = liveResults.response.entity[i].vehicle.position['latitude'];
				const locationLongitude = liveResults.response.entity[i].vehicle.position['longitude'];
				const tripID = liveResults.response.entity[i].vehicle.trip['trip_id'];
				const routeNum = busNumberResults.response[j].route_short_name;
				const routeName = busNumberResults.response[j].route_long_name;
				const occupancyStatus = liveResults.response.entity[i].vehicle['occupancy_status'];

				addMarker(locationLatitude, locationLongitude, tripID, routeNum, routeName, occupancyStatus); //create a marker for the position of the bus
				console.log(locationLatitude, locationLongitude, routeName);
			};
		};
	};
	document.getElementById('searchButton').disabled = false; //re-enable live location search button - disabled in searchBus()
	document.getElementById('mapContainer').style.opacity = 1;
	document.getElementById('mapLoader').style.display = 'none';	
	
};

const getLiveLocation = (busNumberResults) =>{
	const xhr = new XMLHttpRequest();
	const url = `https://api.at.govt.nz/v2/public/realtime/vehiclelocations`;
	
	xhr.responseType = 'json';
	xhr.onreadystatechange = () =>{
		if(xhr.readyState === XMLHttpRequest.DONE){
			showLiveLocation(xhr.response, busNumberResults);
		};
	};
	xhr.open("GET", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Ocp-Apim-Subscription-Key', AT_APIKey);
	xhr.send();	
};

const getRoutesByNumber = (stopNumber) =>{
	const xhr = new XMLHttpRequest();
	const url = `https://api.at.govt.nz/v2/gtfs/routes/routeShortName/${stopNumber}`;
	
	xhr.responseType = 'json';
	xhr.onreadystatechange = () =>{
		if(xhr.readyState === XMLHttpRequest.DONE){
			getLiveLocation(xhr.response);
		};
	};
	xhr.open("GET", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Ocp-Apim-Subscription-Key', AT_APIKey);
	xhr.send();		
};

function getStopTimesByTrip(id, busLat, busLong){ //grab all the stops of a trip and pass it on to find the next stop based on current time
	const xhr = new XMLHttpRequest();
	const url = `https://api.at.govt.nz/v2/gtfs/stopTimes/tripId/${id}`
				
	xhr.responseType = 'json';
	xhr.onreadystatechange = () =>{
		if(xhr.readyState === XMLHttpRequest.DONE){
			getStopById(xhr.response, busLat, busLong);
		};
	};
	xhr.open("GET", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Ocp-Apim-Subscription-Key', AT_APIKey);
	xhr.send();	
};

function getStopById(stops, busLat, busLong){ //Estimate the next stop in {stops} using time, then call the API to get info about that stop
	let nextStopId;
	let nextStopTime;
	let now = new Date();
	let stop_i = new Date();
	let stop_ii = new Date();
	for(let i = 0; i < stops.response.length - 1; i++){ //estimate the next stop based on current time
		stop_i.setHours(parseInt(stops.response[i].departure_time.slice(0, 2)), parseInt(stops.response[i].departure_time.slice(3, 5)), parseInt(stops.response[i].departure_time.slice(6, 8)));
		stop_ii.setHours(parseInt(stops.response[i + 1].departure_time.slice(0, 2)), parseInt(stops.response[i + 1].departure_time.slice(3, 5)), parseInt(stops.response[i + 1].departure_time.slice(6, 8)));
		if(stop_i <= now && now < stop_ii){
			nextStopId = stops.response[i + 1].stop_id;
			nextStopTime = stops.response[i + 1].arrival_time;
		}
		else if(i == 0 && now < stop_i){
			nextStopId = stops.response[i].stop_id;
			nextStopTime = stops.response[i].arrival_time;
		}
	};
	//add leading 0 to minutes and seconds if < 10
	let now_H = now.getHours();
	let now_M = now.getMinutes();
	let now_S = now.getSeconds();
	now_H = checkTime(now_H);
	now_M = checkTime(now_M);
	now_S = checkTime(now_S);
	function checkTime(t){
		if(t < 10){
			t = `0${t}`;
		};
		return t;
	};

	const xhr = new XMLHttpRequest();
	const url = `https://api.at.govt.nz/v2/gtfs/stops/stopId/${nextStopId}`
				
	xhr.responseType = 'json';
	xhr.onreadystatechange = () =>{
		if(xhr.readyState === XMLHttpRequest.DONE){
			stopVectorSource.clear(); //remove current stop location marker before placing a new one
			routeVectorSource.clear();
			let stopName = xhr.response.response[0].stop_name;
			let stopCode = xhr.response.response[0].stop_code;
			let stopLat = xhr.response.response[0].stop_lat;
			let stopLong = xhr.response.response[0].stop_lon; //latitude and longitude values to plot a marker of the stop location
			document.getElementById('busPopupContent').innerHTML += `<img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/TransLink-op-head-bus-right.svg" style="width:8%"> Next stop: ${stopCode} - ${stopName} <br><img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Simple_icon_time.svg" style="width:8%"> ETA: ${nextStopTime} (Current time: ${now_H}:${now_M}:${now_S})`; //add next stop information to popup
			plotStopMarker(stopLat, stopLong, stopName, stopCode);
			plotRouteBusToStop(busLat, busLong, stopLat, stopLong);
		};
	};
	xhr.open("GET", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Ocp-Apim-Subscription-Key', AT_APIKey);
	xhr.send();	
};

const formatTimetable = (res) =>{
	document.getElementById('timetableLoader').style.display = 'none';
	let timetableFrame = document.getElementById('timetableDisplay');
	timetableFrame.style.border = '1px solid #ccc';
	//timetableFrame.innerHTML += '<br>Number Destination<p>Scheduled</p>';
	//timetableFrame.innerHTML += '<p class="timetableBreak">_________________________________</p>'
	timetableFrame.innerHTML += '<br>';
	for(let i = 0; i < res.response.length; i++){
		let routeNum = res.response[i].route_short_name;
		let routeName = res.response[i].route_long_name;
		let departTime = res.response[i].departure_time;
		let pickupType = res.response[i].pickup_type;
		
		let now = new Date();
		let stopTime = new Date();
		stopTime.setHours(parseInt(departTime.slice(0, 2)), parseInt(departTime.slice(3, 5)), parseInt(departTime.slice(6, 8)));
		if(now <= stopTime && pickupType != 1){ //don't display stops whose times that have already passed
			let indexOf_to = routeName.toUpperCase().indexOf(' TO ') + 1;
			let indexOf_via = routeName.toUpperCase().indexOf(' VIA ');
			let shortened_Name = routeName.slice(indexOf_to + 3, indexOf_via);
		
			timetableFrame.innerHTML += `<br><b>${routeNum}</b> ${shortened_Name}<p class="scheduledDepart"><b>${departTime}</b></p>`;
			timetableFrame.innerHTML += '<p class="timetableBreak">_________________________________</p>';			
		}
	};
	document.getElementById('timetableButton').disabled = false; //re-enable the timetable search button
};

const getStopInfo = (stopNumber) =>{ //Live timetable feed
	const xhr = new XMLHttpRequest();
	const url = `https://api.at.govt.nz/v2/gtfs/stops/stopinfo/${stopNumber}`;
	
	xhr.responseType = 'json';
	xhr.onreadystatechange = () =>{
		if(xhr.readyState === XMLHttpRequest.DONE){
			formatTimetable(xhr.response);
		};
	};
	xhr.open("GET", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Ocp-Apim-Subscription-Key', AT_APIKey);
	xhr.send();
};

const getNearbyStops = (userLat, userLong) =>{
	const xhr = new XMLHttpRequest();
	const url = `https://api.at.govt.nz/v2/gtfs/stops/geosearch?lat=${userLat}&lng=${userLong}&distance=1000`;
	
	xhr.responseType = 'json';
	xhr.onreadystatechange = () =>{
		if(xhr.readyState === XMLHttpRequest.DONE){
			plotNearbyStops(xhr.response);
		};
	};
	xhr.open("GET", url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Ocp-Apim-Subscription-Key', AT_APIKey);
	xhr.send();
};

const searchBus = () =>{
	let busNumber = document.getElementById('searchInput').value;
	if(document.getElementById('searchInput').value.trim() != ''){ 
		busPopupOverlay.setPosition(undefined);
		document.getElementById('busPopup-closer').blur();
		stopPopupOverlay.setPosition(undefined);
		document.getElementById('stopPopup-closer').blur();
		
		document.getElementById('searchButton').disabled = true; //disable bus search button
		document.getElementById('mapContainer').style.opacity = 0.5;//change opacity of the map and show the loading animation
		document.getElementById('mapLoader').style.display = 'block';
		getRoutesByNumber(busNumber);
	};
};

const searchTimetable = () =>{
	let stopNumber = document.getElementById('timetableInput').value;
	if(document.getElementById('timetableInput').value.trim() != ''){
		document.getElementById('timetableButton').disabled = true; //disable search button until results load
		document.getElementById('timetableDisplay').innerHTML = ''; //clear timetable feed for new results
		document.getElementById('timetableDisplay').style.border ='';
		let loaderDiv = document.createElement('div'); //recreate div for loading animation because of innerHTML = ''
		loaderDiv.id = 'timetableLoader';
		loaderDiv.className = 'sideBox_loader';
		document.getElementById('timetableDisplay').appendChild(loaderDiv);
		document.getElementById('timetableLoader').style.display = 'block';
		getStopInfo(stopNumber);
	};
};

const checkSearchInput = () =>{
	let searchFieldValue = document.getElementById('searchInput').value.trim();
	if(searchFieldValue != ''){
		document.getElementById('autoUpdateButton').disabled = false;
	}
	else if(searchFieldValue === ''){
		document.getElementById('autoUpdateButton').disabled = true;
	}
};

const toggleAutoUpdate = () =>{
	let updateTime = 15; //time reset to 15 seconds each time button is pressed

	if(autoUpdate){ //turn off auto update if auto update is on
		autoUpdate = false;
		clearInterval(updateInterval);
		document.getElementById('autoUpdateButton').innerHTML = `Turn Auto Update On (${updateTime}s)`;
	}
	else if(!autoUpdate){
		autoUpdate = true;
		updateInterval = setInterval(updateTimer, 1000);
		function updateTimer(){
			if(updateTime === 0){
				updateTime = 15;
				document.getElementById('autoUpdateButton').innerHTML = `Turn Auto Update Off (${updateTime}s)`;				
				searchBus();
			}
			else{
				updateTime -= 1;
				document.getElementById('autoUpdateButton').innerHTML = `Turn Auto Update Off (${updateTime}s)`;
			}
		};
	}
};

const showUserPosition = (position) =>{
	console.log('User latitude ' + position.coords.latitude);
	console.log('User longitude ' + position.coords.longitude);
	plotPositionMarker(position.coords.latitude, position.coords.longitude);
	getNearbyStops(position.coords.latitude, position.coords.longitude); //get stops within a certain radius of the user's location
	document.getElementById('userLocationButton').disabled = false;
};

const userLocationError = (error) =>{
	console.warn(`${error.code} ${error.message}`);
};

const getUserLocation = () =>{
	document.getElementById('userLocationButton').disabled = true;
	positionVectorSource.clear(); //remove current location marker to avoid plotting more than one point
	nearbyStopsVectorSource.clear();
	let geoOptions = {
		enableHighAccuracy: true, 
		timeout: 5000,
		maximumAge: 0
	};
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(showUserPosition, userLocationError, geoOptions);
	}
	else{
		console.log('Geolocation not supported.');
		document.getElementById('userLocationButton').disabled = false;
	}
};

const clearLocations = () =>{ //toggle clear markers button depending on if markers have been placed
	if(document.getElementById('clearLocationsButton').disabled === true){
		document.getElementById('clearLocationsButton').disabled = false; //enable button when markers are active
	}
	else if(document.getElementById('clearLocationsButton').disabled === false){
		positionVectorSource.clear();
		nearbyStopsVectorSource.clear();
		document.getElementById('clearLocationsButton').disabled = true; //re-disable the button when markers have been cleared
	}

};

const openAbout = () =>{
	document.getElementById('aboutBox').style.display = 'block';
	document.getElementById('mapContainer').style.opacity = 0.5;
};
const closeAbout = () =>{
	document.getElementById('aboutBox').style.display = 'none';
	document.getElementById('mapContainer').style.opacity = 1;
};