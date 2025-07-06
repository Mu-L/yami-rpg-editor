'use strict'

const Path = require('path')

// 转换至斜杠分隔符
Path.slash = function IIFE() {
  const regexp = /\\/g
  return function (path) {
    if (path.indexOf('\\') !== -1) {
      path = path.replace(regexp, '/')
    }
    return path
  }
}() 