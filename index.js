var fs = require('fs');
const express = require('express');
const app = express();
var cors = require('cors');
const _parser = require('body-parser');
app.use(cors());
app.use(express.static('C:/Users/MidSh/Desktop/nihongo'));
app.get("/", (req, res)=>res.sendFile(__dirname + "/mapGen.html"));
app.listen(7777, () => console.log('Example app listening on port 3000!'));
app.use(_parser.json({limit: "50mb"}));
app.use(_parser.urlencoded({limit: "50mb", extended: true}));
//app.use(express.bodyParser({limit:"50mb"}));
app.post("/openMap", (req, res)=>{
	var dir = req.body.dir;
	var data = fs.readdirSync(dir).filter((str)=>{if(str.indexOf("png") != -1 && str.indexOf("Map") == -1) return true; return false;});
	console.log(data);
	res.send(data);
});
app.post("/createMap", (req, res)=>{
	var data = req.body;
	var imageData = data.img.replace("data:image/png;base64,", "");
	fs.writeFileSync("" + data.level + "/Map" + data.name, imageData, "base64");
	res.send({});
});
app.post("/createMesh", (req, res)=>{
	var data = req.body;
	var newName = data.name.substring(0, data.name.lastIndexOf(".")) + ".json";
	console.log(newName);
	fs.writeFileSync("" + data.level + "/Map" + newName, JSON.stringify(data.array), "utf8");
	res.send({});	
});
	var data = fs.readdirSync("lvl1").filter((str)=>{if(str.indexOf("png") != -1) return true; return false;});
	console.log(data);