# AST
在计算机科学中，抽象语法树（abstract syntax tree 或者缩写为 AST），或者语法树（syntax tree），是源代码的抽象语法结构的树状表现形式，这里特指编程语言的源代码。
树上的每个节点都表示源代码中的一种结构。之所以说语法是「抽象」的，是因为这里的语法并不会表示出真实语法中出现的每个细节。

可以通过[Esprima](https://esprima.org/demo/parse.html#) 这个网站来将代码转化成 ast。首先一段代码转化成的抽象语法树是一个对象，该对象会有一个顶级的type属性Program,第二个属性是body是一个数组。body数组中存放的每一项都是一个对象，里面包含了所有的对于该语句的描述信息:
```
type:描述该语句的类型 --变量声明语句
kind：变量声明的关键字 -- var
declaration: 声明的内容数组，里面的每一项也是一个对象
    type: 描述该语句的类型 
    id: 描述变量名称的对象
        type：定义
        name: 是变量的名字
        init: 初始化变量值得对象
        type: 类型
        value: 值 "is tree" 不带引号
        row: "\"is tree"\" 带引号
```
```
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "AST"
          },
          "init": {
            "type": "Literal",
            "value": "is Tree",
            "raw": "\"is Tree\""
          }
        }
      ],
      "kind": "var"
    }
  ],
  "sourceType": "script"
}
```

# webpack 简易打包
定义3个文件
```
// index.js
import a from './test'
console.log(a)

// test.js
import b from './message'
const a = 'hello' + b
export default a

// message.js
const b = 'world'
export default b
```

使用webpack打包
```
(function (modules) {
  var installedModules = {};

  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }

    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };

    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    // Flag the module as loaded
    module.l = true;
    // Return the exports of the module
    return module.exports;
  }

  // expose the modules object (__webpack_modules__)
  __webpack_require__.m = modules;
  // expose the module cache
  __webpack_require__.c = installedModules;
  // define getter function for harmony exports
  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, {enumerable: true, get: getter});
    }
  };
  // define __esModule on exports
  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, {value: 'Module'});
    }
    Object.defineProperty(exports, '__esModule', {value: true});
  };
  // create a fake namespace object
  // mode & 1: value is a module id, require it
  // mode & 2: merge all properties of value into the ns
  // mode & 4: return value when already ns object
  // mode & 8|1: behave like require
  __webpack_require__.t = function (value, mode) {
    /******/
    if (mode & 1) value = __webpack_require__(value);
    if (mode & 8) return value;
    if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    var ns = Object.create(null);
    __webpack_require__.r(ns);
    Object.defineProperty(ns, 'default', {enumerable: true, value: value});
    if (mode & 2 && typeof value != 'string') for (var key in value) __webpack_require__.d(ns, key, function (key) {
      return value[key];
    }.bind(null, key));
    return ns;
  };
  // getDefaultExport function for compatibility with non-harmony modules
  __webpack_require__.n = function (module) {
    var getter = module && module.__esModule ?
      function getDefault() {
        return module['default'];
      } :
      function getModuleExports() {
        return module;
      };
    __webpack_require__.d(getter, 'a', getter);
    return getter;
  };
  // Object.prototype.hasOwnProperty.call
  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  // __webpack_public_path__
  __webpack_require__.p = "";
  // Load entry module and return exports
  return __webpack_require__(__webpack_require__.s = "./src/index.js");
})({
  "./src/index.js": (function (module, __webpack_exports__, __webpack_require__) {

    "use strict";
    eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _test__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./test */ \"./src/test.js\");\n\n\nconsole.log(_test__WEBPACK_IMPORTED_MODULE_0__[\"default\"])\n\n\n//# sourceURL=webpack:///./src/index.js?");

  }),
  "./src/message.js": (function (module, __webpack_exports__, __webpack_require__) {
    // ...
  }),
  "./src/test.js": (function (module, __webpack_exports__, __webpack_require__) {
    // ...
  })
});
```
其实就是一个自执行函数，传入了一个modules对象
```
(function(modules) {
  // ...
})({
 // ...
})
```
modules 对象格式
```
{
  "./src/index.js": (function (module, __webpack_exports__, __webpack_require__) {
    // ...
  }),
  "./src/message.js": (function (module, __webpack_exports__, __webpack_require__) {
    // ...
  }),
  "./src/test.js": (function (module, __webpack_exports__, __webpack_require__) {
    // ...
  })
}
```
是这样的一个 `路径 --> 函数` 这样的 key,value 键值对。而函数内部是我们定义的文件转移成 ES5 之后的代码，通过eval来执行：
```
"use strict";
__webpack_require__.r(__webpack_exports__);
// 获取"./src/test.js" 依赖
var _test__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/test.js");

console.log(_test__WEBPACK_IMPORTED_MODULE_0__["default"])
```
到这里基本上结构是分析完了，自执行函数一开始执行的代码是：
```
__webpack_require__(__webpack_require__.s = "./src/index.js");
```
调用了__webpack_require_函数，并传入了一个moduleId参数是"./src/index.js"。
再看看函数内部的主要实现：
```
// 定义 module 格式   
var module = installedModules[moduleId] = {
      i: moduleId, // moduleId
      l: false, // 是否已经缓存
      exports: {} // 导出对象，提供挂载
};

modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
```
这里调用了modules中的函数，并传入了 __webpack_require__函数作为函数内部的调用。module.exports参数作为函数内部的导出。因为index.js里面引用了test.js，所以又会通过 __webpack_require__来执行对test.js的加载：
```
var _test__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/test.js");
```
test.js内又使用了message.js所以，test.js内部又会执行对message.js的加载。message.js执行完成之后，因为没有依赖项，所以直接返回了结果：
```
var b = 'world'
__webpack_exports__["default"] = (b)
```
执行完成之后，再一级一级返回到根文件index.js。最终完成整个文件依赖的处理。
整个过程中，我们像是通过一个依赖关系树的形式，不断地向数的内部进入，等返回结果，又开始回溯到根。

# webpack 的模块机制 
- 打包出来的是一个 IIFE (匿名闭包)
- modules 是一个数组，每一项是一个模块初始化函数 
- __webpack_require 用来加载模块，返回 module.exports · 通过 WEBPACK_REQUIRE_METHOD(0) 启动程序 

# 开发一个简单的 webpack
简单流程:
1. config里的entry为入口文件
2. babylon(也可以用@babel/parser)将入口文件代码转换为ast
3. 用@babel/traverse处理入口文件ast里的文件依赖关系映射
4. 深度遍历,处理深度文件依赖关系,生成依赖关系队列
5. 处理依赖关系队列,用@babel/core将ast转换回es5的代码
6. 模块化包装es5代码生成bundle文件

webpack里不是用的babel而是webassemblyjs配套工具

通过上面的这些调研，我们先考虑一下一个基础的打包编译工具可以做什么？
- 转换ES6语法成ES5
- 处理模块加载依赖
- 生成一个可以在浏览器加载执行的 js 文件

第一个问题，转换语法，其实我们可以通过babel来做。
核心步骤也就是：
1. 通过babylon生成AST
2. 通过babel-core将AST重新生成源码

```
/**
 * 获取文件，解析成ast语法
 * @param filename // 入口文件
 * @returns {*}
 */
function getAst (filename) {
  const content = fs.readFileSync(filename, 'utf-8')

  return babylon.parse(content, {
    sourceType: 'module',
  });
}

/**
 * 编译
 * @param ast
 * @returns {*}
 */
function getTranslateCode(ast) {
    const { code } = transformFromAst(ast, null, {
        presets: ["@babel/preset-env"]
    });
    return code
}
```
处理模块依赖的关系，得到一个依赖关系视图。
babel-traverse提供了一个可以遍历AST视图并做处理的功能，通过 ImportDeclaration 可以得到依赖属性：
```
function getDependence (ast) {
  let dependencies = []
  traverse(ast, {
    ImportDeclaration: ({node}) => {
      dependencies.push(node.source.value);
    },
  })
  return dependencies
}

/**
 * 生成完整的文件依赖关系映射
 * @param fileName
 * @param entry
 * @returns {{fileName: *, dependence, code: *}}
 */
function parse(fileName, entry) {
  let filePath = fileName.indexOf('.js') === -1 ? fileName + '.js' : fileName
  let dirName = entry ? '' : path.dirname(config.entry)
  let absolutePath = path.join(dirName, filePath)
  const ast = getAst(absolutePath)
  return {
    fileName,
    dependence: getDependence(ast),
    code: getTranslateCode(ast),
  };
}
```
上面代码只是得到根文件的依赖关系和编译后的代码，比如我们的index.js依赖了test.js但是我们并不知道test.js还需要依赖message.js，他们的源码也是没有编译过。
所以此时我们还需要做深度遍历，得到完成的深度依赖关系：
```
/**
 * 获取深度队列依赖关系
 * @param main
 * @returns {*[]}
 */
function getQueue(main) {
  let queue = [main]
  for (let asset of queue) {
    asset.dependence.forEach(function (dep) {
      let child = parse(dep)
      queue.push(child)
    })
  }
  return queue
}
```
进行到这一步已经完成了所有文件的编译解析。
最后一步，就是需要按照webpack的思想对源码进行一些包装。
第一步，先是要生成一个modules对象：
```
function bundle(queue) {
  let modules = ''
  queue.forEach(function (mod) {
    modules += `'${mod.fileName}': function (require, module, exports) { ${mod.code} },`
  })
  // ...
}
```
得到 modules 对象后，接下来便是对整体文件的外部包装，注册require，module.exports：
```
(function(modules) {
      function require(fileName) {
          // ...
      }
     require('${config.entry}');
 })({${modules}})
```
而函数内部，也只是循环执行每个依赖文件的 JS 代码而已，完成代码

# 模仿webpack实现loader和plugin:
webpack的loader和plugin本质：

**loader本质是对字符串的正则匹配操作**

**plugin的本质，是依靠webpack运行时广播出来的生命周期事件，再调用Node.js的API利用webpack的全局实例对象进行操作，不论是硬盘文件的操作,还是内存中的数据操作。**

webpack的核心依赖库： Tapable
tapable是webpack的核心依赖库
```
const {
    SyncHook,
    SyncBailHook,
    SyncWaterfallHook,
    SyncLoopHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesWaterfallHook
 } = require("tapable");
```
这些钩子可分为同步的钩子和异步的钩子，Sync开头的都是同步的钩子，Async开头的都是异步的钩子。而异步的钩子又可分为并行和串行，其实同步的钩子也可以理解为串行的钩子。

这是一个发布-订阅模式

webpack运行时广播出事件，让之前订阅这些事件的订阅者们（其实就是插件）都触发对应的事件，并且拿到全局的webpack实例对象，再做一系列的处理，就可以完成很复杂的功能

同步的钩子是串行
异步的钩子分为并行和串行的钩子，并行是指 等待所有并发的异步事件执行之后再执行最终的异步回调。
而串行是值 第一步执行完毕再去执行第二步，以此类推，直到执行完所有回调再去执行最终的异步回调。

拿最简单的同步钩子SyncHook来说
```
const { SyncHook } = require('tapable');

class Hook{
    constructor(){
        /** 1 生成SyncHook实例 */
        this.hooks = new SyncHook(['name']);
    }
    tap(){
        /** 2 注册监听函数 */
        this.hooks.tap('node',function(name){
            console.log('node',name);
        });
        this.hooks.tap('react',function(name){
            console.log('react',name);
        });
    }
    start(){
        /** 3出发监听函数 */
        this.hooks.call('call end.');
    }
}

let h = new Hook();

h.tap();/** 类似订阅 */ 
h.start();/** 类似发布 */

/* 打印顺序：
    node call end.
    react call end.
*/
```

再看一个异步钩子AsyncParallelHook
```
const { AsyncParallelHook } = require('tapable');

class Hook{
    constructor(){
        this.hooks = new AsyncParallelHook(['name']);
    }
    tap(){
        /** 异步的注册方法是tapAsync() 
         * 并且有回调函数cb.
        */
        this.hooks.tapAsync('node',function(name,cb){
            setTimeout(()=>{
                console.log('node',name);
                cb();
            },1000);
        });
        this.hooks.tapAsync('react',function(name,cb){
            setTimeout(()=>{
                console.log('react',name);
                cb();
            },1000);
        });
    }
    start(){
        /** 异步的触发方法是callAsync() 
         * 多了一个最终的回调函数 fn.
        */
        this.hooks.callAsync('call end.',function(){
            console.log('最终的回调');
        });
    }
}

let h = new Hook();

h.tap();/** 类似订阅 */
h.start();/** 类似发布 */

/* 打印顺序：
    node call end.
    react call end.
    最终的回调
*/
```



