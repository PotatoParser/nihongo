async function level2(){
	var allRooms = [["E","WE","WS"],
					["E","WSE","NW"],
					["E","NWSE","W"],
					[null,"N",null]];
	var roomData = await levelGen(allRooms, "lvl2");
	linkLevels(allRooms, roomData);			
	roomData[2][1].load();
	COLLISION = roomData[2][1].collision;
	ENTITY = roomData[2][1].entities;
}
async function level3(){
	var allRooms = [["None"]];
	var roomData = await levelGen(allRooms, "lvl3");
	console.log(roomData);
	linkLevels(allRooms, roomData);			
	roomData[0][0].load();
	COLLISION = roomData[0][0].collision;
	ENTITY = roomData[0][0].entities;

}
async function level4(){
	var allRooms = [["S","S",null],
					["NE","NWSE","W"],
					["E","NWSE","W"],
					[null,"N",null]];
	var roomData = await levelGen(allRooms, "lvl4");
	linkLevels(allRooms, roomData);
	roomData[3][1].load();
	COLLISION = roomData[3][1].collision;
	ENTITY = roomData[3][1].entities;					
}
//level4();

async function level5(){
	var allRooms = [["None"]];
	var roomData = await levelGen(allRooms, "lvl5");
	linkLevels(allRooms, roomData);
}
//level5();

// TODO
async function level6(){
	var allRooms = [["", "", ""],
					["", "", ""],
					["", "", ""]];
	var roomData = await levelGen(allRooms, "lvl6");
	linkLevels(allRooms, roomData);
}
//level6();
async function level7(){
	var allRooms = [["SE", "WSE", "WS"],
					["NS", "N", "NS"],
					["N", null, "N"]];			
	var roomData = await levelGen(allRooms, "lvl7");
	linkLevels(allRooms, roomData);
}
//level7();
async function level8(){
	var allRooms = [["SE", "WE", "W"],
					["NS", "E", "WS"],
					["NE", "WE", "NW"]];
	var roomData = await levelGen(allRooms, "lvl8");
	linkLevels(allRooms, roomData);
	roomData[0][2].load();
	COLLISION = roomData[0][2].collision;
	ENTITY = roomData[0][2].entities;			
}
//level8();
async function level9(){
	var allRooms = [["SE", "W"],
					["NS", null],
					["NE", "WS"],
					[null, "NS"],
					["E", "NW"]];
	var roomData = await levelGen(allRooms, "lvl9");
	linkLevels(allRooms, roomData);
	roomData[2][0].load();
	COLLISION = roomData[2][0].collision;
	ENTITY = roomData[2][0].entities;			
}
//level9();
async function level10(){
	var allRooms = [["None"]];
	var roomData = await levelGen(allRooms, "lvl10");
	linkLevels(allRooms, roomData);
}
//level10();
async function level11(){
	var allRooms = [["SE", "WSE", "WS"],
					["NS", "NS", "NS"],
					["NE", "NWE", "NW"]];
	var roomData = await levelGen(allRooms, "lvl11");
	linkLevels(allRooms, roomData);
	roomData[1][2].load();
	COLLISION = roomData[1][2].collision;
	ENTITY = roomData[1][2].entities;			
}
//level11();
async function level12(){
	var allRooms = [["E", "WSE", "W"],
					["SE", "NW", "S"],
					["NE", "WE", "NW"]];
	var roomData = await levelGen(allRooms, "lvl12");
	linkLevels(allRooms, roomData);
	roomData[2][1].load();
	COLLISION = roomData[2][1].collision;
	ENTITY = roomData[2][1].entities;			
}
//level12();	
async function level13(){
	var allRooms = [[null, "S", null, null],
					[null, "NSE", "WS", null],
					["E", "NWS", "N", null],
					[null, "NSE", "WE", "W"],
					[null, "N", null, null]];
	var roomData = await levelGen(allRooms, "lvl13");
	linkLevels(allRooms, roomData);
	roomData[4][1].load();
	COLLISION = roomData[4][1].collision;
	ENTITY = roomData[4][1].entities;			
}
//level13();
async function level14(){
	var allRooms = [[null, "S", null],
					["E", "NWSE", "W"],
					[null, "N", null]];
	var roomData = await levelGen(allRooms, "lvl14");
	linkLevels(allRooms, roomData);
	roomData[1][1].load();
	COLLISION = roomData[1][1].collision;
	ENTITY = roomData[1][1].entities;				
}
//level14();
async function level15(){
	var allRooms = [["None"]];
	var roomData = await levelGen(allRooms, "lvl5");
	linkLevels(allRooms, roomData);

}
//level15();					