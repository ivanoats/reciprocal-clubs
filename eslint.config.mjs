import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
	...nextVitals,
	{
		ignores: ['styled-system/**', '.next/**', 'coverage/**'],
	},
]

export default config
