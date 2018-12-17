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
			var temp = o.storedItems;
			for (var i = 0; i < temp.length; i++) {
				INVENTORY.addItem(temp[i]);
			}
			o.destroy();				
			return i.old;
		}
		if (o.type == "enemy") {
			if (!o.hitPlayer) return i.old;
			HP.change(-1);
		}
	});
	return mainPlayer;
}