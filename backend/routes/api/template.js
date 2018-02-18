const express = require('express');
const router = express.Router();
const errToJSON = require('error-to-json');

router.post('/something', (req, res) => {
	Promise.resolve()
	.then(() => {
		res.json({
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

