import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'desktop-time-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="desktop-time-controls">
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
    <div class="desktop-time-display">
      <div class="desktop-area">
        <div class="desktop-files">
          <ng-container *ngFor="let file of filesArray; let i = index">
            <div
              class="desktop-file"
              [style.left.px]="getFileLeft(i)"
              [style.top.px]="getFileTop(i)"
            >
              <div class="file-icon"></div>
              <div class="file-label">app{{i+1}}</div>
            </div>
          </ng-container>
        </div>
        <div class="download-bar-container">
          <div class="download-bar-label">Downloading app...</div>
          <div class="download-bar-bg">
            <div class="download-bar-fg" [style.width.%]="downloadPercent"></div>
          </div>
          <div class="download-bar-percent">{{ downloadPercent | number:'1.0-0' }}%</div>
        </div>
      </div>
      <div class="taskbar">
        <div class="taskbar-app">
          <span class="app-icon"></span>
          <span class="app-label">Mail</span>
          <span class="app-notification" *ngIf="minutes > 0">{{ minutes }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class DesktopTimeDisplayComponent implements OnInit, OnDestroy {
  downloadPercent = 0;
  minutes = 0;
  hours = 0;
  displayHours = 0;
  displayMinutes = 0;
  displaySeconds = 0;
  filesArray: number[] = [];
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

    this.displayHours = Math.floor(hours);
    this.displayMinutes = Math.floor(minutes);
    this.displaySeconds = Math.floor(seconds);

    this.minutes = this.displayMinutes;
    this.hours = this.displayHours;

    this.downloadPercent = Math.max(0, Math.min((seconds / 59.999) * 100, 100));
    this.filesArray = Array.from({ length: this.hours }, (_, i) => i);
  }

  getFileLeft(i: number): number {
    return 20 + (i % 8) * 60;
  }

  getFileTop(i: number): number {
    return 20 + Math.floor(i / 8) * 70;
  }
}
