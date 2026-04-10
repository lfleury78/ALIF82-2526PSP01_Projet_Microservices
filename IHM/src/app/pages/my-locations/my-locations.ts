import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-locations',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-locations.html',
  styleUrl: './my-locations.css',
})
export class MyLocations implements OnInit {
  public myLocationsList: any[] = [];
  showAddForm = false;
  newLocation = {
    name: '',
    description: '',
    price: '',
    city: '',
    country: '',
    capacity: ''
  };

  ngOnInit(): void {
    this.loadMyLocations();
  }

  loadMyLocations(): void {
    this.myLocationsList = [
      { 
        id: 1, 
        name: 'Studio Parisien Vue Tour Eiffel', 
        description: 'Un magnifique studio avec une vue spectaculaire sur la Tour Eiffel.', 
        price: '150', 
        city: 'Paris', 
        capacity: 2, 
        country: 'France' 
      },
      { 
        id: 2, 
        name: 'Appartement Cosy à Lyon', 
        description: 'Petit appartement chaleureux au cœur du Vieux Lyon.', 
        price: '95', 
        city: 'Lyon', 
        capacity: 3, 
        country: 'France' 
      },
      { 
        id: 3, 
        name: 'Villa de Luxe en Provence', 
        description: 'Belle villa avec piscine et jardin au calme.', 
        price: '250', 
        city: 'Aix-en-Provence', 
        capacity: 6, 
        country: 'France' 
      }
    ];
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addLocation(): void {
    if (!this.newLocation.name || !this.newLocation.description || !this.newLocation.price || 
        !this.newLocation.city || !this.newLocation.country || !this.newLocation.capacity) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const location = {
      id: Math.max(...this.myLocationsList.map(l => l.id), 0) + 1,
      ...this.newLocation,
      capacity: parseInt(this.newLocation.capacity, 10)
    };

    this.myLocationsList.push(location);

    alert(`Location "${this.newLocation.name}" ajoutée avec succès!`);
    this.resetForm();
    this.showAddForm = false;
  }

  deleteLocation(id: number): void {
    const location = this.myLocationsList.find(l => l.id === id);
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${location.name}" ?`)) {
      this.myLocationsList = this.myLocationsList.filter(l => l.id !== id);
      alert(`Location "${location.name}" supprimée!`);
    }
  }

  resetForm(): void {
    this.newLocation = {
      name: '',
      description: '',
      price: '',
      city: '',
      country: '',
      capacity: ''
    };
  }

  editLocation(id: number): void {
    console.log(`Édition de la location avec l'ID: ${id}`);
    alert('Fonctionnalité d\'édition à venir');
  }
}
