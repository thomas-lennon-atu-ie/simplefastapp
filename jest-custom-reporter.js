import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class SimpleFastReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
    this.testResults = [];
    this.startTime = new Date();
    this.endTime = null;
    this.rootDir = process.cwd();
  }

  onRunStart() {
    this.startTime = new Date();
    console.log('\nStarting SimpleFast tests at', this.startTime.toLocaleString());
  }

  onTestResult(test, testResult) {
    // Get relative path instead of absolute path
    const relativePath = path.relative(this.rootDir, testResult.testFilePath);
    
    this.testResults.push({
      testPath: testResult.testFilePath,
      testName: relativePath, // Store the relative path as the test name
      status: testResult.numFailingTests > 0 ? 'failed' : 'passed',
      numPassingTests: testResult.numPassingTests,
      numFailingTests: testResult.numFailingTests,
      numPendingTests: testResult.numPendingTests,
      testResults: testResult.testResults,
      duration: testResult.perfStats.end - testResult.perfStats.start,
    });
  }

  onRunComplete(contexts, results) {
    this.endTime = new Date();
    const duration = (this.endTime - this.startTime) / 1000;
    
    const htmlReport = this.generateHtmlReport(results, duration);
    
    const reportDir = path.join(process.cwd(), 'test-reports');
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.join(reportDir, `test-report-${this.startTime.toISOString().replace(/[:.]/g, '-')}.html`);
    fs.writeFileSync(reportPath, htmlReport);
    
    console.log(`\nTest report generated: ${reportPath}`);
    console.log(`Tests completed in ${duration.toFixed(2)} seconds`);
    console.log(`${results.numPassedTests} tests passed, ${results.numFailedTests} failed, ${results.numPendingTests} pending`);
  }

  getEnhancedDescription(testName, suiteName) {
    const testDescriptions = {
      // Navigation tests
      "renders OnboardingScreen if onboarding is not complete": "Testing that the onboarding screen appears for users who haven't completed the onboarding process",
      "renders AuthScreen if onboarding complete but no user": "Verifying that unauthenticated users are redirected to the login screen after completing onboarding",
      "renders MainTabNavigator if onboarding complete and user exists": "Checking that authenticated users who've completed onboarding are shown the main app interface",
      "shows loading indicator when auth is loading": "Confirming that a loading indicator is displayed while authentication state is being determined",
      "renders FastingStagesScreen with route params": "Ensuring that the fasting stages screen correctly receives and processes route parameters",
      
      // Component tests
      "renders children": "Verifying that child components are properly rendered within the parent component",
      "renders children container": "Testing that the container correctly wraps its child elements",
      "renders correctly when visible": "Checking that modal components display properly when their visibility is set to true",
      "renders title when visible": "Ensuring that title text is displayed correctly when the component is visible",
      "renders mocked timer": "Verifying that the fasting timer UI element renders correctly",
      "renders mocked button": "Testing that the animated fast button displays properly",
      "renders mocked progress circle": "Confirming that the progress circle component renders correctly",
      
      // Contexts tests
      "provides default onboarding status and allows completion": "Testing that the AppContext correctly provides default onboarding state and allows updating it",
      "initializes with no user and loading false": "Verifying that AuthContext starts with expected null user and non-loading state",
      "renders user email and logout button": "Ensuring that authenticated user information is displayed with logout functionality",
      "provides initial fast state": "Confirming that FastContext begins with proper initial fasting state values",
      "allows starting and ending a fast": "Testing that fasting session can be started and stopped correctly",
      
      // Services tests
      "returns default settings if none are saved": "Verifying that default notification settings are provided when none exist in storage",
      "returns saved settings": "Confirming that custom notification settings are correctly retrieved from storage",
      "saves settings to AsyncStorage": "Testing that notification settings are properly persisted to device storage",
      "schedules a notification for fast completion": "Ensuring that end-of-fast notifications are correctly scheduled",
      "schedules a daily reminder notification": "Verifying that daily reminder notifications can be scheduled",
      "cancels all scheduled notifications": "Testing that all pending notifications can be cancelled properly",
      "verifies notification permissions": "Checking that the app correctly verifies notification permission status",
      
      // Screen tests
      "renders without crashing": "Verifying that the screen component loads without errors",
      "renders goals header": "Testing that the goals screen header is properly displayed",
      "renders settings header": "Ensuring that the notification settings screen header appears correctly",
      "renders welcome text": "Confirming that the welcome message is shown on the onboarding screen",
      "renders user email": "Testing that the user's email address is correctly displayed in the profile",
      "renders stats header": "Verifying that the statistics screen header renders properly",
      "renders timer title": "Ensuring that the timer screen title is correctly displayed",
      "renders stages header": "Testing that the fasting stages screen header appears correctly"
    };
    
    if (testDescriptions[testName]) {
      return testDescriptions[testName];
    }
    
    for (const [key, description] of Object.entries(testDescriptions)) {
      if (testName.includes(key)) {
        return description;
      }
    }
    
    return testName;
  }

  generateHtmlReport(results, duration) {
    try {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const logoPath = path.join(__dirname, 'assets', 'logo.png');
      let logoBase64 = '';
      
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoBase64 = logoBuffer.toString('base64');
      } else {
        logoBase64 = this.getBasicLogo();
      }
      
      let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SimpleFast Test Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eaeaea;
          }
          .logo {
            width: 60px;
            height: 60px;
            margin-right: 20px;
          }
          .header-text {
            flex: 1;
          }
          h1 {
            margin: 0;
            color: #2c7a48;
          }
          .summary {
            background-color: #f7f7f7;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          .summary-table {
            width: 100%;
            border-collapse: collapse;
          }
          .summary-table td {
            padding: 8px;
          }
          .summary-table td:first-child {
            font-weight: bold;
            width: 200px;
          }
          .test-suites {
            margin-top: 30px;
          }
          .test-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .test-table th, .test-table td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #eaeaea;
          }
          .test-table th {
            background-color: #f0f0f0;
          }
          .test-name {
            font-weight: bold;
          }
          .test-description {
            padding-top: 6px;
            color: #666;
            font-style: italic;
          }
          .passed {
            color: #2c7a48;
            font-weight: bold;
          }
          .failed {
            color: #d73a49;
            font-weight: bold;
          }
          .pending {
            color: #e36209;
          }
          .suite-header {
            cursor: pointer;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 4px;
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .suite-header:hover {
            background-color: #e6e6e6;
          }
          .suite-content {
            padding-left: 15px;
            display: none;
          }
          .visible {
            display: block;
          }
          .duration {
            color: #6a737d;
            font-size: 0.9em;
          }
          .toggle-icon {
            display: inline-block;
            width: 20px;
            height: 20px;
            text-align: center;
            line-height: 20px;
            margin-right: 10px;
            font-weight: bold;
            background-color: #2c7a48;
            color: white;
            border-radius: 50%;
            font-size: 14px;
          }
          .suite-header-left {
            display: flex;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <header>
          <img src="data:image/png;base64,${logoBase64}" alt="SimpleFast Logo" class="logo">
          <div class="header-text">
            <h1>SimpleFast Test Report</h1>
            <p>Generated on ${this.endTime.toLocaleString()}</p>
          </div>
        </header>

        <div class="summary">
          <h2>Test Summary</h2>
          <table class="summary-table">
            <tr>
              <td>Total Duration:</td>
              <td>${duration.toFixed(2)} seconds</td>
            </tr>
            <tr>
              <td>Test Suites:</td>
              <td>${results.numPassedTestSuites} passed, ${results.numFailedTestSuites} failed, ${results.numTotalTestSuites} total</td>
            </tr>
            <tr>
              <td>Tests:</td>
              <td>${results.numPassedTests} passed, ${results.numFailedTests} failed, ${results.numPendingTests} pending, ${results.numTotalTests} total</td>
            </tr>
            <tr>
              <td>Start Time:</td>
              <td>${this.startTime.toLocaleString()}</td>
            </tr>
            <tr>
              <td>End Time:</td>
              <td>${this.endTime.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div class="test-suites">
          <h2>Test Suites</h2>`;

      const fileGroups = {};
      this.testResults.forEach(result => {
        if (!fileGroups[result.testPath]) {
          fileGroups[result.testPath] = {
            name: result.testName, 
            status: result.status,
            duration: result.duration,
            numPassingTests: result.numPassingTests,
            numFailingTests: result.numFailingTests,
            numPendingTests: result.numPendingTests,
            tests: []
          };
        }

        result.testResults.forEach(test => {
          fileGroups[result.testPath].tests.push({
            name: test.title,
            fullName: test.fullName,
            status: test.status,
            duration: test.duration
          });
        });
      });

      Object.keys(fileGroups).forEach((filePath, index) => {
        const suite = fileGroups[filePath];
        const suiteId = `suite-${index}`;
        
        html += `
          <div class="suite">
            <div class="suite-header" onclick="toggleSuite('${suiteId}')">
              <div class="suite-header-left">
                <span class="toggle-icon" id="icon-${suiteId}">+</span>
                <div class="test-name">${suite.name} <span class="${suite.status}">(${suite.status})</span></div>
              </div>
              <div class="duration">${(suite.duration / 1000).toFixed(2)}s</div>
            </div>
            <div id="${suiteId}" class="suite-content">
              <table class="test-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Status</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>`;
                
        suite.tests.forEach(test => {
          const enhancedDescription = this.getEnhancedDescription(test.name, suite.name);
          const isEnhanced = enhancedDescription !== test.name;
          
          html += `
                  <tr>
                    <td>
                      <div class="test-name">${test.name}</div>
                      ${isEnhanced ? `<div class="test-description">${enhancedDescription}</div>` : ''}
                    </td>
                    <td class="${test.status}">${test.status}</td>
                    <td class="duration">${(test.duration / 1000).toFixed(3)}s</td>
                  </tr>`;
        });
                
        html += `
                </tbody>
              </table>
            </div>
          </div>`;
      });

      html += `
        </div>

        <script>
          function toggleSuite(id) {
            const content = document.getElementById(id);
            const icon = document.getElementById('icon-' + id);
            
            if (content.classList.contains('visible')) {
              content.classList.remove('visible');
              icon.textContent = '+';
            } else {
              content.classList.add('visible');
              icon.textContent = '-';
            }
          }
        </script>
      </body>
      </html>`;

      return html;
    } catch (error) {
      console.error('Error generating HTML report:', error);
      return `<html><body><h1>Error generating report</h1><pre>${error.stack}</pre></body></html>`;
    }
  }

  getBasicLogo() {
    return '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';
  }
}

export default SimpleFastReporter;
