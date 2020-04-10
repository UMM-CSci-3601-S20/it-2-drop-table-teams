import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { MockDoorBoardService } from '../../testing/doorBoard.service.mock';
import { DoorBoard } from './doorBoard';
import { DoorBoardListComponent } from './doorBoard-list.component';
import { DoorBoardService } from './doorBoard.service';
import { MatIconModule } from '@angular/material/icon';

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

describe('DoorBoard list', () => {

  let doorBoardList: DoorBoardListComponent;
  let fixture: ComponentFixture<DoorBoardListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [DoorBoardListComponent],
      // providers:    [ DoorBoardService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: DoorBoardService, useValue: new MockDoorBoardService() }]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(DoorBoardListComponent);
      doorBoardList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('contains all the doorBoards', () => {
    expect(doorBoardList.serverFilteredDoorBoards.length).toBe(3);
  });

  it('contains a doorBoard named \'Chris\'', () => {
    expect(doorBoardList.serverFilteredDoorBoards.some((doorBoard: DoorBoard) => doorBoard.name === 'Chris')).toBe(true);
  });

  it('contain a doorBoard named \'Jamie\'', () => {
    expect(doorBoardList.serverFilteredDoorBoards.some((doorBoard: DoorBoard) => doorBoard.name === 'Jamie')).toBe(true);
  });

  it('doesn\'t contain a doorBoard named \'Santa\'', () => {
    expect(doorBoardList.serverFilteredDoorBoards.some((doorBoard: DoorBoard) => doorBoard.name === 'Santa')).toBe(false);
  });
});

describe('Misbehaving DoorBoard List', () => {
  let doorBoardList: DoorBoardListComponent;
  let fixture: ComponentFixture<DoorBoardListComponent>;

  let doorBoardServiceStub: {
    getDoorBoards: () => Observable<DoorBoard[]>;
    getDoorBoardsFiltered: () => Observable<DoorBoard[]>;
  };

  beforeEach(() => {
    // stub DoorBoardService for test purposes
    doorBoardServiceStub = {
      getDoorBoards: () => new Observable(observer => {
        observer.error('Error-prone observable');
      }),
      getDoorBoardsFiltered: () => new Observable(observer => {
        observer.error('Error-prone observable');
      })
    };

    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [DoorBoardListComponent],
      // providers:    [ DoorBoardService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: DoorBoardService, useValue: doorBoardServiceStub }]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(DoorBoardListComponent);
      doorBoardList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('generates an error if we don\'t set up a OwnListService', () => {
    // Since the observer throws an error, we don't expect owns to be defined.
    expect(doorBoardList.serverFilteredDoorBoards).toBeUndefined();
  });
});
