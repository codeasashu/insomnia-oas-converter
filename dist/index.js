
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./insomnia-oas-converter.cjs.production.min.js')
} else {
  module.exports = require('./insomnia-oas-converter.cjs.development.js')
}
