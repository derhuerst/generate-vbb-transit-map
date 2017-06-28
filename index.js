'use strict'

const V = require('vec2')
const h = require('virtual-hyperscript-svg')
const parseLine = require('vbb-parse-line')
const colors = require('vbb-util/lines/colors')

// const smoothing = require('./lib/smoothing')
const parallelise = require('./lib/parallelise')

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

const simplify = (nodes) => (edge) => {
	let from = nodes.find((node) => node.id === edge.from)
	if (!from) throw new Error(`node ${edge.from} of edge ${i} not found`)
	from = from.metadata.coordinates

	let to = nodes.find((node) => node.id === edge.to)
	if (!to) throw new Error(`node ${edge.to} of edge ${i} not found`)
	to = to.metadata.coordinates

	return Object.assign({}, edge, {
		line: edge.metadata.line,
		start: [from.x, from.y],
		end: [to.x, to.y]
	})
}

const render = (edge) => {
	const l = edge.line
	const p = parseLine(l).type
	const c = colors[p] && colors[p][l] && colors[p][l].bg || null

	return h('path', {
		class: 'line',
		style: {stroke: c || '#777'},
		d: 'M' + edge.start.map(f).join(' ') + 'L' + edge.end.map(f).join(' ')
	})
}

const generate = (data) => {
	const {nodes, edges} = data

	const items = parallelise(edges.map(simplify(nodes))).map(render)

	for (let station of nodes) {
		items.push(h('circle', {
			class: 'station',
			'data-label': station.label,
			cx: f(station.metadata.coordinates.x),
			cy: f(station.metadata.coordinates.y),
			r: '.18'
		}))
	}

	return items
}

module.exports = generate
