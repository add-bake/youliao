'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_ROOT: '"http://youliaotest.aivics.com/youliao/a/api"',
  IMG_ROOT: '"http://youliaotest.aivics.com/"'
})
