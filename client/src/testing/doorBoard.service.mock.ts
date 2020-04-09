import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DoorBoard } from '../app/doorBoard/doorBoard';
import { DoorBoardService } from '../app/doorBoard/doorBoard.service';

/**
 * A mock version of DoorBoardService used for testing
 */
@Injectable()
export class MockDoorBoardService extends DoorBoardService {
  static testDoorBoards: DoorBoard[] = [
    {
      _id: 'chris_id',
      name: 'Chris',
      building: 'Science Hall',
      email: 'robi1467@morris.umn.edu',
      officeNumber: '1001',
      sub: 'ABC'
    },
    {
      _id: 'richard_id',
      name: 'Richard Mars',
      building: 'HFA',
      email: 'robi1467@morris.umn.edu',
      officeNumber: '2022',
      sub: 'DEF'
    },
    {
      _id: 'jamie_id',
      name: 'Jamie',
      building: 'Humanities',
      email: 'robi1467@morris.umn.edu',
      officeNumber: '111',
      sub: 'GHI'
    }
  ];

  constructor() {
    super(null);
  }

  getDoorBoards(filters?: { name?: string, email?: string, building?: string, officeNumber?: string , sub?: string}): Observable<DoorBoard[]> {
    return of(MockDoorBoardService.testDoorBoards);
  }

  getDoorBoardById(id: string): Observable<DoorBoard> {
    // If the specified ID is for the first test doorBoard,
    // return that doorBoard, otherwise return `null` so
    // we can test illegal doorBoard requests.
    if (id === MockDoorBoardService.testDoorBoards[0]._id) {
      return of(MockDoorBoardService.testDoorBoards[0]);
    } else {
      return of(null);
    }
  }

}
