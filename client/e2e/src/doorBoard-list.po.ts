import { browser, by, element } from 'protractor';

export class DoorBoardPage {
  navigateTo() {
    return browser.get('/doorBoards');
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

  getDoorBoardTitle() {
    const title = element(by.className('doorBoard-list-title')).getText();
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

  getDoorBoardListItems() {
    return element(by.className('doorBoard-nav-list')).all(by.className('doorBoard-list-item'));
  }

  clickViewDoorBoard() {
    return element(by.className('doorBoard-list-item')).click();
  }
}
