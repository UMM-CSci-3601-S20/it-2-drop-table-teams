import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule, MatRadioGroup } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';


// Home
import { HomeComponent } from './home/home.component';

// DoorBoard
import { DoorBoardListComponent } from './doorBoard/doorBoard-list.component';
import { DoorBoardService } from './doorBoard/doorBoard.service';
import { AddDoorBoardComponent } from './doorBoard/add-doorBoard.component';
import { DoorBoardPageComponent } from './doorBoard/doorBoard-page.component';
import { DoorBoardCardComponent } from './doorBoard/doorBoard-card.component';

// Note
import { NoteService } from './notes/note.service';
import { EditNoteComponent } from './notes/edit-note.component';
import { AddNoteComponent } from './notes/add-note.component';

// Other
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

// DoorBoard
import { DoorBoardComponent } from './your-doorBoard/your-doorBoard.component';

// Authentication
import { NavBarComponent } from './nav-bar/nav-bar.component';

const MATERIAL_MODULES: any[] = [
  MatListModule,
  MatButtonModule,
  MatIconModule,
  MatToolbarModule,
  MatCardModule,
  MatMenuModule,
  MatSidenavModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatSelectModule,
  MatOptionModule,
  MatFormFieldModule,
  MatDividerModule,
  MatRadioModule,
  MatSnackBarModule
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DoorBoardListComponent,
    AddDoorBoardComponent,
    DoorBoardPageComponent,
    EditNoteComponent,
    AddNoteComponent,
    DoorBoardComponent,
    NavBarComponent,
    DoorBoardCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    HttpClientModule,
    MATERIAL_MODULES,
    LayoutModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
  providers: [
    DoorBoardService,
    NoteService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
