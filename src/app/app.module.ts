import {NgModule} from '@angular/core';
import {AppComponent} from "./app.component";
import {CalendarModule} from "./calendar/calendar.module";
import {BrowserModule} from "@angular/platform-browser";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CalendarModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
