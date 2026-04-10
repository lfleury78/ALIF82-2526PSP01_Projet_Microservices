import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-make-reservation',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './make-reservation.html',
  styleUrl: './make-reservation.css',
})
export class MakeReservation implements OnInit {
  selectedLocation: any = null;
  departureDate: string = '';
  arrivalDate: string = '';
  numberOfNights: number = 0;
  totalPrice: number = 0;
  pricePerNight: number = 0;

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
      capacity: 4,
      image: 'https://imgs.search.brave.com/WKzJpWv8MjY58GkSvwk38vkrV_vY5oY-sGOeyXvaAmA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2VudHVyeTIxLmZy/L2ltYWdlc0JpZW4v/czMvMjAyLzI0NjQv/YzIxXzIwMl8yNDY0/XzE2Mzc2XzhfOEQ5/Q0UyOTYtMkIzOS00/Nzg1LTlEODktOUJF/RUZCRkQ1RUI4Lmpw/Zw'
    };
    this.pricePerNight = parseInt(this.selectedLocation.price, 10);
  }

  calculatePrice(): void {
    if (this.departureDate && this.arrivalDate) {
      const departure = new Date(this.departureDate);
      const arrival = new Date(this.arrivalDate);

      if (arrival > departure) {
        const timeDiff = arrival.getTime() - departure.getTime();
        this.numberOfNights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        this.totalPrice = this.numberOfNights * this.pricePerNight;
      } else {
        this.numberOfNights = 0;
        this.totalPrice = 0;
      }
    }
  }

  onDepartureDateChange(): void {
    this.calculatePrice();
  }

  onArrivalDateChange(): void {
    this.calculatePrice();
  }

  submitReservation(): void {
    if (!this.departureDate || !this.arrivalDate || this.numberOfNights <= 0) {
      alert('Veuillez sélectionner des dates valides (l\'arrivée doit être après le départ)');
      return;
    }

    const reservationSummary = {
      location: {
        name: this.selectedLocation.name,
        city: this.selectedLocation.city,
        country: this.selectedLocation.country,
        image: this.selectedLocation.image
      },
      dates: {
        departure: this.departureDate,
        arrival: this.arrivalDate,
        numberOfNights: this.numberOfNights
      },
      pricing: {
        pricePerNight: this.pricePerNight,
        totalPrice: this.totalPrice
      }
    };

    console.log('=== RÉCAPITULATIF DE RÉSERVATION ===');
    console.log('Lieu:', reservationSummary.location);
    console.log('Dates:', reservationSummary.dates);
    console.log('Tarif:', reservationSummary.pricing);
    console.log('====================================');

    alert(`Réservation confirmée!\n\n${this.selectedLocation.name}\n${this.selectedLocation.city}, ${this.selectedLocation.country}\n\nDu ${this.departureDate} au ${this.arrivalDate}\n${this.numberOfNights} nuit(s)\nTotal: ${this.totalPrice}€`);
  }

  cancel(): void {
    this.departureDate = '';
    this.arrivalDate = '';
    this.numberOfNights = 0;
    this.totalPrice = 0;
  }
}
