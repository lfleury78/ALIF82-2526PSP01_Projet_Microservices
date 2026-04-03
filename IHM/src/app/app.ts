import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBar } from './shared/nav-bar/nav-bar';
import { HomePage } from './pages/home-page/home-page';

@Component({
  selector: 'app-root',
  imports: [CommonModule, NavBar, HomePage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('IHM');
}
