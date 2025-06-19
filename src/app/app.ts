import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BarPortraitComponent } from './bar-portrait.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, BarPortraitComponent],
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
        </select>
        <ng-container [ngSwitch]="selectedDisplay">
          <bar-portrait *ngSwitchCase="'bar-portrait'"></bar-portrait>
        </ng-container>
        <button class="logout-btn" (click)="logout()">Log out</button>
      </div>
    </ng-template>
  `,
  styleUrl: './app.css'
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