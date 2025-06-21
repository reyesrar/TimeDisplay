import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'fish-tank',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fish-tank-controls">
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
    <div class="fish-tank-container">
      <div class="fish-tank-water">
        <div class="fish-tank-filter">
          <div class="bubble" *ngFor="let b of bubbles" [style.bottom.px]="b.y"></div>
        </div>
        <div class="fish" [style.left.%]="fishX" [class.flipped]="fishFlipped"></div>
        <div class="algae" [style.height.%]="algaeHeight"></div>
        <div class="stones-row">
          <div class="stone" *ngFor="let s of stones"></div>
        </div>
        <div class="gravel"></div>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class FishTankComponent implements OnInit, OnDestroy {
  bubbles: {x: number, y: number, t: number}[] = [];
  fishX = 0;
  fishFlipped = false;
  algaeHeight = 10;
  private intervalId: any;
  private lastSecond = -1;
  customHours = 0;
  customMinutes = 0;
  customSeconds = 0;
  useCustomTime = false;
  displayHours = 0;
  displayMinutes = 0;
  displaySeconds = 0;
  customStartReal = 0;
  customStartTotalSeconds = 0;
  stones: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setToSystemTime();
    this.updateState();
    this.intervalId = setInterval(() => {
      this.updateState();
      this.cdr.detectChanges();
    }, 16);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  setCustomTime() {
    this.useCustomTime = true;
    this.customStartTotalSeconds = this.customHours * 3600 + this.customMinutes * 60 + this.customSeconds;
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

  private updateState() {
    const now = new Date();
    const ms = now.getMilliseconds();
    if (now.getSeconds() !== this.lastSecond) {
      this.lastSecond = now.getSeconds();
      this.spawnBubble(now);
    }
    this.updateBubbles();
    let hours, minutes, seconds, sec, min, hr;
    if (this.useCustomTime) {
      const elapsed = (Date.now() / 1000) - this.customStartReal;
      let totalSeconds = (this.customStartTotalSeconds + elapsed) % 86400;
      hr = Math.floor(totalSeconds / 3600);
      min = Math.floor((totalSeconds % 3600) / 60);
      sec = totalSeconds % 60;
      hours = hr + (min / 60);
      minutes = min + (sec / 60);
      seconds = sec;
    } else {
      hr = now.getHours();
      min = now.getMinutes();
      sec = now.getSeconds() + ms / 1000;
      hours = hr + (min / 60);
      minutes = min + (sec / 60);
      seconds = sec;
    }
    this.displayHours = Math.floor(hr);
    this.displayMinutes = Math.floor(min);
    this.displaySeconds = Math.floor(sec);
    if (sec < 30) {
      this.fishX = (sec / 29.999) * 80;
      this.fishFlipped = true;
    } else {
      this.fishX = (1 - ((sec - 30) / 29.999)) * 80;
      this.fishFlipped = false;
    }
    this.algaeHeight = ((hours + 1) / 24) * 80 + 10;
    this.stones = Array(Math.max(0, Math.floor(min))).fill(0);
  }

  private spawnBubble(now: Date) {
    this.bubbles.push({x: 10, y: 0, t: now.getTime()});
  }

  private updateBubbles() {
    const now = Date.now();
    this.bubbles = this.bubbles
      .map(b => {
        const elapsed = (now - b.t) / 1000;
        return { ...b, y: Math.min(260, 60 + (elapsed / 1) * 200) };
      })
      .filter(b => b.y < 260);
  }
}
