import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OwnerListComponent } from './owner/owner-list.component';
import { AddOwnerComponent } from './owner/add-owner.component';
import { OwnerPageComponent } from './owner/owner-page.component';
import { EditNoteComponent } from './notes/edit-note.component';
import { AddNoteComponent } from './notes/add-note.component';
import { AccountComponent } from './account/account.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './auth/interceptor.service';



const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'owners', component: OwnerListComponent},
  {path: 'owners/new', component: AddOwnerComponent},
  {path: 'owners/:id', component: OwnerPageComponent},
  {path: 'notes', component: OwnerPageComponent},
  {path: 'notes/new', component: AddNoteComponent},
  {path: 'notes/edit', component: EditNoteComponent},
  {path: 'account', component: AccountComponent}
];
// Due to using different request types rather than different routes, we don't seem to need
// to lock down a *route* to provide authentication.  However, if we do decide we need that
// (for instance, due to having a page that displays "my edit page" and we want to make sure
// that whoever views it is logged in as *somebody*), we could do it by adding canActivate: AuthGuard
// to the route in question.
// n.b. the notes/edit path doesn't seem to be used anywhere.  We also don't really have an EditNoteComponent though,
// so.  Arguably, we don't need notes/new at all either, and can just direct the POST request directly at notes.

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    },
    Router
  ]
})
export class AppRoutingModule {


 }
