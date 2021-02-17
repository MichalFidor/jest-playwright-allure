const Allure = require('allure-js-commons');
const stripAnsi = require('strip-ansi');
const Reporter = require('./reporter');
const fs = require('fs');

function registerAllureReporter() {
  const allure = new Allure();
  const reporter = (global.reporter = new Reporter(allure));
  let asyncFlow = null;
  let logError = [];
  let logPageError = [];

  const wait = async () => {
    await asyncFlow;
    asyncFlow = null;
  };

  const addTaskToFlow = callback => {
    if (asyncFlow == null) {
      asyncFlow = callback();
    } else {
      asyncFlow = asyncFlow.then(callback);
    }
  };

  const addStatus = async (spec, failure) => {
    let error;
    if (spec.status === 'pending') {
      error = { message: spec.pendingReason };
      return error;
    }
    if (spec.status === 'disabled') {
      error = { message: 'This test was disabled' };
      return error;
    }
    if (failure) {
      error = {
        message: stripAnsi(failure.message),
        stack: stripAnsi(failure.stack),
      };
      if (logError.length || logPageError.length) {
        const errorText = `${logError.join('\n')}\n${logPageError.join('\n')}`;
        allure.addAttachment('console error', errorText, 'text/plain');
      }
      const rx = /See diff for details: (.*)/g;
      const arrMessage = rx.exec(error.message);
      if (arrMessage) {
        const diffImage = fs.readFileSync(arrMessage[1]);
        allure.addAttachment('Difference image', diffImage, 'image/png');
        return error;
      }
    }
    return error;
  };

  const asyncSpecDone = async spec => {
    const failure =
      spec.failedExpectations && spec.failedExpectations.length
        ? spec.failedExpectations[0]
        : undefined;
    const error = await addStatus(spec, failure);
    allure.endCase(spec.status, error);
  };

  beforeEach(() => wait());
  afterAll(() => wait());

  jasmine.getEnv().addReporter({
    suiteStarted: suite => {
      addTaskToFlow(async () => {
        page.on('error', err => {
          logError.push(err.toString());
        });
        page.on('pageerror', pageErr => {
          logPageError.push(pageErr.toString());
        });
        allure.startSuite(suite.fullName);
      });
    },
    suiteDone: () => {
      addTaskToFlow(async () => allure.endSuite());
    },
    specStarted: spec => {
      addTaskToFlow(async () => {
        logError = [];
        logPageError = [];
        allure.startCase(spec.fullName);
        if (global.browserName) {
          allure.getCurrentTest().addParameter('argument', 'Browser: ', `${global.browserName} v. ${browser.version()}`);
        }
      });
    },
    specDone: spec => {
      addTaskToFlow(async () => asyncSpecDone(spec));
    },
  });
}

module.exports = registerAllureReporter;
