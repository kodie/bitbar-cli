# bitbar-cli
A command line tool for managing your [BitBar](https://github.com/matryer/bitbar) plugins.

## Installation
```
$ npm i -g bitbar-cli
```

## Help
```
$ bitbar --help

Usage: bitbar [options] [command]


Commands:

  install|i <plugin>    Install plugins
  uninstall|u <plugin>  Uninstall plugins
  list|l                List all currently installed plugins
  meta|m <plugin>       Display plugin meta info
  refresh|r [plugin]    Refresh a plugin
  search|s [plugin]     Search the online database for a plugin

Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

## Plugin Dependencies
When using the `install` command, the CLI tool will search the plugin's `bitbar.dependencies` and `bitbar.dependencies.npm` meta fields for dependencies that start with `npm/` or `npm-g/` and install them via npm.

For example, a plugin containing the follow meta field:
```
<bitbar.dependencies>node, npm, npm-g/jq, npm/https://github.com/y-a-v-a/easy-gd.git, npm/fs, npm/home-config, npm/node-time-ago, npm/request, npm/sync-request</bitbar.dependencies>
```

Results in the CLI tool running this command during installation:
```
$ cd '${pluginsPath}' && npm install https://github.com/y-a-v-a/easy-gd.git fs home-config node-time-ago request sync-request && npm install -g jq
```

As you can see, any dependencies that start with `npm/` will be installed to the BitBar plugins directory, and dependencies that start with `npm-g/` will be installed on the system globally.

## License
MIT. See the License file for more info.
