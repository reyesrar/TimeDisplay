import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BarPortraitComponent } from './bar-portrait.component';
import { FishTankComponent } from './fish-tank.component';
import { DesktopTimeDisplayComponent } from './desktop-time-display.component';
import { BinaryLedsComponent } from './binary-leds.component';
import { FlowerClockComponent } from './flower-clock.component';
import { MagicBookComponent } from './magic-book.component';
import { TvClockComponent } from './tv-clock.component';
import { BookshelfClockComponent } from './bookshelf-clock.component';
import { WebBrowserClockComponent } from './web-browser-clock.component';
import { PizzaClockComponent } from './pizza-clock.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BarPortraitComponent,
    FishTankComponent,
    DesktopTimeDisplayComponent,
    BinaryLedsComponent,
    FlowerClockComponent,
    MagicBookComponent,
    TvClockComponent,
    BookshelfClockComponent,
    WebBrowserClockComponent,
    PizzaClockComponent,
  ],
  template: `
    <div *ngIf="!authenticated; else mainApp" class="auth-container">
      <div *ngIf="showLogin; else registerForm">
        <form (ngSubmit)="login()" #loginForm="ngForm">
          <label>
            Username:
            <input type="text" [(ngModel)]="loginUser" name="loginUser" required />
          </label>
          <label>
            Password:
            <input type="password" [(ngModel)]="loginPass" name="loginPass" required />
          </label>
          <button type="submit">Log in</button>
        </form>
        <p>
          Don't have an account?
          <a href="#" (click)="toggleForm($event)">Register</a>
        </p>
      </div>
      <ng-template #registerForm>
        <form (ngSubmit)="register()" #registerForm="ngForm">
          <label>
            Username:
            <input type="text" [(ngModel)]="registerUser" name="registerUser" required />
          </label>
          <label>
            Password:
            <input type="password" [(ngModel)]="registerPass" name="registerPass" required />
          </label>
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account?
          <a href="#" (click)="toggleForm($event)">Log in</a>
        </p>
      </ng-template>
      <div *ngIf="message" class="message">{{ message }}</div>
    </div>
    <ng-template #mainApp>
      <div class="main-app">
        <select class="display-select" [(ngModel)]="selectedDisplay">
          <option disabled [value]="''">Select a time display</option>
          <option value="bar-portrait">Bar Portrait</option>
          <option value="fish-tank">Fish Tank</option>
          <option value="desktop-time">Computer Desktop</option>
          <option value="binary-leds">Binary LEDs</option>
          <option value="flower-clock">Flower Clock</option>
          <option value="magic-book">Magic Book</option>
          <option value="tv-clock">TV Clock</option>
          <option value="bookshelf-clock">Bookshelf Clock</option>
          <option value="web-browser-clock">Web Browser Clock</option>
          <option value="pizza-clock">Pizza Clock</option>
        </select>
        <ng-container [ngSwitch]="selectedDisplay">
          <bar-portrait *ngSwitchCase="'bar-portrait'"></bar-portrait>
          <fish-tank *ngSwitchCase="'fish-tank'"></fish-tank>
          <desktop-time-display *ngSwitchCase="'desktop-time'"></desktop-time-display>
          <binary-leds *ngSwitchCase="'binary-leds'"></binary-leds>
          <flower-clock *ngSwitchCase="'flower-clock'"></flower-clock>
          <magic-book *ngSwitchCase="'magic-book'"></magic-book>
          <tv-clock *ngSwitchCase="'tv-clock'"></tv-clock>
          <bookshelf-clock *ngSwitchCase="'bookshelf-clock'"></bookshelf-clock>
          <web-browser-clock *ngSwitchCase="'web-browser-clock'"></web-browser-clock>
          <pizza-clock *ngSwitchCase="'pizza-clock'"></pizza-clock>
        </ng-container>
        <button class="logout-btn" (click)="logout()">Log out</button>
      </div>
    </ng-template>
  `,
  styleUrls: ['./app.css']
})
export class App {
  showLogin = true;
  loginUser = '';
  loginPass = '';
  registerUser = '';
  registerPass = '';
  message = '';
  authenticated = false;
  currentUser = '';
  selectedDisplay = '';

  toggleForm(event: Event) {
    event.preventDefault();
    this.showLogin = !this.showLogin;
    this.message = '';
    this.clearFields();
  }

  login() {
    const user = localStorage.getItem('user');
    const pass = localStorage.getItem('pass');
    if (this.loginUser === user && this.loginPass === pass) {
      this.authenticated = true;
      this.currentUser = this.loginUser;
    } else {
      this.message = 'Incorrect username or password.';
    }
    this.clearFields();
  }

  register() {
    if (this.registerUser && this.registerPass) {
      localStorage.setItem('user', this.registerUser);
      localStorage.setItem('pass', this.registerPass);
      this.message = 'Registration successful! You can now log in.';
      this.showLogin = true;
      this.clearFields();
    } else {
      this.message = 'Please fill in all fields.';
    }
  }

  logout() {
    this.authenticated = false;
    this.currentUser = '';
    this.clearFields();
    this.message = '';
    this.showLogin = true;
  }

  clearFields() {
    this.loginUser = '';
    this.loginPass = '';
    this.registerUser = '';
    this.registerPass = '';
  }
}