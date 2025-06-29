import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'web-browser-clock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="web-browser-clock-controls">
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
    <div class="web-browser-clock-display">
      <div class="browser-window">
        <div class="browser-tabs" #tabsContainer>
          <div
            *ngFor="let t of tabsArray; let i = index"
            class="browser-tab"
            [class.active]="i === (displayHours % 24)"
            #tabElem
          >
            Tab {{ i + 1 }}
          </div>
        </div>
        <div class="browser-bar">
          <span class="browser-url">https://search.com/?page={{ displayMinutes + 1 }}</span>
        </div>
        <div class="browser-results">
          <div class="results-header">
            <span>Results ({{ displaySeconds + 1 }})</span>
            <span class="results-page">Page {{ displayMinutes + 1 }}</span>
          </div>
          <div class="results-list" #resultsList>
            <div
              *ngFor="let r of resultsArray; let i = index"
              class="result"
              [class.highlight]="i === displaySeconds"
            >
              <span class="result-title">Result {{ i + 1 }}</span>
              <span class="result-url">https://result{{ i + 1 }}.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./app.css']
})
export class WebBrowserClockComponent implements OnInit, OnDestroy, AfterViewInit {
  displayHours = 0;
  displayMinutes = 0;
  displaySeconds = 0;
  tabsArray = Array.from({ length: 24 });
  resultsArray = Array.from({ length: 60 });
  private frameId: any;

  useCustomTime = false;
  customHours = 0;
  customMinutes = 0;
  customSeconds = 0;
  customStartTimestamp = 0;
  customStartReal = 0;
  private lastHour = 0;
  private lastSecond = -1;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setToSystemTime();
    this.animate();
  }

  ngAfterViewInit() {
    this.scrollToActiveTab();
    this.scrollToActiveResult();
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
    this.scrollToActiveTab();
    this.scrollToActiveResult();
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

    if (this.displayHours !== this.lastHour) {
      this.scrollToActiveTab();
      this.lastHour = this.displayHours;
    }
    if (this.displaySeconds !== this.lastSecond) {
      this.scrollToActiveResult();
      this.lastSecond = this.displaySeconds;
    }
  }

  scrollToActiveTab() {
    const tabsContainer = document.querySelector('.browser-tabs');
    if (!tabsContainer) return;
    const activeTab = tabsContainer.querySelector('.browser-tab.active') as HTMLElement;
    if (activeTab && typeof activeTab.scrollIntoView === 'function') {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  scrollToActiveResult() {
    const resultsList = document.querySelector('.results-list');
    if (!resultsList) return;
    const activeResult = resultsList.querySelector('.result.highlight') as HTMLElement;
    if (activeResult && typeof activeResult.scrollIntoView === 'function') {
      activeResult.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }
}
