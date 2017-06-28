'use strict'

const V = require('vec2')

const f = (n) => Math.round(n * 1000) / 1000

const signature = (edge) => {
	return [edge.start, edge.end]
	.sort((a, b) => f(a[0] + a[1]) - f(b[0] + b[1])) // get unified direction
	.map((n) => f(n[0]) + '|' + f(n[1]))
	.join(' ')
}

const parallelise = (edges) => {
	// group by signature
	const bySig = {}
	for (let edge of edges) {
		const sig = signature(edge)
		if (!bySig[sig]) bySig[sig] = []
		bySig[sig].push(edge)
	}

	// find neighbors
	for (let sig in bySig) {
		const group = bySig[sig]
		group.before = []
		group.after = []

		const {start, end} = group[0]
		for (let nSig in bySig) {
			if (nSig === sig) continue // exclude self
			const {start: nStart, end: nEnd} = bySig[nSig][0]

			if (start[0] === nEnd[0] && start[1] === nEnd[1]) {
				// neighbor before current edge
				group.before.push(nSig)
			} else if (end[0] === nStart[0] && end[1] === nStart[1]) {
				// neighbor after current edge
				group.after.push(nSig)
			}
		}
	}

	const newEdges = []
	// move parallel edges next to each other
	for (let sig in bySig) {
		const group = bySig[sig]
		for (let i = 0; i < group.length; i++) {
			const {start, end} = group[i]

			const offset = new V(end[0] - start[0], end[1] - start[1])
			offset.rotate(Math.PI / 2).divide(offset.length()).multiply(i / 3)

			const edge = Object.assign({}, group[i], {
				start: [start[0] + offset.x, start[1] + offset.y],
				end: [end[0] + offset.x, end[1] + offset.y]
			})
			newEdges.push(edge)
		}
	}

	return newEdges
}

module.exports = parallelise
