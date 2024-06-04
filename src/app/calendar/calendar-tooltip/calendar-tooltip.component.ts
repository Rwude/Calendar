import {Component, Input} from '@angular/core';
import {EventItem} from "../models";

@Component({
  selector: 'app-calendar-tooltip',
  templateUrl: './calendar-tooltip.component.html',
  styleUrl: './calendar-tooltip.component.scss'
})
export class CalendarTooltipComponent {

    @Input() eventItem?: EventItem;
    left: number = 0;
    top: number = 0;

}
