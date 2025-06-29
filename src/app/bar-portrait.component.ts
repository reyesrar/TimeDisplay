import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'bar-portrait',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bar-portrait-controls">
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
    <div class="bar-portrait-container">
      <div class="bar-group">
        <div class="bar-portrait-bar hours"
             [style.height.%]="hoursHeight"
             [style.transition]="transition"></div>
      </div>
      <div class="bar-group">
        <div class="bar-portrait-bar minutes"
             [style.height.%]="minutesHeight"
             [style.transition]="transition"></div>
      </div>
      <div class="bar-group">
        <div class="bar-portrait-bar seconds"
             [style.height.%]="secondsHeight"
             [style.transition]="transition"></div>
      </div>
    </div>
    <div class="bar-portrait-labels">
      <div class="bar-label">Hours</div>
      <div class="bar-label">Minutes</div>
      <div class="bar-label">Seconds</div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class BarPortraitComponent implements OnInit, OnDestroy {
  secondsHeight = 0;
  minutesHeight = 0;
  hoursHeight = 0;
  transition = 'height 1.5s cubic-bezier(.4,1.5,.6,1)';
  private frameId: any;

  useCustomTime = false;
  customHours = 0;
  customMinutes = 0;
  customSeconds = 0;
  customStartTimestamp = 0;
  customStartReal = 0;

  displayHours = 0;
  displayMinutes = 0;
  displaySeconds = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setToSystemTime();
    this.startAnimation();
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

  private startAnimation() {
    const animate = () => {
      this.updateBars();
      this.cdr.detectChanges();
      this.frameId = requestAnimationFrame(animate);
    };
    this.frameId = requestAnimationFrame(animate);
  }

  private updateBars() {
    let hours: number, minutes: number, seconds: number;
    if (this.useCustomTime) {
      const elapsed = (Date.now() / 1000) - this.customStartReal;
      let totalSeconds = this.customStartTimestamp + elapsed;
      totalSeconds = ((totalSeconds % 86400) + 86400) % 86400;
      hours = Math.floor(totalSeconds / 3600);
      minutes = Math.floor((totalSeconds % 3600) / 60);
      seconds = totalSeconds % 60;

      this.customHours = hours;
      this.customMinutes = minutes;
      this.customSeconds = Math.floor(seconds);
    } else {
      const now = new Date();
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds() + now.getMilliseconds() / 1000;

      this.customHours = hours;
      this.customMinutes = minutes;
      this.customSeconds = Math.floor(seconds);
    }

    const minutesWithFrac = minutes + (seconds / 60);
    const hoursWithFrac = hours + (minutesWithFrac / 60);

    this.secondsHeight = (seconds / 59.999) * 100;
    this.minutesHeight = (minutesWithFrac / 59.999) * 100;
    this.hoursHeight = (hoursWithFrac / 23.999) * 100;

    this.displayHours = Math.floor(hours);
    this.displayMinutes = Math.floor(minutes);
    this.displaySeconds = Math.floor(seconds);
  }
}