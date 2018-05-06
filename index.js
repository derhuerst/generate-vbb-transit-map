'use strict'

const h = require('virtual-dom/virtual-hyperscript/svg')

const generate = require('./lib/generate')

const styles = h('style', {}, `
	.line {
		stroke: #333;
		stroke-width: .09;
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.station {
		stroke: none;
	}
	.transit {
		stroke: #555;
		stroke-width: .05;
		fill: #fff;
	}
`)

const generateWrapped = (data) => {
	const {items, bbox} = generate(data)

	// padding
	const l = bbox.left - .5
	const t = bbox.top - .5
	const w = bbox.width + 1
	const ht = bbox.height + 1

	return h('svg', {
		xmlns: 'http://www.w3.org/2000/svg',
		width: (w * 20).toFixed(3),
		height: (ht * 20).toFixed(3),
		viewBox: [
			l.toFixed(3), t.toFixed(3), w.toFixed(3), ht.toFixed(3)
		].join(' ')
	}, [
		styles,
		h('g', {transform: `translate(0,${bbox.height}) scale(1,-1)`}, items)
	])
}

module.exports = generateWrapped
