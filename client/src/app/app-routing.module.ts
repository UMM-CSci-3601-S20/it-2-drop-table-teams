import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DoorBoardListComponent } from './doorBoard/doorBoard-list.component';
import { AddDoorBoardComponent } from './doorBoard/add-doorBoard.component';
import { DoorBoardPageComponent } from './doorBoard/doorBoard-page.component';
import { EditNoteComponent } from './notes/edit-note.component';
import { AddNoteComponent } from './notes/add-note.component';
import { DoorBoardComponent} from './your-doorBoard/your-doorBoard.component';
import { AuthGuard } from './auth/auth.guard';


const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'doorBoards', component: DoorBoardListComponent},
  {path: 'doorBoards/new', component: AddDoorBoardComponent, canActivate: [AuthGuard]},
  {path: 'doorBoards/:id', component: DoorBoardPageComponent},
  {path: 'notes', component: DoorBoardPageComponent},
  {path: 'notes/new', component: AddNoteComponent},
  {path: 'notes/edit', component: EditNoteComponent},
  {path: 'your-doorBoard', component: DoorBoardComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {


 }
