const PLAYER = async ()=>{
	var allImages = ["test.png", "testBack.png", "orb.png"];			
	//var playerArt = await loadImages(allImages);
	await globalLoad("test.png", "testBack.png", "orb.png");
	var mainPlayer = new player(false, false, ["test.png", "testBack.png"], 7*SCALE, 5*SCALE, Math.round(36/48*SCALE), Math.round(40/48*SCALE), 0.125*SCALE, Math.round(6/48*SCALE), SCALE,SCALE);
	mainPlayer.oncollision((c, o, i)=>{
		var direction = "";
		if (i["x"] != undefined) {
			if (i["x"] == 0) {
				direction = "W";
			} else direction = "E";
		} else {
			if (i["y"] == 0) {
				direction = "N";
			} else direction = "S";
		}
		if(o.type == "wall" && o.prop["room"] != undefined) o.prop["room"].changeRoom(direction);
	});
	//mainPlayer.speed = 4;	
	mainPlayer.setSpeed(4);		
	mainPlayer.onCursorMove("face", (mouse, playerData)=>{
		if (playerData.moving()) return;
		if (mouse.y-32 < mainPlayer.y) playerData.index = 1;
		else playerData.index = 0;				
	});
	mainPlayer.onmove("KeyS", 1, "y", 0, false, ()=>{
		mainPlayer.mouseControls.face.exe();
	});
	mainPlayer.onmove("KeyW", -1, "y", 1, false, ()=>{
		mainPlayer.mouseControls.face.exe();
	});			
	mainPlayer.onmove("KeyA", -1, "x", null, false, false);
	mainPlayer.onmove("KeyD", 1, "x", null, false, false);	

	mainPlayer.hitbox(true);
	mainPlayer.onCursorClick("leftClick", "left", 0, (mouse, playerData)=>{
		var canvasProp = mfpp._dimension(canvas.element);
		if (mouse.x < canvasProp.x || mouse.y < canvasProp.y || mouse.y > canvasProp.height + canvasProp.y || mouse.x > canvasProp.x + canvasProp.width) return;
		INVENTORY.activate(mouse, playerData);

	}, (mouse, playerData)=>{
		INVENTORY.deactivate(mouse, playerData);
	});
	mainPlayer.oncollision((c, o, i)=>{
		if (o.type == "chest") {
			/*var other = async ()=>{
				var staffData = await loadImages(["staff.png", "randoRing.png"]);
				INVENTORY.addItem(new item(staffData["staff.png"], (mouse, playerData, itemData)=>{
					var temp = new entity(ENTITY, COLLISION, [playerArt["orb.png"]], playerData.x+playerData.hit.offWidth/2-4, playerData.y+playerData.hit.offHeight/2-4, 8, 8, 4, 4);
					temp.oncollision((c, o, i)=>{
						if(o.type == "wall" || o.type == "room") c.destroy();
						else if(o.type == "enemy"){
							c.destroy();
							if (o.hp > 0) o.hp--;
							else o.destroy();
						} else return i.old;
					});
					temp.moveTo(mouse.x-4-canvas.x, mouse.y-4-canvas.y, ()=>{});
					//temp.speed = 10;
					temp.setSpeed(10);
				}, false, false, 1000/60));
				INVENTORY.addItem(new item(staffData["randoRing.png"], (mouse, playerData, itemData)=>{
					var temp = new entity(ENTITY, COLLISION, [playerArt["orb.png"]], playerData.x+playerData.hit.offWidth/2-4, playerData.y+playerData.hit.offHeight/2-4, 8, 8, 4, 4);
					temp.oncollision((c, o, i)=>{
						if(o.type == "wall" || o.type == "room") c.destroy();
						else if(o.type == "enemy"){
							c.destroy();
							if (o.hp > 0) o.hp--;
							else o.destroy();
						} else return i.old;
					});
					temp.moveTo(mouse.x-4-canvas.x, mouse.y-4-canvas.y, ()=>{});
					//temp.speed = 10;
					temp.setSpeed(10);
				}, false, false, 0));
			}*/
			var temp = o.storedItems;
			for (var i = 0; i < temp.length; i++) {
				INVENTORY.addItem(temp[i]);
			}
			o.destroy();				
			//other();
			return i.old;
		}
	});
	return mainPlayer;
}