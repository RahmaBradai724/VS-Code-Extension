'use strict';

const path = require('path');
const webpack = require('webpack');

/** @type {import('webpack').Configuration} */
module.exports = {
  target: 'node', // VS Code extensions run in Node.js
  mode: 'none',   // keep readable output; vsce handles minification concerns

  entry: './src/extension.ts',

  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },

  externals: {
    // vscode is always provided by the host — never bundle it
    vscode: 'commonjs vscode',

    // Optional native bindings / drivers we don't use — mark as external so
    // webpack doesn't error when TypeORM tries to require() them
    'pg-native':                     'commonjs pg-native',
    'sqlite3':                       'commonjs sqlite3',
    'better-sqlite3':                'commonjs better-sqlite3',
    'mysql':                         'commonjs mysql',
    'mysql2':                        'commonjs mysql2',
    'oracledb':                      'commonjs oracledb',
    'mssql':                         'commonjs mssql',
    'mongodb':                       'commonjs mongodb',
    'ioredis':                       'commonjs ioredis',
    'redis':                         'commonjs redis',
    'react-native-sqlite-storage':   'commonjs react-native-sqlite-storage',
    '@sap/hana-client':              'commonjs @sap/hana-client',
    'hdb-pool':                      'commonjs hdb-pool',
    'sql.js':                        'commonjs sql.js',
    'typeorm-aurora-data-api-driver':'commonjs typeorm-aurora-data-api-driver',
    '@google-cloud/spanner':         'commonjs @google-cloud/spanner',
    '@sap/hana-client/extension/Stream': 'commonjs @sap/hana-client/extension/Stream',
    'pg-query-stream':               'commonjs pg-query-stream',
  },

  resolve: {
    extensions: ['.ts', '.js'],
    // Needed so TypeORM's internal require() calls resolve correctly
    mainFields: ['main'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },

  plugins: [
    // Suppress TypeORM's "Critical dependency: the request of a dependency is
    // an expression" warnings caused by its dynamic driver-loading code
    new webpack.ContextReplacementPlugin(/typeorm/, (data) => {
      delete data.dependencies[0].critical;
      return data;
    }),
  ],

  ignoreWarnings: [/Critical dependency/],
};
