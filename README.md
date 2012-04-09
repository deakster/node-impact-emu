## Description

Enables various features from the [ImpactJS](http://impactjs.com) HTML5 framework in Node.js to enable code
sharing and re-use between the client and server side.

The features that are emulated or re-created are:

* The Module system
* The Class system
* The Native type extensions

## Use Cases

* Server authoritative multiplayer games
* High score validation - record inputs from the game, send over to server after level is done, server can then
replay using the same logic and code on server
* Use or embed game data or game structures from your game into your webapp

## Usage

### Note: Enabling the systems should only be done in one place, in the entry point of your app. After that, their effect is global.

Enable the [Class System](http://impactjs.com/documentation/class-reference/class):

```javascript
require("node-impact-emu").useClass();
```

Enable the [Module System](http://impactjs.com/documentation/class-reference/ig-core#module-definition):

```javascript
// Note: Must pass in the root class path folder. This can be the same lib folder that
// contains your client-side modules
require("node-impact-emu").useModule(__dirname + '/lib');
```

Enabling the module system allows you to manage all modules using the ImpactJS
style ```ig.module('...').requires('...', '...', '...').defines(...);``` rather than using node.js's **require** function.

Enable the [Native JavaScript Object Extensions](http://impactjs.com/documentation/class-reference/ig-core#native-javascript-object-extensions):

```javascript
require("node-impact-emu").useNative();
```


You can also enable more than one system at a time by chaining:

```javascript
require("node-impact-emu").useNative().useClass();
```

Or you can enable everything:

```javascript
require("node-impact-emu").useAll(__dirname + '/lib'); // Also takes class path folder for useModule
```

See example folder for an example app.

## Disclaimer

Enabling these features diverges from typical Node.js development practices. The global namespace is modified,
and modules are no longer entirely self-contained. Use at your own risk.