const express = require('express');
const router = express.Router();
const errToJSON = require('error-to-json');
const Scanner = require('../../lib/scanner');

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

module.exports = router;

