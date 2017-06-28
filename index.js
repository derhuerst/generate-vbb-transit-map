'use strict'

const V = require('vec2')
const h = require('virtual-hyperscript-svg')
const parseLine = require('vbb-parse-line')
const colors = require('vbb-util/lines/colors')

// const smoothing = require('./lib/smoothing')

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

	const renderedEdges = {}
	const renderEdge = (from, to, edge) => {
		const start = [from.x, 70 - from.y]
		const end = [to.x, 70 - to.y]

		// const signature = start.join(' ') + ' ' + end.join(' ')
		const signature = [start, end]
		.sort((a, b) => f(a[0] + a[1]) - f(b[0] + b[1]))
		.map((n) => f(n[0]) + ' ' + f(n[1]))
		.join(' ')

		if (renderedEdges[signature]) {
			const n = renderedEdges[signature] // nr of parallel edges
			renderedEdges[signature]++

			const offset = new V(end[0] - start[0], end[1] - start[1])
			offset.rotate(Math.PI / 2).divide(offset.length()).multiply(n / 3)

			start[0] += offset.x
			start[1] += offset.y
			end[0] += offset.x
			end[1] += offset.y
		}
		else renderedEdges[signature] = 1

		return 'M' + start.map(f).join(' ') + 'L' + end.map(f).join(' ')
	}

	for (let edge of edges) {
		const l = edge.metadata.line
		const p = parseLine(l).type
		const c = colors[p] && colors[p][l] && colors[p][l].bg || null

		const from = nodes.find((node) => node.id === edge.from)
		if (!from) throw new Error(`node ${edge.from} not found`)

		const to = nodes.find((node) => node.id === edge.to)
		if (!to) throw new Error(`node ${edge.to} not found`)

		items.push(h('path', {
			class: 'line',
			style: {stroke: c || '#777'},
			d: renderEdge(from.metadata.coordinates, to.metadata.coordinates, edge)
		}))
	}

	for (let station of nodes) {
		items.push(h('circle', {
			class: 'station',
			'data-label': station.label,
			cx: f(station.metadata.coordinates.x),
			cy: 70 - f(station.metadata.coordinates.y),
			r: '.18'
		}))
	}

	return items
}

module.exports = generate
