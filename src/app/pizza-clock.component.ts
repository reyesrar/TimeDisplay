import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'pizza-clock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pizza-clock-controls">
      <label>
        Hours:
        <input type="range" min="0" max="23" [(ngModel)]="customHours" (change)="setCustomTime()" />
        <span>{{ displayHours }} in</span>
      </label>
      <label>
        Minutes:
        <input type="range" min="0" max="59" [(ngModel)]="customMinutes" (change)="setCustomTime()" />
        <span>{{ displayMinutes }} pepperoni</span>
      </label>
      <label>
        Seconds:
        <input type="range" min="0" max="59" [(ngModel)]="customSeconds" (change)="setCustomTime()" />
        <span>{{ displaySeconds }} slices</span>
      </label>
      <button type="button" (click)="resetToSystemTime()">Reset</button>
    </div>
    <div class="pizza-clock-display">
      <div class="pizza-area">
        <svg [attr.width]="svgSize" [attr.height]="svgSize" [attr.viewBox]="'0 0 ' + svgSize + ' ' + svgSize">
          <circle
            [attr.cx]="svgSize/2"
            [attr.cy]="svgSize/2"
            [attr.r]="pizzaRadius"
            fill="#fbbf24"
            stroke="#eab308"
            stroke-width="8"
          />
          <circle
            [attr.cx]="svgSize/2"
            [attr.cy]="svgSize/2"
            [attr.r]="pizzaRadius - 12"
            fill="#fde68a"
            stroke="#fbbf24"
            stroke-width="2"
          />
          <ng-container *ngFor="let p of pepperoniArray; let i = index">
            <circle
              *ngIf="i < displayMinutes"
              [attr.cx]="getPepperoniX(i)"
              [attr.cy]="getPepperoniY(i)"
              r="13"
              fill="#b91c1c"
              stroke="#991b1b"
              stroke-width="2"
            />
          </ng-container>
          <ng-container *ngFor="let s of slicesArray; let i = index">
            <line
              *ngIf="i < displaySeconds"
              [attr.x1]="svgSize/2"
              [attr.y1]="svgSize/2"
              [attr.x2]="getSliceX(i)"
              [attr.y2]="getSliceY(i)"
              stroke="#fff"
              stroke-width="4"
              opacity="0.7"
            />
          </ng-container>
        </svg>
        <div class="pizza-diameter-label">{{ displayHours }} in</div>
      </div>
    </div>
  `,
  styleUrl: './app.css'
})
export class PizzaClockComponent implements OnInit, OnDestroy {
  displayHours = 0;
  displayMinutes = 0;
  displaySeconds = 0;
  svgSize = 420;
  minDiameter = 8;
  maxDiameter = 24;
  pepperoniArray = Array.from({ length: 59 });
  slicesArray = Array.from({ length: 59 });
  private frameId: any;

  useCustomTime = false;
  customHours = 0;
  customMinutes = 0;
  customSeconds = 0;
  customStartTimestamp = 0;
  customStartReal = 0;

  get pizzaDiameter(): number {
    return this.minDiameter + (this.maxDiameter - this.minDiameter) * (this.displayHours / 23);
  }

  get pizzaRadius(): number {
    const minR = 60, maxR = 180;
    return minR + (maxR - minR) * (this.displayHours / 23);
  }

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

  getPepperoniX(i: number): number {
    const r = this.pizzaRadius - 30 - (i % 3) * 18;
    const angle = (i / Math.max(1, this.displayMinutes)) * 2 * Math.PI + (i % 2 ? 0.2 : -0.2);
    return this.svgSize / 2 + r * Math.cos(angle);
  }

  getPepperoniY(i: number): number {
    const r = this.pizzaRadius - 30 - (i % 3) * 18;
    const angle = (i / Math.max(1, this.displayMinutes)) * 2 * Math.PI + (i % 2 ? 0.2 : -0.2);
    return this.svgSize / 2 + r * Math.sin(angle);
  }

  getSliceX(i: number): number {
    const angle = (i / this.displaySeconds) * 2 * Math.PI;
    return this.svgSize / 2 + this.pizzaRadius * Math.cos(angle);
  }

  getSliceY(i: number): number {
    const angle = (i / this.displaySeconds) * 2 * Math.PI;
    return this.svgSize / 2 + this.pizzaRadius * Math.sin(angle);
  }
}
