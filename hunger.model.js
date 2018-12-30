
// eslint-disable-next-line no-undef
Vue.component("rater", {
	//	props: ["title", "pool", "size"],
	props: ["config", "value"],
	template: `
	<div>
		<h3>{{config.title}}</h3>
		<div class="btn-group btn-group-toggle">
			<label v-for="(n, i) in config.maxsize" class="btn btn-secondary" v-bind:class="{ active: value==i}">
				<input type="radio" v-bind:value="i" v-on:input="$emit('input', $event.target.value)" v-model="value"> {{i}}
			</label>
		</div>
	</div>
		`
});

// eslint-disable-next-line no-undef
var app = new Vue({
	el: "#app",
	data: {
		hungerpool: "1",
		attributepool: "1",
		skillpool: "1",
		willpowerpool: "3",
		dicerolls: {},
		successes: 0,
		bestialFailure: false,
		messyCritical: false,
		willpowerAlreadyUsed: false,
		permitReroll: true,

		straightSuccesses: 0,
		possibleCrits: 0,
		critBonusSuccesses: 0,
		possibleBloodCrit: 0,
		lastSettings: {}
	},
	methods: {
		forceShowDiceTray: function () {
			// eslint-disable-next-line no-undef
			$("#collapse-homepage").collapse("hide");
			// eslint-disable-next-line no-undef
			$("#collapse-results").collapse("show");
		},
		addDice: function (numDice, resetPools = true, includesBloodDice = true, isWillPowerDice = false, failureIncreasesHunger = false, offerRollAgain = false) {
			app.lastSettings = {
				"numDice": numDice,
				"resetPools": resetPools,
				"includesBloodDice": includesBloodDice,
				"isWillPowerDice": isWillPowerDice,
				"failureIncreasesHunger": failureIncreasesHunger,
				"offerRollAgain": offerRollAgain
			};
			app.forceShowDiceTray();
			if (resetPools) {
				app.dicerolls = {};
				app.successes = 0;
				app.willpowerAlreadyUsed = false;
				app.straightSuccesses = 0;
				app.possibleCrits = 0;
				app.critBonusSuccesses = 0;
				app.possibleBloodCrit = 0;
				app.bestialFailure = false;
				app.messyCritical = false;
				app.permitReroll = true;
			}
			app.permitReroll = offerRollAgain;
			if (failureIncreasesHunger) {
				app.willpowerAlreadyUsed = true;
			}
			var startingDiceSize = Object.keys(app.dicerolls).length;

			for (var die = startingDiceSize; die < startingDiceSize + numDice; die++) {
				var hunger = parseInt(app.hungerpool);
				app.dicerolls[die] = {};
				if (die >= numDice - hunger && includesBloodDice) {
					app.dicerolls[die]["blood"] = true;
				}
				app.dicerolls[die]["willpower"] = isWillPowerDice;
				app.dicerolls[die]["result"] = Math.ceil(Math.random() * 10);
				app.dicerolls[die]["success"] = app.dicerolls[die]["result"] > 5;
				app.dicerolls[die]["failure"] = app.dicerolls[die]["result"] < 6;
				app.dicerolls[die]["crit"] = app.dicerolls[die]["result"] == 10;
				app.dicerolls[die]["bonus"] = false;
				if (app.dicerolls[die]["success"]) {
					app.straightSuccesses += 1;
				}
				if (app.dicerolls[die]["crit"]) {
					app.possibleCrits += 1;
				}
				if (app.dicerolls[die]["blood"] && app.dicerolls[die]["result"] == 1) {
					app.bestialFailure = true;
					app.dicerolls[die]["bestial"] = true;
				}
				if (app.dicerolls[die]["blood"] && app.dicerolls[die]["crit"]) {
					app.possibleBloodCrit++;
				}
				app.dicerolls[die]["summary"] = "Failure";
				app.dicerolls[die]["summary"] = app.dicerolls[die]["blood"] ? "Blood Die" : app.dicerolls[die]["summary"];
				app.dicerolls[die]["summary"] = app.dicerolls[die]["result"] > 5 ? "Success!" : app.dicerolls[die]["summary"];
				app.dicerolls[die]["summary"] = app.dicerolls[die]["crit"] ? "Critical!" : app.dicerolls[die]["summary"];
				app.dicerolls[die]["summary"] = app.dicerolls[die]["bestial"] && app.dicerolls[die]["blood"] ? "Bestial!" : app.dicerolls[die]["summary"];
			}
			app.successes = app.straightSuccesses;
			app.critBonusSuccesses += Math.floor(app.possibleCrits / 2) * 2;
			app.successes += app.critBonusSuccesses;
			if (app.possibleBloodCrit > 1 || (app.possibleBloodCrit > 0 && app.possibleCrits > 1)) {
				app.messyCritical = true;
			}

			if (failureIncreasesHunger && app.successes < 1) {
				app.hungerpool++;
			}

			for (die = startingDiceSize + numDice; die < app.critBonusSuccesses + startingDiceSize + numDice; die++) {
				app.dicerolls[die] = {};
				app.dicerolls[die]["result"] = 10;
				app.dicerolls[die]["success"] = true;
				app.dicerolls[die]["failure"] = false;
				app.dicerolls[die]["crit"] = false;
				app.dicerolls[die]["bonus"] = true;
				app.dicerolls[die]["willpower"] = false;
				app.dicerolls[die]["blood"] = false;
			}
		},
		rollDice: function () {
			var poolsize = parseInt(app.attributepool) + parseInt(app.skillpool);
			app.addDice(poolsize, true, true, false, false, true);
		},
		useWillpower: function () {
			app.willpowerpool--;
			app.willpowerAlreadyUsed = true;
			app.addDice(3, false, false, true);
		},
		rouseCheck: function () {
			app.forceShowDiceTray();
			app.willpowerAlreadyUsed = true;
			app.addDice(1, true, true, false, true);
		},
		willpowerCheck: function () {
			app.forceShowDiceTray();
			app.willpowerAlreadyUsed = true;
			app.addDice(app.willpowerpool, true, true, false, true);
		}
	}
});