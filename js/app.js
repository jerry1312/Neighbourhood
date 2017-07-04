var models = [
  {
    placename: 'Pavitra Jewellers',
    placeID: "ChIJp6XLRjqTDzkRfKbhXWm44a4",
    selection: false,
    show: true,
    lat: 30.711745,
    lng: 76.844899
  },
  {
    placename: 'Talwar Jewellers',
    placeID: "ChIJecW2vKTtDzkRvUTRfC-uFJ8",
    selection: false,
    show: true,
    lat: 30.735037,
    lng: 76.769475
  },
  {
    placename: 'Sunder Jewellers',
    placeID: "ChIJMUlimaftDzkRULygSioUV4U",
    selection: false,
    show: true,
    lat: 30.725833, 
    lng: 76.759319
  },
  {
    placename: 'Saraf The Jeweller',
    placeID: "ChIJO1VVVSmTDzkRT9GnMsZrVD4",
    selection: false,
    show: true,
    lat: 30.716733, 
    lng: 76.833031
  },
  {
    placename: 'Anurag Jewellers',
    placeID: "ChIJZeyM0zuTDzkR-Nu1aCvbkPw",
    selection: false,
    show: true,
    lat: 30.719528, 
    lng: 76.831700
  },

  {
    placename: 'Tanishq Jewellers',
    placeID: "ChIJBwAAAEPtDzkRAkqVZ-E5-es",
    selection: false,
    show: true,
    lat: 30.710207,
    lng: 76.839452
  },
  {
    placename: 'PC Jewellers',
    placeID: "ChIJ_____67tDzkR9Ugr1gEZenI",
    selection: false,
    show: true,
    lat: 30.735499, 
    lng: 76.768950
  },
  {
    placename: 'Ganpati Jewellers',
    placeID: "ChIJGZR0rTGTDzkR93Th6znuphk",
    selection: false,
    show: true,
    lat: 30.708938, 
    lng: 76.840081
  },
  {
    placename: 'Navkarr Jewellers',
    placeID: "ChIJnRqq1LLtDzkRgTq-8ZLoM0A",
    selection: false,
    show: true,
    lat: 30.718414, 
    lng: 76.765721
  },


];





var viewModel = function () {

  var self = this;

  self.error = ko.observable('');
  self.place_input = ko.observable('');
  self.selected_place = ko.observableArray([]);
  //This function take in color  and then create a new marker

  self.makeMarkerIcon = function (markerColor) {

    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
    return markerImage;
  };

  var highlightedIcon = self.makeMarkerIcon('blue');
  var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
  var myIcon = iconBase + "info-i_maps.png";

  models.forEach(function (counter) {

    var marker = new google.maps.Marker({
      placename: counter.placename,
      position: { lat: counter.lat, lng: counter.lng },
      show: ko.observable(counter.show),
      placeID: counter.placeID,
      selection: ko.observable(counter.selection),
      animation: google.maps.Animation.DROP,
      map: map,
      icon: myIcon,
      id: 1
    });

    self.selected_place.push(marker);

    marker.addListener('mouseout', function () {
      this.setIcon(myIcon);
    });

    marker.addListener('mouseover', function () {
      this.setIcon(highlightedIcon);
    });

    marker.addListener('click', function () {
      self.makeBounce(marker);
      self.populateInfoWindow(this, largeInfowindow);
      self.addApiInfo(marker);

    });
  });

  var largeInfowindow = new google.maps.InfoWindow();
  self.no_places = self.selected_place.length;
  self.current_place = self.selected_place[0];

  self.populateInfoWindow = function (marker, infowindow) {

    // Check  infowindow is not already opened through marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content streetview to load.
      infowindow.setContent();
      infowindow.marker = marker;
      //  marker property is cleared if  infowindow is closed.
      infowindow.addListener('closeclick', function () {
        if (infowindow.marker !== null)
          infowindow.marker.setAnimation(null);
        infowindow.marker = null;
      });

      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;

      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options

      self.getStreetView = function (data, status) {

        if (status == google.maps.StreetViewStatus.OK) {

          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);

          infowindow.setContent('<div>' + marker.placename + '</div><div id="pano"></div>');

          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };

          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        }

        else {
          infowindow.setContent('<div>' + marker.placename + '</div>' +
            '<div>No Street View Found</div>');
        }

      };



    }

  };
  self.makeBounce = function (counter_marker) {
    counter_marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () { counter_marker.setAnimation(null); }, 700);
  };

  self.addApiInfo = function (counter_marker) {
    $.ajax({
      url: "https://api.foursquare.com/v2/venues/" + counter_marker.placeID + '?client_id=Q30KETWVBUFQQ4W3NSYKWZCFKFZXB1XENK3IPAVIAUEDF3Y5&client_secret=TGBBXRCXFGGH4WS3YLL2BY0MHXMPKQD51B4DSTMXEDUSPWN0&v=20170603',
      dataType: "json",
      success: function (data) {

        var out = data.response.venue;
        counter_marker.likes = out.likes.summary ? out.likes.summary : "No info available";
        counter_marker.rating = out.hasOwnProperty('rating') ? out.rating : "No info Available";
        infowindow.setContent('<div>' + counter_marker.placename + '</div><p>Likes: ' +
          counter_marker.likes + '</p><p>Rating: ' +
          counter_marker.rating + '</p><div id="pano"></div>');
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        streetViewService.getPanoramaByLocation(counter_marker.position, radius, self.getStreetView);
        infowindow.open(map, counter_marker);
      },
      error: function (e) {
        self.error("Foursquare data is invalid,Please Try Again ");
      }
    });
  };

  self.dMark = function (marker) {

    google.maps.event.trigger(marker, 'click');
  };
  self.filterText = ko.observable('');


  // calls every keydown from input box
  self.applyFilter = function() {

    var currentFilter = self.place_input();
    infowindow.close();

    //filter the list as user seach
    if (currentFilter.length === 0) {
			self.setAllShow(true);
		} else {
			for (var i = 0; i < self.selected_place().length; i++) {
				if (self.selected_place()[i].placename.toLowerCase().indexOf(currentFilter.toLowerCase()) > -1) {
					self.selected_place()[i].show(true);
					self.selected_place()[i].setVisible(true);
				} else {
					self.selected_place()[i].show(false);
					self.selected_place()[i].setVisible(false);
				}
			}
    }
    infowindow.close();
  };

  // to make all marker visible
  self.setAllShow = function(showVar) {
    for (var i = 0; i < self.selected_place().length; i++) {
      self.selected_place()[i].show(showVar);
      self.selected_place()[i].setVisible(showVar);
    }
  };

  self.setAllUnselected = function() {
		for (var i = 0; i < self.no_places; i++) {
			self.selected_place()[i].selection(false);
		}
	};

  
};

var map;
var infoWindow;

function initMap() {
  //create a style array to use with the map.
  var styles = [
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -40 }
      ]
    },
    {
      featureType: 'water',
      stylers: [
        { color: '#19a0d8' }
      ]
    },
    {
      featureType: 'administrative',
      elementType: 'labels.text.stroke',
      stylers: [
        { color: '#ffffff' },
        { weight: 6 }
      ]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [
        { lightness: 100 }
      ]
    },
    {
      featureType: 'transit.station',
      stylers: [
        { weight: 9 },
        { hue: '#e85113' }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.icon',
      stylers: [
        { visibility: 'off' }
      ]
    },
    {
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        { color: '#e85113' }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -25 }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        { visibility: 'on' },
        { color: '#f0e4d3' }
      ]
    }
  ];
  map = new google.maps.Map(
    document.getElementById('map'), {
      center: { lat: 30.723490, lng: 76.767508 },
      zoom: 12,
      mapTypeControl: false,
      styles: styles
    });
  infowindow = new google.maps.InfoWindow();
  ko.applyBindings(new viewModel());
}

function errorHandling() {
  alert("Error Loading Google Maps API!");
}
