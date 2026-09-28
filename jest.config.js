module.exports = {
    preset: 'ts-jest',

    testEnvironment: 'node',

    roots: [
        '<rootDir>/test'
    ],

    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/app.ts',
        '!src/server.ts',
        '!src/generated/**'
    ],

    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};