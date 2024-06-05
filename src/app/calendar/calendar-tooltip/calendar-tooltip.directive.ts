import {
    ComponentRef,
    Directive,
    ElementRef, HostListener,
    Input, OnChanges, SimpleChanges, ViewContainerRef
} from '@angular/core';
import {EventItem} from "../models";
import {CalendarTooltipComponent} from "./calendar-tooltip.component";

@Directive({
  selector: '[calendarTooltip]'
})
export class CalendarTooltipDirective implements OnChanges{

    @Input() eventItem?: EventItem;
    @Input() pseudoStart?: number;
    @Input() pseudoEnd?: number;
    @Input() placement?: string;
    @Input() delay?: number;
    @Input() left: number = 0;
    @Input() top: number = 0;
    @Input() utc: boolean = false;

    private tooltip?: ComponentRef<CalendarTooltipComponent>;

    constructor(
        private elementRef: ElementRef,
        private viewContainerRef: ViewContainerRef
    ){
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['pseudoStart'] || changes['pseudoEnd']) {
            this.update();
        }
    }

    @HostListener('mouseenter')
    onMouseEnter(){
        if (!this.tooltip) {
            this.show();
        }
    }

    @HostListener('mouseleave')
    onMouseLeave(){
        if (this.tooltip) {
            this.hide();
        }
    }

    show() {
        const tooltipRef = this.viewContainerRef.createComponent(CalendarTooltipComponent);
        this.tooltip = tooltipRef;
        tooltipRef.instance.eventItem = this.eventItem;
        tooltipRef.instance.left = this.left!;
        tooltipRef.instance.top = this.top!;
        tooltipRef.instance.update(this.eventItem!.start, this.eventItem!.end, this.utc)
    }

    hide() {
        this.tooltip!.destroy();
        this.tooltip = undefined;
    }

    update() {
        if (this.tooltip) {
            if (this.pseudoStart && this.pseudoEnd) {
                this.tooltip.instance.update(this.pseudoStart, this.pseudoEnd, this.utc);
            } else {
                this.tooltip.instance.update(this.eventItem!.start, this.eventItem!.end, this.utc)

            }
            this.tooltip.instance.left = this.left!;
        }
    }



}
