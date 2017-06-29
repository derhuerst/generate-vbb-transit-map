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
		const m = group.length - 1

		for (let i = 0; i <= m; i++) {
			let edge = group[i]

			if (m > 0) { // more than one line
				// get normalized orthogonal
				const [A, B] = [edge.start, edge.end]
				.sort((a, b) => f(a[0] + a[1]) - f(b[0] + b[1])) // get unified direction
				const offset = new V(B[0] - A[0], B[1] - A[1])
				offset.rotate(Math.PI / 2).divide(offset.length())

				// shift sideways
				offset.multiply((i - m / 2) / 7)

				edge = Object.assign({}, group[i], {
					start: [edge.start[0] + offset.x, edge.start[1] + offset.y],
					end: [edge.end[0] + offset.x, edge.end[1] + offset.y]
				})
			}

			newEdges.push(edge)
		}
	}

	return newEdges
}

module.exports = parallelise
