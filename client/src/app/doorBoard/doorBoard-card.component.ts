import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { DoorBoard } from './doorBoard';
import { DoorBoardService } from './doorBoard.service';

@Component({
  selector: 'app-doorBoard-card',
  templateUrl: './doorBoard-card.component.html',
  styleUrls: ['./doorBoard-card.component.scss']
})
export class DoorBoardCardComponent implements OnInit {

  doorBoardForm: DoorBoard;
  DoorBoardDoorBoardForm: FormGroup;

  @Input() doorBoard: DoorBoard;
  @Input() simple ? = false;

  constructor(private fb: FormBuilder, private doorBoardService: DoorBoardService) { }

  ngOnInit(): void {
  }

}
