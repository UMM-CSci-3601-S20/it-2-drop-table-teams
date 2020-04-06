import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { Owner } from './owner';
import { OwnerService } from './owner.service';

@Component({
  selector: 'app-owner-card',
  templateUrl: './owner-card.component.html',
  styleUrls: ['./owner-card.component.scss']
})
export class OwnerCardComponent implements OnInit {

  ownerForm: Owner;
  DoorBoardOwnerForm: FormGroup;

  @Input() owner: Owner;
  @Input() simple ? = false;

  constructor(private fb: FormBuilder, private ownerService: OwnerService) { }

  ngOnInit(): void {
  }

}
