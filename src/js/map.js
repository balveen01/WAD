//set map

var myLatLng = { lat: 1.3521, lng: 103.8198 };
var mapOptions = {
  center: myLatLng,
  zoom: 13,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};

var markerArray = [];
//create map

var map = new google.maps.Map(document.getElementById('map'), mapOptions)

//create a directions service object

var directionsService = new google.maps.DirectionsService();

//create a directionsRenderer object which we will use to display route
var rendererOptions = {
  map: map
}

var directionsRenderer = new google.maps.DirectionsRenderer(rendererOptions);

//bind the directionsRenderer to the map 

directionsRenderer.setMap(map);

// Instantiate an info window to hold step text.
stepDisplay = new google.maps.InfoWindow();


//function 

function calcRoute() {
  //create request 
  const selectedMode = document.getElementById('mode').value;
 
  var request = {
    origin: document.getElementById('from').value,
    destination: document.getElementById('to').value,
    travelMode: google.maps.TravelMode[selectedMode],//WALKING,BICYCLING AND TRANSIT
    unitSystem: google.maps.UnitSystem.METRIC
  }

  //Pass the request to the route metthod
  directionsService.route(request, (result, status) => {
    if (status == google.maps.DirectionsStatus.OK) {

      //get distance and time 

      const output = document.querySelector('#output');
      const destination = document.getElementById('to').value
      const source = document.getElementById('from').value

      var toSave = {}
      toSave['source'] = source
      toSave['destination'] = destination
      var route = []

      for (const point of result.routes[0].overview_path) {
        route.push({
          lat: point.lat(),
          lng: point.lng()
        })
      }
      toSave['route'] = route

      if (user_detail != null) {
        var useremail = JSON.parse(localStorage.getItem("users")).email

        toSave['email'] = useremail
      }

      //display route
      directionsRenderer.setDirections(result);
      showSteps(result);

      output.innerHTML = "<div class='alert-info fs-4'><br><b>Distance: </b>" + result.routes[0].legs[0].distance.text + "<br/><b>Duration: </b> " + result.routes[0].legs[0].duration.text + "</div><br>";
    } else {
      //delete route from map 
      directionsRenderer.setDirections({ routes: [] });

      //center map in spain 
      map.setCenter(myLatLng);

      //show error msg
      output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Could not retrieve distance </div>"
    }
  })

  function showSteps(directionResult) {
    // For each step, place a marker, and add the text to the marker's
    // info window. Also attach the marker to an array so we
    // can keep track of it and remove it when calculating new
    // routes.
    steps.innerHTML = "<b>Directions:</b> <br><br>"
    var myRoute = directionResult.routes[0].legs[0];
    for (var i = 0; i < myRoute.steps.length; i++) {
      var marker = new google.maps.Marker({
        position: myRoute.steps[i].start_point,
        map: map
      });
      attachInstructionText(marker, myRoute.steps[i].instructions);
      markerArray[i] = marker;
      steps.innerHTML += "<li>" + myRoute.steps[i].instructions + "</li><hr>"
    }
  }

  function attachInstructionText(marker, text) {
    google.maps.event.addListener(marker, 'click', function () {
      stepDisplay.setContent(text);
      stepDisplay.open(map, marker);
    });
  }



}



//create autocomplete objects for all input 

var options = {
  types: ['establishment'],
  componentRestrictions: { 'country': ['SG'] },
}

var input1 = document.getElementById('from');
var autocomplete1 = new google.maps.places.Autocomplete(input1, options)

var input2 = document.getElementById('to');
var autocomplete2 = new google.maps.places.Autocomplete(input2, options)