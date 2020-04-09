import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Note, NoteStatus } from '../notes/note';
import { OnInit, Component, OnDestroy, SecurityContext } from '@angular/core';
import { DoorBoardService } from './doorBoard.service';
import { DoorBoard } from './doorBoard';
import { Subscription, forkJoin, Observable } from 'rxjs';
import { NoteService } from '../notes/note.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../auth/auth.service';
import { HttpParameterCodec } from "@angular/common/http";
import { async } from '@angular/core/testing';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-doorBoard-page-component',
  templateUrl: 'doorBoard-page.component.html',
  styleUrls: ['doorBoard-page.component.scss'],
  providers: []
})

export class DoorBoardPageComponent implements OnInit, OnDestroy {

  constructor(private doorBoardService: DoorBoardService, private noteService: NoteService,
              private route: ActivatedRoute, private sanitizer: DomSanitizer, private auth: AuthService) { }

  public notes: Note[];
  public serverFilteredNotes: Note[];
  public filteredNotes: Note[];
  public GcalURL: SafeResourceUrl;

  doorBoard: DoorBoard;
  id: string;

  getNotesSub: Subscription;
  getDoorBoardSub: Subscription;

  public noteStatus: NoteStatus = 'active';
  public noteAddDate: Date;
  public noteExpireDate: Date;
  public noteBody: string;
  public getCurrentSub: Subscription;
  public currentSub: string = 'invalid';




  public getNotesFromServer(): void {
    this.unsub();
    this.getNotesSub = this.noteService.getNotesByDoorBoard(
      this.id,{
        status: this.noteStatus,
        body: this.noteBody
      }).subscribe(returnedNotes => {
        this.serverFilteredNotes = returnedNotes;
        this.updateFilter();
      }, err => {
        console.log(err);
      });
  }

  public updateFilter(): void {
    this.filteredNotes = this.noteService.filterNotes(
      this.serverFilteredNotes,
      {
        addDate: this.noteAddDate,
        expireDate: this.noteExpireDate
      });
}

  public createGmailConnection(doorBoardEmail: string): void {
    let gmailUrl = doorBoardEmail.replace('@', '%40'); // Convert doorBoard e-mail to acceptable format for connection to gCalendar
    console.log('BEING CALLED');
    gmailUrl = 'https://calendar.google.com/calendar/embed?mode=WEEK&src='+ gmailUrl; // Connection string
    //this.GcalURL = gmailUrl; // Set the global connection string
    this.GcalURL = this.sanitizer.bypassSecurityTrustResourceUrl(gmailUrl);
  }
  // public returnSafeLink(): SafeResourceUrl{
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(this.GcalURL);  // Return a "safe" link to gCalendar
  // }

  public getName(): string {
    return this.doorBoard.name;
  }
  public getBuilding(): string {
    return this.doorBoard.building;
  }
  public getOfficeNumber(): string {
    return this.doorBoard.officeNumber;
  }
  public getEmail(): string {
    return this.doorBoard.email;
  }

  public getSub(): string {
    // console.log('From ID: ' + this.doorBoard.sub);
    return this.doorBoard.sub;
  }


  public getLoginSub(): Observable<string> {
    const currentSub = this.auth.userProfile$.pipe(
      map(profile => {
        if (profile) {
          return JSON.stringify(profile.sub).replace(/['"]+/g, '');
        } else {
          return null;
        }
      })
    );
    return currentSub;
  }


  public compareSubs(): Observable<boolean> {
    return this.getLoginSub().pipe(map(val => val !== null && val === this.getSub()));
  }


  ngOnInit(): void {
    // Subscribe doorBoard's notes
    this.route.paramMap.subscribe((pmap) => {
      this.id = pmap.get('id');
      if (this.getNotesSub){
        this.getNotesSub.unsubscribe();
      }
      this.getNotesSub = this.noteService.getNotesByDoorBoard(this.id).subscribe( notes => this.notes = notes);
      this.getNotesFromServer();
      if (this.getDoorBoardSub) {
        this.getDoorBoardSub.unsubscribe();
      }
      this.getDoorBoardSub = this.doorBoardService.getDoorBoardById(this.id).subscribe( async (doorBoard: DoorBoard) => {
      this.doorBoard = doorBoard;
      this.createGmailConnection(this.doorBoard.email);
    });
  });
  }


  ngOnDestroy(): void {
    if (this.getNotesSub) {
      this.getNotesSub.unsubscribe();
    }
    if (this.getDoorBoardSub) {
      this.getDoorBoardSub.unsubscribe();
    }
  }

  unsub(): void {
    if (this.getNotesSub) {
      this.getNotesSub.unsubscribe();
    }

    if (this.getDoorBoardSub) {
      this.getDoorBoardSub.unsubscribe();
    }
  }

}
