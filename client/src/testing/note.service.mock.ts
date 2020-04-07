import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Note } from '../app/notes/note';
import { NoteService } from '../app/notes/note.service';

@Injectable()
export class MockNoteService extends NoteService {
  static testNotes: Note[] = [
    {
      _id: 'first_id',
      doorBoardID: 'test-id',
      body: 'This is the body of the first test id. It is somewhat long.',
      addDate: new Date().toISOString(),
      expireDate: '2025-03-06T22:03:38+0000',
      status: 'active'
    },
    {
      _id: 'second_id',
      doorBoardID: 'test-id',
      body: 'This is the second test id.',
      addDate: new Date().toISOString(),
      expireDate: '2025-03-06T22:03:38+0000',
      status: 'active'
    },
    {
      _id: 'third_id',
      doorBoardID: 'test-id',
      body: 'Third test id body.',
      addDate: new Date().toISOString(),
      expireDate: '2025-03-06T22:03:38+0000',
      status: 'template'
    },
    {
      _id: 'fourth_id',
      doorBoardID: 'test-id',
      body: 'This is the fourth test id.',
      addDate: new Date().toISOString(),
      expireDate: '2025-03-06T22:03:38+0000',
      status: 'template'
    },
    {
      _id: 'fifth_id',
      doorBoardID: 'test-id',
      body: 'Fifth id test body.',
      addDate: new Date().toISOString(),
      expireDate: '2025-03-06T22:03:38+0000',
      status: 'draft'
    },
    {
      _id: 'sixth_id',
      doorBoardID: 'test-id',
      body: 'Sixth id test body.',
      addDate: new Date().toISOString(),
      expireDate: '2025-03-06T22:03:38+0000',
      status: 'draft'
    },
    {
      _id: 'seventh_id',
      doorBoardID: 'test-id',
      body: 'Fifth id test body.',
      addDate: new Date().toISOString(),
      expireDate: '2025-03-06T22:03:38+0000',
      status: 'deleted'
    },
    {
      _id: 'eighth_id',
      doorBoardID: 'test-id',
      body: 'Eighth id test body.',
      addDate: new Date().toISOString(),
      expireDate: '2025-03-06T22:03:38+0000',
      status: 'deleted'
    }
  ];


  constructor() {
    super(null);
  }

  getNotesByDoorBoard(DoorBoardId: string): Observable<Note[]> {
   let notesObtained: Note[];
   let amount = 0;
   for(let i = 0; i < 8; i++){
      if (DoorBoardId === MockNoteService.testNotes[i].doorBoardID) {
        notesObtained[amount] = MockNoteService.testNotes[i];
        amount++;
      }
    }
   return of(notesObtained);

  }

}
