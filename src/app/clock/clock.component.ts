import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, map, shareReplay, tap, distinctUntilChanged } from 'rxjs/operators';

const DEG_PER_H = 360 / 12;
const DEG_PER_MIN = 360 / 60;
const DEG_PER_SEC = 360 / 60;

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent implements OnInit {

  destroy$: Subject<void> = new Subject();
  hourDegrees$: Observable<number>;
  minDegrees$: Observable<number>;
  secDegrees$: Observable<number>;

  constructor() { }

  ngOnInit() {
    /*
    Tick often enough to make running out of sync with real time unnoticable
    and not often enough to drain people's batteries.
     */
    const date$ = interval(1000)
      .pipe(
        /* Unsubscribe all subscribers when the component is destroyed
         This is really iiportant only when you manually call someObservable.subscribe()
          for preventing MEM leaks. The async -pipe in template handles that for you.
        */
        takeUntil(this.destroy$),
        /* Values of this Observable (like a stream) will be Date objects of the current Date */
        map(() => new Date()),
        /*
        Share the Observable and replay the latest value if it has one yet, so we call the source (in this case setInterval) only once, not one per each subscriber.
        Good practice when you know you have multiple subscribers, to avoid multiple API requests etc.
         */
        shareReplay()
      );
    /* Now we can split date$ stream into streams of all the degrees for different clock hands */
    this.hourDegrees$ = date$.pipe(
      map(date => DEG_PER_H * (date.getHours() % 12) - 90),
      distinctUntilChanged()
    );
    this.minDegrees$ = date$.pipe(
      map(date => DEG_PER_MIN * date.getMinutes() - 90),
      distinctUntilChanged()
    );
    this.secDegrees$ = date$.pipe(
      map(date => DEG_PER_SEC * date.getUTCSeconds() - 90),
      distinctUntilChanged()
    );
  }
  ngOnDestroy() {
    this.destroy$.next();
  }
}
