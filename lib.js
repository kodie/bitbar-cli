#!/usr/bin/env node
'use strict';

module.exports = {

  getFileName(path) {
    return path.replace(/^.*[\\\/]/, '');
  },

  getInstalledPlugins() {
    var fs = require('fs');

    var pluginsPath = this.getPluginsPath();
    var plugins = fs.readdirSync(pluginsPath);
    var installedPlugins = [];

    for (var i = 0; i < plugins.length; i++) {
      if (plugins[i].indexOf('.') < 2) { continue; }
      installedPlugins.push(plugins[i]);
    }

    return installedPlugins;
  },

  getPluginMeta(plugin) {
    var fs = require('fs');

    var pluginsPath = this.getPluginsPath();
    var pluginFile = pluginsPath + '/' + plugin;
    var lines = fs.readFileSync(pluginFile, 'utf8').split('\n');
    var pattern = /<(.*?)>(.*?)<\/.*?>/;
    var obj = {};

    lines.forEach(function(line) {
      var match = line.match(pattern);
      if (match) {
        obj[match[1].toLowerCase()] = match[2];
      }
    });

    return obj;
  },

  getPluginsPath() {
    var defaults = require('osx-defaults');

    var path = defaults.read({
      domain: 'com.matryer.BitBar',
      key: 'pluginsDirectory'
    });

    return path;
  },

  installNpmDependencies(plugin) {
    var exec = require('child_process').exec;
    var ora = require('ora');

    var pluginsPath = this.getPluginsPath();
    var pluginMeta = this.getPluginMeta(plugin);
    var deps = [];
    var npmLocalDeps = [];
    var npmGlobalDeps = [];
    var cmd = '';

    if (pluginMeta['bitbar.dependencies']) {
      deps = deps.concat(pluginMeta['bitbar.dependencies'].split(/[ ,]+/));
    }

    if (pluginMeta['bitbar.dependencies.npm']) {
      deps = deps.concat(pluginMeta['bitbar.dependencies.npm'].split(/[ ,]+/));
    }

    if (deps.length) {
      var spinner = ora(`Installing dependencies for ${plugin}...`).start();
    } else {
      return;
    }

    deps.forEach(function(dep) {
      if (dep.indexOf('npm/') == 0) {
        npmLocalDeps.push(dep.substring(4));
      }

      if (dep.indexOf('npm-g/') == 0) {
        npmGlobalDeps.push(dep.substring(6));
      }
    });

    if (npmLocalDeps.length) {
      cmd += `cd '${pluginsPath}' && npm install ${npmLocalDeps.join(' ')}`;
    }

    if (npmGlobalDeps.length) {
      if (cmd) { cmd += ' && '; }
      cmd += `npm install -g ${npmGlobalDeps.join(' ')}`;
    }

    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        spinner.fail();
        console.log(error);
      } else { spinner.succeed(); }
    });
  },

  installPlugin(plugin) {
    var fs = require('fs');
    var ora = require('ora');
    var request = require('sync-request');

    var pluginsPath = this.getPluginsPath();
    var spinner = ora(`Installing ${plugin}...`).start();
    var filename = this.getFileName(plugin);
    var file = `${pluginsPath}/${filename}`;
    var path = `https://github.com/matryer/bitbar-plugins/raw/master/${plugin}`;

    try {
      var res = request('GET', path);
      var data = res.getBody('utf-8');
      fs.writeFileSync(file, data);
      fs.chmodSync(file, '755');
      spinner.succeed();
      this.installNpmDependencies(filename);
    } catch(e) {
      spinner.fail();
      console.log(`An error occured while trying to install the ${plugin}.`);
    }
  },

  pluginSearch(search) {
    var fuzzysearch = require('fuzzysearch');
    var ora = require('ora');
    var request = require('sync-request');

    var spinner = ora('Searching plugins database...').start();
    var requestUrl = 'https://api.github.com/repos/matryer/bitbar-plugins/git/trees/master?recursive=1';
    var requestOptions = { headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; .NET CLR 1.0.3705; .NET CLR 1.1.4322; Media Center PC 4.0)' } };
    var res = request('GET', requestUrl, requestOptions);
    var tree = JSON.parse(res.getBody()).tree;
    var results = [];

    if (!search) { search = ''; }

    for (var i = 0; i < tree.length; i++) {
      var thisPath = tree[i].path;
      if (thisPath.indexOf('.') < 2) { continue; }
      if (fuzzysearch(search.toLowerCase(), thisPath.toLowerCase())) { results.push(thisPath); }
    }

    if (results.length) {
      spinner.succeed();
    } else {
      spinner.fail();
    }

    return results;
  },

  refresh(plugin) {
    var open = require('open');

    var pkg = plugin || '*?';
    open(`bitbar://refreshPlugin?name=${pkg}.*?`);
  },

  uninstallPlugin(plugin) {
    var fs = require('fs');
    var ora = require('ora');

    var pluginsPath = this.getPluginsPath();
    var spinner = ora(`Uninstalling ${plugin}...`).start();

    try {
      fs.unlinkSync(`${pluginsPath}/${plugin}`);
      spinner.succeed();
    } catch(e) {
      spinner.fail();
      console.log(`An error occured while trying to uninstall ${plugin}.`)
    }
  }

}
