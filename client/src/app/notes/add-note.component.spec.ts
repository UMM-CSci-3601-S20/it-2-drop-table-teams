import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockNoteService } from 'src/testing/note.service.mock';
import { AddNoteComponent } from './add-note.component';
import { NoteService } from './note.service';
import { DoorBoardService } from '../doorBoard/doorBoard.service';
import { MockDoorBoardService } from 'src/testing/doorBoard.service.mock';


// From team four star code base

describe('AddNoteComponent', () => {
  let addNoteComponent: AddNoteComponent;
  let addNoteForm: FormGroup;
  let calledClose: boolean;
  let fixture: ComponentFixture<AddNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      declarations: [AddNoteComponent],
      providers: [{ provide: NoteService, useValue: new MockNoteService()},
        {provide: DoorBoardService, useValue: new MockDoorBoardService() }]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    calledClose = false;
    fixture = TestBed.createComponent(AddNoteComponent);
    addNoteComponent = fixture.componentInstance;
    addNoteComponent.ngOnInit();
    fixture.detectChanges();
    addNoteForm = addNoteComponent.addNoteForm;
    expect(addNoteForm).toBeDefined();
    expect(addNoteForm.controls).toBeDefined();
  });

  // Not terribly important; if the component doesn't create
  // successfully that will probably blow up a lot of things.
  // Including it, though, does give us confidence that our
  // our component definitions don't have errors that would
  // prevent them from being successfully constructed.
  it('should create the component and form', () => {
    expect(addNoteComponent).toBeTruthy();
    expect(addNoteForm).toBeTruthy();
  });

  // Confirms that an initial, empty form is *not* valid, so
  // people can't submit an empty form.
  it('form should be invalid when empty', () => {
    expect(addNoteForm.valid).toBeFalsy();
  });

  describe('The body field', () => {
    let bodyControl: AbstractControl;

    beforeEach(() => {
      bodyControl = addNoteComponent.addNoteForm.controls[`body`];
    });

    it('should not allow empty body field', () => {
      bodyControl.setValue('');
      expect(bodyControl.valid).toBeFalsy();
      expect(bodyControl.hasError('required')).toBeTruthy();
    });

    it('should be fine with "Kid sick, read chapter 3.1"', () => {
      bodyControl.setValue('Kid sick, read chapter 3.1');
      expect(bodyControl.valid).toBeTruthy();
    });

    it('should fail on really long body messages', () => {
      bodyControl.setValue('moo'.repeat(333));
      expect(bodyControl.valid).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.maxLength(2)`.
      expect(bodyControl.hasError('maxlength')).toBeTruthy();
    });
  });
});
