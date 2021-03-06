import { Component, NgModule, NgZone, OnInit, ViewChild, ElementRef, Directive, Input, Output  } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { AgmCoreModule, MapsAPILoader, GoogleMapsAPIWrapper } from '@agm/core';
import { SessionService } from '../session.service';

declare var google:any;
declare var $:any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers : [ GoogleMapsAPIWrapper ]
})

export class MapComponent implements OnInit {

  alertShow: boolean = false;
  alertMessage: string;

  public saveTest: string;

  public user: any;
  public error: string;
  public userPlaces: any;
  public userPlacesRoute: any;

  public placeInfo = {
    user: '',
    place: '',
    time: '',
    type: '',
    mapBD: []
  };

  public latitude: number;
  public longitude: number;

  public zoom: number;
  public iconurl: string;
  public mapCustomStyles : any;

  typeSearch;
  origin;
  timeOrigin;
  location;
  destination;
  timeDestination;
  dataComplete = false;

  userTime;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private gmapsApi: GoogleMapsAPIWrapper,
    private _elementRef : ElementRef,
    private session: SessionService
  ) {}

  ngOnInit() {

    this.user = this.session.user;

    //set google maps defaults
    this.zoom = 4;
    this.latitude =25.7617;
    this.longitude = 80.1918;
    this.iconurl = "../../assets/img/p-c.png";
    this.mapCustomStyles = [
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{"color": "#e9e9e9"},{"lightness": 17}]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [{"color": "#f5f5f5"},{"lightness": 20}]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#ffffff"},{"lightness": 17}]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{"color": "#ffffff"},{"lightness": 29},{"weight": 0.2}]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{"color": "#ffffff"},{"lightness": 18}]
      },
      {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [{"color": "#ffffff"},{"lightness": 16}]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{"color": "#f5f5f5"},{"lightness": 21}]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{"color": "#dedede"},{"lightness": 21}]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [{"visibility": "on"},{"color": "#ffffff"},{"lightness": 16}]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [{"saturation": 36},{"color": "#333333"},{"lightness": 40}]
      },
      {
        "elementType": "labels.icon",
        "stylers": [{"visibility": "off"}]
      },
      {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [{"color": "#f2f2f2"},{"lightness": 19}]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [{"color": "#fefefe"},{"lightness": 20}]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [{"color": "#fefefe"},{"lightness": 17},{"weight": 1.2}]
      }
    ]

    this.setCurrentPosition();

  }

  private dataCompleteFalse(){
    this.dataComplete = false;
  }

  private setPickUpLocation( place:any ) {
    //verify result
    if (place.geometry === undefined || place.geometry === null) {
      return;
    }
    //set latitude, longitude and zoom
    this.latitude = place.geometry.location.lat();
    this.longitude = place.geometry.location.lng();
    this.zoom = 12;
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  public secondsToTime(secs) {
     secs = Math.round(secs);
     var hours = Math.floor(secs / (60 * 60));

     var divisor_for_minutes = secs % (60 * 60);
     var minutes = Math.floor(divisor_for_minutes / 60);

     var divisor_for_seconds = divisor_for_minutes % 60;
     var seconds = Math.ceil(divisor_for_seconds);

     var t = hours + ":" + minutes + ":" + seconds;

     return t;
  }

  private getMapCustomStyles() {
    // Write your Google Map Custom Style Code Here.
  }

  alertChange(){
    this.alertShow = false
  }

  originSelected(originAll){
    this.origin = originAll;
  }

  typeSelect(value){
    this.typeSearch = value;
  }

  destinationSelected(destinationAll){
    this.destination = destinationAll;
    this.location = destinationAll.location;


    this.userTime = (this.destination.minutes - this.origin.minutes) * 60;
    this.userTime = this.secondsToTime(this.userTime);
    this.dataComplete = true;
  }

  dataRoute(data){
    this.userPlacesRoute = data;
  }

  showRoute(route){
    this.userPlaces = route;
  }

  getAlert(alert){
    this.alertShow = alert.alertShow;
    this.alertMessage = alert.alertMessage;
  }

  setMapRoute(){

    this.alertShow = true
    this.alertMessage = "The route has been SAVED, check on your profiles"

    this.placeInfo.user = this.user._id;
    this.placeInfo.place = this.location.vicinity;
    this.placeInfo.time = this.userTime;
    this.placeInfo.type = this.typeSearch;
    for(var i = 0; i < this.userPlaces.length;i++){
      this.placeInfo.mapBD.push(
        {
          icon: this.userPlaces[i].photos[0].getUrl({'maxWidth': 150, 'maxHeight': 150}),
          name: this.userPlaces[i].name,
          vicinity: this.userPlaces[i].vicinity,
        }
      );
    }
    this.session.postMapRoute(this.placeInfo)
    .subscribe(
      (user) => this.successCb(user),
      (err) => this.errorCb(err)
    );
  }

  errorCb(err) {
    this.error = err;
    this.user = null;
  }

  successCb(user) {
    this.user = user;
    this.error = null;
  }


}
