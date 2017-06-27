'use strict'

const h = require('virtual-hyperscript-svg')
const groupBy = require('lodash.groupby')
const parseLine = require('vbb-parse-line')
const colors = require('vbb-util/lines/colors')

const smoothing = require('./lib/smoothing')

const f = (n) => Math.round(n * 1000) / 1000

// const noSmoothing = (polyline) => {
// 	const first = polyline[0]
// 	const commands = [
// 		'M' + f(first[0]) + ' ' + (70 - f(first[1]))
// 	]

// 	for (let i = 1; i < polyline.length; i++) {
// 		const point = polyline[i]
// 		commands.push('L' + f(point[0]) + ' ' + (70 - f(point[1])))
// 	}

// 	return commands.join('')
// }

const generate = (data) => {
	const {nodes, edges} = data
	const items = []

	// for (let edge of edges) {
	// 	const l = edge.metadata.line
	// 	const p = parseLine(l).type
	// 	const c = colors[p] && colors[p][l] && colors[p][l].bg || null

	// 	const from = nodes.find((node) => node.id === edge.from)
	// 	const to = nodes.find((node) => node.id === edge.to)

	// 	items.push(h('path', {
	// 		class: 'line',
	// 		style: {stroke: c || '#777'},
	// 		d: [
	// 			'M' + f(from.metadata.coordinates.x) + ' ' + (70 - f(from.metadata.coordinates.y)),
	// 			'L' + f(to.metadata.coordinates.x) + ' ' + (70 - f(to.metadata.coordinates.y))
	// 		].join(' ')
	// 	}))
	// }

	const groupedEdges = groupBy(edges, (edge) => edge.metadata.line)
	for (let line in groupedEdges) {
		const edges = groupedEdges[line]
		// todo: sort by closest neighbor

		const firstFrom = nodes.find((node) => node.id === edges[0].from)
		const firstTo = nodes.find((node) => node.id === edges[0].to)
		const points = [[
			f(firstFrom.metadata.coordinates.x),
			f(firstTo.metadata.coordinates.y)
		]]
		for (let edge of edges) {
			const to = nodes.find((node) => node.id === edge.to)
			points.push([
				f(to.metadata.coordinates.x),
				f(to.metadata.coordinates.y)
			])
		}

		// const d = noSmoothing(points)
		const d = smoothing(points)

		const p = parseLine(line).type
		const c = colors[p] && colors[p][line] && colors[p][line].bg || null
		items.push(h('path', {
			class: 'line',
			style: {stroke: c},
			d
		}))
	}

	for (let station of nodes) {
		items.push(h('circle', {
			class: 'station',
			'data-label': station.label,
			cx: f(station.metadata.coordinates.x),
			cy: 70 - f(station.metadata.coordinates.y),
			r: '.25'
		}))
	}

	return items
}

module.exports = generate
