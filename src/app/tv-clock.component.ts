import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'tv-clock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tv-clock-controls">
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
    <div class="tv-clock-display">
      <div class="tv-outer">
        <svg width="520" height="420" viewBox="0 0 520 420">
          <rect x="80" y="100" width="360" height="240" rx="40" fill="#222" stroke="#444" stroke-width="12"/>
          <rect x="120" y="140" width="280" height="180" rx="28"
            [attr.fill]="screenColor"
            stroke="#e5e7eb" stroke-width="6"/>
          <text x="140" y="170" text-anchor="start" font-size="38" font-family="monospace" fill="#fff" opacity="0.8">
            {{ displayMinutes === 0 ? 'No Signal' : 'Ch ' + displayMinutes }}
          </text>
          <g>
            <rect x="255" y="40" width="18" height="60" rx="7" fill="#888"/>
            <line
              x1="264" y1="40"
              [attr.x2]="getAntennaX2()"
              [attr.y2]="getAntennaY2()"
              stroke="#aaa" stroke-width="7" stroke-linecap="round"
            />
          </g>
        </svg>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class TvClockComponent implements OnInit, OnDestroy {
  displayHours = 0;
  displayMinutes = 0;
  displaySeconds = 0;
  screenColor = '#222';
  antennaAngle = 0;
  private frameId: any;

  useCustomTime = false;
  customHours = 0;
  customMinutes = 0;
  customSeconds = 0;
  customStartTimestamp = 0;
  customStartReal = 0;

  private hourColors = [
    '#f87171',   // 0 red
    '#fbbf24',   // 1 yellow
    '#34d399',   // 2 green
    '#60a5fa',   // 3 blue
    '#a78bfa',   // 4 purple
    '#f472b6',   // 5 pink
    '#f59e42',   // 6 orange
    '#4f46e5',   // 7 indigo
    '#22c55e',   // 8 lime
    '#eab308',   // 9 gold
    '#64748b',   // 10 slate
    '#ff6f00',   // 11 amber
    '#00bcd4',   // 12 cyan
    '#8bc34a',   // 13 light green
    '#d84315',   // 14 deep orange
    '#ba68c8',   // 15 light purple
    '#ffd600',   // 16 bright yellow
    '#00e676',   // 17 vivid green
    '#2979ff',   // 18 vivid blue
    '#c51162',   // 19 magenta
    '#ffb300',   // 20 vivid gold
    '#6d4c41',   // 21 brown
    '#00acc1',   // 22 teal
    '#f06292',   // 23 pink
  ];

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

    this.screenColor = this.hourColors[hours % this.hourColors.length];

    this.antennaAngle = (-Math.PI / 4) + (Math.PI / 2) * (seconds / 59);
  }

  getAntennaX2(): number {
    return 264 + 120 * Math.sin(this.antennaAngle);
  }

  getAntennaY2(): number {
    return 40 - 120 * Math.cos(this.antennaAngle);
  }
}