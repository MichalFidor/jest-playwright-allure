jest-playwright-allure
=========
NOTICE: This package is forked from `jest-puppeteer-allure` and adjusted to my personal requirements. 
It allows you to generate an allure report. The allure report contains screenshots and errors from the browser console if the test fails.
## Getting Started
### Prerequisites
The following packages must be installed in your project: `jest` and `playwright`.
And `page` variable should be global variable.
### Installing
```
npm install --save-dev jest-playwright-allure
```

### Usage
Add to jest config:
```
reporters: ["default", "jest-playwright-allure"]
```
or
```
setupFilesAfterEnv: ['jest-playwright-allure/src/registerAllureReporter']
```
**If you have your own setupTestFrameworkScriptFile file**, you need to manually register reporter, for it you need add import:
```js
import registerAllureReporter from 'jest-playwright-allure/src/registerAllureReporter';
```


#### Advanced features
You can add description, screenshots, steps, severity and lots of other 
fancy stuff to your reports.

Depending on configuration of your project, global variable `reporter` available in your tests with such methods:
```
    description(description: string): this;
    severity(severity: Severity): this;
    epic(epic: string): this;
    feature(feature: string): this;
    story(story: string): this;
    startStep(name: string): this;
    endStep(status?: Status): this;
    addArgument(name: string): this;
    addEnvironment(name: string, value: string): this;
    addAttachment(name: string, buffer: any, type: string): this;
    addLabel(name: string, value: string): this;
    addParameter(paramName: string, name: string, value: string): this;
```
Example:
```js
it('Test', async () => {
  reporter
    .feature('Feature')
    .story('Story');
  await page.goto('http://example.com');
  const screenshot = await page.screenshot();
  reporter.addAttachment('Screenshot', screenshot, 'image/jpg');
})
``` or 
```js
it('Test', async () => {
  global.reporter
    .feature('Feature')
    .story('Story');
  await page.goto('http://example.com');
  const screenshot = await page.screenshot();
  reporter.addAttachment('Screenshot', screenshot, 'image/jpg');
})
```
If you use [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot) then diff image attach to test report. 