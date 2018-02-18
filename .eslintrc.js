module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es6": true,
		"node": true
	},
	"parser": "babel-eslint",
	"rules": {
		"strict": 0
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"sourceType": "module"
	},
	"rules": {
		"indent": [
			"off",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"semi": [
			"error",
			"always"
		],
		"no-console": [
			"off"
		],
		"no-empty": [
			"off"
		]
	}
};