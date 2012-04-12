var path = require("path");

// Global ig object
var window = global;
global.ig = {};

// Shortcut to enable all systems
exports.useAll = function (base) {
    exports.useNative();
    exports.useClass();
    exports.useModule(base);
};

var moduleBase = null;

// Get the expected path for the module name
function getExpectedPath(mname) {
    var modParts = mname.split(".");
    modParts.unshift(moduleBase);
    return path.join.apply(null, modParts) + ".js";
}

// Module system
// -----------------------------------------------------------------------------
exports.useModule = function (base) {
    base = path.normalize(base);
    
    if (!path.existsSync(base)) {
        throw "Cannot enable modules, path doesn't exist: " + base;
    }
    
    moduleBase = base;
    
    window.ig.module = function (mname) {
        return window.ig;
    };
    
    window.ig.requires = function () {
        for (var i = 0; i < arguments.length; i++) {
            require(getExpectedPath(arguments[i]));
        }
        return window.ig;
    };
    
    window.ig.defines = function (body) {
        body.call(window);
        return window.ig;
    }
    
    return exports;
}


// Native type extensions (taken straight out of impact)
// -----------------------------------------------------------------------------
exports.useNative = function () {
    // -----------------------------------------------------------------------------
    // Native Object extensions
    
    Number.prototype.map = function(istart, istop, ostart, ostop) {
        return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
    };
    
    Number.prototype.limit = function(min, max) {
        return Math.min(max, Math.max(min, this));
    };
    
    Number.prototype.round = function(precision) {
        precision = Math.pow(10, precision || 0);
        return Math.round(this * precision) / precision;
    };
    
    Number.prototype.floor = function() {
        return Math.floor(this);
    };
    
    Number.prototype.ceil = function() {
        return Math.ceil(this);
    };
    
    Number.prototype.toInt = function() {
        return (this | 0);
    };
    
    Number.prototype.toRad = function() {
        return (this / 180) * Math.PI;
    };
    
    Number.prototype.toDeg = function() {
        return (this * 180) / Math.PI;
    };
    
    Array.prototype.erase = function(item) {
        for( var i = this.length; i--; ) {
            if( this[i] === item ) {
                this.splice(i, 1);
            }
        }
        return this;
    };
    
    Array.prototype.random = function() {
        return this[ Math.floor(Math.random() * this.length) ];
    };
    
    Function.prototype.bind = function(bind) {
        var self = this;
        return function(){
            var args = Array.prototype.slice.call(arguments);
            return self.apply(bind || null, args);
        };
    };
    
    return exports;
};


// Class system (taken straight out of impact)
// -----------------------------------------------------------------------------
exports.useClass = function () {
    
	window.ig.copy = function( object ) {
		if(
		   !object || typeof(object) != 'object' ||
		   object instanceof ig.Class
		) {
			return object;
		}
		else if( object instanceof Array ) {
			var c = [];
			for( var i = 0, l = object.length; i < l; i++) {
				c[i] = ig.copy(object[i]);
			}
			return c;
		}
		else {
			var c = {};
			for( var i in object ) {
				c[i] = ig.copy(object[i]);
			}
			return c;
		}
	};
	
	window.ig.merge = function( original, extended ) {
		for( var key in extended ) {
			var ext = extended[key];
			if(
				typeof(ext) != 'object' ||
				ext instanceof HTMLElement ||
				ext instanceof ig.Class
			) {
				original[key] = ext;
			}
			else {
				if( !original[key] || typeof(original[key]) != 'object' ) {
					original[key] = (ext instanceof Array) ? [] : {};
				}
				ig.merge( original[key], ext );
			}
		}
		return original;
	};
	
    // -----------------------------------------------------------------------------
    // Class object based on John Resigs code; inspired by base2 and Prototype
    // http://ejohn.org/blog/simple-javascript-inheritance/
    
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bparent\b/ : /.*/;
    
    window.ig.Class = function(){};
    var inject = function(prop) {	
        var proto = this.prototype;
        var parent = {};
        for( var name in prop ) {		
            if( 
                typeof(prop[name]) == "function" &&
                typeof(proto[name]) == "function" && 
                fnTest.test(prop[name])
            ) {
                parent[name] = proto[name]; // save original function
                proto[name] = (function(name, fn){
                    return function() {
                        var tmp = this.parent;
                        this.parent = parent[name];
                        var ret = fn.apply(this, arguments);			 
                        this.parent = tmp;
                        return ret;
                    };
                })( name, prop[name] );
            }
            else {
                proto[name] = prop[name];
            }
        }
    };
    
    window.ig.Class.extend = function(prop) {
        var parent = this.prototype;
     
        initializing = true;
        var prototype = new this();
        initializing = false;
     
        for( var name in prop ) {
            if( 
                typeof(prop[name]) == "function" &&
                typeof(parent[name]) == "function" && 
                fnTest.test(prop[name])
            ) {
                prototype[name] = (function(name, fn){
                    return function() {
                        var tmp = this.parent;
                        this.parent = parent[name];
                        var ret = fn.apply(this, arguments);			 
                        this.parent = tmp;
                        return ret;
                    };
                })( name, prop[name] );
            }
            else {
                prototype[name] = prop[name];
            }
        }
     
        function Class() {
            if( !initializing ) {
                
                // If this class has a staticInstantiate method, invoke it
                // and check if we got something back. If not, the normal
                // constructor (init) is called.
                if( this.staticInstantiate ) {
                    var obj = this.staticInstantiate.apply(this, arguments);
                    if( obj ) {
                        return obj;
                    }
                }
                for( var p in this ) {
                    if( typeof(this[p]) == 'object' ) {
                        this[p] = ig.copy(this[p]); // deep copy!
                    }
                }
                if( this.init ) {
                    this.init.apply(this, arguments);
                }
            }
            return this;
        }
        
        Class.prototype = prototype;
        Class.constructor = Class;
        Class.extend = arguments.callee;
        Class.inject = inject;
        
        return Class;
    };
    
    return exports; // For chaining
};

