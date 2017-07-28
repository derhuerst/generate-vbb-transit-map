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

const renderEdges = (reportBbox) => (edge) => {
	const l = edge.line
	const p = parseLine(l).type
	const c = colors[p] && colors[p][l] && colors[p][l].bg || null

	const top = Math.min(edge.start[1], edge.end[1])
	const left = Math.min(edge.start[0], edge.end[0])
	const bottom = Math.max(edge.start[1], edge.end[1])
	const right = Math.max(edge.start[0], edge.end[0])
	reportBbox(top, left, bottom, right)

	return h('path', {
		class: 'line ' + l,
		style: {stroke: c || '#777'},
		d: 'M' + edge.start.map(f).join(' ') + 'L' + edge.end.map(f).join(' ')
	})
}

const generate = (data) => {
	const {nodes, edges} = data

	let top = Infinity, left = Infinity, bottom = -Infinity, right = -Infinity
	const reportBbox = (t, l, b, r) => {
		if (t < top) top = t
		if (l < left) left = l
		if (b > bottom) bottom = b
		if (r > right) right = r
	}

	const items = parallelise(edges.map(simplify(nodes)))
	.map(renderEdges(reportBbox))

	for (let station of nodes) {
		const c = station.metadata.coordinates
		items.push(h('circle', {
			class: 'station',
			'data-label': station.label,
			cx: f(c.x),
			cy: f(c.y),
			r: '.1'
		}))
		reportBbox(c.y - .1, c.x - .1, c.y + .1, c.x + .1)
	}

	left = f(left)
	top = f(top)
	const width = f(right - left)
	const height = f(bottom - top)
	const bbox = Object.assign([left, top, width, height], {left, top, width, height})

	return {items, bbox}
}

module.exports = generate
