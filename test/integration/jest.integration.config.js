const path = require('path')

module.exports = {
  rootDir: path.resolve(__dirname),
  moduleFileExtensions: ['js', 'json'],
  setupFiles: ['<rootDir>/integration.env.setup'],
  testResultsProcessor: '<rootDir>/integration-result-reporter.js'
}
