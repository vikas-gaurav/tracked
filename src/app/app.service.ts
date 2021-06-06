import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(private http: HttpClient ) { 
    console.log(`AppService :: constructor ::constructor initialized`);
  }

  private readonly apiUrl = "https://api.mystral.in/tt/mobile/logistics/searchTrucks?auth-company=PCH&companyId=33&deactivated=false&key=g2qb5jvucg7j8skpu5q7ria0mu&q-expand=true&q-include=lastRunningState,lastWaypoint";

  //get all trucke
  public getAllTrucks(){
    console.log(`AppService :: getAllTrucks :: Entering...`);
    return this.http.get(this.apiUrl);
  }
}
