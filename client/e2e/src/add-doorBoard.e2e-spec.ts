import {browser, protractor, by, element, utils} from 'protractor';
import { AddDoorBoardPage, TestDoorBoard } from './add-doorBoard.po';
import { E2EUtil } from './e2e.util';
import { emit } from 'cluster';

describe('Add doorBoard', () => {
  let page: AddDoorBoardPage;
  const EC = protractor.ExpectedConditions;

  beforeEach(() => {
    page = new AddDoorBoardPage();
    page.navigateTo();
  });

  it('should have the correct title', () => {
    expect(page.getTitle()).toEqual('New DoorBoard');
  });

  it('should enable and disable the add doorBoard button', async () => {
    expect(element(by.buttonText('ADD DOORBOARD')).isEnabled()).toBe(false);
    await page.typeInput('nameField', 'test');
    expect(element(by.buttonText('ADD DOORBOARD')).isEnabled()).toBe(false);
    await page.typeInput('buildingField', 'test');
    expect(element(by.buttonText('ADD DOORBOARD')).isEnabled()).toBe(false);
    await page.typeInput('officeNumberField', 'test');
    expect(element(by.buttonText('ADD DOORBOARD')).isEnabled()).toBe(false);
    await page.typeInput('emailField', 'billydavis@gmail.com');
    expect(element(by.buttonText('ADD DOORBOARD')).isEnabled()).toBe(true);
  });

  it('should add a new doorBoard and go to the correct page', async () => {
    const doorBoard: TestDoorBoard = {
      name: E2EUtil.randomText(10),
      building: E2EUtil.randomText(15),
      officeNumber: E2EUtil.randomText(4),
      email: E2EUtil.randomText(5) + '@yahoo.com'
    };

    await page.addDoorBoard(doorBoard);

    // Wait until the URL does not contain 'doorBoards/new'
    await browser.wait(EC.not(EC.urlContains('doorBoards/new')), 10000);

    const url = await page.getUrl();
    expect(RegExp('.*\/doorBoards\/[0-9a-fA-F]{24}$', 'i').test(url)).toBe(true);
    expect(url.endsWith('/doorBoards/new')).toBe(false);

    expect(element(by.id('nameField')).getText()).toEqual('Name: ' + doorBoard.name);
    expect(element(by.id('buildingField')).getText()).toEqual('Building: ' + doorBoard.building);
    expect(element(by.id('officeNumberField')).getText()).toEqual('Office Number: ' + doorBoard.officeNumber);
    expect(element(by.id('emailField')).getText()).toEqual('E-mail: ' + doorBoard.email);
  });
});

