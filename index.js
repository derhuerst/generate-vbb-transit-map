'use strict'

const h = require('virtual-hyperscript-svg')
const color = require('random-color')

const f = (n) => '' + Math.round(n * 1000) / 1000

const generate = (data) => {
	// todo: this structure is not valid JGF. change this!
	// right now, this follows the output of dirkschumacher/TransitmapSolver.jl
	const {stations, edges, lines, faces} = data
	const items = []

	for (let edge of edges) {
		const {from, to, line} = edge
		items.push(h('path', {
			class: 'line',
			style: {stroke: color().hexString()},
			d: [
				'M' + f(from.coordinate.x) + ' ' + f(from.coordinate.y),
				'L' + f(to.coordinate.x) + ' ' + f(to.coordinate.y)
			].join(' ')
		}))
	}

	for (let station of stations) {
		items.push(h('circle', {
			class: 'station',
			style: {fill: color().hexString()},
			cx: station.coordinate.x,
			cy: station.coordinate.y,
			r: 1
		}))
	}

	return items
}

module.exports = generate
