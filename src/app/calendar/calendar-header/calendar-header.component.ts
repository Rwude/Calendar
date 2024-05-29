import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {EnumTimeFrame, Period} from "../models";
import {TimeFunctionsService} from "../time-functions.service";

@Component({
  selector: 'app-calendar-header',
  templateUrl: './calendar-header.component.html',
  styleUrl: './calendar-header.component.scss'
})
export class CalendarHeaderComponent implements OnChanges, OnInit{
    @Input() periods!: Period[];
    @Input() utc: boolean = false;
    @Input() dayShort: string[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    @Input() monthShort: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    @Input() currentPeriod!: Period;
    @Input() start: number | undefined = 0;

    @Output() timeFrameEvent = new EventEmitter<{start: number, end: number}>();
    @Output() periodChangeEvent = new EventEmitter<{periodIdx: number}>();

    period: Period | undefined;
    periodIndex: null | number = 0;
    end: number = 0;
    title: string = '';

    constructor(
        private timeFunctions: TimeFunctionsService
    ) {}

    ngOnInit() {
        this.period = this.currentPeriod;
        this.end = this.start! + this.timeFunctions.getTimeFrameLength(this.period, this.start!, this.utc) - this.period.timeFramePeriod[1] * this.period.timeFramePeriod[0];
        this.title = this.getTitle()
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['periods']) {
            this.periodIndex = 0;
            this.period = this.periods[0];
            this.start = this.period.start || new Date().setHours(0,0,0,0);
            this.end = this.start + this.timeFunctions.getTimeFrameLength(this.period, this.start, this.utc) - this.period.timeFramePeriod[1] * this.period.timeFramePeriod[0];
            this.title = this.getTitle();
        } else if (changes['currentPeriod'] || changes['start']) {
            this.period = this.currentPeriod;
            this.periodIndex = this.periods.findIndex(p => p.timeFrame[0] === this.currentPeriod.timeFrame[0] && p.timeFrame[1] === this.currentPeriod.timeFrame[1]);
            this.end = this.start! + this.timeFunctions.getTimeFrameLength(this.period, this.start!, this.utc) - this.period.timeFramePeriod[1] * this.period.timeFramePeriod[0];
            this.title = this.getTitle()
        }
    }

    getTitle(): string {
        const startDate = new Date(this.start!);
        const endDate = new Date(this.end);
        let startInfo: string[];
        let endInfo: string[];
        if (this.utc) {
            startInfo = [startDate.getUTCFullYear().toString(), this.monthShort[startDate.getUTCMonth()], startDate.getUTCDate().toString(), this.dayShort[startDate.getUTCDay()]];
            endInfo = [endDate.getUTCFullYear().toString(), this.monthShort[endDate.getUTCMonth()], endDate.getUTCDate().toString(), this.dayShort[endDate.getUTCDay()]];
        } else {
            startInfo = [startDate.getFullYear().toString(), this.monthShort[startDate.getMonth()], startDate.getDate().toString(), this.dayShort[startDate.getDay()]];
            endInfo = [endDate.getFullYear().toString(), this.monthShort[endDate.getMonth()], endDate.getDate().toString(), this.dayShort[endDate.getDay()]];
        }
        return this.buildTitle(startInfo, endInfo);
    }

    buildTitle(startInfo: string[], endInfo: string[]): string {
        const yearBehind = startInfo[0] === endInfo[0];
        const sameMonth = startInfo[1] === endInfo[1];
        let title: string = '';
        switch (this.period?.timeFrame[1]) {
            case EnumTimeFrame.Year:
                if (!yearBehind) {
                    title += startInfo[0] + ' - ' + endInfo[0]
                } else {
                    title += startInfo[0]
                }
                break;
            case EnumTimeFrame.Month:
                title += startInfo[1];
                if (!yearBehind) title += ' ' + startInfo[0];
                if (!sameMonth) {
                    title += ' - ' + endInfo[1];
                }
                title += yearBehind ? ', ' + startInfo[0] : ' ' + endInfo[0];
                break;
            case EnumTimeFrame.Week:
                title += startInfo[1] + ' ' + startInfo[2];
                if (!yearBehind) title += ', ' + startInfo[0];
                title += ' - '
                if(!sameMonth) title += endInfo[1] + ' '
                title += endInfo[2] + ', ' + endInfo[0]
                break;
            case EnumTimeFrame.Day:
                if (this.period!.timeFrame[0] > 1) {
                    title += startInfo[1] + ' ' + startInfo[2];
                    if (!yearBehind) title += ', ' + startInfo[0];
                    title += ' - '
                    if(!sameMonth) title += endInfo[1] + ' '
                    title += endInfo[2] + ', ' + endInfo[0]
                } else {
                    title += startInfo[1] + ' ' + startInfo[2] + ', ' + startInfo[0];
                }
                break;
            default:
                title += startInfo[1] + ' ' + startInfo[2] + ', ' + startInfo[0];
        }
        return title
    }

    switchPeriod(event: any) {
        this.periodIndex = event.value
        this.period = this.periods[this.periodIndex!];
        this.start = this.period!.start || new Date().setHours(0,0,0,0);
        this.end = this.start + this.timeFunctions.getTimeFrameLength(this.period!, this.start, this.utc) - this.period!.timeFramePeriod[1] * this.period!.timeFramePeriod[0];
        this.title = this.getTitle()

        this.periodChangeEvent.emit({periodIdx: this.periodIndex!});
    }

    changeTimeFrame(button: string) {
        if (button === 'next') {
            this.start = this.end + this.period!.timeFramePeriod[1] * this.period!.timeFramePeriod[0];
            this.end = this.start + this.timeFunctions.getTimeFrameLength(this.period!, this.start, this.utc) - this.period!.timeFramePeriod[1] * this.period!.timeFramePeriod[0];
            this.title = this.getTitle();
        } else if (button === 'prev') {
            this.end = this.start! - this.period!.timeFramePeriod[1] * this.period!.timeFramePeriod[0];
            this.start = this.end - this.timeFunctions.getTimeFrameLength(this.period!, this.start!, this.utc, true) + this.period!.timeFramePeriod[1] * this.period!.timeFramePeriod[0];
            this.title = this.getTitle();
        } else {
            this.start = new Date().setHours(0,0,0,0);
            this.end = this.start + this.timeFunctions.getTimeFrameLength(this.period!, this.start, this.utc) - this.period!.timeFramePeriod[1] * this.period!.timeFramePeriod[0];
            this.title = this.getTitle();
        }

        this.timeFrameEvent.emit({start: this.start, end: this.end + this.period!.timeFramePeriod[1] * this.period!.timeFramePeriod[0]})
    }
}
