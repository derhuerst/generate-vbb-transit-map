'use strict'

const V = require('vec2')
const h = require('virtual-dom/virtual-hyperscript/svg')
const parseLine = require('vbb-parse-line')
const colors = require('vbb-util/lines/colors')
const uniqBy = require('lodash.uniqby')

// const smoothing = require('./smoothing')
const parallelise = require('./parallelise')

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

const simplifyEdges = (nodes) => (edge) => {
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

const findEdgesAt = (edges, node) => edges.filter((edge) => {
	// todo: change to source & target, as in JGF spec
	return edge.from === node.id || edge.to === node.id
})

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

const renderStations = (edges, reportBbox) => (station) => {
	const edgesAt = findEdgesAt(edges, station)
	if (edgesAt.length === 0) throw new Error('no edges connected to ' + station.id)
	const isTransitNode = uniqBy(edgesAt, (e) => e.metadata.line).length > 1

	let color = null
	if (!isTransitNode) {
		const l = edgesAt[0].metadata.line
		const p = parseLine(l).type
		color = colors[p] && colors[p][l] && colors[p][l].bg || null
	}
	const radius = isTransitNode ? .12 : .1 // todo

	const c = station.metadata.coordinates
	reportBbox(c.y - radius, c.x - radius, c.y + radius, c.x + radius)

	return h('circle', {
		class: isTransitNode ? 'station transit' : 'station',
		'data-id': station.id,
		'data-label': station.label,
		cx: f(c.x),
		cy: f(c.y),
		r: radius + '',
		fill: color || '#333'
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

	const items = [].concat(
		parallelise(edges.map(simplifyEdges(nodes))).map(renderEdges(reportBbox)),
		nodes.map(renderStations(edges, reportBbox))
	)

	left = f(left)
	top = f(top)
	const width = f(right - left)
	const height = f(bottom - top)
	const bbox = Object.assign([left, top, width, height], {left, top, width, height})

	return {items, bbox}
}

module.exports = generate
