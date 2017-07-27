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

	// sort by name
	for (let sig in bySig) {
		bySig[sig] = bySig[sig].sort((a, b) => {
			if (a.line < b.line) return -1
			if (a.line > b.line) return 1
			return 0
		})
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

				if (offset.length() === 0) {
					throw new Error(`edge ${edge.source}-${edge.target} has a length of 0`)
				}

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
