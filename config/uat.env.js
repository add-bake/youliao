'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"uat"',
  API_ROOT: '"https://youliaouat.aivics.com/youliaoUAT/a/api"',
  IMG_ROOT: '"https://youliaouat.aivics.com/"'
})
