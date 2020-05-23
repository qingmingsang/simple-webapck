const fs = require('fs');
const path = require('path');
const parser = require('babylon');
const traverse = require('@babel/traverse').default;
const { transformFromAST } = require('@babel/core');

// 分析一个文件，转成CommonJS Module，并找出它的依赖
function readCode(filePath) {
    // 读取文件字符串
    const content = fs.readFileSync(filePath, 'utf-8');
    // 语法解析成 AST
    const ast = parser(content, {
        sourceType: 'module'
    })
    // 获取本文件的依赖
    const dependiences = [];
    // 遍历 AST，每当触发依赖钩子，就往依赖数组添加
    traverse(ast, {
        ImportDeclaration({ node }) {
            // 把对应的以来路径存起来
            dependiences.push(node.source.value)
        }
    })
    // 把 es6 转成 es5 字符串
    // 最重要的是把 esModule 的 import export，转成 es5 能认识的 commonJs写法
    const { code } = transformFromAST(ast, null, {
        presets: ['@babel/preset-env']
    })
    return {
        filePath,
        code,
        dependiences
    }
}

// 广度优先算法，深入找出所有的依赖
function getAllDependencies(filePath) {
    const entryObj = readCode(filePath);
    const dependencies = [entryObj];
    for (const dependency of dependencies) {
        const curDirname = path.dirname(dependency.filePath)
        for (const relativePath of dependency.dependencies) {
            const absolutePath = path.join(curDirname, relativePath);
            const child = readCode(absolutePath);
            child.relativePath = relativePath;
            dependencies.push(child);
        }
    }
    return dependencies;
}

function bundle(fileName) {
    const dependencies = getAllDependencies(fileName);
    const modulesStr = '';
    dependencies.forEach(dependency => {
        const key = dependency.relativePath || dependency.filePath;
        modulesStr += `'${key}': function(module, exports, require) {
            ${ dependency.code}
        }`
    })
    return `(function(modules) {
        const installedModules = {};
        function require(id) {
            // 解决循环依赖
            if (installedModules[id]) {
                return installedModules[id].exports;
            }
            var module = installedModules[id] = {exports: {}};
            modules[id].call(module.exports, module, module.exports, require);
            return module.exports;
        }
        return require('${fileName}')
    })({${modulesStr}})`
}