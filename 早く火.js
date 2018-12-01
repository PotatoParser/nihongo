window.fastFire = {
	keyEvent: class {
		constructor(key, event){
			window.addEventListener("keypress", (e)=>{event();});
		}
	},
	algPath: ()=>{

	},
	AI: class {
		constructor(elementHook, allProp){
			var origin = {
				range: 100,
				hitbox: [[0,0],[0,1],[1,0],[1,1]], // hitbox of the ai
				focus: true, // focus on the main player
				targets: ["player"], // All possible targets
				pathing: algPath,
				refreshRate: 100, // Algorithm activates after 100 milliseconds
				fogOfWar: false // If set to true, allows the AI to detect targets outside of its normal range
			}
			this.timer = setInterval(()=>{
				var prioritize = [];
				for (let i = 0; i < targets.length; i++) {
					var temp = document.getElementsByClassName(targets[i]);
					for (var a = 0; a < temp.length; a++) {

					}
				}
				for (let i = 0; i < prioritize.length; i++) origin.pathing(prioritize);
			}, origin.refreshRate);
		}
	},

}