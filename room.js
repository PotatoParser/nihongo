var createLayer = async (art, index)=>{
	return new layer((window.innerWidth-15*SCALE)/2, 1, 15*SCALE, 15*SCALE, (await loadImages([art]))[art], index);
};
class room {
	constructor(mapName, level){
		this.level = level;
		this.botLayer = null;
		this.topLayer = null;
		this.mapName = mapName;
		this.entities = {};
		this.collision = {};
		this.N = null;
		this.W = null;
		this.S = null;
		this.E =  null;
		this.collisionLayer = new collisionEntity(this.entities, this.collision, 0,0,canvas.height, canvas.width);
		//this.collisionLayer.type = "wall";
		this.box = new collisionEntity(this.entities, this.collision, 0,0,canvas.height, canvas.width);
		//this.box.type = "wall";
		this.box.type = "wall";
		this.box.prop["room"] = this;
		this.box.addCollision(0,0,canvas.width, "x");
		this.box.addCollision(0,0,canvas.height, "y");
		this.box.addCollision(0,canvas.height,canvas.width, "x");
		this.box.addCollision(canvas.width,0,canvas.height, "y");

		this.entities[MAINPLAYER.id] = MAINPLAYER;
		this.collision[MAINPLAYER.id] = MAINPLAYER;
	}
	load() {
		this.botLayer.show();
		this.topLayer.show();
	}
	start() {
		this.load();
		ENTITY = this.entities;
		COLLISION = this.collision;
	}
	unload() {
		this.botLayer.hide();
		this.topLayer.hide();
	}
	async layer() {
		this.botLayer = await createLayer(`${this.level}/Map${this.mapName}.png`, -10);
		this.topLayer = await createLayer(`${this.level}/Map${this.mapName}Top.png`, 10);
	}
	readMap(rawData, collisionCheck){
		for (var i = 0; i < rawData.length; i++) {
			//var start = false;
			//var i = 1;
			this.collisionLayer.type = "room";
			var top = false;
			var bottom = false;
			for (var j = 0; j < rawData[i].length; j++) {
				var target = rawData[i][j];
				if (collisionCheck[target] != undefined) {
					if (i != 0 && top === false) 
						if (collisionCheck[rawData[i-1][j]] == undefined) 
							top = j;
					if (i != rawData.length-1 && bottom === false) 
						if (collisionCheck[rawData[i+1][j]] == undefined) 
							bottom = j;
				}
				if (top !== false) {
					if (collisionCheck[rawData[i-1][j]] != undefined || collisionCheck[target] == undefined || j == rawData[i].length-1) {
						if (j == rawData[i].length-1 && collisionCheck[rawData[i-1][j]] == undefined) {
							j++;
						}
							this.collisionLayer.addCollision(top*SCALE, i*SCALE, (j-top)*SCALE, "x");
							top = false;
					}
				}
				if (bottom !== false) {
					if (collisionCheck[rawData[i+1][j]] != undefined || collisionCheck[target] == undefined || j == rawData[i].length-1) {
						if (j == rawData[i].length-1 && collisionCheck[rawData[i+1][j]] == undefined) {
							j++;
						}
						this.collisionLayer.addCollision(bottom*SCALE, (i+1)*SCALE, (j-bottom)*SCALE, "x");
						bottom = false;
					}
				}
			}
		}
		for (var i = 0; i < rawData.length; i++) {
			var left = false;
			var right = false;

			for (var j = 0; j < rawData[i].length; j++) {
				var target = rawData[j][i];
				if (collisionCheck[target] != undefined) {
					if (i != 0 && left === false) 
						if (collisionCheck[rawData[j][i-1]] == undefined) 
							left = j;
					if (i != rawData.length-1 && right === false) 
						if (collisionCheck[rawData[j][i+1]] == undefined) 
							right = j;
				}
				if (left !== false) {
					if (collisionCheck[rawData[j][i-1]] != undefined || collisionCheck[target] == undefined || j == rawData[i].length-1) {
						if (j == rawData[i].length-1 && collisionCheck[rawData[j][i-1]] == undefined) {
							j++;
						}
							this.collisionLayer.addCollision(i*SCALE, left*SCALE, (j-left)*SCALE, "y");
							left = false;
					}
				}
				if (right !== false) {
					if (collisionCheck[rawData[j][i+1]] != undefined || collisionCheck[target] == undefined || j == rawData[i].length-1) {
						if (j == rawData[i].length-1 && collisionCheck[rawData[j][i+1]] == undefined) {
							j++;
						}
						this.collisionLayer.addCollision((i+1)*SCALE, right*SCALE, (j-right)*SCALE, "y");
						right = false;
					}
				}
			}
		}			
	}
	connect(otherRoom, side){
		switch(side) {
			case "N":
				this.N = otherRoom;
				otherRoom.S = this;
				break;
			case "W":
				this.W = otherRoom;
				otherRoom.E = this;
				break;
			case "S":
				this.S = otherRoom;
				otherRoom.N = this;
				break;
			case "E":
				this.E = otherRoom;
				otherRoom.W = this;
				break;
			default: break;
		}
	}
	changeRoom(direction){
		this.unload();
		switch(direction) {
			case "N": 
				MAINPLAYER.tp(false, canvas.height - MAINPLAYER.hit.offHeight);
				break;
			case "W":
				MAINPLAYER.tp(canvas.width - MAINPLAYER.hit.offWidth);
				break;
			case "S":
				MAINPLAYER.tp(false, 1);
				break;
			case "E":
				MAINPLAYER.tp(1);
				break;
			default: break;
		}
		this[direction].load();				
		COLLISION = this[direction].collision;
		ENTITY = this[direction].entities;
	}
}
async function get(path, data) {
	return new Promise(async (resolve, reject)=>{		
		var temp = new XMLHttpRequest();
		temp.open('GET', path, true);
		temp.send();
			temp.onreadystatechange = ()=>{
				if (temp.readyState === 4) {
					//var data = JSON.parse(temp.response);
					//if (data.msg) resolve(data.msg);
					resolve(temp.response);
				}
			};
		});
}
async function levelGen(array, level){
	if (!MAINPLAYER) MAINPLAYER = await PLAYER();
	var allRooms = array;
	var roomData = [];
	for (var a = 0; a < allRooms.length; a++) {
		var temp = [];
		for (var b = 0; b < allRooms[a].length; b++) {
			if (allRooms[a][b] == null) {
				temp.push(null);
				continue;
			}
			var rooms = new room(allRooms[a][b], level); 
			await rooms.layer();
			var mapData = await get(`/${level}/Map${allRooms[a][b]}.json`);
			//readMap(mapData, collisionTest, rooms.collisionLayer);
			rooms.readMap(JSON.parse(mapData), collisionTest);
			temp.push(rooms);
		}
		roomData.push(temp);
	}
	return roomData;
}
function linkLevels(roomNames, roomData) {
	for (var i = 0; i < roomNames.length; i++) {
		for (var j = 0; j < roomNames[i].length; j++) {
			var name = roomNames[i][j];
			if (name == null || name == "None") continue;
			if (name.indexOf("N") != -1) {
				roomData[i][j].connect(roomData[i-1][j], "N");
			}
			if (name.indexOf("W") != -1) {
				roomData[i][j].connect(roomData[i][j-1], "W");
			}
			if (name.indexOf("S") != -1) {
				roomData[i][j].connect(roomData[i+1][j], "S");
			}
			if (name.indexOf("E") != -1) {
				roomData[i][j].connect(roomData[i][j+1], "E");
			}
		}
	}
}