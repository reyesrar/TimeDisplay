import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'flower-clock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flower-clock-controls">
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
    <div class="flower-clock-display">
      <svg width="340" height="660" viewBox="0 0 340 660">
        <rect x="160" y="120" width="20" height="460" rx="10" fill="#5cb85c"/>
        <ellipse
          [attr.cx]="150"
          [attr.cy]="getLeafY(displayMinutes)"
          rx="28" ry="14"
          fill="#14532d"
          opacity="0.7"
          [attr.transform]="'rotate(-30 150 ' + getLeafY(displayMinutes) + ')'"

        />
        <ellipse
          [attr.cx]="190"
          [attr.cy]="getLeafY(displaySeconds)"
          rx="28" ry="14"
          fill="#a3e635"
          opacity="0.7"
          [attr.transform]="'rotate(30 190 ' + getLeafY(displaySeconds) + ')'"

        />
        <ng-container *ngFor="let petal of petals; let i = index">
          <ellipse
            *ngIf="i < 12"
            [attr.cx]="getPetalCx(i)"
            [attr.cy]="getPetalCy(i)"
            rx="28" ry="48"
            [attr.fill]="getPetalColor(i)"
            [attr.opacity]="getPetalOpacity(i)"
            [attr.transform]="'rotate(' + (i*30) + ' ' + getPetalCx(i) + ' ' + getPetalCy(i) + ')'"
          />
        </ng-container>
        <ng-container *ngFor="let petal of petals, let i = index">
          <ellipse
            *ngIf="i >= 12 && i < 24"
            [attr.cx]="getPetalCx(i-12)"
            [attr.cy]="getPetalCy(i-12)"
            rx="28" ry="48"
            [attr.fill]="getPetalColor(i)"
            [attr.opacity]="getPetalOpacity(i)"
            [attr.transform]="'rotate(' + ((i-12)*30) + ' ' + getPetalCx(i-12) + ' ' + getPetalCy(i-12) + ')'"
          />
        </ng-container>
        <circle cx="170" cy="170" r="38" fill="#ffe066" stroke="#e6b800" stroke-width="6"/>
      </svg>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class FlowerClockComponent implements OnInit, OnDestroy {
  displayHours = 0;
  displayMinutes = 0;
  displaySeconds = 0;
  petals = Array.from({ length: 24 });
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

  getPetalColor(i: number): string {
    if (i < 12) {
      if (this.displayHours < 12) {
        return i <= this.displayHours ? '#f59e42' : '#e0e0e0';
      }
      return '#f59e42';
    } else {
      return (i - 12 <= this.displayHours - 12) && (this.displayHours >= 12)
        ? '#4f46e5'
        : 'transparent';
    }
  }

  getPetalOpacity(i: number): number {
    if (i < 12) {
      if (this.displayHours < 12) {
        return i <= this.displayHours ? 1 : 0.25;
      }
      return 1;
    } else {
      return (i - 12 <= this.displayHours - 12) && (this.displayHours >= 12) ? 1 : 0;
    }
  }

  getPetalCx(i: number): number {
    return 170 + 80 * Math.sin(i * Math.PI / 6);
  }

  getPetalCy(i: number): number {
    return 170 - 80 * Math.cos(i * Math.PI / 6);
  }

  getLeafY(value: number): number {
    const minY = 300;
    const maxY = 500;
    return maxY - (maxY - minY) * (value / 59);
  }
}
