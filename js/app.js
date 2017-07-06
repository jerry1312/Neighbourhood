var places = [
  {
    placename: 'Siddharth Jewellers',
    placeID: "4ed9f8137ee5e8e3e65285ec",
    selection: false,
    show: true,
    lat: 30.736847,
    lng: 76.749300
  },
  {
    placename: 'Talwar Jewellers',
    placeID: "4db832a2f7b15ca52ce4c975",
    selection: false,
    show: true,
    lat: 30.735002, 
    lng: 76.769505
  },
  {
    placename: 'Jagdish Jewellers',
    placeID: "5107c64be4b0addb4bb276cb",
    selection: false,
    show: true,
    lat: 30.728421, 
    lng: 76.770890
  },
  {
    placename: 'Krishna Jeweller',
    placeID: "5704b503498e01f40606efa3",
    selection: false,
    show: true,
    lat: 30.724702,  
    lng: 76.759249
  },
  {
    placename: 'Pure Gold Jewellers',
    placeID: "519322da498e1228f7f01c85",
    selection: false,
    show: true,
    lat: 30.705893, 
    lng: 76.800629
  },

  {
    placename: 'Kushals Fashion Jewellery',
    placeID: "51a099a0498e1473b6e3e5a1",
    selection: false,
    show: true,
    lat: 30.705554, 
    lng: 76.801233
  },
  {
    placename: 'MoolJI Diamonds',
    placeID: "511659afe4b0805e11936b78",
    selection: false,
    show: true,
    lat: 30.725328,  
    lng: 76.805696
  },
  {
    placename: 'Tanishq',
    placeID: "5177b676e4b0621d2e03041c",
    selection: false,
    show: true,
    lat: 30.710216,
    lng: 76.839584
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

  var highlightedIcon = self.makeMarkerIcon('green');
  var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
  var mynewIcon = iconBase + "ranger_station.png";


  places.forEach(function (index_marker) {

    var marker = new google.maps.Marker({
      placename: index_marker.placename,
      position: { lat: index_marker.lat, lng: index_marker.lng },
      show: ko.observable(index_marker.show),
      map: map,
      selection: ko.observable(index_marker.selection),
      animation: google.maps.Animation.DROP,
      placeID: index_marker.placeID,
      icon: mynewIcon,
      id: 1
    });

    self.selected_place.push(marker);

    marker.addListener('mouseout', function () {
      this.setIcon(mynewIcon);
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
      infowindow.setContent('');
      infowindow.marker = marker;
      //  marker property is cleared if  infowindow is closed.
      infowindow.addListener('closeclick', function () {
        if (infowindow.marker !== null)
        infowindow.marker = null;
      infowindow.marker.setAnimation(null);
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
    setTimeout(function () { counter_marker.setAnimation(null); }, 999);
  };

  self.addApiInfo = function (counter_marker) {
    $.ajax({
      url: "https://api.foursquare.com/v2/venues/" + counter_marker.placeID + '?client_id=Q30KETWVBUFQQ4W3NSYKWZCFKFZXB1XENK3IPAVIAUEDF3Y5&client_secret=TGBBXRCXFGGH4WS3YLL2BY0MHXMPKQD51B4DSTMXEDUSPWN0&v=20170603',
      dataType: "json",
      success: function (data) {

        var out = data.response.venue;
        counter_marker.likes = out.hasOwnProperty('likes') ? out.likes.summary : "Not Available";
        counter_marker.rating = out.hasOwnProperty('rating') ? out.rating : "Not Available";
        infowindow.setContent('<div id="placeinfo">' + '<h4>'+counter_marker.placename+'</h4>' + '<h5>'+'No. Of Likes: ' +
          counter_marker.likes + '</br></br>Ratings: ' +
          counter_marker.rating+'</h5>'+'</div>' );
       
        infowindow.open(map, counter_marker);
      },
      error: function (e) {
        self.diserror("Foursquare Data is Invalid ");
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

