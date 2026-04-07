import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBar } from './shared/nav-bar/nav-bar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, NavBar, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('IHM');
}
