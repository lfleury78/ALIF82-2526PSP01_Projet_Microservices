import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-location',
  imports: [CommonModule, RouterModule],
  templateUrl: './location.html',
  styleUrl: './location.css',
})
export class Location implements OnInit {
  selectedLocation: any = null;

  ngOnInit(): void {
    this.loadLocation();
  }

  loadLocation(): void {
    this.selectedLocation = {
      id: 1,
      name: 'Location 1',
      description: 'Description détaillée de Location 1. C\'est une magnifique propriété avec une vue spectaculaire.',
      price: '100',
      city: 'Paris',
      country: 'France',
      capacity: 4
    };
  }
}
