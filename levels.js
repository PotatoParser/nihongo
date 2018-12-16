var ALLITEMS;
function dealDamage(damage){
	return (c, o, i)=>{
		if(o.type == "wall" || o.type == "room") c.destroy();
		else if(o.type == "enemy"){
			c.destroy();
			if (o.hp > 0) o.hp-=damage;
			if (o.hp <= 0) {
				GOLD+=o.gold;
				o.destroy();
			}
		} else return i.old;
	};
}
async function level1(){
	LEVEL = 1;
	await loadAllItems();
	var allRooms = [["SE", "WS", "S"],
					["NE", "NWS", "NS"],
					[null, "NE", "NW"]];
	var roomData = await levelGen(allRooms, "lvl1");
	//var otherArt = await loadImages(["art/woodenChest.png", "test.png"]);
	await globalLoad("art/woodenChest.png", "test.png", "staff.png", "orb.png", "randoRing.png");
	var simpleTarget = (c)=>{
		if (Math.abs(MAINPLAYER.x-c.x) > c.speed){
			if (c.x < MAINPLAYER.x) {
				c.moveX(c.x+c.speed);
			} else if (c.x > MAINPLAYER.x) c.moveX(c.x-c.speed);
		}
		if (Math.abs(MAINPLAYER.y-c.y) > c.speed) {
			if (c.y < MAINPLAYER.y) {	
				c.moveY(c.y+c.speed);
			} else if (c.y > MAINPLAYER.y) c.moveY(c.y-c.speed);	
		}
	}
	var randMove = (c)=>{
		if (c.moveToLoop) {
			return;
		}
		var temp = rand(1,15);
		var temp2 = rand(1,15);		
		c.moveTo(temp*SCALE, temp2*SCALE);			
	}
	linkLevels(allRooms, roomData);
	//[otherArt["art/woodenChest.png"]]
	var temp = new entity(roomData[0][0].entities, roomData[0][0].collision, ["art/woodenChest.png"], 7*SCALE, 7*SCALE, false, false, false, false, SCALE,SCALE);	
	temp.type = "chest";
	temp.hitbox(0.125*SCALE, 0.125*SCALE, 0.75*SCALE, 0.75*SCALE);	
	temp.storeItem(ALLITEMS["Fire Staff"]);
	ALLITEMS["Bento Bomb"]["counter"] = 10;
	temp.storeItem(ALLITEMS["Bento Bomb"]);
	var randEnemy = (roomInfo, count)=>{	
		for (var i = 0; i < count; i++) {
			var e = new enemy(roomInfo.entities, roomInfo.collision, ["test.png"], rand(1,13)*SCALE, rand(2,13)*SCALE, Math.round(36/48*SCALE), Math.round(40/48*SCALE), 0.125*SCALE, Math.round(6/48*SCALE), SCALE, SCALE);
			e.addAlgorithm(randMove);
			e.setHP(10);
			e.setSpeed(2);
			e.hitbox(true);
			e.oncollision((c,o)=>{
				if(o.type == "wall" || o.type == "room") {
					c.stopMoving();
				}
			});
			e.oncollision((c,o,i)=>{return (o.type === "enemy") ? i.old : false;});
		}
	}
	var simpleEnemy = (roomInfo, count)=>{	
		for (var i = 0; i < count; i++) {
			var e = new enemy(roomInfo.entities, roomInfo.collision, ["test.png"], rand(1,13)*SCALE, rand(2,13)*SCALE, Math.round(36/48*SCALE), Math.round(40/48*SCALE), 0.125*SCALE, Math.round(6/48*SCALE), SCALE,SCALE);
			e.addAlgorithm(simpleTarget);
			e.setHP(10);
			e.setSpeed(2);
			e.hitbox(true);
			e.oncollision((c,o)=>{
				if(o.type == "wall" || o.type == "room") {
					c.stopMoving();
				} else if (o.type == "player") {
					HP.change(-1);
				}
			});
		}
	}
	roomData[0][0].start();				
	// When player is out, it tps the player.
	simpleEnemy(roomData[0][0], 1);
	simpleEnemy(roomData[2][2], 1);
	simpleEnemy(roomData[1][2], 1);
	randEnemy(roomData[0][1], 3);
	randEnemy(roomData[1][0], 3);
	randEnemy(roomData[2][1], 3);
}

/*
TEMPLATE||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

"template": new item("staff.png", (mouse, playerData, itemData)=>{
	if (MP.getValue()<1) return;
	MP.change(-1);
	var temp = new entity(ENTITY, COLLISION, ["orb.png"], playerData.x+playerData.hit.offWidth/2-4, playerData.y+playerData.hit.offHeight/2-4, 8, 8, 4, 4);
	temp.oncollision(dealDamage(LEVEL*2, 1));
	temp.moveTo(mouse.x-4-canvas.x, mouse.y-4-canvas.y, ()=>{});
	temp.setSpeed(10);
}, false, false, 1000),	


*/

async function loadAllItems(){
	await globalLoad("staff.png", "orb.png", "randoRing.png");
	var temp = {
		'Fire Staff': new item("staff.png", (mouse, playerData, itemData)=>{
			if (MP.getValue()<1) return;
			MP.change(-1);
			var temp = new entity(ENTITY, COLLISION, ["orb.png"], playerData.x+playerData.hit.offWidth/2-4, playerData.y+playerData.hit.offHeight/2-4, 8, 8, 4, 4);
			temp.oncollision(dealDamage(LEVEL*2));
			temp.moveTo(mouse.x-4-canvas.x, mouse.y-4-canvas.y, ()=>{});
			temp.setSpeed(10);
		}, false, false, 1000),
		"HP Potion (L)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			HP.update(HP.getMax());
			itemData.removeItem();
		}, false, false, 0),	
		"HP Potion (M)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			HP.update(HP.getMax()*0.5);
			itemData.removeItem();
		}, false, false, 0),	
		"HP Potion (S)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			HP.update(HP.getMax()*0.25);
			itemData.removeItem();
		}, false, false, 0),	
		"Mana Potion (L)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			MP.update(MP.getMax());
			itemData.removeItem();
		}, false, false, 0),		
		"Mana Potion (M)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			MP.update(MP.getMax()*0.5);
			itemData.removeItem();
		}, false, false, 0),
		"Mana Potion (S)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			MP.update(MP.getMax()*0.25);
			itemData.removeItem();
		}, false, false, 0),
		"Bento Bomb": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if (itemData["counter"] == undefined) return;
			var temp = Object.getOwnPropertySymbols(ENTITY);
			for (var i = 0; i < temp.length; i++) {
				if (ENTITY[temp[i]].type == "enemy") ENTITY[temp[i]].updateHP(-10*itemData["counter"]);
			}			
			itemData.removeItem();
		}, false, false, 0),	
		"Upgrade Ring": new item("randoRing.png", (mouse, playerData, itemData)=>{
			MP.update(MP.getMax()*0.25);
			itemData.removeItem();
		}, false, false, 0),						
	}
	ALLITEMS = temp;
}