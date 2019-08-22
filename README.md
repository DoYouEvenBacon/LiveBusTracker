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
![1_initialView](https://user-images.githubusercontent.com/45221821/63489649-cbbabf80-c506-11e9-8865-c55d5107bd97.PNG)
![2_showLocationStops](https://user-images.githubusercontent.com/45221821/63489653-ceb5b000-c506-11e9-8717-0f9411b94552.PNG)
![3_clickStopMarker](https://user-images.githubusercontent.com/45221821/63489661-d2493700-c506-11e9-87d3-7eec8a6b6b38.PNG)
![4_searchBus](https://user-images.githubusercontent.com/45221821/63489666-d412fa80-c506-11e9-9cf7-6bb983668a22.PNG)
![4-5_searchBus](https://user-images.githubusercontent.com/45221821/63489669-d70deb00-c506-11e9-817d-746533cdb919.PNG)
![5_autoUpdateBusLocation](https://user-images.githubusercontent.com/45221821/63489674-d9704500-c506-11e9-8001-cb2568e16965.PNG)
![6_clickBusLiveInformation](https://user-images.githubusercontent.com/45221821/63489677-dbd29f00-c506-11e9-9605-66da0ad2c1e8.PNG)
![7_clickStopInformation](https://user-images.githubusercontent.com/45221821/63489681-de34f900-c506-11e9-90c9-dc7300bff78a.PNG)
![8_searchStopNumber](https://user-images.githubusercontent.com/45221821/63489689-dffebc80-c506-11e9-9338-5fc0509fbec4.PNG)
![8-5_searchStopNumber](https://user-images.githubusercontent.com/45221821/63489691-e1c88000-c506-11e9-9a14-9ba92dc21ae9.PNG)
