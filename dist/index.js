
    (function(modules) {
      function require(fileName) {
        const fn = modules[fileName];

        const module = { exports : {} };

        fn(require, module, module.exports);

        return module.exports;
      }

      require('./target/index.js');
    })({'./target/index.js': function (require, module, exports) { "use strict";

var _test = _interopRequireDefault(require("./test"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

console.log(_test["default"]); },'./test': function (require, module, exports) { "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _message = _interopRequireDefault(require("./message"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var a = 'hello' + _message["default"];
var _default = a;
exports["default"] = _default; },'./message': function (require, module, exports) { "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var b = 'world';
var _default = b;
exports["default"] = _default; },})
  