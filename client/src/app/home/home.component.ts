import { Component, AfterViewInit, ElementRef} from '@angular/core';

declare const gapi: any;

// NOTE: This code is copied from
// https://stackoverflow.com/questions/35530483/google-sign-in-for-websites-and-angular-2-using-typescript/42802835#42802835
// For now, it is only experimental and may be edited or replaced entirely
// For the time being, it doesn't do anything useful other than open an authentication window.
@Component({
  selector: 'app-home-component',
  // template: '<button id="googleBtn">Google Sign-In</button>',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: []
})
export class HomeComponent implements AfterViewInit {

  private clientId = 'CLIENT_ID.apps.googleusercontent.com';

  private scope = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/admin.directory.user.readonly'
  ].join(' ');

  public auth2: any;

  public googleInit() {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: this.clientId,
        cookie_policy: 'single_host_origin',
        scope: this.scope
      });
      this.attachSignin(this.element.nativeElement.firstChild);
    });
  }

  public attachSignin(element) {
    this.auth2.attachClickHandler(element, {},
      (googleUser) => {
        let profile = googleUser.getBasicProfile();
        console.log('Token || ' + googleUser.getAuthResponse().id_token);
        console.log('ID: ' + profile.getId());
        // ...
      }, function (error) {
        console.log(JSON.stringify(error, undefined, 2));
      });
  }

  constructor(private element: ElementRef) {
    console.log('ElementRef: ', this.element);
  }

  ngAfterViewInit() {
    this.googleInit();
  }
}

