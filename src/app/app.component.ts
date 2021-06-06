import { Component, OnInit } from '@angular/core';
import { ITruck } from './interfaces';
import { AppService } from './app.service';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Tracker';
  public totalTrucks?: Array<ITruck>; 
  public runningTrucks?: Array<ITruck>;
  public stoppedTrucks?: Array<ITruck>;
  public idleTrucks?: Array<ITruck>;
  public errorTrucks?: Array<ITruck>;
  public filteredList?: Array<ITruck>;
  public center: google.maps.LatLngLiteral;
  public mapOptions: google.maps.MapOptions = {
    mapTypeId: 'hybrid',
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: false,
    maxZoom: 15,
    minZoom: 8,
  }
  public markers: Array<{ position: google.maps.LatLngLiteral, options: google.maps.MarkerOptions}>;
  public activeItem ="total";

  constructor(private appService: AppService) {
    console.log(`AppComponent :: constructor ::constructor initialized`);
  }

  public ngOnInit() {
    console.log(`AppComponent :: ngOnInit ::ngOnInit initialized`);
    if (this.appService) {
      this._updateView();
      this.activateItem('total');

      //currently center position is hard coded
      //TODO: add center position logicaly, so that all location can be bounded
      this.center = {
        lat: 30.75797462463379,
        lng: 76.13279724121094,
      }
    }
  }

  /*
  * This function is called initially from onInit, with 'total'as selected
  * This function is also called from UI header, to filter out the list of trucks at left panel
  * 
  * */
  public activateItem(state_: string){
    console.log(`AppComponent :: activateItem :: Entering with item ${state_}`);
    if (state_ && state_.length && this.totalTrucks && this.totalTrucks.length){
      this.activeItem = state_;
      this.markers.length= 0; //empty the marker array
      switch (state_){
        case "total": 
          this.filteredList = this.totalTrucks;
          console.log(`AppComponent :: filteredList :: all`, this.filteredList);
          break;
        case "running":
          this.filteredList = this.runningTrucks
          console.log(`AppComponent :: filteredList :: running`, this.filteredList);
          break;
        case "stopped":
          this.filteredList = this.stoppedTrucks
          console.log(`AppComponent :: filteredList :: stopped`, this.filteredList);
          break;
        case "idle":
          this.filteredList = this.idleTrucks
          console.log(`AppComponent :: filteredList :: idle`, this.filteredList);
          break;
        case "error":
          this.filteredList = this.errorTrucks
          console.log(`AppComponent :: filteredList :: error`, this.filteredList);
          break;
      }

      //create marker array, with position and title
      this.markers = this.filteredList.map(truck_ => {
        return {
          position:{
            lng: truck_.lastWaypoint.lng,
            lat: truck_.lastWaypoint.lat
          },
          options: {
            label : truck_.truckNumber //truck number as label
          }
        }
      });
      console.log(`AppComponent :: filteredList :: markers`, this.markers);
    }
  }

  /*
  * This function is called to get the elaped time, for start/stop time
  * This function also convert the Epoch time to human readable form
  * Using moment js
  * EPOCH===> elapse time
  * */
  public evaElapsedDuration(epoch_: number){
    const startDate_ = moment(epoch_).format('LLLL');
    const elapsedDuration_ = moment.duration(moment().diff(startDate_));
    if (elapsedDuration_ && elapsedDuration_.isValid){
      if (elapsedDuration_.months()){
        return elapsedDuration_.months()+"m";
      }
      else if (elapsedDuration_.days()){
        return elapsedDuration_.days()+"d";
      }
      else if (elapsedDuration_.hours()) {
        return elapsedDuration_.hours() + "hr";
      }
      else if (elapsedDuration_.milliseconds) {
        return Math.round(elapsedDuration_.asMinutes())+"min";
      }
    }
  }

  /*
  * This method is called on component load to fetch the all trucks from appservice
  * This method also fiters the trucks in diffetent list
  */
  private _updateView() {
    console.log(`AppComponent :: _updateView :: Updating view:`);
    this.appService.getAllTrucks().subscribe((res_: { data: Array<ITruck>}) => {
      console.log(`AppComponent :: ngOnInit :: getAllTrucks API responce :`, res_);
      if (res_ && res_.data && res_.data.length ) {
        this.filteredList = this.totalTrucks = res_.data;
        console.log(`AppComponent :: _updateView :: trucks list:`, this.totalTrucks);

        //running trucks
        this.runningTrucks = this.totalTrucks.filter((truck) => {
          return truck.lastRunningState.truckRunningState === 1;
        });

        //stopped strucks
        this.stoppedTrucks = this.totalTrucks.filter((truck) => {
          return (truck.lastRunningState
            && truck.lastRunningState.truckRunningState === 0
            && truck.lastWaypoint
            && !truck.lastWaypoint.ignitionOn);
        });

        //idle trucks
        this.idleTrucks = this.totalTrucks.filter((truck) => {
          return (truck.lastRunningState
            && truck.lastRunningState.truckRunningState === 0
            && truck.lastWaypoint
            && truck.lastWaypoint.ignitionOn);
        });

        //error trucks
        this.errorTrucks = this.totalTrucks.filter((truck) => {
          return (!truck.lastRunningState
            || !truck.lastWaypoint || (truck.lastWaypoint && (!truck.lastWaypoint.lng || !truck.lastWaypoint.lat)));
        });
      }
    }, err => console.error(err));
  }

}
