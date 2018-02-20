const express = require('express');
const router = express.Router();
const errToJSON = require('error-to-json');
const Scanner = require('../../scantron/components/scanner');

router.post('/list', (req, res) => {
	Scanner.findScantrons()
	.then(devices => {		
		res.json({
			devices,
			status: 0,
		});
	})
	.catch((error) => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.post('/results', (req, res) => {
});

module.exports = router;

