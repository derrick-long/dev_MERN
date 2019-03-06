const express = require('express');
const router = express.Router();

router.get('/test', (req,res)=>
    res.json({msg: "howdy partner profile works"}));

module.exports = router;