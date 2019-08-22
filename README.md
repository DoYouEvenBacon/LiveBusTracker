# LiveBusTracker
This web app is powered by Auckland Transport API and OpenLayers API which is based on OpenStreetMaps.

## Requirements
- The latest web browser. (This web app was developed in Google Chrome. Certain css animations might not work in Safari.)
- [An Auckland Transport API key](https://dev-portal.at.govt.nz/).



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
- The inital view of the web app
![1_initialView](https://user-images.githubusercontent.com/45221821/63489649-cbbabf80-c506-11e9-8865-c55d5107bd97.PNG)
<br/><br/><br/>
- User location and the locations of bus stops within a 1 km radius are shown when the "Show My Location and Stops" button is pressed.
![2_showLocationStops](https://user-images.githubusercontent.com/45221821/63489653-ceb5b000-c506-11e9-8717-0f9411b94552.PNG)
<br/><br/>
- When the user clicks on one of the bus stop markers from the above feature, the web app automatically searches the live timetable of that stop.
![3_clickStopMarker](https://user-images.githubusercontent.com/45221821/63489661-d2493700-c506-11e9-87d3-7eec8a6b6b38.PNG)
<br/><br/><br/>
- The user can enter a bus number and the web app will display the location of all active buses of that number at the current time.
![4_searchBus](https://user-images.githubusercontent.com/45221821/63489666-d412fa80-c506-11e9-9cf7-6bb983668a22.PNG)
![4-5_searchBus](https://user-images.githubusercontent.com/45221821/63489669-d70deb00-c506-11e9-817d-746533cdb919.PNG)
<br/><br/>
- There is a button that will toggle an automatic update of the bus locations. The web app doesn't automatically do it to reduce the number of calls made to the Auckland Transport APIs. 
![5_autoUpdateBusLocation](https://user-images.githubusercontent.com/45221821/63489674-d9704500-c506-11e9-8001-cb2568e16965.PNG)
<br/><br/>
- Clicking on one of the live bus icons will show a popup box with information about that bus, including the seat capacity and the time and location of its next stop.
![6_clickBusLiveInformation](https://user-images.githubusercontent.com/45221821/63489677-dbd29f00-c506-11e9-9605-66da0ad2c1e8.PNG)
<br/><br/>
- The blue background bus icon indicates the next stop for the bus connected by a blue line.
![7_clickStopInformation](https://user-images.githubusercontent.com/45221821/63489681-de34f900-c506-11e9-90c9-dc7300bff78a.PNG)
<br/><br/><br/>
- The third main feature of the web app allows the user to search a bus stop number and see the live timetable; the same timetable they would see on the electronic board at the stop.
![8_searchStopNumber](https://user-images.githubusercontent.com/45221821/63489689-dffebc80-c506-11e9-9338-5fc0509fbec4.PNG)
![8-5_searchStopNumber](https://user-images.githubusercontent.com/45221821/63489691-e1c88000-c506-11e9-9a14-9ba92dc21ae9.PNG)
