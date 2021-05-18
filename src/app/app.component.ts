import { Component, AfterViewInit, ViewChild, OnDestroy } from "@angular/core";
import { fromEvent, interval, Observable, Subscription } from "rxjs";
import { buffer, debounceTime, filter, map, takeUntil } from "rxjs/operators";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  //
  @ViewChild("stopBtn", { static: false }) stopBtn;
  @ViewChild("resetBtn", { static: false }) resetBtn;
  @ViewChild("waitBtn", { static: false }) waitBtn;

  private timer$ = interval(1000);
  private timerValue: number = 0;
  private stop$: Observable<any>;
  private wait$: Observable<any>;
  private reset$: Observable<any>;
  private doubleClicks$: Observable<any>;
  private buff$: Observable<any>;

  private doubleClicksSubscription: Subscription;
  private resetSubscription: Subscription;
  private stopSubscription: Subscription;

  start: any;
  status: string = "stoped";
  seconds: number | string = "00";
  hours: number | string = "00";
  minutes: number | string = "00";

  ngAfterViewInit() {
    this.stop$ = fromEvent(this.stopBtn.nativeElement, "click");
    this.reset$ = fromEvent(this.resetBtn.nativeElement, "click");
    this.wait$ = fromEvent(this.waitBtn.nativeElement, "click");
    // wait
    this.buff$ = this.wait$.pipe(debounceTime(250));
    this.doubleClicks$ = this.wait$.pipe(
      buffer(this.buff$),
      map((click: any) => click.length),
      filter((click) => click === 2)
    );
    this.doubleClicksSubscription = this.doubleClicks$.subscribe(() => this.wait());
    // reset
    this.resetSubscription = this.reset$.subscribe(() => this.reset());
    // stop
    this.stopSubscription = this.stop$.subscribe(() => this.stop());
  }

  startTimer() {
    this.start = this.timer$.pipe(takeUntil(this.reset$)).subscribe(() => {
      this.timerValue += 1;
      this.displayTimerValue();
      this.status = "started";
    });
  }

  reset() {
    this.timerValue = 0;
    this.seconds = "00";
    this.hours = "00";
    this.minutes = "00";
    this.start.unsubscribe();
    this.startTimer();
  }

  stop() {
    this.status = "stoped";
    this.start.unsubscribe();
  }

  wait() {
    this.start.unsubscribe();
    setTimeout(() => this.startTimer(), 2000);
  }

  displayTimerValue() {
    if (this.timerValue % 60 < 10) {
      this.seconds = "0" + (this.timerValue % 60);
    } else {
      this.seconds = this.timerValue % 60;
    }

    if (this.timerValue % 60 == 0 && this.timerValue / 60 < 60) {
      this.minutes = this.timerValue / 60;
      this.minutes.toFixed(0);
      if (this.minutes < 10) {
        this.minutes = "0" + this.minutes;
      }
    } else if (this.timerValue % 60 == 0 && this.timerValue / 60 >= 60) {
      this.minutes = "00";
    }

    if (this.timerValue % 3600 == 0 && this.timerValue / 3600 < 24) {
      this.hours = this.timerValue / 3600;
      this.hours.toFixed(0);
      if (this.hours < 10) {
        this.hours = "0" + this.hours;
      }
    } else if (this.timerValue % 3600 == 0 && this.timerValue / 3600 >= 24) {
      this.minutes = "00";
    }
  }

  ngOnDestroy() {
    this.doubleClicksSubscription.unsubscribe();
    this.resetSubscription.unsubscribe();
    this.stopSubscription.unsubscribe();
  }
}
