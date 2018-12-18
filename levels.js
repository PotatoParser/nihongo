var ALLITEMS;
var ALGORITHMS = {
	simpleTarget: (c)=>{
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
	},
	randMove: (c)=>{
		if (c.moveToLoop) {
			return;
		}
		var temp = rand(1,15);
		var temp2 = rand(1,15);		
		c.moveTo(temp*SCALE, temp2*SCALE);			
	}

}
function dealDamage(damage){
	return (c, o, i)=>{
		if(o.type == "wall" || o.type == "room") c.destroy();
		else if(o.type == "enemy"){
			c.destroy();
			if (o.hp > 0) o.updateHP(-damage);
			if (o.hp <= 0) {
				GOLD+=o.gold;
				o.destroy();
			}
		} else return i.old;
	};
}
async function exitPortal(room, x, y, nextFunc){
	await globalLoad("art/portal.png");	
	var temp = new entity(room.entities, room.collision, ["art/portal.png"], x, y, false, false, false, false, SCALE,SCALE);	
	temp.type = "portal";
	temp.hitbox(true);	
	temp.prop["tp"] = nextFunc;
}
async function level1(){
	LEVEL = 1;
	await loadAllItems();
	INVENTORY.addItem(ALLITEMS["Fire Staff"]);

	var allRooms = [["SE", "WS", "S"],
					["NE", "NWS", "NS"],
					[null, "NE", "NW"]];
	var roomData = await levelGen(allRooms, "lvl1");
	//var otherArt = await loadImages(["art/woodenChest.png", "test.png"]);
	await globalLoad("art/woodenChest.png", "test.png", "staff.png", "orb.png", "randoRing.png");
	linkLevels(allRooms, roomData);
	//[otherArt["art/woodenChest.png"]]
	var temp = new entity(roomData[0][0].entities, roomData[0][0].collision, ["art/woodenChest.png"], 7*SCALE, 7*SCALE, false, false, false, false, SCALE,SCALE);	
	temp.type = "chest";
	temp.hitbox(0.125*SCALE, 0.125*SCALE, 0.75*SCALE, 0.75*SCALE);	
	temp.storeItem(ALLITEMS["Ring of Resolve"]);
	temp.storeItem(ALLITEMS["Ring of Magic"]);
	var randEnemy = (roomInfo, count)=>{	
		for (var i = 0; i < count; i++) {
			let e = new enemy(roomInfo.entities, roomInfo.collision, ["test.png"], rand(1,13)*SCALE, rand(2,13)*SCALE, Math.round(36/48*SCALE), Math.round(40/48*SCALE), 0.125*SCALE, Math.round(6/48*SCALE), SCALE, SCALE);
			e.addAlgorithm(ALGORITHMS.randMove);
			e.setHP(10);
			e.setSpeed(1);
			e.hitbox(true);
			e.oncollision((c, o, i)=>{
				if(o.type == "wall" || o.type == "room") {
					c.stopMoving();
				} else if (o.type == "player") {
					if (!c.hitPlayer) return i.old;
				}
			});
			e.oncollision((c,o,i)=>{return (o.type === "enemy") ? i.old : false;});
		}
	}
	var simpleEnemy = (roomInfo, count)=>{	
		for (var i = 0; i < count; i++) {
			let e = new enemy(roomInfo.entities, roomInfo.collision, ["test.png"], rand(1,13)*SCALE, rand(2,13)*SCALE, Math.round(36/48*SCALE), Math.round(40/48*SCALE), 0.125*SCALE, Math.round(6/48*SCALE), SCALE,SCALE);
			e.addAlgorithm(ALGORITHMS.simpleTarget);
			e.setHP(10);
			e.setSpeed(1);
			e.hitbox(true);
			e.oncollision((c,o)=>{
				if(o.type == "wall" || o.type == "room") {
					c.stopMoving();
				} else if (o.type == "player") {
					HP.change(-1);
				}
			});
			e.oncollision((c,o,i)=>{return (o.type === "enemy") ? i.old : false;});			
		}
	}
	var testDummy = (roomInfo, count)=>{	
		for (var i = 0; i < count; i++) {
			var e = new enemy(roomInfo.entities, roomInfo.collision, ["test.png"], rand(1,13)*SCALE, rand(2,13)*SCALE, Math.round(36/48*SCALE), Math.round(40/48*SCALE), 0.125*SCALE, Math.round(6/48*SCALE), SCALE, SCALE);
			e.setHP(10);
			e.setSpeed(2);
			e.hitbox(true);
		}
	}	
	roomData[1][1].start(7*SCALE+(SCALE-MAINPLAYER.hit.offWidth)/2, 9*SCALE);				
	// When player is out, it tps the player.
	simpleEnemy(roomData[0][0], 1);
	simpleEnemy(roomData[2][2], 1);
	simpleEnemy(roomData[1][2], 1);
	randEnemy(roomData[0][1], 3);
	randEnemy(roomData[1][0], 3);
	randEnemy(roomData[2][1], 3);
	await exitPortal(roomData[0][2], 7*SCALE, 2*SCALE, ()=>{roomData[0][2].unload(); level5();});
	//testDummy(roomData[0][0], 1);
}

async function level5(){
	LEVEL = 5;
	await loadAllItems();
	INVENTORY.addItem(ALLITEMS["Fire Staff"]);	
	await globalLoad("art/woodenChest.png", "test.png", "staff.png", "orb.png", 
		"randoRing.png", "lvl5/heart.png", "lvl5/twoFaceBack.png", "lvl5/boredFace.png", "lvl5/happyFace.png", "lvl5/sadFace.png", "lvl5/funFace.png");

	var allRooms = [["None"]];
	var roomData = await levelGen(allRooms, "lvl5");
	linkLevels(allRooms, roomData);
	var twoFace = new enemy(roomData[0][0].entities, roomData[0][0].collision, ["lvl5/happyFace.png", "lvl5/sadFace.png", "lvl5/funFace.png", "lvl5/twoFaceBack.png", "lvl5/boredFace.png"], 7*SCALE, 3*SCALE, Math.round(34/64*SCALE), Math.round(64/64*SCALE), 11/48*SCALE, 0, SCALE,SCALE);
	twoFace.addAlgorithm(ALGORITHMS.randMove);
	var timer = setInterval(()=>{
		console.log("start");
		let temp = ["happy", "sad", "excited", "bored", "happy", "sad", "excited", "happy"];
		expressions[temp[rand(0, temp.length-1)]]();
	}, 5000);		
	twoFace.death = ()=>{
		GOLD+=twoFace.gold;
		twoFace.destroy();
		twoFace.addEffect = ()=>{};
		twoFace.clearAllEffects();
		clearInterval(timer);
	}
	twoFace.setHP(300);
	twoFace.setSpeed(4);
	twoFace.hitbox(true);
	twoFace.oncollision((c,o)=>{
		if(o.type == "wall" || o.type == "room") {
			c.stopMoving();
		} else if (o.type == "player") {
			HP.change(-3);
		}
	});
	var currentFace = 0;
	twoFace.ony = (obj, y)=>{
		if (y < obj.y) {
			obj.index = 3;
		} else {
			obj.index = currentFace;
		}
	}
	var expressions = {
		happy: ()=>{
			twoFace.clearAllEffects();
			currentFace = 0;
			twoFace.addEffect("HappyTime", 0, 1000, ()=>{
				let paths = [[0,1], [-1,0], [1,0], [0,-1]]
				for (let a = 0; a < paths.length; a++) {
					for (let i = 0; i < 3; i++) {
						setTimeout(()=>{
							let temp = new orb(twoFace, ["lvl5/heart.png"], 8, 8, 4, 4);
							temp.oncollision((c, o, i)=>{
								if(o.type == "wall" || o.type == "room") c.destroy();
								else if(o.type == "player"){
									c.destroy();
									HP.change(-5);
								} else return i.old;
							});
							temp.moveTo(temp.x + paths[a][0],temp.y+paths[a][1], ()=>{});
							temp.setSpeed(10);
						}, i*200);
					}			
				}
			}, false);		
		},
		sad: ()=>{
			twoFace.clearAllEffects();
			currentFace = 1;
			twoFace.addEffect("SadTime", 0, 2000, ()=>{
				MAINPLAYER.changeSpeed(-1);
				MAINPLAYER.addEffect("Saddened", 1, 1000, false, ()=>{MAINPLAYER.changeSpeed(1);});
			}, false);			
		},
		excited: ()=>{
			twoFace.clearAllEffects();
			currentFace = 2;
			let paths = [[0,1], [-1,0], [1,0], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]];
			for (let a = 0; a < paths.length; a++) {
				setTimeout(()=>{
					let temp = new orb(twoFace, ["lvl5/heart.png"], 8, 8, 4, 4);
					temp.oncollision((c, o, i)=>{
						if(o.type == "wall" || o.type == "room") c.destroy();
						else if(o.type == "player"){
							c.destroy();
							HP.change(-5);
						} else return i.old;
					});
					temp.moveTo(temp.x + paths[a][0],temp.y+paths[a][1], ()=>{});
					temp.setSpeed(10);
				}, 200);
			}	
			twoFace.addEffect("ExcitedTime", 0, 2000, ()=>{
				twoFace.changeSpeed(2);
				twoFace.addEffect("Excited", 1, 4000, false, ()=>{twoFace.changeSpeed(-2);});
			}, false);				
		},
		bored: ()=>{
			twoFace.clearAllEffects();
			currentFace = 4;
			twoFace.updateHP = (value)=>{
				twoFace.setHP(twoFace.hp + value*2);
			}
			twoFace.addEffect("BoredTime", 1, 2000, ()=>{
				twoFace.updateHP = (value)=>{
					twoFace.setHP(twoFace.hp + value);
				}
			}, false);			
		}
	}
	twoFace.oncollision((c,o,i)=>{return (o.type === "enemy") ? i.old : false;});		
	roomData[0][0].start(7*SCALE+(SCALE-MAINPLAYER.hit.offWidth)/2, 11*SCALE);				
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
			if (!payMana(1)) return;
			// Equal to scalings
			var temp = new orb(MAINPLAYER, ["orb.png"], 8, 8, 4, 4);
			temp.oncollision(dealDamage(LEVEL*2));
			temp.setSpeed(10);			
			temp.moveToMouse(mouse, ()=>{});
		}, false, false, 1000),
		"HP Potion (L)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			HP.change(HP.getMax());
			itemData.removeItem();
		}, false, false, 0),	
		"HP Potion (M)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			HP.change(HP.getMax()*0.5);
			itemData.removeItem();
		}, false, false, 0),	
		"HP Potion (S)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			HP.change(HP.getMax()*0.25);
			itemData.removeItem();
		}, false, false, 0),	
		"Mana Potion (L)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			MP.change(MP.getMax());
			itemData.removeItem();
		}, false, false, 0),		
		"Mana Potion (M)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			MP.change(MP.getMax()*0.5);
			itemData.removeItem();
		}, false, false, 0),
		"Mana Potion (S)": new item("randoRing.png", (mouse, playerData, itemData)=>{
			MP.change(MP.getMax()*0.25);
			itemData.removeItem();
		}, false, false, 0),
		"Pocket Watch": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if (!payMana(10)) return;
			var temp = Object.getOwnPropertySymbols(ENTITY);
			for (var i = 0; i < temp.length; i++) {
				if (ENTITY[temp[i]].type == "enemy") {
					let other = ENTITY[temp[i]];
					other.setSpeed(0);
					new effect(1, 5000, false, ()=>{other.setSpeed(2);})
				}
			}			
		}, false, 20000, 0),
		"Ring of Resolve": new item("randoRing.png", false, (itemData)=>{
			HP.changeMax(25);
			if (HP.getValue() == HP.getMax()) HP.change(25);
			MP.changeMax(-25);
			MP.verify();
			itemData.passiveoff = ()=>{
				MP.changeMax(25);
				HP.changeMax(-25);
				HP.verify();
				MP.verify();
				itemData.current = false;				
			}
		}, false, 0),
		"Bento Bomb": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if (itemData["counter"] == undefined) return;
			var temp = Object.getOwnPropertySymbols(ENTITY);
			for (var i = 0; i < temp.length; i++) {
				if (ENTITY[temp[i]].type == "enemy") ENTITY[temp[i]].updateHP(-10*itemData["counter"]);
			}			
			itemData.removeItem();
		}, false, false, 0),	
		"Upgrade Ring": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if (!payMana(25)) return;
			var maxHP = HP.getMax() + 0;
			HP.updateMax(maxHP + 25);
			HP.change(25);
			new effect(1, 5000, false, ()=>{
				HP.updateMax(HP.getMax()-25);
				HP.verify();
			});
		}, false, false, 0),
		"Combo Potion": new item("randoRing.png", (mouse, playerData, itemData)=>{
			HP.update(HP.getMax()*0.5);
			MP.update(MP.getMax()*0.5);			
			itemData.removeItem();
		}, false, false, 0),
		"Staff of Healing": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if (!payMana(10)) return;
			HP.change(LEVEL*2);
		}, false, 10000, 0),	
		"Ring of Magic": new item("randoRing.png", false, (itemData)=>{
			MP.changeMax(25);
			if (MP.getValue() == MP.getMax()) MP.change(25);
			HP.changeMax(-25);
			HP.verify();
			itemData.passiveoff = ()=>{
				HP.changeMax(25);
				MP.changeMax(-25);
				MP.verify();
				HP.verify();
				itemData.current = false;				
			}
		}, false, 0),			
		'Sanguine Ring': new item("randoRing.png", (mouse, playerData, itemData)=>{
			if (MP.getValue()<1 && HP.getValue() < 1) return;
			HP.change(-1);
			MP.change(-1);
			var temp = new entity(ENTITY, COLLISION, ["orb.png"], playerData.x+playerData.hit.offWidth/2-4, playerData.y+playerData.hit.offHeight/2-4, 8, 8, 4, 4);
			temp.oncollision((c, o, i)=>{
				if(o.type == "wall" || o.type == "room") c.destroy();
				else if(o.type == "enemy"){
					c.destroy();
					if (o.hp > 0) o.hp-=LEVEL*2;
					if (o.hp <= 0) {
						GOLD+=o.gold;
						HP.change(15);
						o.destroy();
					}
				} else return i.old;
			});
			temp.moveTo(mouse.x-4-canvas.x, mouse.y-4-canvas.y, ()=>{});
			temp.setSpeed(10);
		}, false, false, 500),	
		"Ring of Speed": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if (!payMana(10)) return;
			var currentSpeed = MAINPLAYER.getSpeed() + 0;
			var increasedSpeed = currentSpeed/2;
			MAINPLAYER.setSpeed(MAINPLAYER.getSpeed() + increasedSpeed);
			new effect(1, 10000, false, ()=>{
				MAINPLAYER.setSpeed(MAINPLAYER.getSpeed() - increasedSpeed);
			});
		}, false, 10000, 0),	
		"Ring of Invisibility": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if (!payMana(10)) return;
			var temp = Object.getOwnPropertySymbols(ENTITY);
			for (var i = 0; i < temp.length; i++) {
				if (ENTITY[temp[i]].type == "enemy") {
					let other = ENTITY[temp[i]];
					ENTITY[temp[i]].hitPlayer = false;
					new effect(1, 3000, false, ()=>{other.hitPlayer = true;})
				}
			}			
		}, false, 20000, 0),			
		"Staff of Tracking": new item("staff.png", (mouse, playerData, itemData)=>{
			var closest = null;
			var dist = Number.MAX_SAFE_INTEGER;
			var temp = Object.getOwnPropertySymbols(ENTITY);
			for (var i = 0; i < temp.length; i++) {
				if (ENTITY[temp[i]].type == "enemy") {
					var tot = entityDistance(MAINPLAYER, ENTITY[temp[i]]);
					if (tot < dist) {
						dist = tot;
						closest = ENTITY[temp[i]];
					}
				}
			}
			if(closest) {
				if (!payMana(3)) return;
				var temp = new orb(MAINPLAYER, ["orb.png"], 8, 8, 4, 4);
				temp.oncollision((c, o, i)=>{
					if(o.type == "wall" || o.type == "room") c.destroy();
					else if(o.type == "enemy"){
						c.destroy();
						if (o.hp > 0) o.hp-=LEVEL*3;
						if (o.hp <= 0) {
							GOLD+=o.gold;
							o.destroy();
						}
					} else return i.old;
				});
				var simpleTarget = (c)=>{
						if (c.x < closest.x) {
							c.moveX(c.x+c.speed);
						} else if (c.x > closest.x) c.moveX(c.x-c.speed);
						if (c.y < closest.y) {	
							c.moveY(c.y+c.speed);
						} else if (c.y > closest.y) c.moveY(c.y-c.speed);
				}
				temp.addAlgorithm(simpleTarget);
				temp.setSpeed(5);
			}						
		}, false, false, 1000),	
		'Staff of Beams': new item("staff.png", (mouse, playerData, itemData)=>{
			if (!payMana(3)) return;
			var orb = new orb(MAINPLAYER, ["orb.png"], 8, 8, 4, 4);
			orb.prop["enemy"] = [];
			orb.oncollision((c, o, i)=>{
				if(o.type == "wall" || o.type == "room") c.destroy();	

				if(o.type == "enemy"){
					for (var a = 0; a < orb.prop["enemy"].length; a++) {
						if (o.id == orb.prop["enemy"][a]) return i.old;
					}
					orb.prop["enemy"].push(o.id);
					if (o.hp > 0) o.hp-=LEVEL*3;
					if (o.hp <= 0) {
						GOLD+=o.gold;
						o.destroy();
					}
				}
				return i.old;
			});
			orb.moveToMouse(mouse, ()=>{});
			orb.setSpeed(10);
		}, false, false, 1000),	
		'Lightning Staff': new item("staff.png", (mouse, playerData, itemData)=>{
			if (!payMana(1)) return;
			var temp = new orb(MAINPLAYER, ["orb.png"], 8, 8, 4, 4);
			temp.oncollision(dealDamage(LEVEL*3));
			temp.moveToMouse(mouse, ()=>{});
			temp.setSpeed(10);
		}, false, false, 1000),		
		'Staff of Mud': new item("staff.png", (mouse, playerData, itemData)=>{
			if (!payMana(3)) return;
			var temp = new entity(ENTITY, COLLISION, ["orb.png"], 8, 8, 4, 4);
			temp.oncollision((c, o, i)=>{
				if(o.type == "wall" || o.type == "room") c.destroy();
				else if(o.type == "enemy"){
					c.destroy();
					if (o.hp > 0) {
						o.hp-=LEVEL*3;
						if (o.effects["slowness"] == undefined) {
							let speedChange = o.getSpeed()-1;
							o.setSpeed(speedChange);
							o.addEffect("slowness", 1, 1000, false, ()=>{o.setSpeed(o.getSpeed()+1);});
						}
					}
					if (o.hp <= 0) {
						GOLD+=o.gold;
						o.destroy();
					}
				} else return i.old;
			});
			temp.moveToMouse(mouse, ()=>{});
			temp.setSpeed(10);
		}, false, false, 1000),	
		"Ring of Regeneration": new item("randoRing.png", false, (itemData)=>{
			var temp = setInterval(()=>{HP.change(2); MP.change(4);}, 1000);
			itemData.passiveoff = ()=>{
				clearInterval(temp);
				itemData.current = false;				
			}
		}, false, 0),		
		"Scroll of Health": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if(!payMana(20)) return;
			HP.changeMax(100);
			itemData.removeItem();
		}, false, false, 0),		
		"Scroll of Speed": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if(!payMana(20)) return;			
			MAINPLAYER.setSpeed(MAINPLAYER.getSpeed()+2);
			itemData.removeItem();
		}, false, false, 0),
		"Scroll of Mana": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if(!payHP(20)) return;			
			MP.changeMax(100);
			itemData.removeItem();
		}, false, false, 0),	
		"Staff of Time": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if (!payMana(20)) return;
			var temp = Object.getOwnPropertySymbols(ENTITY);
			for (var i = 0; i < temp.length; i++) {
				if (ENTITY[temp[i]].type == "enemy") {
					if (ENTITY[temp[i]].effects["timeSlowing"] == undefined) {
						let other = ENTITY[temp[i]];
						other.changeSpeed(-2);
						other.addEffect("timeSlowing", 1, 10000, false, ()=>other.changeSpeed(2));
					}
				}
			}			
		}, false, 5000, 0),
		'Staff of Randomness': new item("staff.png", (mouse, playerData, itemData)=>{
			if (!payMana(5)) return;
			var temp = new orb(MAINPLAYER, ["orb.png"], 8, 8, 4, 4);
			temp.oncollision((c, o, i)=>{
				if(o.type == "wall" || o.type == "room") c.destroy();
				else if(o.type == "enemy"){
					c.destroy();
					if (o.hp > 0) o.hp-=rand(LEVEL, LEVEL*5);
					if (o.hp <= 0) {
						GOLD+=o.gold;
						o.destroy();
					}
				} else return i.old;
			});
			temp.moveToMouse(mouse, ()=>{});
			temp.setSpeed(10);
		}, false, false, 1000),	
		'Staff of Flames': new item("staff.png", (mouse, playerData, itemData)=>{
			if (!payMana(7)) return;
			var temp = new orb(MAINPLAYER, ["orb.png"], 8, 8, 4, 4);
			temp.oncollision((c, o, i)=>{
				if(o.type == "wall" || o.type == "room") c.destroy();
				else if(o.type == "enemy"){
					c.destroy();
					if (o.hp > 0) {
						o.hp-=LEVEL*3;
						o.clearEffect("burning");
						o.addEffect("burning", 5, 5000, ()=>{
							o.hp-=LEVEL; 
							if (o.hp <= 0) {
								GOLD+=o.gold;
								o.destroy();
							}
						}, false);
					}
					if (o.hp <= 0) {
						GOLD+=o.gold;
						o.destroy();
					}
				} else return i.old;
			});
			temp.moveToMouse(mouse, ()=>{});
			temp.setSpeed(10);
		}, false, false, 1000),
		"Ring of Bravery": new item("randoRing.png", (mouse, playerData, itemData)=>{
			if (!payMana(20)) return;
			var other = HP.getValue() + 0;	
			if (MAINPLAYER.includesEffect("Bravery")) return;
			HP.changeMax(other);
			HP.change(other);
			MAINPLAYER.addEffect("Bravery", 1, 10000, false, ()=>{HP.changeMax(-other); HP.verify();});	
		}, false, 20000, 0),
		"Staff of Corruption": new item("randoRing.png", (mouse, playerData, itemData)=>{
			// WIP
			if (!payMana(20)) return;
			var temp = Object.getOwnPropertySymbols(ENTITY);
			for (var i = 0; i < temp.length; i++) {
				if (ENTITY[temp[i]].type == "enemy") {
					if (ENTITY[temp[i]].effects["timeSlowing"] == undefined) {
						let other = ENTITY[temp[i]];
						other.changeSpeed(-2);
						other.addEffect("timeSlowing", 1, 10000, false, ()=>other.changeSpeed(2));
					}
				}
			}			
		}, false, 5000, 0),				
		'Staff of Dashing': new item("staff.png", (mouse, playerData, itemData)=>{
			if (!payMana(10)) return;
			var x = mouse.x-4-canvas.x;
			var y = mouse.y-4-canvas.y;
			var dist = distance(x, y, MAINPLAYER.x, MAINPLAYER.y);
			if (dist > 2*SCALE) {

			}
			MAINPLAYER.setSpeed(20);
			MAINPLAYER.moveTo(x, y, (reach, xNew, yNew)=>{
				reach.moveY(xNew);
				reach.moveX(yNew);
				reach.stopMoving();
				MAINPLAYER.setSpeed(4);
			});
			//temp.moveTo(mouse.x-4-canvas.x, mouse.y-4-canvas.y, ()=>{});
			//temp.setSpeed(10);
		}, false, 2000, 0),								
	}
	ALLITEMS = temp;
}

function payMana(num){
	if (MP.getValue()<num) return false;
	MP.change(-1*num);
	return true;
}

function payHP(num){
	if (HP.getValue()<num) return false;
	HP.change(-1*num);
	return true;
}