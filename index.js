var fs = require('fs');
const express = require('express');
const app = express();
var cors = require('cors');
app.use(cors());
app.use(express.static('C:/Users/MidSh/Desktop/nihongo'));
app.get("/", (req, res)=>res.sendFile(__dirname + "/mapGen.html"));
app.listen(7777, () => console.log('Example app listening on port 3000!'));