import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Note, NewNote } from './note';
import { NoteService } from './note.service';

describe('Note service: ', () => {

  const testNotes: Note[] = [
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
      status: 'deleted'
    },
    {
      _id: 'third_id',
      doorBoardID: 'test-id',
      body: 'Third test id body.',
      addDate: new Date().toISOString(),
      expireDate: '2025-03-06T22:03:38+0000',
      status: 'template'
    }
  ];

  const newNote: NewNote = {
      doorBoardID: 'test-id',
      body: 'Fourth body.',
      addDate: new Date().toISOString(),
      expireDate: '2025-03-06T22:03:38+0000',
      status: 'active'
  };

  let noteService: NoteService;

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    noteService = new NoteService(httpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('the getNotesByDoorBoard() method', () => {
    it('calls /api/notes', () => {
      noteService.getNotesByDoorBoard('test-id').subscribe(notes => {
        expect(notes).toBe(testNotes);
      });


      const req = httpTestingController.expectOne(request =>
        request.url.startsWith(noteService.noteUrl)
          && request.params.has('doorBoardid')
      );

      expect(req.request.method).toEqual('GET');

     // Check that the name parameter was 'Chris'
      expect(req.request.params.get('doorBoardid')).toEqual('test-id');

      req.flush(testNotes);
    } );

    it('sends along the status query-parameter', () => {
      noteService.getNotesByDoorBoard('test-id', { status: 'active' }).subscribe(notes => {
        expect(notes).toBe(testNotes);
      });

      const req = httpTestingController.expectOne(request =>
        request.url.startsWith(noteService.noteUrl)
          && request.params.has('doorBoardid')
          && request.params.has('status')
      );

      expect(req.request.method).toEqual('GET');

      expect(req.request.params.get('doorBoardid')).toEqual('test-id');
      expect(req.request.params.get('status')).toEqual('active');

      req.flush(testNotes);
    });
  });

  describe('the addNewNote() method', () => {
    it('calls /api/notes/new', () => {
      noteService.addNewNote(newNote).subscribe(id => {
        expect(id).toBe('foo');
      });

      const req = httpTestingController.expectOne(request =>
        request.url.startsWith(noteService.noteUrl + '/new')
      );

      expect(req.request.method).toEqual('POST');

      expect(req.request.body).toEqual(newNote);

      req.flush({id: 'foo'});
    });
  });
});
