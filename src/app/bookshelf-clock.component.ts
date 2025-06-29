import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'bookshelf-clock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bookshelf-clock-controls">
      <label>
        Hours:
        <input type="range" min="0" max="23" [(ngModel)]="customHours" (change)="setCustomTime()" />
        <span>{{ displayHours }}</span>
      </label>
      <label>
        Minutes:
        <input type="range" min="0" max="59" [(ngModel)]="customMinutes" (change)="setCustomTime()" />
        <span>{{ displayMinutes }}</span>
      </label>
      <label>
        Seconds:
        <input type="range" min="0" max="59" [(ngModel)]="customSeconds" (change)="setCustomTime()" />
        <span>{{ displaySeconds }}</span>
      </label>
      <button type="button" (click)="resetToSystemTime()">Reset</button>
    </div>
    <div class="bookshelf-clock-display">
      <div class="bookshelf-row">
        <span class="shelf-label">Hours</span>
        <div class="bookshelf">
          <span
            *ngFor="let b of booksArray; let i = index"
            class="book"
            [class.filled]="i < displayHours"
            [class.empty]="i >= displayHours"
            [style.background]="i < displayHours ? '#f59e42' : '#e5e7eb'"
          ></span>
          <span
            class="book"
            [class.filled]="59 < displayHours"
            [class.empty]="59 >= displayHours"
            [style.background]="59 < displayHours ? '#f59e42' : '#e5e7eb'"
          ></span>
        </div>
      </div>
      <div class="bookshelf-row">
        <span class="shelf-label">Minutes</span>
        <div class="bookshelf">
          <span
            *ngFor="let b of booksArray; let i = index"
            class="book"
            [class.filled]="i < displayMinutes"
            [class.empty]="i >= displayMinutes"
            [style.background]="i < displayMinutes ? '#22c55e' : '#e5e7eb'"
          ></span>
          <span
            class="book"
            [class.filled]="59 < displayMinutes"
            [class.empty]="59 >= displayMinutes"
            [style.background]="59 < displayMinutes ? '#22c55e' : '#e5e7eb'"
          ></span>
        </div>
      </div>
      <div class="bookshelf-row">
        <span class="shelf-label">Seconds</span>
        <div class="bookshelf">
          <span
            *ngFor="let b of booksArray; let i = index"
            class="book"
            [class.filled]="i < displaySeconds"
            [class.empty]="i >= displaySeconds"
            [style.background]="i < displaySeconds ? '#4f46e5' : '#e5e7eb'"
          ></span>
          <span
            class="book"
            [class.filled]="59 < displaySeconds"
            [class.empty]="59 >= displaySeconds"
            [style.background]="59 < displaySeconds ? '#4f46e5' : '#e5e7eb'"
          ></span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class BookshelfClockComponent implements OnInit, OnDestroy {
  displayHours = 0;
  displayMinutes = 0;
  displaySeconds = 0;
  booksArray = Array.from({ length: 59 });
  private frameId: any;

  useCustomTime = false;
  customHours = 0;
  customMinutes = 0;
  customSeconds = 0;
  customStartTimestamp = 0;
  customStartReal = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setToSystemTime();
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.frameId);
  }

  setCustomTime() {
    this.customHours = Math.max(0, Math.min(23, +this.customHours));
    this.customMinutes = Math.max(0, Math.min(59, +this.customMinutes));
    this.customSeconds = Math.max(0, Math.min(59, +this.customSeconds));
    this.useCustomTime = true;
    this.customStartTimestamp =
      this.customHours * 3600 +
      this.customMinutes * 60 +
      this.customSeconds;
    this.customStartReal = Date.now() / 1000;
  }

  resetToSystemTime() {
    this.setToSystemTime();
    this.useCustomTime = false;
  }

  private setToSystemTime() {
    const now = new Date();
    this.customHours = now.getHours();
    this.customMinutes = now.getMinutes();
    this.customSeconds = now.getSeconds();
  }

  private animate = () => {
    this.updateTime();
    this.cdr.detectChanges();
    this.frameId = requestAnimationFrame(this.animate);
  };

  private updateTime() {
    let hours: number, minutes: number, seconds: number;
    if (this.useCustomTime) {
      const elapsed = (Date.now() / 1000) - this.customStartReal;
      let totalSeconds = this.customStartTimestamp + elapsed;
      totalSeconds = ((totalSeconds % 86400) + 86400) % 86400;
      hours = Math.floor(totalSeconds / 3600);
      minutes = Math.floor((totalSeconds % 3600) / 60);
      seconds = Math.floor(totalSeconds % 60);

      this.customHours = hours;
      this.customMinutes = minutes;
      this.customSeconds = seconds;
    } else {
      const now = new Date();
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();

      this.customHours = hours;
      this.customMinutes = minutes;
      this.customSeconds = seconds;
    }

    this.displayHours = hours;
    this.displayMinutes = minutes;
    this.displaySeconds = seconds;
  }
}
