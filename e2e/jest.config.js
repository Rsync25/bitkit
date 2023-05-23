module.exports = {
	maxWorkers: 1,
	testTimeout: 240000,
	rootDir: '..',
	testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
	verbose: true,
	reporters: ['detox/runners/jest/reporter'],
	globalSetup: 'detox/runners/jest/globalSetup',
	globalTeardown: 'detox/runners/jest/globalTeardown',
	testEnvironment: 'detox/runners/jest/testEnvironment',

	// we need this to use Slashtags SDK in jest enviroment
	transformIgnorePatterns: ['jest-runner'],
	setupFiles: [
		'<rootDir>/e2e/jest.setup.js',
		'dotenv/config',
	],
};
