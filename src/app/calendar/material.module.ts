import { NgModule } from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatButtonModule} from "@angular/material/button";
import {CdkDrag} from "@angular/cdk/drag-drop";
import {MatDivider} from "@angular/material/divider";
import {FormsModule} from "@angular/forms";



@NgModule({
    declarations: [],
    imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSidenavModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        CdkDrag,
        MatDivider,
        FormsModule,
    ],
    exports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSidenavModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        CdkDrag,
        MatDivider,
        FormsModule,
    ]
})
export class MaterialModule { }
