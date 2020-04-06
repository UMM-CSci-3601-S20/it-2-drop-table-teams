import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Owner } from '../owner/owner';
import { OwnerService } from '../owner/owner.service';
// import { OwnerCardComponent } from '../owner/owner-card.component';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-your-doorboard-component',
  templateUrl: 'your-doorboard.component.html',
  styleUrls: ['./your-doorboard.component.scss']

})



export class DoorBoardComponent implements OnInit, OnDestroy {


  constructor(public auth: AuthService, private router: Router, private ownerService: OwnerService) { }

  @Input() note: Owner;
  @Input() ownerSub: string = 'invalid';



  public serverFilteredOwners: Owner[];
  public filteredOwners: Owner[];
  name: string;
  email: string;
  building: string;
  officeNumber: string;
  sub: string;
  currentSub: any;
  public viewType: 'card' | 'list' = 'card';
  getDoorBoardsSub: Subscription;
  getCurrentSub: Subscription;



  getOwnerBoards(): void {
    this.unsub();
    this.getCurrentSub =
    this.auth.userProfile$.subscribe(userProfile => {
      this.currentSub = userProfile.sub;
      // console.log(this.currentSub);
  });
    this.unsub();
    this.getDoorBoardsSub = this.ownerService.getOwners({
      sub: this.sub,
    }).subscribe(returnedOwners => {
      this.serverFilteredOwners = returnedOwners;
      this.updateFilter();
    }, err => {
      console.log(err);
    });
  }

  public updateFilter(): void {
    this.filteredOwners = this.ownerService.filterOwners(
      this.serverFilteredOwners, {sub: this.sub = this.currentSub});
  }

  /**
   * Starts an asynchronous operation to update the boards list
   *
   */
  ngOnInit(): void {
    this.getOwnerBoards();
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
    this.router.navigate(['owners/new']);
}


}
