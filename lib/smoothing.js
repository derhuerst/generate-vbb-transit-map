'use strict'

// https://github.com/d3/d3-shape/blob/04f60b8/test/curve/cardinalClosed-test.js#L11

const line = require('d3-shape').line
const cardinal = require('d3-shape').curveCardinalClosed

const smoothing = (points, tension = .3) => {
	return line().curve(cardinal.tension(tension))(points)
}

module.exports = smoothing
