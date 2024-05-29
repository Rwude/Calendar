import {Component, Input} from '@angular/core';
import {EventItem} from "../../../models";

@Component({
  selector: 'calendar-grid-item',
  standalone: true,
  imports: [],
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.scss'
})
export class GridItemComponent {
    @Input() eventItem!: EventItem;
    @Input() width!: number;
}
