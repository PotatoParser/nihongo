async function loadImages(arrImages){
	var temp = {};
	for (var i = 0; i < arrImages.length; i++) {
		var other = new Image();
		other.src = arrImages[i];
		other.draggable = false;
		await new Promise((resolve)=>{
			other.onload = ()=>{
				resolve();
			}
		});
		temp[arrImages[i]] = other;
	}
	return temp;
}
async function globalLoad(){
	for (var i = 0; i < arguments.length; i++) {
		if (IMAGES[arguments[i]] != undefined) continue;
		var other = new Image();
		other.src = arguments[i];
		other.draggable = false;
		await new Promise((resolve)=>{
			other.onload = ()=>{
				resolve();
			}
		});
		IMAGES[arguments[i]] = other;
	}
}
function entityDistance(firstEntity, secondEntity) {
	return distance(firstEntity.x, firstEntity.y, secondEntity.x, secondEntity.y);
}
class wall {
	constructor(x, y, distance, direction, OBJ){
		this.x = x;
		this.y = y;
		this.distance = distance;
		if (direction === 'x') {
			this.check = (x, dist, y1, y2, onImpact)=>{
				var bounds = [this.x, this.x+this.distance];
				if (!((bounds[0] < x || bounds[0] < x+dist) && (x < bounds[1] || x+dist < bounds[1]))) return {y:y2, impact: false, old: y2};
				if (y1>y2) {
					if (y1 >= this.y && this.y > y2) return {y:this.y, impact:OBJ, old:y2};
				} else {
					if (y2 >= this.y && this.y > y1) return {y:this.y, impact:OBJ, old:y2};
				}
				if (isNaN(y2)) {
					console.log(x, dist, y1, y2, "TWO");
					debugger;
				}
				return {y:y2, impact: false, old:y2};

			};
		} else if (direction === 'y') {
			this.check = (y, dist, x1, x2, onImpact)=>{
				//console.log(y,x1,x2);
				var bounds = [this.y, this.y+this.distance];
				if (!((bounds[0] < y || bounds[0] <y+dist) && (y < bounds[1] || y+dist < bounds[0]))) return {x:x2, impact: false, old:x2};
				if (x1>x2) {
					if (x1 >= this.x && this.x > x2) return {x:this.x, impact:OBJ, old:x2}; // limit
				}
				else {
					if(x2 >= this.x && this.x > x1) return {x:this.x, impact:OBJ, old:x2};
				}

				return {x:x2, impact: false, old:x2};
			};	
		}
	}
}			
class layer {
	constructor(x, y, width, height, image, index){
		this.element = document.createElement("CANVAS");
		//this.img = image || null;
		this.img = image || null;
		if (this.img) this.img = IMAGES[image].cloneNode();
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 100;
		this.height = height || 100;
		//this.show();				
		this.ctx = this.element.getContext("2d");
		this.index = index || 0;
		this.setPosition();
		this.setDimension();
		this.reload();				
	}
	reload(){
		if (this.img != null) {
			this.ctx.drawImage(this.img, 0, 0, this.width, this.height);
		}
	}
	setPosition(x, y){
		this.element.style.position = "fixed";
		this.element.style.left = `${x || this.x}px`;
		this.element.style.top = `${y || this.y}px`;
		this.element.style["z-index"] = this.index;
	}
	setDimension(width, height) {
		this.element.width = width || this.width;
		this.element.height = height || this.height;
	}
	hide(){
		this.element.remove();				
	}
	show(){
		console.log("RUN");
		document.body.appendChild(this.element);
	}
}
class key{
	constructor(keyCode, whenDown, whenUp, speed){
		this.mainKey = keyCode;
		this.keyDown = false;
		this.whenDown = (e)=>{
			//.stopImmediatePropagation();
			if (e.code != this.mainKey) return;
			if (!this.keyDown) {
				this.keyDown = true;
				whenDown();
				if (speed != 0) this.keyDown = setInterval(whenDown, speed);
			}
		};
		this.whenUp = (e)=>{
			if (e.code != this.mainKey) return;					
			if (this.keyDown) {
				whenUp();
				if (speed != 0) clearInterval(this.keyDown);
				this.keyDown = false;
			}
		};
		document.addEventListener("keydown", this.whenDown);
		document.addEventListener("keyup", this.whenUp);
	}
	destroy(){
		if (this.keyDown) clearInterval(this.keyDown);
		document.removeEventListener("keydown", this.whenDown);
		document.removeEventListener("keyup", this.whenUp);
		delete this;
	}
}
function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}		
function ERR(actual, calc){
	if (Math.round(actual) == Math.round(calc)) console.log("PERFECT");
	else console.log(Math.round((actual-calc)/calc*100) + "%");
}
class entity{
	constructor(entity, collision, image, x, y, hitWidth, hitHeight, offsetX, offsetY, width, height){
		//this.img = image;
		this.img = image;
		if (this.img) {
			this.img = [];
			for (var i = 0; i < image.length; i++) {
				this.img.push(IMAGES[image[i]].cloneNode());	
			}
		}
		this.x = x || 0;
		this.y = y || 0;
		this.height = height || this.img[0].height;
		this.width = width || this.img[0].width;			
		this.index = 0;
		this.speed = 1;
		this.moveToLoop = false;
		this.id = Symbol();
		this.prop = {};
		this.hit = {
			offX: offsetX || 0,
			offY: offsetY || 0,
			offWidth: (hitWidth || this.width),
			offHeight: (hitHeight || this.height),
		}
		this.collisionEvent = [];
		this.colArea = {
			x: [],
			y: []
		}
		if (entity) this.ENTITY = entity;
		if (collision) this.COLLISION = collision;
		this.still = false;
		if (entity) this.ENTITY[this.id] = this;
		this.alg = [];	
		this.movehit = false;
		this.hp = 0;
		this.type = null;
		this.storedItems = [];
		this.effects = {};
		this.onx = false;
		this.ony = false;
		this.status = "alive";
	}
	draw(ctx){
		//console.log(this.img, this, JSON.parse(JSON.stringify(IMAGES)));
		if (!this.still) ctx.drawImage(this.img[this.index], this.x-this.hit.offX, this.y-this.hit.offY, this.width, this.height);
	}
	tp(x,y){
		if (x) this.x = x;
		if (y) this.y = y;
		if (this.movehit) this.hitbox();
	}
	moveX(newX){
		if (!this.alive()) return;
		if (this.onx) this.onx(this, newX);
		if (newX < this.x) this.x = this.checkAllX(this.y, this.hit.offHeight, this.x, newX);
		else this.x = this.checkAllX(this.y, this.hit.offHeight, this.x, newX+this.hit.offWidth)-this.hit.offWidth;	
		if (this.movehit) this.hitbox();			
	}			
	moveY(newY){
		if (!this.alive()) return;		
		if (this.ony) this.ony(this, newY);
		if (isNaN(newY)) {
			console.log(newY, "ZERO1");
			debugger;
		}	
		if (newY < this.y) this.y = this.checkAllY(this.x, this.hit.offWidth, this.y, newY);
		else this.y = this.checkAllY(this.x, this.hit.offWidth, this.y, newY+this.hit.offHeight)-this.hit.offHeight;
		if (this.movehit) this.hitbox();			
	}			
	moveTo(x, y, reach){
		//One pixel every frame
		this.stopMoving();
		var rise = y-this.y, run = x-this.x, dist = distance(x,y,this.x,this.y), xPos = 1, yPos = 1;
		if (dist == 0) return;
		if (rise < 0) yPos = -1;
		if (run < 0) xPos = -1;
		this.moveToLoop = true;
		this.moveToLoop = setInterval(()=>{
			var tempY = this.y + rise/dist*this.speed;
			var tempX = this.x + run/dist*this.speed;
			if ((tempX-x)*xPos >= 0 && (tempY-y)*yPos >= 0){ // -x means that tempY is negative 
				if (!reach) {
					this.moveY(y);
					this.moveX(x);
					this.stopMoving();	
					return;
				} else reach(this,x,y);
			}
			if (isNaN(tempY)) {
				console.log(this.y, rise, dist, this.speed, tempY, "ZERO2");
				debugger;
			}						
			this.moveY(tempY);
			this.moveX(tempX);
		}, 1000/60);
	}
	moveToMouse(mouse, reach){
		var x = mouse.x-canvas.x-this.hit.offWidth/2;
		var y = mouse.y-canvas.y-this.hit.offHeight/2;
		this.moveTo(x, y,reach);
	}
	stopMoving(){
		// Not currently rounding!!!!
		if (this.moveToLoop) {
			clearInterval(this.moveToLoop);
			this.moveToLoop = false;
		}
	}
	oncollision(func){
		this.collisionEvent.push(func);
	}
	checkAllY(x, dist, y1, y2){
		var temp2 = y2+0;
		if (isNaN(temp2)) {
			console.log(x, dist, y1, y2, "ZERO");
			debugger;
		}	
		var allEnt = Object.getOwnPropertySymbols(this.COLLISION);
		for (var b = 0; b < allEnt.length; b++) {
			if (allEnt[b] == this.id) continue;		
			for (var i = 0; i < this.ENTITY[allEnt[b]].colArea.y.length; i++) {
				if (isNaN(temp2)) {
					console.log(x, dist, y1, y2, "ONE");
					debugger;
				}								
				var temp = this.ENTITY[allEnt[b]].colArea.y[i].check(x, dist, y1, temp2);
				if (temp.impact) {
					for (var a = 0; a < this.collisionEvent.length; a++) {
						//console.log(x, y1, y2, temp);
						var atImpact = this.collisionEvent[a](this, temp.impact, temp);
						if (atImpact) {
							return atImpact;
						}
					}
				}
				temp2 = temp.y;
				if (isNaN(temp2)) {
					console.log(x, dist, y1, y2, temp, "THREE");
					debugger;
				}						
			}
		}
		return temp2;
	}
	checkAllX(y, dist, x1, x2){
		var allEnt = Object.getOwnPropertySymbols(this.COLLISION);
		for (var b = 0; b < allEnt.length; b++) {
			if (allEnt[b] == this.id) continue;	
			for (var i = 0; i < this.ENTITY[allEnt[b]].colArea.x.length; i++) {
				var temp = this.ENTITY[allEnt[b]].colArea.x[i].check(y, dist, x1, x2);
				if (temp.impact) {
					for (var a = 0; a < this.collisionEvent.length; a++) {
						//console.log(temp);
						var atImpact = this.collisionEvent[a](this, temp.impact, temp);
						if (atImpact) {
							return atImpact;
						}
					}
				}		
				x2 = temp.x;
			}
		}
		return x2;
	}		
	destroy(){
		if (this.moveToLoop) clearInterval(this.moveToLoop);
		delete this.ENTITY[this.id];
		delete this.COLLISION[this.id];	
		this.clearAllEffects();
		this.status = "dead";
		delete this;
	}
	alive(){
		return this.status === "alive";
	}
	addCollision(x, y, distance, direction){
		this.COLLISION[this.id] = this;
		var exists = false;
		switch(direction) {
			case "y": 
				for (var i = 0; i < this.colArea.x.length; i++) 
					if (this.colArea.x[i].x == x && this.colArea.x[i].y == y && this.colArea.x[i].distance == distance) 
						exists = true;
				this.colArea.x.push(new wall(x, y, distance, direction, this)); 
				break;
			case "x": 
				for (var i = 0; i < this.colArea.y.length; i++) 
					if (this.colArea.y[i].x == x && this.colArea.y[i].y == y && this.colArea.y[i].distance == distance) 
						exists = true;
				if (!exists) this.colArea.y.push(new wall(x, y, distance, direction, this)); 
				break;
			default: break;
		}
	}
	hitbox(xOffset, yOffset, widthT, heightT){
		if (xOffset === true) this.movehit = true;
		this.colArea.x = [];
		this.colArea.y = [];
		//var tempX = this.hit.offX || (this.x+(xOffset || 0));
		//var tempY = this.hit.offY || (this.y+(yOffset || 0));
		var tempX = (typeof xOffset == 'number') ? this.x+xOffset : this.x;
		var tempY = (typeof yOffset == 'number') ? this.y+yOffset : this.y;
		//var tempY = this.hit.offY || (this.y+(yOffset || 0));				
		var tempWidth = (typeof widthT == 'number') ? widthT : this.hit.offWidth;
		var tempHeight = (typeof heightT == 'number') ? heightT : this.hit.offHeight;
		//console.log(tempX, tempY, tempWidth, tempHeight);
		this.addCollision(tempX, tempY, tempWidth, "x");
		this.addCollision(tempX, tempY, tempHeight, "y");
		this.addCollision(tempX, tempY+tempHeight, tempWidth, "x");
		this.addCollision(tempX+tempWidth, tempY, tempHeight, "y");
	}
	addAlgorithm(newAlg){
		this.alg.push(newAlg);
	}
	algorithm(){
		for (var i = 0; i < this.alg.length; i++) {
			this.alg[i](this);
		}
	}
	setSpeed(value){
		this.speed = value/48*SCALE;
	}
	changeSpeed(value) {
		this.setSpeed(this.getSpeed() + value);
	}
	getSpeed(){
		return this.speed/SCALE*48;
	}
	updateHP(value){
		this.setHP(this.hp + value);
	}
	setHP(value){
		this.hp = value;
		if (this.hp < 0 && typeof this.death == 'function') {
			console.log("DEATH");
			this.death();
		}
	}
	storeItem(item) {
		this.storedItems.push(item);
	}
	addEffect(name, repetition, totalDuration, effectDuring, effectAfter, effectBefore){
		if(this.effects[name] == undefined) this.effects[name] = new effect(repetition, totalDuration, effectDuring, ()=>{
			if (effectAfter) effectAfter(); 
			this.effectClean(name);
		}, effectBefore);
	}
	clearEffect(name) {
		if(this.effects[name] == undefined) return;
		clearInterval(this.effects[name].timer);
		this.effects[name].after();
		delete this.effects[name];
	}
	effectClean(name){
		if(this.effects[name] == undefined) return;
		delete this.effects[name];		
	}
	clearAllEffects(){
		for (var key in this.effects) this.clearEffect(key);		
	}
	includesEffect(name) {
		return this.effects[name] != undefined;
	}
	centerX(){
		return this.x+this.hit.offWidth/2;
	}
	centerY(){
		return this.y+this.hit.offHeight/2;
	}
}	
class collisionEntity extends entity{
	constructor(entity, collision, boxX, boxY, boxHeight, boxWidth){
		super(entity, collision, null, 0, 0, 0, 0, 0, 0, 1, 1);
		this.still = true;
		this.speed = 0;
		this.img = null;
	}
}
class enemy extends entity{
	constructor(entity, collision, image, x, y, hitWidth, hitHeight, offsetX, offsetY, width, height){
		super(entity, collision, image, x, y, hitWidth, hitHeight, offsetX, offsetY, width, height);
		this.type = "enemy";
		this.gold = 1;
		this.hitPlayer = true;
		this.onhitdamage = 1;
		this.damageeffect = ()=>{};
		this.damagetime = 1000;
		this.oncollision((c,o,i)=>{return (o.type === "enemy") ? i.old : false;});
	}
	death(){
		GOLD+=this.gold;
		this.destroy();
		this.addEffect = ()=>{};
		this.status = "dead";				
	}
	damage(){
		if (!this.prop["damage"]) {
			this.prop["damage"] = true;		
			HP.change(-this.onhitdamage);
			this.damageeffect();
			setTimeout(()=>{this.prop["damage"] = false}, this.damagetime);			
		}
	}
}
class boss extends entity{
	constructor(entity, collision, image, x, y, hitWidth, hitHeight, offsetX, offsetY, width, height){
		super(entity, collision, image, x, y, hitWidth, hitHeight, offsetX, offsetY, width, height);
		this.type = "boss";
		this.gold = 20;
		this.hitPlayer = true;
	}
	death(){
		GOLD+=this.gold;
		this.destroy();
		this.addEffect = ()=>{};		
	}	
}
// offset of 8, hitHeight of 
class player extends entity{
	constructor(entity, collision, image, x, y, hitWidth, hitHeight, offsetX, offsetY, width, height){
		super(false, false, image, x, y, hitWidth, hitHeight, offsetX, offsetY, width, height);
		this.movement = [];
		this.controls = {};
		this.mouseControls = {};
		this.entity = ENTITY;
		this.collision = COLLISION;
		this.type = "player";
	}
	onmove(keyCode, reversed, type ,imageIndex, whenDown, whenUp) {
		if (typeof whenUp !== 'function') whenUp = ()=>{};
		if (typeof whenDown !== 'function') whenDown = ()=>{};					
		//whenDown = whenDown || ()=>{};
		this.controls[keyCode] = new key(keyCode, ()=>{
			if (type === "x") this.moveX(this.x+reversed*this.speed);
			else if(type === "y") this.moveY(this.y+reversed*this.speed);
			if (!(imageIndex === null)) this.index = imageIndex;
			this.move(keyCode);					
			whenDown();
		}, ()=>{
			this.stop(keyCode);
			whenUp();
		}, 1000/60);				
	}
	move(key){
		var temp = this.movement.indexOf(key);
		if (temp == -1) this.movement.push(key);
	}
	stop(key) {
		var temp = this.movement.indexOf(key);
		if (temp == -1) return false;				
		this.movement.splice(temp, 1);
	}
	moving(){
		return this.movement.length != 0;
	}	
	onCursorMove(label, func){
		this.mouseControls[label] = new cursorMove(func, this);
	}
	onCursorClick(label, button, repetition, whenDown, whenUp){
		this.mouseControls[label] = new cursorClick(button, repetition, whenDown, whenUp, this);
	}
	clean(){
		for (var key in this.controls) {
			this.controls[key].destroy();
		}
		for (var key in this.mouseControls) {
			this.mouseControls[key].destroy();
		}
		this.destroy();
	}
	checkAllY(x, dist, y1, y2){
		var allEnt = Object.getOwnPropertySymbols(COLLISION);
		for (var b = 0; b < allEnt.length; b++) {
			if (allEnt[b] == this.id) continue;		
			for (var i = 0; i < ENTITY[allEnt[b]].colArea.y.length; i++) {
				var temp = ENTITY[allEnt[b]].colArea.y[i].check(x, dist, y1, y2);
				if (temp.impact) {
					for (var a = 0; a < this.collisionEvent.length; a++) {
						//console.log(x, y1, y2, temp);
						var atImpact = this.collisionEvent[a](this, temp.impact, temp);
						if (atImpact) return atImpact;
					}
				}
				y2 = temp.y;
			}
		}
		return y2;
	}
	checkAllX(y, dist, x1, x2){
		var allEnt = Object.getOwnPropertySymbols(COLLISION);
		for (var b = 0; b < allEnt.length; b++) {
			if (allEnt[b] == this.id) continue;	
			for (var i = 0; i < ENTITY[allEnt[b]].colArea.x.length; i++) {
				var temp = ENTITY[allEnt[b]].colArea.x[i].check(y, dist, x1, x2);
				if (temp.impact) {
					for (var a = 0; a < this.collisionEvent.length; a++) {
						//console.log("temp");
						var atImpact = this.collisionEvent[a](this, temp.impact, temp);
						if (atImpact) return atImpact;
					}
				}		
				x2 = temp.x;
			}
		}
		return x2;
	}		
	destroy(){
		if (this.moveToLoop) clearInterval(this.moveToLoop);
		delete ENTITY[this.id];
		delete COLLISION[this.id];				
		delete this;
	}
	addCollision(x, y, distance, direction){
		COLLISION[this.id] = this;
		var exists = false;
		switch(direction) {
			case "y": 
				for (var i = 0; i < this.colArea.x.length; i++) 
					if (this.colArea.x[i].x == x && this.colArea.x[i].y == y && this.colArea.x[i].distance == distance) 
						exists = true;
				this.colArea.x.push(new wall(x, y, distance, direction, this)); 
				break;
			case "x": 
				for (var i = 0; i < this.colArea.y.length; i++) 
					if (this.colArea.y[i].x == x && this.colArea.y[i].y == y && this.colArea.y[i].distance == distance) 
						exists = true;
				if (!exists) this.colArea.y.push(new wall(x, y, distance, direction, this)); 
				break;
			default: break;
		}
	}
}
class cursorMove{
	constructor(func, objectRef) {
		this.mousePos = {
			x: 0,
			y: 0
		};
		this.exe = ()=>{func(this.mousePos, objectRef);};
		document.addEventListener("mousemove", (e)=>{
			this.mousePos.x = e.clientX;
			this.mousePos.y = e.clientY;
			this.exe();
		});
	}
}
class cursor {
	constructor(whenDown, whenMove, whenUp, allProp){
		for (var key in allProp) {
			this[key] = allProp[key];
		}
		this.ondown = false;
		this.onmove = false;
		this.onup = false;
		if (typeof whenDown === 'function') this.ondown = (e)=>whenDown(e,this);
		if (typeof whenMove === 'function') this.onmove = (e)=>whenMove(e,this);	
		if (typeof whenUp === 'function') this.onup = (e)=>whenUp(e,this);					
	}
	load(){
		this.ondown ? document.addEventListener("mousedown", this.ondown) : null;
		this.onmove ? document.addEventListener("mousemove", this.onmove) : null;				
		this.onup ? document.addEventListener("mouseup", this.onup) : null;
	}
	destroy(){
		this.ondown ? document.removeEventListener("mousedown", this.ondown) : null;
		this.onmove ? document.removeEventListener("mousemove", this.onmove) : null;				
		this.onup ? document.removeEventListener("mouseup", this.onup): null;				
		delete this;
	}
}
class cursorClick extends cursor{
	constructor(button, repetition, whenDown, whenUp, objectRef) {
		if (typeof whenUp !== 'function') whenUp = ()=>{};
		if (typeof whenDown !== 'function') whenDown = ()=>{};				
		switch(button) {
			case "left": button = 0; break;
			case "right": button = 2; break;
			default: break;
		}
		super();
		this.button = button;
		this.time = repetition;
		this.clicking = false;
		this.mouse = {
			x: 0,
			y: 0,
		}
		this.ondown = (e, targetObj)=>{
			if (e.button !== this.button) return;
			this.mouse.x = e.clientX;
			this.mouse.y = e.clientY;
			if (!this.clicking) {
				this.clicking = true;
				whenDown(this.mouse, objectRef);
				if (repetition !== 0) this.clicking = setInterval(()=>whenDown(this.mouse, objectRef), repetition);
			}
		};
		this.onmove = (e)=>{
			this.mouse.x = e.clientX;
			this.mouse.y = e.clientY;
		};
		this.onup = (e, targetObj)=>{
			if (e.button !== this.button) return;
			this.mouse.x = e.clientX;
			this.mouse.y = e.clientY;										
			if (this.clicking) {
				whenUp(this.mouse, objectRef);
				if (repetition !== 0) clearInterval(this.clicking);
				this.clicking = false;
			}
		};
		this.load();
	}
}
class inventory {
	constructor(x, y, width, squareWidth){
		this.items = [[null, null, null, null],
					  [null, null, null, null],
					  [null, null, null, null],
					  [null, null, null, null],
					  [null, null, null, null]];
		this.width = width;
		this.inv = document.createElement("DIV");
		this.inv.classList.add("inventory");
		mfpp.position(this.inv, x, y, this.width, this.width);
		document.body.appendChild(this.inv);
		var remainder = (width - squareWidth*4)/5;
		var id = 0;
		for (var i = 0; i < 4; i++) {
			for (var j = 0; j < 4; j++) {
				id++;
				this.items[i][j] = {
					element: this.genInv(j*squareWidth+(j+1)*remainder-2, i*squareWidth+(i+1)*remainder-2, squareWidth, id),
					item: null,
				};
				this.inv.appendChild(this.items[i][j].element);
			}
		}
		var selector = document.createElement("DIV");
		selector.classList.add("selector");
		mfpp.position(selector, x, y, this.width, 2*remainder-8/48*SCALE + squareWidth);	
		document.body.appendChild(selector);			
		this.target = false;
		this.hover = false;
		//button, repetition, whenDown, whenUp, objectRef
		this.cursor = {
			press: new cursor((e, i)=>{
			}, (e, i)=>{
				if (!this.target) return;
				if (this.getSlot(this.target).item == null) return;
				console.log(this.getSlot(this.target));
				var image = this.getSlot(this.target).item.img;
				i.x = e.clientX-32; i.y = e.clientY-32;
				image.style.position = "fixed";
				image.style.top = i.y + "px";
				image.style.left = i.x + "px";
			}, (e, i)=>{
				console.log(this.target, this.hover);
				if (!this.target) return;
				if (this.hover) return;
				if (this.getSlot(this.target).item == null) return;	
				console.log("UP");	
				var image = this.getSlot(this.target).item.img;
				image.style.top = "initial";
				image.style.left = "initial";
				image.style.position = "absolute";
				this.target = false;											
			}, {
				x: null, 
				y: null
			})
		}
		this.cursor.press.load();
		console.log(this.cursor.press);
		for (var i = 1; i <= 4; i++) {
			this.createKey(i);
			//keyCode, whenDown, whenUp, speed
		}
		this.current = 1;
		this.getSlot(1).element.style.borderColor = "red";
		this.setCurrent(1);
	}
	createKey(index){
		return new key("Digit" + index, ()=>{this.setCurrent(index);}, ()=>{console.log("NO");}, 0);
	}
	genInv(x,y,width,id){
		var temp = document.createElement("DIV");
		temp.classList.add("slot");
		temp.id = id;
		temp.style.width = width + "px";
		temp.style.height = width + "px";
		temp.style.top = y + "px";
		temp.style.left = x + "px";
		temp.addEventListener("mousedown", ()=>{
			if (this.getSlot(id).item === null) return;
			if (!this.target) this.target = id;
			console.log(id);
		});
		/*temp.addEventListener("mouseover", ()=>{
			this.hover = id;
		});*/
		temp.addEventListener("mouseup", ()=>{
			this.hover = id;
			if (!this.target) return;
			if (this.getSlot(this.target).item == null) {
				this.target = false;
				this.hover = false;
				return;	
			}
			console.log("UP");	
			console.log((this.getSlot(this.target)).item);
			var firstItem = (this.getSlot(this.target)).item;
			var image = (this.getSlot(this.target)).item.img;
			image.style.top = "initial";
			image.style.left = "initial";
			image.style.position = "absolute";
			if (this.hover && this.hover !== this.target) {
				var switcher = null;
				if (this.getSlot(this.hover).item !== null) {
					switcher = this.getSlot(this.hover).item;
					switcher.img.remove();	
					this.getSlot(this.target).element.appendChild(switcher.img);
				}
				image.remove();
				this.getSlot(this.hover).element.appendChild(image);
				if (switcher) {
					this.setItem(this.hover, firstItem);
					this.setItem(this.target, switcher);
					//this.getSlot(this.hover).item = firstItem;
					//this.getSlot(this.target).item = switcher;
				} else {
					this.setItem(this.hover, firstItem);
					//this.getSlot(this.hover).item = firstItem;
					this.getSlot(this.target).item = null;
				}
			}	
			this.target = false;	
			this.hover = false;
		});
		return temp;				
	}
	getSelected(){
		return [this.items[0], this.items[1], this.items[2], this.items[3]];
	}
	getSlot(index) {
		var row = Math.floor((index-1)/4);
		return this.items[row][(index-1)%4];
	}
	setItem(slot, item) {
		this.getSlot(slot).item = item;
		item.slot = this;
		item.slotNum = slot;
		item.passiveon();
		this.getSlot(slot).element.appendChild(item.img);
	}
	addItem(item) {
		for (var i = 1; i <= 16; i++) {
			if(this.getSlot(i).item === null) {
				this.setItem(i, item);
				return;
			}
		}
	}
	removeItem(slot){
		var temp = this.getSlot(slot);
		if (temp.item === null) return;
		temp.item.deactivate();
		temp.item.img.remove();
		temp.item = null;
	}
	setCurrent(slot) {
		if (slot === this.current) return;
		this.getSlot(this.current).element.style.borderColor = "white";
		this.getSlot(slot).element.style.borderColor = "red";
		this.deactivate();
		this.current = slot;
	}
	activate(mouse, entityData) {
		var temp = this.getSlot(this.current).item;
		if (temp == null) return;
		if (typeof temp.active == "function") temp.active(mouse, entityData);
	}
	deactivate(mouse, entityData) {
		var temp = this.getSlot(this.current).item;
		if (temp == null) return;
		if (typeof temp.active == "function") {
			temp.deactivate();
		}			
	}
}
class statusBar {
	constructor(x, y, width, height, defaultColor, currentValue, maxValue){
		this.prop = {
			x: x,
			y: y,
			width: width,
			height: height
		}
		this.element = document.createElement("DIV");
		this.element.classList.add("status");
		mfpp.position(this.element, this.prop);
		this.element.style.backgroundColor = defaultColor;
		document.body.appendChild(this.element);
		this.data = document.createElement("DIV");
		this.element.classList.add("statusText");
		mfpp.position(this.data, 0, 0, this.prop.width, this.prop.height);
		this.currentValue = currentValue;
		this.maxValue = maxValue;
		this.data.innerHTML = `${this.currentValue}/${this.maxValue}`;
		this.element.appendChild(this.data);
	}
	update(value){
		this.currentValue = Math.max(0, value);				
		var percent = Math.min(value/this.maxValue, 1);
		this.element.style.width = this.prop.width*percent + "px";
		this.data.innerHTML = `${this.currentValue}/${this.maxValue}`;				
	}
	updateMax(value){
		this.maxValue = value;
		var percent = Math.min(this.currentValue/value, 1);
		this.element.style.width = this.prop.width*percent + "px";				
		this.data.innerHTML = `${this.currentValue}/${this.maxValue}`;
	}
	change(value){
		this.currentValue += value;
		this.currentValue = Math.min(this.currentValue, this.maxValue);
		this.update(this.currentValue);
	}
	changeMax(value){
		this.maxValue += value;
		this.updateMax(this.maxValue);
	}
	getValue(){
		return this.currentValue;
	}
	getMax(){
		return this.maxValue;
	}
	verify(){
		this.change(0);
	}
	restore() {
		this.currentValue = this.maxValue;
		this.update(this.currentValue);
	}
}
class item {
	constructor(image, active, passive, cooldown, repetition, properties){
		//this.img = image;
		this.quantity = 1;
		this.img = IMAGES[image].cloneNode();
		this.active = false;
		if (typeof passive == 'function') this.passive = passive;
		else this.passive = ()=>{};
		this.current = false;
		this.on = false;
		this.oncooldown = false;
		this.cooldown = cooldown;			
		this.currentCool = false;
		if (typeof active == 'function') this.active = (mouse, entityData)=>{
			this.on = true;
			if (!this.oncooldown) {
				active(mouse, entityData, this);
				if (this.cooldown) {
					this.oncooldown = true;
					this.currentCool = setTimeout(()=>{
						this.oncooldown = false;
					}, this.cooldown);
				}
			}
			if (repetition !== 0) {
				this.on = setInterval(()=>{
					if (!this.oncooldown) {
						active(mouse, entityData, this);
						if (this.cooldown) {
							this.oncooldown = true;
							this.currentCool = setTimeout(()=>{this.oncooldown = false;}, this.cooldown);
						}
					}
				}, repetition);
			}
		};
		this.img.classList.add("item");
		for (var key in properties) {
			this[key] = properties[key];
		}
		this.slot = 0;			
		this.slotNum = 0;
	}
	deactivate(){
		if (this.on) {
			clearInterval(this.on);
			this.on = false;
		}
	}
	passiveon(){
		if (this.slotNum > 4) return this.passiveoff();		
		if (this.current) return;
		this.current = true;
		this.passive(this); // Passes the item into it
	}
	passiveoff(){
		this.current = false;
	}
	removeItem(){
		this.slot.removeItem(this.slotNum);
	}
}
class effect {
	constructor(repetition, totalDuration, effectDuring, effectAfter, effectBefore){
		this.reps = repetition;
		this.counter = 0;
		if (this.reps !== 0) this.interval = totalDuration/this.reps;
		else this.interval = totalDuration;
		this.during = effectDuring;
		if (typeof this.during != 'function') this.during = ()=>{};
		this.after = effectAfter;
		if (typeof this.after != 'function') this.after = ()=>{};
		this.before = effectBefore;
		if (typeof this.before != 'function') this.before = ()=>{};
		this.before();		
		this.timer = setInterval(()=>{
			this.counter++;
			this.during();
			if (this.counter >= this.reps && this.reps !== 0) {
				clearInterval(this.timer);
				this.after();
			}
		}, this.interval);
	}
}

class orb extends entity {
	constructor(reference, image, hitWidth, hitHeight, offsetX, offsetY, width, height){
		super(ENTITY, COLLISION, image, 0, 0, hitWidth, hitHeight, offsetX, offsetY, width, height);
		this.x = reference.x+reference.hit.offWidth/2-this.hit.offWidth/2;
		this.y = reference.y+reference.hit.offHeight/2-this.hit.offHeight/2;		
		this.onhitdamage = 1;
		this.damageeffect = ()=>{};
		this.damagetime = 1000;
	}
	death(){
		this.destroy();
		this.addEffect = ()=>{};
		this.status = "dead";				
	}
	damage(){
		if (!this.prop["damage"]) {
			this.prop["damage"] = true;		
			HP.change(-this.onhitdamage);
			this.damageeffect();
			setTimeout(()=>{this.prop["damage"] = false}, this.damagetime);			
		}
	}
}
class chest extends entity {
	constructor(room, x, y){
		super(room.entities, room.collision, ["art/woodenChest.png"], x, y, false, false, false, false, SCALE,SCALE);	
		this.type = "chest";
		this.hitbox(0.125*SCALE, 0.125*SCALE, 0.75*SCALE, 0.75*SCALE);	
	}
}

class gate extends entity {
	constructor(room, x, y, image){
		super(room.entities, room.collision, [image], x, y, false, false, false, false, SCALE,SCALE);	
		this.type = "gate";
		this.hitbox(0, 0, SCALE, SCALE);	
	}
}
class trigger extends entity {
	constructor(entity, collision, x,y, width, height, letter, trig){
		super(entity, collision, null, x, y, false, false, false, false, width, height);
		this.still = true;
		this.speed = 0;
		this.img = null;
		this.hitbox(letter);
		this.type = "trigger";
		this.trig = trig;
	}
	hitbox(letter){
		this.colArea.x = [];
		this.colArea.y = [];
		var tempX = this.x;
		var tempY = this.y;			
		var tempWidth = this.hit.offWidth;
		var tempHeight = this.hit.offHeight;
		switch(letter) {
			case "N":
				this.addCollision(tempX, tempY, tempHeight, "y");
				this.addCollision(tempX, tempY+tempHeight, tempWidth, "x");
				this.addCollision(tempX+tempWidth, tempY, tempHeight, "y");
				break;
			case "W":
				this.addCollision(tempX, tempY, tempWidth, "x");
				this.addCollision(tempX, tempY+tempHeight, tempWidth, "x");
				this.addCollision(tempX+tempWidth, tempY, tempHeight, "y");
				break;
			case "S":
				this.addCollision(tempX, tempY, tempWidth, "x");
				this.addCollision(tempX, tempY, tempHeight, "y");
				this.addCollision(tempX+tempWidth, tempY, tempHeight, "y");
				break;
			case "E":
				this.addCollision(tempX, tempY, tempWidth, "x");
				this.addCollision(tempX, tempY, tempHeight, "y");
				this.addCollision(tempX, tempY+tempHeight, tempWidth, "x");
				break;
			default: break;
		}
		/*this.addCollision(tempX, tempY, tempWidth, "x");
		this.addCollision(tempX, tempY, tempHeight, "y");
		this.addCollision(tempX, tempY+tempHeight, tempWidth, "x");
		this.addCollision(tempX+tempWidth, tempY, tempHeight, "y");*/
	}
}

var drawCollision = (obj)=>{
	var xDir = obj.colArea.x;
	var yDir = obj.colArea.y;
	for (var i = 0; i < xDir.length; i++) {
		var temp = xDir[i];
		testCanvas.ctx.fillStyle = 'red';
		testCanvas.ctx.fillRect(temp.x-1, temp.y,2, temp.distance);
	}
	for (var i = 0; i < yDir.length; i++) {
		var temp = yDir[i];
		testCanvas.ctx.fillStyle = 'blue';
		testCanvas.ctx.fillRect(temp.x, temp.y-1,temp.distance,2);
	}
};

var drawDimensions = (obj)=>{
	var xDir = obj.x;
	var yDir = obj.y;
	testCanvas.ctx.fillStyle = 'blue';	
	testCanvas.ctx.fillRect(obj.x-1, obj.y-obj.hit.offY,2, obj.height);
	testCanvas.ctx.fillRect(obj.x, obj.y-1,obj.width, 2);

	//testCanvas.ctx.fillRect(obj.x-1+obj.width, obj.y,2, temp.distance);

	/*for (var i = 0; i < yDir.length; i++) {
		var temp = yDir[i];
		testCanvas.ctx.fillStyle = 'blue';
		testCanvas.ctx.fillRect(temp.x, temp.y-1,temp.distance,2);
	}*/
};