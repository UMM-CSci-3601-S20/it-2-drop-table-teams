import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DoorBoard } from './doorBoard';
import { map } from 'rxjs/operators';

@Injectable()
export class DoorBoardService {
  getRegisteredSub(sub: string) {
    throw new Error("Method not implemented.");
  }
  readonly doorBoardUrl: string = environment.API_URL + 'doorBoards';

  constructor(private httpClient: HttpClient) {
  }
  getDoorBoards(filters?: { name?: string, email?: string, building?: string, officeNumber?: string, sub?: string  }): Observable<DoorBoard[]> {
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.name) {
        httpParams = httpParams.set('name', filters.name);
      }
      if (filters.email) {
        httpParams = httpParams.set('email', filters.email);
      }
      if (filters.building) {
        httpParams = httpParams.set('building', filters.building);
      }
      if (filters.officeNumber) {
        httpParams = httpParams.set('officenumber', filters.officeNumber);
      }
      if (filters.sub) {
        httpParams = httpParams.set('sub', filters.sub);
      }
    }
    return this.httpClient.get<DoorBoard[]>(this.doorBoardUrl, {
      params: httpParams,
    });
  }
  getDoorBoardById(id: string): Observable<DoorBoard> {
    const doorBoard = this.httpClient.get<DoorBoard>(this.doorBoardUrl + '/' + id);
    return doorBoard;
  }

  filterDoorBoards(doorBoards: DoorBoard[], filters: { name?: string, email?: string, building?: string, officeNumber?: string, sub?: string}):
   DoorBoard[] {

    let filteredDoorBoards = doorBoards;

    // Filter by name
    if (filters.name) {
      filters.name = filters.name.toLowerCase();

      filteredDoorBoards = filteredDoorBoards.filter(doorBoard => {
        return doorBoard.name.toLowerCase().includes(filters.name);
      });
    }

    // Filter by email
    if (filters.email) {
      filters.email = filters.email.toLowerCase();

      filteredDoorBoards = filteredDoorBoards.filter(doorBoard => {
        return doorBoard.email.toLowerCase().includes(filters.email);
      });
    }

    // Filter by building
    if (filters.building) {
      filters.building = filters.building.toLowerCase();

      filteredDoorBoards = filteredDoorBoards.filter(doorBoard => {
        return doorBoard.building.toLowerCase().includes(filters.building);
      });
    }

    // Filter by officeNumber
    if (filters.officeNumber) {
      filters.officeNumber = filters.officeNumber.toLowerCase();

      filteredDoorBoards = filteredDoorBoards.filter(doorBoard => {
        return doorBoard.officeNumber.toLowerCase().includes(filters.officeNumber);
      });
    }

    // Filter by sub
    if (filters.sub) {
      filters.sub = filters.sub.toLowerCase();

      filteredDoorBoards = filteredDoorBoards.filter(doorBoard => {
        return doorBoard.sub.toLowerCase().includes(filters.sub);
      });
    }

    return filteredDoorBoards;
  }

  addDoorBoard(newDoorBoard: DoorBoard): Observable<string> {
    // Send post request to add a new doorBoard with the doorBoard data as the body.
    return this.httpClient.post<{id: string}>(this.doorBoardUrl + '/new', newDoorBoard).pipe(map(res => res.id));
  }
}
