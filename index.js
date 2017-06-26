'use strict'

const h = require('virtual-hyperscript-svg')
const color = require('random-color')
const groupBy = require('lodash.groupby')

const smoothing = require('./lib/smoothing')

const f = (n) => Math.round(n * 1000) / 1000

// const noSmoothing = (polyline) => {
// 	const first = polyline[0]
// 	const commands = [
// 		'M' + f(first[0]) + ' ' + f(first[1])
// 	]

// 	for (let i = 1; i < polyline.length; i++) {
// 		const point = polyline[i]
// 		commands.push('L' + f(point[0]) + ' ' + f(point[1]))
// 	}

// 	return commands.join(' ')
// }

const generate = (data) => {
	// todo: this structure is not valid JGF. change this!
	// right now, this follows the output of dirkschumacher/TransitmapSolver.jl
	const {stations, edges, lines, faces} = data
	const items = []

	const groupedEdges = groupBy(edges, (e) => e.line.id) // todo
	for (let line in groupedEdges) {
		const edges = groupedEdges[line]
		// todo: sort by closest neighbor

		const points = [
			[f(edges[0].from.coordinate.x), f(edges[0].from.coordinate.y)]
		]
		for (let edge of edges) {
			points.push([f(edge.to.coordinate.x), f(edge.to.coordinate.y)])
		}

		// const d = noSmoothing(points)
		const d = smoothing(points)

		items.push(h('path', {
			class: 'line',
			style: {stroke: color().hexString()},
			d
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
