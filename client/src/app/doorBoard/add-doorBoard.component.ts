import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DoorBoard } from './doorBoard';
import { DoorBoardService } from './doorBoard.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-add-doorBoard',
  templateUrl: './add-doorBoard.component.html',
  styleUrls: []
})
export class AddDoorBoardComponent implements OnInit {

  addDoorBoardForm: FormGroup;

  doorBoard: DoorBoard;

  constructor(private fb: FormBuilder, private doorBoardService: DoorBoardService, private snackBar: MatSnackBar, private router: Router,
              public auth: AuthService) {
  }

  // not sure if this name is magical and making it be found or if I'm missing something,
  // but this is where the red text that shows up (when there is invalid input) comes from
  add_doorBoard_validation_messages = {
    name: [
      {type: 'required', message: 'Name is required'},
      {type: 'minlength', message: 'Name must be more than 1 character long'},
      {type: 'maxlength', message: 'Name cannot be more than 50 characters long'},
      {type: 'pattern', message: 'Name must contain only numbers and letters'},
    ],

    email: [
      {type: 'email', message: 'Email must be formatted properly'},
      {type: 'required', message: 'Email is required'}
    ],

    building: [
      { type: 'required', message: 'building is required' },
      {type: 'minlength', message: 'Building must be at least 2 characters long'},
      {type: 'maxlength', message: 'Building cannot be more than 50 characters long'},
      {type: 'pattern', message: 'Building must contain only numbers and letters'},
    ],
    officeNumber: [
      { type: 'required', message: 'Office number is required' },
      {type: 'minlength', message: 'Office number must be at least 1 characters long'},
      {type: 'maxlength', message: 'Office number cannot be more than 25 characters long'},
      {type: 'pattern', message: 'Office number must contain only numbers and letters'},
    ],
    sub: [
    ],
  };

  createForms() {

    // add doorBoard form validations
    this.addDoorBoardForm = this.fb.group({
      // We allow alphanumeric input and limit the length for name.
      // FIX: this incorrectly rejects doorBoards whose names contain
      // non-English characters.  I'm unclear as to why we're actually
      // doing this check in the first place--if we want to prevent some
      // sort of attack, we should perform actual sanitation rather than
      // simply excluding lists of characters.
      name: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern('^[\\w\\s]+$'),
      ])),
      // We don't need a special validator just for our app here, but there is a default one for email.
      // We will require the email, though.
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.email,
      ])),

      building: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[\\w\\s]+$'),
      ])),

      officeNumber: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern('^[\\w\\s]+$')
      ])),

      sub: new FormControl('', Validators.compose([

      ])),

    });

  }

  ngOnInit() {
    this.createForms();
  }


  submitForm() {
    this.doorBoardService.addDoorBoard(this.addDoorBoardForm.value).subscribe(newID => {
      this.snackBar.open('Added DoorBoard ' + this.addDoorBoardForm.value.name, null, {
        duration: 2000,
      });
      this.router.navigate(['/doorBoards/', newID]);
    }, err => {
      this.snackBar.open('Failed to add the doorBoard', null, {
        duration: 2000,
      });
    });
  }

}
