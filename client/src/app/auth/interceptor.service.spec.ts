import { HttpHandler, HttpRequest, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { InterceptorService } from './interceptor.service';
import { AuthService } from './auth.service';

describe('The interceptor', () => {
  let interceptor: InterceptorService;
  let auth: AuthService;
  let next: HttpHandler;
  let requestsAndWhetherTheyreSecure: [HttpRequest<any>, boolean][];

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({});

    auth = jasmine.createSpyObj('auth', ['getTokenSilently$']);

    interceptor = new InterceptorService(auth);

    next = jasmine.createSpyObj('next', ['handle']);

    requestsAndWhetherTheyreSecure = [
      [
        new HttpRequest<any>('GET', '/api/notes'),
        true,
      ],
      [
        new HttpRequest<any>('GET', '/api/notes', {
          params: new HttpParams().append('status', 'active')}
        ),
        false,
      ],
      [
        new HttpRequest<any>('GET', '/api/notes', {
          params: new HttpParams().append('status', 'draft')}
        ),
        true,
      ],
      [
        new HttpRequest<any>('POST', '/api/notes/new', { iAm: 'the request body' }),
        true,
      ],
      [
        new HttpRequest<any>('DELETE', '/api/notes/12121212'),
        true,
      ],
      [
        new HttpRequest<any>('PATCH', '/api/notes/12121212', { iAm: 'the request body' }),
        true,
      ],
      [
        new HttpRequest<any>('GET', '/api/doorBoards'),
        false,
      ],
      [
        new HttpRequest<any>('GET', '/api/doorBoards/12121212'),
        false,
      ],
      [
        new HttpRequest<any>('POST', '/api/doorBoards/new', { iAm: 'the request body' }),
        true,
      ]
    ];

  });

  describe('The shouldThereBeAToken() method', () => {
    it('correctly determines whether or not there should be a JWT attached to any given request', () => {
      for (const [request, isItSecure] of requestsAndWhetherTheyreSecure) {
        expect(interceptor.shouldThereBeAToken(request)).toBe(isItSecure);
      }
    });
  });
});
