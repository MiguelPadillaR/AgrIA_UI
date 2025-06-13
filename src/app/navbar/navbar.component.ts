import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngClass/ngIf
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink/routerLinkActive

@Component({
  selector: 'app-navbar',
  // Add CommonModule and RouterModule to imports for standalone components
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  // Initialize isMenuOpen to false, meaning the menu is closed by default
  isMenuOpen: boolean = false;

  constructor() { }

  /**
   * Toggles the state of the mobile menu (open/closed).
   * This method is called when the hamburger icon is clicked.
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen; // Flips the boolean value
    console.log("this.isMenuOpen", this.isMenuOpen)
  }

  /**
   * Closes the mobile menu.
   * This can be useful for closing the menu when a navigation link is clicked,
   * especially in a single-page application where navigating doesn't refresh the page.
   */
  closeMenu(): void {
    this.isMenuOpen = false;
  }
}