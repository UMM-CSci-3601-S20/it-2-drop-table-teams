import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { DoorBoard } from '../doorBoard/doorBoard';
import { DoorBoardService } from '../doorBoard/doorBoard.service';
// import { DoorBoardCardComponent } from '../doorBoard/doorBoard-card.component';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-your-doorBoard-component',
  templateUrl: 'your-doorBoard.component.html',
  styleUrls: ['./your-doorBoard.component.scss']

})



export class DoorBoardComponent implements OnInit, OnDestroy {


  constructor(public auth: AuthService, private router: Router, private doorBoardService: DoorBoardService) { }

  @Input() note: DoorBoard;
  @Input() doorBoardSub: string = 'invalid';



  public serverFilteredDoorBoards: DoorBoard[];
  public filteredDoorBoards: DoorBoard[];
  name: string;
  email: string;
  building: string;
  officeNumber: string;
  sub: string;
  currentSub: any;
  public viewType: 'card' | 'list' = 'card';
  getDoorBoardsSub: Subscription;
  getCurrentSub: Subscription;



  getDoorBoardBoards(): void {
    this.unsub();
    this.getCurrentSub =
    this.auth.userProfile$.subscribe(userProfile => {
      this.currentSub = userProfile.sub;
      // console.log(this.currentSub);
  });
    this.unsub();
    this.getDoorBoardsSub = this.doorBoardService.getDoorBoards({
      sub: this.sub,
    }).subscribe(returnedDoorBoards => {
      this.serverFilteredDoorBoards = returnedDoorBoards;
      this.updateFilter();
    }, err => {
      console.log(err);
    });
  }

  public updateFilter(): void {
    this.filteredDoorBoards = this.doorBoardService.filterDoorBoards(
      this.serverFilteredDoorBoards, {sub: this.sub = this.currentSub});
  }

  /**
   * Starts an asynchronous operation to update the boards list
   *
   */
  ngOnInit(): void {
    this.getDoorBoardBoards();
  }

  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getDoorBoardsSub) {
      this.getDoorBoardsSub.unsubscribe();
    }
  }

  createBoard() {
    this.router.navigate(['doorBoards/new']);
}


}
