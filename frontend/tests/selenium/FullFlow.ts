
import { Builder, Browser, By, Key, until } from 'selenium-webdriver';

import chrome from 'selenium-webdriver/chrome'


let driver = new webdriver.Builder()
  .forBrowser(webdriver.Browser.CHROME)
  .setChromeOptions(/* ... */)
  .build()