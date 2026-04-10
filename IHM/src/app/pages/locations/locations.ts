import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-locations',
  imports: [RouterModule],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class Locations implements OnInit {
  public listLocations: any[] = [];

  ngOnInit(): void {
    this.getLocations();
  }

  getLocations(): void {
        this.listLocations = [
      { id: 1, name: 'Location 1', description: 'Description for Location 1', price:"100", city:"Paris", capacity: 4, country:"France" },
      { id: 2, name: 'Location 2', description: 'Description for Location 2', price:"200", city:"London", capacity: 6, country:"Angleterre" },
      { id: 3, name: 'Location 3', description: 'Description for Location 3', price:"300", city:"New York", capacity: 8, country:"États-Unis" },
      { id: 4, name: 'Location 4', description: 'Description for Location 4', price:"400", city:"Tokyo", capacity: 10, country:"Japon" }

    ];
  }

}
