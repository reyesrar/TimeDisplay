import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'binary-leds',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="binary-leds-controls">
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
    <div class="binary-leds-display">
      <div class="binary-row">
        <span class="binary-label">Hours</span>
        <span class="led" *ngFor="let bit of hoursBits" [class.on]="bit"></span>
      </div>
      <div class="binary-row">
        <span class="binary-label">Minutes</span>
        <span class="led" *ngFor="let bit of minutesBits" [class.on]="bit"></span>
      </div>
      <div class="binary-row">
        <span class="binary-label">Seconds</span>
        <span class="led" *ngFor="let bit of secondsBits" [class.on]="bit"></span>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class BinaryLedsComponent implements OnInit, OnDestroy {
  displayHours = 0;
  displayMinutes = 0;
  displaySeconds = 0;
  hoursBits: boolean[] = [];
  minutesBits: boolean[] = [];
  secondsBits: boolean[] = [];
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

    this.hoursBits = this.toBits(hours, 5);
    this.minutesBits = this.toBits(minutes, 6);
    this.secondsBits = this.toBits(seconds, 6);
  }

  private toBits(value: number, bits: number): boolean[] {
    const arr: boolean[] = [];
    for (let i = bits - 1; i >= 0; i--) {
      arr.push(((value >> i) & 1) === 1);
    }
    return arr;
  }
}
