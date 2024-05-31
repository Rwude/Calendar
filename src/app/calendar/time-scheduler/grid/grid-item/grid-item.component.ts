import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EventItem} from "../../../models";

@Component({
  selector: 'calendar-grid-item',
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.scss'
})
export class GridItemComponent implements OnChanges{
    @Input() eventItem!: EventItem;
    @Input() width!: number;
    @Input() height!: number;
    @Input() color!: string;
    @Input() backgroundColor!: string;

    tooltip: string;
    constructor() {
        this.tooltip = this.getTooltip()
    }

    ngOnChanges(changes: SimpleChanges) {
        this.tooltip = this.getTooltip();
    }

    getTooltip() {
        return `${this.eventItem?.name}

        Start: ${this.eventItem?.start}
        End: ${this.eventItem?.end}`

    }
}
