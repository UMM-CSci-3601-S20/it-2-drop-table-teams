import { HttpHandler, HttpRequest, HttpParams } from '@angular/common/http';
import { TestBed, async } from '@angular/core/testing';
import { InterceptorService } from './interceptor.service';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('The interceptor', () => {
  let interceptor: InterceptorService;
  let auth: AuthService;
  let next: HttpHandler;

  const requestsAndWhetherTheyreSecure: [HttpRequest<any>, boolean][] = [
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

  beforeEach(() => {
    TestBed.configureTestingModule({});

    auth = jasmine.createSpyObj('auth', ['getTokenSilently$']) as jasmine.SpyObj<AuthService>;
    (auth as jasmine.SpyObj<AuthService>)
      .getTokenSilently$.and.callFake(() => of('super secure token'));

    interceptor = new InterceptorService(auth);

    next = jasmine.createSpyObj('next', ['handle']);
    // next.handle(...) needs to return an observable or else RxJS will
    // complain!
    (next as jasmine.SpyObj<HttpHandler>)
      .handle.and.callFake(() => of(null));
  });

  describe('The shouldThereBeAToken() method', () => {
    describe('correctly determines whether or not there should be a JWT attached to the following requests:', () => {
      console.log(requestsAndWhetherTheyreSecure);
      for (const [request, isItSecure] of requestsAndWhetherTheyreSecure) {
        it(`${request.method} ${request.url}`, () => {
          expect(interceptor.shouldThereBeAToken(request)).toBe(isItSecure);
        });
      }
    });
  });

  describe('The intecept() method', () => {
    describe('calls next.handle(...) when given the following requests:', () => {
      for (const [request] of requestsAndWhetherTheyreSecure) {
        it(`${request.method} ${request.url}`, async(() => {
          interceptor.intercept(request, next).subscribe(() => {
            expect(next.handle).toHaveBeenCalledTimes(1);
          });
        }));
      }
    });

    describe('puts a JWT in the header in a given request iff that request is secure:', () => {
      for (const [request, isItSecure] of requestsAndWhetherTheyreSecure) {
        it(`${request.method} ${request.url}`, async(() => {
          interceptor.intercept(request, next).subscribe(() => {
            const theRequestPassedAlong = (next as jasmine.SpyObj<HttpHandler>)
              .handle.calls.argsFor(0)[0];

            expect(theRequestPassedAlong.headers.has('Authorization')).toBe(isItSecure);

            if (isItSecure) {
              expect(theRequestPassedAlong.headers.get('Authorization'))
                .toBe('Bearer super secure token');
            }
          });
        }));
      }
    });
  });
});
