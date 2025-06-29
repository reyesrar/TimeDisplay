import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const LOREM_WORDS = `Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum`
  .split(' ')
  .slice(0, 60);

@Component({
  selector: 'magic-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="magic-book-controls">
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
    <div class="magic-book-display">
      <div class="magic-book">
        <div class="page left-page" [class.animate]="animateLeft">
          <div class="page-number" [class.magic]="isMagicPage(leftPageNumber)">
            {{ leftPageNumber + 1 }}
          </div>
          <div class="page-content">
            <span
              *ngFor="let word of LOREM_WORDS; let i = index"
              [class.glow]="isMagicWord(i, leftPageNumber)"
            >{{ word }}</span>
          </div>
        </div>
        <div class="page right-page" [class.animate]="animateRight">
          <div class="page-number" [class.magic]="isMagicPage(rightPageNumber)">
            {{ rightPageNumber + 1 }}
          </div>
          <div class="page-content">
            <span
              *ngFor="let word of LOREM_WORDS; let i = index"
              [class.glow]="isMagicWord(i, rightPageNumber)"
            >{{ word }}</span>
          </div>
        </div>
        <div class="bookmark" [style.height.%]="bookmarkHeight"></div>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class MagicBookComponent implements OnInit, OnDestroy {
  displayHours = 0;
  displayMinutes = 0;
  displaySeconds = 0;
  leftPageNumber = 0;
  rightPageNumber = 1;
  bookmarkHeight = 0;
  LOREM_WORDS = LOREM_WORDS;
  animateLeft = false;
  animateRight = false;
  private frameId: any;
  private lastLeftPage = 0;
  private lastRightPage = 1;

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

    const newLeft = Math.floor(hours / 2) * 2;
    const newRight = newLeft + 1;

    if (newLeft !== this.lastLeftPage) {
      this.animateLeft = true;
      setTimeout(() => (this.animateLeft = false), 700);
    }
    if (newRight !== this.lastRightPage) {
      this.animateRight = true;
      setTimeout(() => (this.animateRight = false), 700);
    }
    this.leftPageNumber = newLeft;
    this.rightPageNumber = newRight;
    this.lastLeftPage = newLeft;
    this.lastRightPage = newRight;


    this.bookmarkHeight = (seconds / 59) * 100;
  }

  isMagicPage(page: number): boolean {
    return page === this.displayHours;
  }

  isMagicWord(wordIndex: number, page: number): boolean {
    return page === this.displayHours && wordIndex === this.displayMinutes;
  }
}
