#!/usr/bin/env node
'use strict';

var ver = '0.0.1';
var program = require('commander');
var lib = require('./lib');

program
  .command('install <plugin>')
  .alias('i')
  .description('Install plugins')
  .action(function(plugin, options) {
    lib.installPlugin(plugin);
  });

program
  .command('uninstall <plugin>')
  .alias('u')
  .description('Uninstall plugins')
  .action(function(plugin, options) {
    lib.uninstallPlugin(plugin);
  });

program
  .command('list')
  .alias('l')
  .description('List all currently installed plugins')
  .action(function(plugin, options) {
    var plugins = lib.getInstalledPlugins();

    console.log(`${plugins.length} plugins installed:`);

    plugins.forEach(function(plugin) {
      console.log(plugin);
    })
  });

program
  .command('meta <plugin>')
  .alias('m')
  .description('Display plugin meta info')
  .action(function(plugin, options) {
    var meta = lib.getPluginMeta(plugin);
    console.log(meta);
  });

program
  .command('refresh [plugin]')
  .alias('r')
  .description('Refresh a plugin')
  .action(function(plugin, options) {
    lib.refresh(plugin);
  });

program
  .command('search [plugin]')
  .alias('s')
  .description('Search the online database for a plugin')
  .action(function(search, options) {
    var results = lib.pluginSearch(search);

    if (results.length > 0) {
      console.log(`${results.length} plugin(s) found:`);

      for (var i = 0; i < results.length; i++) {
        console.log(`${results[i]}`);
      }
    } else {
      console.log(`No plugins found containing ${search}`);
    }
  });

program
  .version(ver)
  .on('--help', function() {
    console.log('');
    console.log(`  BitBar CLI Tool v${ver} by Kodie Grantham [www.kodieg.com]`);
    console.log('  https://github.com/kodie/bitbar-cli');
    console.log('');
  })
  .parse(process.argv);
