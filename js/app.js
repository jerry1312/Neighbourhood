var models = [
  {
    placename: 'Pavitra Jewellers',
    cinemaID: "ChIJp6XLRjqTDzkRfKbhXWm44a4",
    selection: false,
    show: true,
    lat: 30.711745,
    lng: 76.844899
  },
  {
    placename: 'Talwar Jewellers',
    cinemaID: "50a351abe4b0850330656105",
    selection: false,
    show: true,
    lat: 30.735037,
    lng: 76.769475
  },
  {
    placename: 'Sunder Jewellers',
    cinemaID: "50d43c3ce4b0621a680d3bf6",
    selection: false,
    show: true,
    lat: 30.725833, 
    lng: 76.759319
  },
  {
    placename: 'Saraf The Jeweller',
    cinemaID: "4ccc5d0975dcbfb7d05ba764",
    selection: false,
    show: true,
    lat: 30.716733, 
    lng: 76.833031
  },
  {
    placename: 'Anurag Jewellers',
    cinemaID: "51c480e1498e73948d26e8be",
    selection: false,
    show: true,
    lat: 30.719528, 
    lng: 76.831700
  },

  {
    placename: 'Tanishq Jewellers',
    cinemaID: "4b40c527f964a520eaba25e3",
    selection: false,
    show: true,
    lat: 30.710207,
    lng: 76.839452
  },
  {
    placename: 'PC Jewellers',
    cinemaID: "58d528a1da54ae3953b2f523",
    selection: false,
    show: true,
    lat: 30.735499, 
    lng: 76.768950
  },
  {
    placename: 'Ganpati Jewellers',
    cinemaID: "4da43e5463b5a35d20a4211a",
    selection: false,
    show: true,
    lat: 30.708938, 
    lng: 76.840081
  },
  {
    placename: 'Navkarr Jewellers',
    cinemaID: "5207dd7d8bbd2f9376e1dce0",
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
      cinemaID: counter.cinemaID,
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
      url: "https://api.foursquare.com/v2/venues/" + counter_marker.cinemaID + '?client_id=33RUTCVQOVXUZGPGME4T05JGXH010VRWMGVBKLKKVTZR52GK&client_secret=BIG1WPWORXNTJGB55HJ5XKRZYXVJDITSLJ12KFPMXAEBJILT&v=20170527',
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

    var currentFilter = self.filterText();
    infowindow.close();

    //filter the list as user seach
    if (currentFilter.length === 0) {
			self.setAllShow(true);
		} else {
			for (var i = 0; i < self.no_places; i++) {
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
    for (var i = 0; i < self.no_places; i++) {
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