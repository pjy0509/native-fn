import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import path from 'path'

const pluginNames = [
	'appearance',
	'badge',
	'battery',
	'clipboard',
	'dimension',
	'fullscreen',
	'geolocation',
	'notification',
	'open',
	'platform',
	'theme',
	'vibration',
	'permission',
	'pip',
]

const entries = [
	{
		input: 'index.ts',
		jsOutBase: 'dist/native.',
		dtsOutFile: 'dist/index.d.ts',
		umdName: 'Native',
		buildUmd: true,
	},
	...pluginNames.map((name) => ({
		input: `src/plugin/${name}/index.ts`,
		jsOutBase: `dist/plugin/${name}/index.`,
		dtsOutFile: `dist/plugin/${name}/index.d.ts`,
		buildUmd: false,
	})),
]

const jsBundles = entries.flatMap((options) => {
	const formats = options.buildUmd
		? [
			{ format: 'es', extension: 'mjs', minExtension: 'min.mjs' },
			{ format: 'cjs', extension: 'cjs', minExtension: 'min.cjs', exports: 'auto' },
			{ format: 'umd', extension: 'umd.js', minExtension: 'umd.min.js', exports: 'default' },
		]
		: [
			{ format: 'es', extension: 'mjs' },
			{ format: 'cjs', extension: 'cjs', exports: 'auto' },
		]
	
	return formats.map((fmt) => {
		const outputs = [
			{
				file: options.jsOutBase + fmt.extension,
				format: fmt.format,
				exports: fmt.exports,
				name: options.umdName,
			},
		]
		
		if (fmt.minExtension) {
			outputs.push({
				file: options.jsOutBase + fmt.minExtension,
				format: fmt.format,
				exports: fmt.exports,
				name: options.umdName,
				plugins: [terser()],
			})
		}
		
		return {
			input: options.input,
			plugins: [
				typescript({ tsconfig: './tsconfig.json' }),
				json(),
			],
			output: outputs,
		}
	})
})

const dtsBundles = entries.map((options) => ({
	input: options.input,
	plugins: [dts()],
	output: {
		file: path.resolve(options.dtsOutFile),
		format: 'es',
	},
}))

export default [...jsBundles, ...dtsBundles]
