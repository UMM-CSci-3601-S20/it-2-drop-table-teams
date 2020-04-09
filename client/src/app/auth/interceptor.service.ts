import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  // This class comes verbatim from Auth0's tutorial:
  // https://auth0.com/docs/quickstart/spa/angular2/02-calling-an-api#create-an-http-interceptor

  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.shouldThereBeAToken(req)) {
      return this.requestWithTokenAttached(req, next);
    }

    return next.handle(req);
  }

  private shouldThereBeAToken(req: HttpRequest<any>): boolean {
    let endpoint: string;
    const match = req.url.match(/^\/api\/(.*?)\/?$/);
    if (match) {
      endpoint = match[1];
    } else {
      // This request isn't going to our api; don't bother
      // including a JWT.
      return false;
    }

    switch (req.method) {
      case 'GET':
        if (endpoint.startsWith('doorBoards')) {
          // DoorBoards are always public.
          return false;
        } else if (endpoint.startsWith('notes')) {
          // Active notes are public; all other notes are private.
          if (req.params.get('status') === 'active') {
            return false;
          } else {
            return true;
          }
        } else {
          // Assume that all other GET requests are public.
          return false;
        }

      default:
        // Assume that all other requests are private.
        return true;
    }
  }

  private requestWithTokenAttached(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.auth.getTokenSilently$().pipe(
      mergeMap(token => {
        const tokenReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next.handle(tokenReq);
      }),
      catchError(err => throwError(err))
    );
  }
}
