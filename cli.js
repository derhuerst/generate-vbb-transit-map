#!/usr/bin/env node
'use strict'

const mri = require('mri')
const toString = require('virtual-dom-stringify')

const pkg = require('./package.json')
const generate = require('.')

const argv = mri(process.argv.slice(2), {
	boolean: ['help', 'h', 'version', 'v']
})

if (argv.help || argv.h) {
	process.stdout.write(`
Usage:
    generate-vbb-transit-map
Examples:
    cat graph.json | generate-vbb-transit-map > map.svg
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`generate-vbb-transit-map v${pkg.version}\n`)
	process.exit(0)
}

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

let input = ''
process.stdin
.on('error', showError)
.on('data', (d) => {
	input += d.toString('utf8')
})
.once('end', () => {
	try {
		const graph = JSON.parse(input)
		const svg = generate(graph)
		process.stdout.write(toString(svg))
	} catch (err) {
		return showError(err)
	}
})
