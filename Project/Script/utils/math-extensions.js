'use strict'

// 限定取值范围 - 范围不正确时返回较大的数(minimum)
Math.clamp = function IIFE() {
  const {max, min} = Math
  return (number, minimum, maximum) => {
    return max(min(number, maximum), minimum)
  }
}()

// 四舍五入到指定小数位
Math.roundTo = function IIFE() {
  const {round} = Math
  return (number, decimalPlaces) => {
    const ratio = 10 ** decimalPlaces
    return round(number * ratio) / ratio
  }
}()

// 返回两点距离
// 比 Math.hypot() 快很多
Math.dist = function IIFE() {
  const {sqrt} = Math
  return (x1, y1, x2, y2) => {
    return sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
  }
}()

// 计算指定范围的随机值
Math.randomBetween = function IIFE() {
  const {random} = Math
  return (value1, value2) => {
    return value1 + (value2 - value1) * random()
  }
}()

// 角度转弧度
Math.radians = function IIFE() {
  const factor = Math.PI / 180
  return degrees => {
    return degrees * factor
  }
}()

// 弧度转角度
Math.degrees = function IIFE() {
  const factor = 180 / Math.PI
  return radians => {
    return radians * factor
  }
}()

// 角度取余数 [0, 360)
Math.modDegrees = (degrees, period = 360) => {
  return degrees >= 0 ? degrees % period : (degrees % period + period) % period
}

// 弧度取余数 [0, 2π)
Math.modRadians = function IIFE() {
  const PI2 = Math.PI * 2
  return (radians, period = PI2) => {
    return radians >= 0 ? radians % period : (radians % period + period) % period
  }
}() 

RegExp.number = /^-?\d+(?:\.\d+)?$/