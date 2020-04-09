import { Component, OnInit, OnDestroy } from '@angular/core';
import { DoorBoard } from './doorBoard';
import { DoorBoardService } from './doorBoard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doorBoard-list-component',
  templateUrl: 'doorBoard-list.component.html',
  styleUrls: ['./doorBoard-list.component.scss'],
  providers: []
})

export class DoorBoardListComponent implements OnInit, OnDestroy  {
  // These are public so that tests can reference them (.spec.ts)
  public serverFilteredDoorBoards: DoorBoard[];
  public filteredDoorBoards: DoorBoard[];

  public doorBoardName: string;
  public doorBoardEmail: string;
  public doorBoardBuilding: string;
  public doorBoardOfficeNumber: string;
  public doorBoardSub: string;
  public viewType: 'list';
  getDoorBoardsSub: Subscription;


  // Inject the DoorBoardService into this component.
  // That's what happens in the following constructor.
  //
  // We can call upon the service for interacting
  // with the server.

  constructor(private doorBoardService: DoorBoardService) {

  }
  getDoorBoardsFromServer(): void {
    this.unsub();
    this.getDoorBoardsSub = this.doorBoardService.getDoorBoards({
    }).subscribe(returnedDoorBoards => {
      this.serverFilteredDoorBoards = returnedDoorBoards;
      this.updateFilter();
    }, err => {
      console.log(err);
    });
  }


  public updateFilter(): void {
    this.filteredDoorBoards = this.doorBoardService.filterDoorBoards(
      this.serverFilteredDoorBoards, {
        name: this.doorBoardName,
        email: this.doorBoardEmail,
        building: this.doorBoardBuilding,
        officeNumber: this.doorBoardOfficeNumber,
        sub: this.doorBoardSub,
       });
  }

  /**
   * Starts an asynchronous operation to update the doorBoards list
   *
   */
  ngOnInit(): void {
    this.getDoorBoardsFromServer();
  }

  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getDoorBoardsSub) {
      this.getDoorBoardsSub.unsubscribe();
    }
  }
}

