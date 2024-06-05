import {Component, Input} from '@angular/core';
import {EventItem} from "../models";

@Component({
  selector: 'calendar-tooltip',
  templateUrl: './calendar-tooltip.component.html',
  styleUrl: './calendar-tooltip.component.scss'
})
export class CalendarTooltipComponent {

    @Input() eventItem?: EventItem;
    @Input() utc: boolean = false;
    @Input() startLabel: string = '';
    @Input() endLabel: string = '';
    left: number = 0;
    top: number = 0;

    update(start: number, end: number, utc: boolean) {
        this.startLabel = this.calculateDate(start, utc);
        this.endLabel = this.calculateDate(end, utc)
    }
    calculateDate(time: number, utc: boolean) {
        const date = new Date(time);
        let timeLabel: string = '';
        let timeInfo: string[] = [];
        if (utc) {
            timeInfo.push(date.getUTCFullYear().toString());
            timeInfo.push(this.minXDigits((date.getUTCMonth() + 1), 2))
            timeInfo.push(this.minXDigits(date.getUTCDate(), 2))
            timeInfo.push(this.minXDigits(date.getUTCHours(), 2))
            timeInfo.push(this.minXDigits(date.getUTCMinutes(), 2))
        } else {
            timeInfo.push(date.getFullYear().toString());
            timeInfo.push(this.minXDigits((date.getMonth() + 1), 2))
            timeInfo.push(this.minXDigits(date.getDate(), 2))
            timeInfo.push(this.minXDigits(date.getHours(), 2))
            timeInfo.push(this.minXDigits(date.getMinutes(), 2))
        }

        timeLabel += timeInfo[0] + '-' + timeInfo[1] + '-' + timeInfo[2];
        timeLabel += ' ' + timeInfo[3] + ':' + timeInfo[4];
        return timeLabel
    }

    minXDigits(n: number, digits: number) {
        return n.toString().padStart(digits, '0');
    }

}
