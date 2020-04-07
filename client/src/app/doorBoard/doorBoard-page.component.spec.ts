import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';

// DoorBoard imports
import { DoorBoard } from './doorBoard';
import { DoorBoardService } from './doorBoard.service';
import { DoorBoardPageComponent } from './doorBoard-page.component';
import { MockDoorBoardService } from '../../testing/doorBoard.service.mock';

// Note imports
import { Note } from '../notes/note';
import { NoteService } from '../notes/note.service';
import { MockNoteService } from '../../testing/note.service.mock';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const COMMON_IMPORTS: any[] = [
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatListModule,
  MatDividerModule,
  MatRadioModule,
  MatIconModule,
  BrowserAnimationsModule,
  RouterTestingModule,
];

describe('DoorBoardPageComponent', () => {
  let component: DoorBoardPageComponent;
  let fixture: ComponentFixture<DoorBoardPageComponent>;
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub();


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatCardModule
      ],
      declarations: [DoorBoardPageComponent],
      providers: [
        {provide: DoorBoardService, useValue: new MockDoorBoardService()},
        {provide: NoteService, useValue: new MockNoteService()},
        {provide: activatedRoute, useValue: activatedRoute}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoorBoardPageComponent);
    fixture.detectChanges();

    component = fixture.componentInstance;
  });

  it('should create the component', () => {

  });
});
