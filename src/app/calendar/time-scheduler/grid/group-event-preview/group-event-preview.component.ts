import {Component, Input} from '@angular/core';

@Component({
  selector: 'group-event-preview',
  templateUrl: './group-event-preview.component.html',
  styleUrl: './group-event-preview.component.scss'
})
export class GroupEventPreviewComponent {
    @Input() width!: number;
    @Input() height!: number;
    @Input() color!: string;
}
