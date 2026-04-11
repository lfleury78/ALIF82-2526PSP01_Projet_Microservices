import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviews: Review[] = [
    {
      id: 1,
      locationId: 1,
      author: 'Lucas',
      rating: 5,
      comment: 'Très belle location, propre et bien située.',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      locationId: 1,
      author: 'Elhadj',
      rating: 4,
      comment: 'Bon séjour, accueil agréable.',
      createdAt: new Date().toISOString()
    }
  ];

  getReviewsByLocationId(locationId: number): Observable<Review[]> {
    return of(this.reviews.filter(review => review.locationId === locationId));
  }

  addReview(review: Review): Observable<Review> {
    const newReview = {
      ...review,
      id: this.reviews.length + 1,
      createdAt: new Date().toISOString()
    };

    this.reviews.push(newReview);
    return of(newReview);
  }
}
