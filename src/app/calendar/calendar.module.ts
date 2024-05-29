import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TimeSchedulerComponent} from "./time-scheduler/time-scheduler.component";
import {MaterialModule} from "./material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {GridComponent} from "./time-scheduler/grid/grid.component";
import {CalendarHeaderComponent} from "./calendar-header/calendar-header.component";
import {GridItemComponent} from "./time-scheduler/grid/grid-item/grid-item.component";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
      TimeSchedulerComponent,
      GridComponent,
      CalendarHeaderComponent
  ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        MaterialModule,
        GridItemComponent,
        FormsModule,
    ],
  exports: [
      TimeSchedulerComponent,
      GridComponent,
      CalendarHeaderComponent
  ]
})
export class CalendarModule { }
