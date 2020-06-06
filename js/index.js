
 var map;
 var markers = [];
 var infoWindow;
 var currLatitude;
 var currLongitude;

 function initMap() {
    var losAngeles = {
        lat: 34.063380,
        lng: -118.358080
    }
     map = new google.maps.Map(document.getElementById('map'), {
     center: losAngeles,
     zoom: 8,
     styles: [
        {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{color: '#263c3f'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#6b9a76'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#38414e'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{color: '#212a37'}]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{color: '#9ca5b3'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#746855'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#1f2835'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{color: '#f3d19c'}]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{color: '#2f3948'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{color: '#17263c'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#515c6d'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#17263c'}]
        }
     ]
     });

     infoWindow = new google.maps.InfoWindow();
     searchStores();
     setOnClickListener();
     getLocation();
 }

 function displayStores (stores) {
     var storesList ="";
     var address;
     var phone;
    stores.forEach(function(store, index) {
        address = store.addressLines;
        phone = store.phoneNumber;
        storesList += `
        <div class="store-container">
            <div class="store-container-background">
                <div class="store-info-container"> 
                    <div class="store-address">
                        <span>${address[0]}</span> 
                        <span>${address[1]}</span>
                    </div>
                    <div class="store-phone-number">${phone}</div>
                </div>
                <div class="store-number-container">
                    <div class="store-number">${index+1}</div>
                </div>
            </div>
        </div>
        `
    });
    document.querySelector('.stores-list').innerHTML = storesList;
   }

   /* Show stores pin markers on map */
   function showStoresMarker(stores, search) {
    var latlng;
    var name;
    var address;
    var statusText;
    var phoneNumber;
    var bounds = new google.maps.LatLngBounds();
    stores.forEach(function(store, index) {
    latlng = new google.maps.LatLng(
        store.coordinates.latitude,
        store.coordinates.longitude);
    name = store.name;
    address = store.addressLines[0];
    statusText = store.openStatusText;
    phoneNumber = store.phoneNumber;
    
    createMarker(latlng, name, address, statusText, phoneNumber, index);
    setMarkerDirections(store.coordinates.latitude, store.coordinates.longitude, index);
    setMarkerAnimations(markers[index], search)
    bounds.extend(latlng);
   });
   map.fitBounds(bounds);
}

function setMarkerAnimations (marker, search) {
    if (search == true)
        marker.setAnimation(google.maps.Animation.BOUNCE);
    else
        marker.setAnimation(google.maps.Animation.DROP);
}

function createMarker(latlng, name, address, statusText, phoneNumber, index) {
var html = `
    <div class="store-info-window">
        <div class="store-info-name">
            ${name}
        </div>
        <div class="store-info-status">
            ${statusText}
        </div>
        <div id="store-address-id" class="store-info-address">
            <div class="circle">
                <i class="fas fa-location-arrow"></i>
            </div>
            ${address}
        </div>
        <div class="store-info-phone">
            <div class="circle">
                <i class="fas fa-phone-alt"></i>
            </div>
            ${phoneNumber}
        </div>
    </div>
    `
var marker = new google.maps.Marker({
    map: map,
    position: latlng,
    label: `${index+1}`,
});

google.maps.event.addListener(marker, 'mouseover', function() {
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
});
markers.push(marker);
}

function setMarkerDirections(lat, long, index) {
google.maps.event.addListener(markers[index], 'click', function() {
    setOnClickListenerAddress(lat, long);
});
}

/* Open the info window marker on store selection in stores list */
function setOnClickListener() {
    var storeElements = document.querySelectorAll('.store-container');
    storeElements.forEach(function(elem, index) {
        elem.addEventListener('click', function() {
            google.maps.event.trigger(markers[index], 'mouseover');
        })
    })
}

function clearLocations(){
infoWindow.close();
for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
}
markers.length = 0; /* Find out why */
}

/* Allow a user to search for the stores using zip code */
function searchStores() {
    var search = false;
    var zipCode = document.getElementById('zip-code-input').value;
    if (zipCode) {
    var foundStores = [];
    stores.forEach(function(store){
        var postal = store.address.postalCode.substring(0,5);
        if (zipCode == postal) {
            foundStores.push(store);
        }
    });
    search = true;
    clearLocations();
} else {
    foundStores = stores; 
}
displayStores(foundStores);
showStoresMarker(foundStores, search);
}

function saveCurrentLocation(position) {
    currLatitude = position.coords.latitude;
    currLongitude = position.coords.longitude;
    console.log(currLatitude, currLongitude);
 }

function errorHandler(err) {
    if(err.code == 1) {
       alert("Error: Access is denied!");
    } else if( err.code == 2) {
       alert("Error: Position is unavailable!");
    }
 }

function getLocation(){
    if(navigator.geolocation){
       // timeout at 60000 milliseconds (60 seconds)
       var options = {timeout:60000};
       navigator.geolocation.getCurrentPosition
       (saveCurrentLocation, errorHandler, options);
    } else{
       alert("Sorry, browser does not support geolocation!");
    }
 }

function setOnClickListenerAddress(lat, lng) {
    
            var url = "https://www.google.com/maps/dir/?api=1";
            var origin = "&origin=" + currLatitude + "," + currLongitude;
            var destination = "&destination=" + lat + "," + lng;
            var newUrl = new URL(url + origin + destination);
            console.log(newUrl);
            window.open(newUrl, '_blank');

            
}