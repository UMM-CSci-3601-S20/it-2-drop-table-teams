import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DoorBoard } from './doorBoard';
import { DoorBoardService } from './doorBoard.service';

describe('DoorBoard service: ', () => {
  // A small collection of test doorBoards
  const testDoorBoards: DoorBoard[] = [
    {
      _id: 'chris_id',
      name: 'Chris',
      building: 'Science Hall',
      email: 'chris@this.that',
      officeNumber: '1001',
      sub: 'ABC'
    },
    {
      _id: 'richard_id',
      name: 'Richard Mars',
      building: 'HFA',
      email: 'mars@this.that',
      officeNumber: '2022',
      sub: 'BCD'
    },
    {
      _id: 'william_id',
      name: 'William',
      building: 'Humanities',
      email: 'enterprise@this.that',
      officeNumber: '111',
      sub: 'CDE'
    }
  ];
  let doorBoardService: DoorBoardService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    doorBoardService = new DoorBoardService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getDoorBoards() calls api/doorBoards', () => {

    doorBoardService.getDoorBoards().subscribe(
      doorBoards => expect(doorBoards).toBe(testDoorBoards)
    );
    const req = httpTestingController.expectOne(doorBoardService.doorBoardUrl);

    expect(req.request.method).toEqual('GET');

    req.flush(testDoorBoards);
  });

  it('getDoorBoards() calls api/doorBoards with filter parameter \'name\'', () => {

    doorBoardService.getDoorBoards({ name: 'Chris' }).subscribe(
      doorBoards => expect(doorBoards).toBe(testDoorBoards)
    );

    // Specify that (exactly) one request will be made to the specified URL with the name parameter.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(doorBoardService.doorBoardUrl) && request.params.has('name')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the name parameter was 'Chris'
    expect(req.request.params.get('name')).toEqual('Chris');

    req.flush(testDoorBoards);
  });

  it('getDoorBoards() calls api/doorBoards with filter parameter \'email\'', () => {

    doorBoardService.getDoorBoards({ email: 'mars@this.that' }).subscribe(
      doorBoards => expect(doorBoards).toBe(testDoorBoards)
    );

    // Specify that (exactly) one request will be made to the specified URL with the parameter.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(doorBoardService.doorBoardUrl) && request.params.has('email')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the parameter was correct
    expect(req.request.params.get('email')).toEqual('mars@this.that');

    req.flush(testDoorBoards);
  });

  it('getDoorBoards() calls api/doorBoards with multiple filter parameters', () => {

    doorBoardService.getDoorBoards({ name: 'william', building: 'Humanities', officeNumber: '111', sub: 'CED' }).subscribe(
      doorBoards => expect(doorBoards).toBe(testDoorBoards)
    );

    // Specify that (exactly) one request will be made to the specified URL with the parameters.
    const req = httpTestingController.expectOne(
      (request) => request.url.startsWith(doorBoardService.doorBoardUrl)
        && request.params.has('name') && request.params.has('building') && request.params.has('officenumber')
    );

    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');

    // Check that the parameters are correct
    expect(req.request.params.get('name')).toEqual('william');
    expect(req.request.params.get('building')).toEqual('Humanities');
    expect(req.request.params.get('officenumber')).toEqual('111');
    expect(req.request.params.get('sub')).toEqual('CED');

    req.flush(testDoorBoards);
  });

  it('getDoorBoardById() calls api/doorBoards/id', () => {
    const targetDoorBoard: DoorBoard = testDoorBoards[1];
    const targetId: string = targetDoorBoard._id;
    doorBoardService.getDoorBoardById(targetId).subscribe(
      doorBoard => expect(doorBoard).toBe(targetDoorBoard)
    );

    const expectedUrl: string = doorBoardService.doorBoardUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetDoorBoard);
  });


  it('filterDoorBoards() filters by building', () => {
    expect(testDoorBoards.length).toBe(3);
    const doorBoardCompany = 'HFA';
    expect(doorBoardService.filterDoorBoards(testDoorBoards, { building: doorBoardCompany }).length).toBe(1);
  });

  it('addDoorBoard() calls api/doorBoards/new', () => {

    doorBoardService.addDoorBoard(testDoorBoards[1]).subscribe(
      id => expect(id).toBe('testid')
    );

    const req = httpTestingController.expectOne(doorBoardService.doorBoardUrl + '/new');

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(testDoorBoards[1]);

    req.flush({id: 'testid'});
  });
});
