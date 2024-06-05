import {Component, Input} from '@angular/core';
import {EventItem, GridPosition} from "../../../models";

@Component({
  selector: 'calendar-grid-item',
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.scss'
})
export class GridItemComponent {
    @Input() eventItem!: EventItem;
    @Input() gridPosition!: GridPosition;
    @Input() height!: number;
    @Input() width!: number;
}
