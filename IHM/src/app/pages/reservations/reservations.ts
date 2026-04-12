import { Component, OnInit } from '@angular/core';
import { Http } from '../../services/http/http';
import { environment } from '../../../environments/environment';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-reservations',
  imports: [
    RouterLink
  ],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations implements OnInit {
  reservations: any;

  constructor(private httpService: Http) {}

  ngOnInit(): void {
    this.reservations = [
      { id: 1, name: 'Location 1', city:"Paris", country:"France", dateBegin:"25/03/2025", dateEnd:"28/03/2025" },
      { id: 2, name: 'Location 2', city:"London", country:"Angleterre", dateBegin:"01/06/2024", dateEnd:"10/06/2024" },
      { id: 3, name: 'Location 3', city:"New York", country:"États-Unis", dateBegin:"01/06/2024", dateEnd:"10/06/2024" },
      { id: 4, name: 'Location 4', city:"Tokyo", country:"Japon", dateBegin:"01/06/2024", dateEnd:"10/06/2024" }

    ];
    /*
    const url = environment.BACKEND_URL + environment.BACKEND_GET_LOCATIONS;
    this.httpService.getRequest(url).subscribe((res) => {
      this.reservations = res;
    });
    */
  }
}
