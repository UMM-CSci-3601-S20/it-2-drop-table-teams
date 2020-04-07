import {browser, by, element, Key, ElementFinder} from 'protractor';

export interface TestDoorBoard {
  name: string;
  email: string;
  building: string;
  officeNumber: string;
}

export class AddDoorBoardPage {
  navigateTo() {
    return browser.get('/doorBoards/new');
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

  getTitle() {
    const title = element(by.className('add-doorBoard-title')).getText();
    return title;
  }

  async typeInput(inputId: string, text: string) {
    const input = element(by.id(inputId));
    await input.click();
    await input.sendKeys(text);
  }

  selectMatSelectValue(selectID: string, value: string) {
    const sel = element(by.id(selectID));
    return sel.click().then(() => {
      return element(by.css('mat-option[value="' + value + '"]')).click();
    });
  }

  clickAddDoorBoard() {
    return element(by.buttonText('ADD DOORBOARD')).click();
  }

  async addDoorBoard(newDoorBoard: TestDoorBoard) {
    await this.typeInput('nameField', newDoorBoard.name);
    await this.typeInput('buildingField', newDoorBoard.building);
    await this.typeInput('officeNumberField', newDoorBoard.officeNumber);
    await this.typeInput('emailField', newDoorBoard.email);
    return this.clickAddDoorBoard();
  }
}
