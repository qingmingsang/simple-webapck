const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('@babel/traverse').default;
const { transformFromAst } = require('@babel/core');



/**
 * 获取文件，解析成ast语法
 * @param filename // 入口文件
 * @returns {*}
 */
function getAst(filename) {
    const content = fs.readFileSync(filename, 'utf-8')
    return babylon.parse(content, {
        sourceType: 'module',
    });
}
const dir = path.resolve(__dirname, '../target', 'index.js');
const babylonAST = getAst(dir);
const babylonJson = JSON.stringify(babylonAST, null, '\t');
fs.writeFile('babylon.json', babylonJson, 'utf8', (err) => {
    if (err) {
        console.log('babylon解析错误:', err);
        throw err;
    }
    console.log('babylon解析完毕');
});

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

const transformCode = getTranslateCode(babylonAST);
fs.writeFile('transformFromAst.js', transformCode, 'utf8', (err) => {
    if (err) {
        console.log('babel-core transformFromAst解析错误:', err);
        throw err;
    }
    console.log('babel-core transformFromAst解析完毕');
});


function getDependence(ast) {
    let dependencies = []
    traverse(ast, {
        ImportDeclaration: ({ node }) => {
            dependencies.push(node.source.value);
        },
    })
    return dependencies
}
const config = {
    entry: dir
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

const parseJson = parse(dir, true);
const parseJsonStr = JSON.stringify(parseJson, null, '\t');
fs.writeFile('flieParse.json', parseJsonStr, 'utf8', (err) => {
    if (err) {
        console.log('flieParse解析错误:', err);
        throw err;
    }
    console.log('flieParse解析完毕');
});


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

let queueArr = getQueue(parseJson);
const queueArrStr = JSON.stringify(queueArr, null, '\t');
fs.writeFile('fileQueue.json', queueArrStr, 'utf8', (err) => {
    if (err) {
        console.log('getQueue解析错误:', err);
        throw err;
    }
    console.log('getQueue解析完毕');
});

function bundle(queue) {
    let modules = ''
    queue.forEach(function (mod) {
        modules += `'${mod.fileName}': function (require, module, exports) { ${mod.code} },`
    })

    const result = `
      (function(modules) {
        function require(fileName) {
          const fn = modules[fileName];
  
          const module = { exports : {} };
  
          fn(require, module, module.exports);
  
          return module.exports;
        }
  
        require('${config.entry}');
      })({${modules}})
    `;
    return result;
}

const bundleResult = bundle(queueArr);
fs.writeFile('bundle.js', bundleResult, 'utf8', (err) => {
    if (err) {
        console.log('bundle解析错误:', err);
        throw err;
    }
    console.log('bundle解析完毕');
});