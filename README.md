# LiveBusTracker
This web app is powered by Auckland Transport API and OpenLayers API which is based on OpenStreetMaps.

## Requirements
```
- The latest web browser. (This web app was developed in Google Chrome. It might not work in Safari.)
- An Auckland Transport API key from https://dev-portal.at.govt.nz/
```

## Setting Up
1. Place the HTML and JavaScript files in the same directory.
2. Put your AT API key in line 5 of the JavaScript file.
3. The web app should now be able to run.

## Features
* This web app allows the user to search for a bus number which will display the location of every active bus for that number. The user can set it so that the locations update every 30 seconds without having to reload the page or search again.
* Clicking on the bus will show its route name along with occupancy status and next stop information. The map will also plot the location of the next stop for that specific bus.
* The web app can grab the user's location (with their permission) and plot it on the map. It will show all bus stops in a 1km radius. Clicking on a marker will display its live timetable on the left hand timetable box.
* Live bus stop timetables can also be searched by entering the bus stop number, or by clicking on the stop marker from the above function.

## Images of the Web App
![BusAndStopInfo](https://user-images.githubusercontent.com/45221821/63071487-91d04300-bf73-11e9-9558-a22de7b28d00.PNG)
