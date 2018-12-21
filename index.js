var fs = require('fs');
const express = require('express');
const app = express();
var cors = require('cors');
const _parser = require('body-parser');
app.use(cors());
app.use(express.static(__dirname));
app.get("/", (req, res)=>res.sendFile(__dirname + "/test.html"));
app.listen(process.env.PORT || 5000, () => console.log('Example app listening on port 3000!'));
app.use(_parser.json({limit: "50mb"}));
app.use(_parser.urlencoded({limit: "50mb", extended: true}));
/*app.post("/getMaps", (req, res)=>{
	for (var i = 0; i < )
});*/