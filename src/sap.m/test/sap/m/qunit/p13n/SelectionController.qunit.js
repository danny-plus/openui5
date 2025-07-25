/* global QUnit*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/p13n/SelectionController",
	"sap/m/p13n/MetadataHelper",
	"sap/m/p13n/modules/xConfigAPI",
	"sap/m/p13n/enums/ProcessingStrategy",
	"sap/ui/thirdparty/sinon"
], function (Control, SelectionController, MetadataHelper, xConfigAPI, ProcessingStrategy, sinon) {
	"use strict";

	const simulateRemoveItem = function(aArray, sKey, sKeyName) {
		if (!sKeyName) {
			sKeyName = "key";
		}
		for (let i = 0; i < aArray.length; i++) {
			const oItem = aArray[i];
			if (oItem[sKeyName] === sKey) {
				aArray.splice(i, 1);
				break;
			}
		}
	};

	const simulateAddItem = function(aArray, oItem, iNewIdx) {
		aArray.splice(iNewIdx, 0, oItem);
	};

	const simulateMoveItem = function(aArray, sKey, iNewIdx, sKeyName) {
		if (!sKeyName) {
			sKeyName = "key";
		}
		for (let i = 0; i < aArray.length; i++) {
			const oItem = aArray[i];
			if (oItem[sKeyName] === sKey) {
				aArray.splice(i, 1);
				aArray.splice(iNewIdx, 0, oItem);
				break;
			}
		}
	};

	QUnit.module("Generic API tests", {
		initHelper: function() {

			var oHelper = new MetadataHelper([
				{key: "fieldA", label: "Field A"},
				{key: "fieldB", label: "Field B"},
				{key: "fieldC", label: "Field C"}
			]);

			return oHelper;
		},
        beforeEach: function() {
			this.oTestControl = new Control();
			this.oSelectionController = new SelectionController({
				control: new Control(),
				targetAggregation: "dependents"
			});
        },
        afterEach: function() {
			this.oTestControl.destroy();
			this.oTestControl = null;
			this.oSelectionController.destroy();
			this.oSelectionController = null;
		}
	});

	QUnit.test("Instantiate", function(assert){

		var oSelectionController;

		assert.throws(function () {
			oSelectionController = new SelectionController();
		}, function(oError) {
			return oError instanceof Error;
		},  "Controller can not be instanciated without a control configuration");


		oSelectionController = new SelectionController({
			control: new Control()
		});

		assert.ok(oSelectionController, "SelectionController is instanciable when a control instance has been provided");
	});

	QUnit.test("Check 'targetAggregation' constructor config", function(assert){
		var oSelectionController = new SelectionController({
			control: new Control("TestControl"),
			targetAggregation: "items"
		});

		assert.equal(oSelectionController.getAdaptationControl().getId(), "TestControl", "AdaptationControl provided");
		assert.equal(oSelectionController.getTargetAggregation(), "items", "Targetaggregation provided");
	});

	QUnit.test("Check 'initAdaptationUI' ", function(assert){

		var oHelper = this.initHelper();

		return this.oSelectionController.initAdaptationUI(oHelper)
		.then(function(oSelectionPanel) {
			assert.ok(oSelectionPanel.isA("sap.m.p13n.SelectionPanel"), "The SelectionController creates a SelectionPanel as UI");
			assert.ok(oSelectionPanel.getEnableReorder(), "Reordering is enabled per default");
		});

	});

	QUnit.test("Check 'initAdaptationUI' - reordering disabled", function(assert){

		var oHelper = this.initHelper();
		var oSelectionController = new SelectionController({
			control: new Control(),
			targetAggregation: "items",
			enableReorder: false
		});

		return oSelectionController.initAdaptationUI(oHelper)
		.then(function(oSelectionPanel) {
			assert.ok(oSelectionPanel.isA("sap.m.p13n.SelectionPanel"), "The SelectionController creates a SelectionPanel as UI");
			assert.notOk(oSelectionPanel.getEnableReorder(), "Reordering is disabled");
		});

	});

	QUnit.test("Check 'getCurrentState' --> it should reflect the aggregation", function(assert){

		//Start and check empty
		var aCurrentState = this.oSelectionController.getCurrentState();
		assert.deepEqual(aCurrentState, [], "The control does currently not have any aggregation state");

		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		//Add three items and assert
		var oField1 = new Control("fieldA");
		var oField2 = new Control("fieldB");
		var oField3 = new Control("fieldC");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);
		oAdaptationControl.addDependent(oField3);

		var aState = [
			{key: "fieldA"},
			{key: "fieldB"},
			{key: "fieldC"}
		];

		var aAddState = this.oSelectionController.getCurrentState();
		assert.deepEqual(aAddState, aState, "The control state has changed");

		//Remove one item and assert again
		oAdaptationControl.removeDependent(2);
		aState = [
			{key: "fieldA"},
			{key: "fieldB"}
		];
		var aRemoveState = this.oSelectionController.getCurrentState();
		assert.deepEqual(aRemoveState, aState, "The control state has changed");

		oField1.destroy();
		oField2.destroy();
		oField3.destroy();
	});

	QUnit.test("Check 'getCurrentState' --> it should reflect the aggregation and merge it with xConfig if provided", function(assert){

		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		//Add three items
		var oField1 = new Control("fieldA");
		var oField2 = new Control("fieldB");
		var oField3 = new Control("fieldC");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);
		oAdaptationControl.addDependent(oField3);

		//Set one to invsibile via xConfig
		return xConfigAPI.enhanceConfig(oAdaptationControl, {
			key: "fieldA",
			property: "visible",
			operation: "remove",
			controlMeta: {
				aggregation: "dependents"
			},
			value: {
				value: false
			}
		})
		.then(function(){
			var aState = [
				{key: "fieldB"},
				{key: "fieldC"}
			];

			var aCurrentState = this.oSelectionController.getCurrentState();
			assert.deepEqual(aCurrentState, aState, "The control state has been merged with xConfig");
			oField1.destroy();
			oField2.destroy();
			oField3.destroy();
		}.bind(this));

	});

	QUnit.test("check 'getDelta' without absolute appliance", function(assert){

		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var oField1 = new Control("fieldA");
		var oField2 = new Control("fieldB");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);

		var aChanges = this.oSelectionController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oSelectionController.getChangeOperations(),
			existingState: this.oSelectionController.getCurrentState(),
			changedState: [],
			propertyInfo: this.initHelper().getProperties()
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 0, "No absolute appliance, state kept");

		oField1.destroy();
		oField2.destroy();

	});


	QUnit.test("check 'getDelta' but with absolute appliance", function(assert){

		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var oField1 = new Control("fieldA");
		var oField2 = new Control("fieldB");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);

		var aChanges = this.oSelectionController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oSelectionController.getChangeOperations(),
			existingState: this.oSelectionController.getCurrentState(),
			changedState: [],
			propertyInfo: this.initHelper().getProperties(),
			applyAbsolute: true
		});

		assert.ok(aChanges.length !== undefined, "Returned value is an array of change objects");
		assert.equal(aChanges.length, 2, "Absolute appliance --> state will be removed implicitly");

		assert.equal(aChanges[0]["changeSpecificData"].changeType, "removeItem", "Remove change created");
		assert.equal(aChanges[0]["changeSpecificData"].content.key, "fieldA", "Remove change created with correct key");

		assert.equal(aChanges[1]["changeSpecificData"].changeType, "removeItem", "Remove change created");
		assert.equal(aChanges[1]["changeSpecificData"].content.key, "fieldB", "Remove change created with correct key");

		oField1.destroy();
		oField2.destroy();

	});

	QUnit.test("check 'getDelta' when rearranging an index - absolute appliance set to false", function(assert){

		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var oField1 = new Control("fieldA");
		var oField2 = new Control("fieldB");
		var oField3 = new Control("fieldC");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);
		oAdaptationControl.addDependent(oField3);

		var aChanges = this.oSelectionController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			changeOperations: this.oSelectionController.getChangeOperations(),
			existingState: this.oSelectionController.getCurrentState(),
			changedState: [{key: "fieldC", label: "Field C", position: 0},
			{key: "fieldB", label: "Field B", position: 1}],
			propertyInfo: this.initHelper().getProperties()
		});

		assert.equal(aChanges.length, 2, "Returned value is an array of change objects");
		assert.equal(aChanges[0].changeSpecificData.changeType, "moveItem", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.changeType, "moveItem", "Returned value is of correct type");

		oField1.destroy();
		oField2.destroy();
		oField3.destroy();

	});

	QUnit.test("check 'stableKeys' delta should be unaffected (full replace)", function(assert){

		this.oSelectionController = new SelectionController({
			control: new Control(),
			targetAggregation: "dependents",
			stableKeys: ["A"]
		});
		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var oField1 = new Control("A");
		var oField2 = new Control("B");
		var oField3 = new Control("C");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);
		oAdaptationControl.addDependent(oField3);

		var aChanges = this.oSelectionController.getDelta({
			control: oAdaptationControl,
			deltaAttributes: ["key"],
			applyAbsolute: ProcessingStrategy.FullReplace,//even in a full replace, A should be unaffected
			changeOperations: this.oSelectionController.getChangeOperations(),
			existingState: this.oSelectionController.getCurrentState(),
			changedState: [{key: "C"},{key: "B"}], //Mock a change to move C to index 0 --> no remove for a should be created
			propertyInfo: this.initHelper().getProperties()
		});

		assert.equal(aChanges.length, 1, "Returned value is an array of change objects");
		assert.equal(aChanges[0].changeSpecificData.changeType, "moveItem", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "C", "Returned value is of correct key");
		assert.equal(aChanges[0].changeSpecificData.content.index, 1, "Returned value is of correct index");

		oField1.destroy();
		oField2.destroy();
		oField3.destroy();

	});

	QUnit.test("check 'stableKeys' delta should be unaffected (additive)", function(assert){

		this.oSelectionController = new SelectionController({
			control: new Control(),
			targetAggregation: "dependents",
			stableKeys: ["A"]
		});
		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var oField1 = new Control("A");
		var oField2 = new Control("B");
		var oField3 = new Control("C");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);
		oAdaptationControl.addDependent(oField3);

		var aChanges = this.oSelectionController.getDelta({
			control: oAdaptationControl,
			applyAbsolute: ProcessingStrategy.Add,
			deltaAttributes: ["key"],
			changeOperations: this.oSelectionController.getChangeOperations(),
			existingState: this.oSelectionController.getCurrentState(),
			changedState: [{key: "B", position: 2}],
			propertyInfo: this.initHelper().getProperties()
		});

		assert.equal(aChanges.length, 1, "No change created for moving a stable key");
		assert.equal(aChanges[0].changeSpecificData.changeType, "moveItem", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "C", "Returned value is of correct key");
		assert.equal(aChanges[0].changeSpecificData.content.index, 1, "Returned value is of correct index");

		oField1.destroy();
		oField2.destroy();
		oField3.destroy();

	});

	QUnit.test("check 'stableKeys' delta should be unaffected, the dialog should exclude it", function(assert){

		this.oSelectionController = new SelectionController({
			control: new Control(),
			targetAggregation: "dependents",
			stableKeys: ["fieldA"]
		});
		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var oField1 = new Control("fieldA");
		var oField2 = new Control("fieldB");
		var oField3 = new Control("fieldC");
		oAdaptationControl.addDependent(oField1);
		oAdaptationControl.addDependent(oField2);
		oAdaptationControl.addDependent(oField3);


		var oHelper = this.initHelper();

		return this.oSelectionController.initAdaptationUI(oHelper)
		.then(function(oSelectionPanel) {
			assert.ok(oSelectionPanel.isA("sap.m.p13n.SelectionPanel"), "The SelectionController creates a SelectionPanel as UI");
			assert.equal(oSelectionPanel.getP13nData().length, 2, "One item has been excluded");
			assert.equal(oSelectionPanel.getP13nData()[0].key, "fieldB", "Correct key");
			assert.equal(oSelectionPanel.getP13nData()[1].key, "fieldC", "Correct key");

			oField1.destroy();
			oField2.destroy();
			oField3.destroy();

		});

	});

	QUnit.test("check 'getArrayDeltaChanges'", function(assert){

		var aChanges;
		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState:  [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"},{"name":"E","key":"E"},{"name":"F","key":"F"}],  // is state
			changedState:   [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"},{"name":"E","key":"E"},{"name":"F","key":"F"}]   // target state
		};
		const aTarget = data.existingState;

		// no changes
		aChanges = this.oSelectionController.getArrayDeltaChanges(data);
		assert.equal(aChanges.length, 0, "Returned value is an array of change objects");

		// remove all
		data.changedState  = [];

		aChanges = this.oSelectionController.getArrayDeltaChanges(data);
		assert.equal(aChanges.length, 6, "Returned value is an array of change objects");

		data.changedState  = [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"D","key":"D"},{"name":"E","key":"E"},{"name":"F","key":"F"}];
		aChanges = this.oSelectionController.getArrayDeltaChanges(data);
		assert.equal(aChanges.length, 1, "Returned value is an array of change objects");
		assert.equal(aChanges[0].changeSpecificData.changeType, "removeFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "C", "Returned the expected name");
		simulateRemoveItem(aTarget, "C");

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (moving) - 1'", function(assert) {
		// arrange
		const oAdaptationControl = this.oSelectionController.getAdaptationControl();

		const data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState: [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"},{"name":"E","key":"E"},{"name":"F","key":"F"}],
			changedState: [{"name":"F","key":"F"},{"name":"E","key":"E"},{"name":"D","key":"D"},{"name":"C","key":"C"},{"name":"B","key":"B"},{"name":"A","key":"A"}]
		};
		const aTarget = data.existingState;

		// act
		const aChanges = this.oSelectionController.getArrayDeltaChanges(data);

		// assert
		assert.equal(aChanges.length, 5, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "F", "Returned the expected name");
		assert.equal(aChanges[0].changeSpecificData.content.index, 0, "Returned the expected index");
		simulateMoveItem(aTarget, "F", aChanges[0].changeSpecificData.content.index);

		assert.equal(aChanges[1].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.content.key, "E", "Returned the expected name");
		assert.equal(aChanges[1].changeSpecificData.content.index, 1, "Returned the expected index");
		simulateMoveItem(aTarget, "E", aChanges[1].changeSpecificData.content.index);

		assert.equal(aChanges[2].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[2].changeSpecificData.content.key, "D", "Returned the expected name");
		assert.equal(aChanges[2].changeSpecificData.content.index, 2, "Returned the expected index");
		simulateMoveItem(aTarget, "D", aChanges[2].changeSpecificData.content.index);

		assert.equal(aChanges[3].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[3].changeSpecificData.content.key, "C", "Returned the expected name");
		assert.equal(aChanges[3].changeSpecificData.content.index, 3, "Returned the expected index");
		simulateMoveItem(aTarget, "C", aChanges[3].changeSpecificData.content.index);

		assert.equal(aChanges[4].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[4].changeSpecificData.content.key, "B", "Returned the expected name");
		assert.equal(aChanges[4].changeSpecificData.content.index, 4, "Returned the expected index");
		simulateMoveItem(aTarget, "B", aChanges[4].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (moving)' - 2", function(assert) {
		// arrange
		const oAdaptationControl = this.oSelectionController.getAdaptationControl();
		const data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState: [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"},{"name":"E","key":"E"},{"name":"F","key":"F"}],
			changedState: [{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"F","key":"F"},{"name":"D","key":"D"},{"name":"A","key":"A"},{"name":"E","key":"E"}]
		};
		const aTarget = data.existingState;

		// act
		const aChanges = this.oSelectionController.getArrayDeltaChanges(data);

		// assert
		assert.equal(aChanges.length, 2, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "F", "Returned the expected name");
		assert.equal(aChanges[0].changeSpecificData.content.index, 3, "Returned the expected index");
		simulateMoveItem(aTarget, "F", aChanges[0].changeSpecificData.content.index);

		assert.equal(aChanges[1].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.content.key, "A", "Returned the expected name");
		assert.equal(aChanges[1].changeSpecificData.content.index, 4, "Returned the expected index");
		simulateMoveItem(aTarget, "A", aChanges[1].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (moving)' - 3'", function(assert) {
		// arrange
		const oAdaptationControl = this.oSelectionController.getAdaptationControl();
		const data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState: [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"},{"name":"E","key":"E"},{"name":"F","key":"F"}],
			changedState: [{"name":"F","key":"F"},{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"},{"name":"E","key":"E"}]
		};
		const aTarget = data.existingState;

		// act
		const aChanges = this.oSelectionController.getArrayDeltaChanges(data);

		// assert
		assert.equal(aChanges.length, 1, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "F", "Returned the expected name");
		assert.equal(aChanges[0].changeSpecificData.content.index, 0, "Returned the expected index");
		simulateMoveItem(aTarget, "F", aChanges[0].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (moving)' - 4", function(assert) {
		// arrange
		const oAdaptationControl = this.oSelectionController.getAdaptationControl();
		const data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState: [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"},{"name":"E","key":"E"},{"name":"F","key":"F"}],
			changedState: [{"name":"B","key":"B"},{"name":"F","key":"F"},{"name":"A","key":"A"},{"name":"C","key":"C"},{"name":"D","key":"D"},{"name":"E","key":"E"}]
		};
		const aTarget = data.existingState;

		// act
		const aChanges = this.oSelectionController.getArrayDeltaChanges(data);

		// assert
		assert.equal(aChanges.length, 2, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "F", "Returned the expected name");
		assert.equal(aChanges[0].changeSpecificData.content.index, 2, "Returned the expected index");
		simulateMoveItem(aTarget, "F", aChanges[0].changeSpecificData.content.index);

		assert.equal(aChanges[1].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.content.key, "A", "Returned the expected name");
		assert.equal(aChanges[1].changeSpecificData.content.index, 2, "Returned the expected index");
		simulateMoveItem(aTarget, "A", aChanges[1].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (moving)' - 5", function(assert) {
		// arrange
		const oAdaptationControl = this.oSelectionController.getAdaptationControl();
		const data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState: [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"}],
			changedState: [{"name":"C","key":"C"},{"name":"B","key":"B"},{"name":"A","key":"A"},{"name":"D","key":"D"}]
		};
		const aTarget = data.existingState;

		// act
		const aChanges = this.oSelectionController.getArrayDeltaChanges(data);

		// assert
		assert.equal(aChanges.length, 2, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "C", "Returned the expected name");
		assert.equal(aChanges[0].changeSpecificData.content.index, 0, "Returned the expected index");
		simulateMoveItem(aTarget, "C", aChanges[0].changeSpecificData.content.index);

		assert.equal(aChanges[1].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.content.key, "B", "Returned the expected name");
		assert.equal(aChanges[1].changeSpecificData.content.index, 1, "Returned the expected index");
		simulateMoveItem(aTarget, "B", aChanges[1].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (moving)' - 6", function(assert) {
		// adding removing moving
		// arrange
		const oAdaptationControl = this.oSelectionController.getAdaptationControl();
		const data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState: [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"}],
			changedState:  [{"name":"D","key":"D"},{"name":"A","key":"A"},{"name":"F","key":"F"}]
		};
		const aTarget = data.existingState;

		// act
		const aChanges = this.oSelectionController.getArrayDeltaChanges(data);

		// assert
		assert.equal(aChanges.length, 4, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "removeFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "B", "Returned the expected name");
		simulateRemoveItem(aTarget, "B");

		assert.equal(aChanges[1].changeSpecificData.changeType, "removeFilter", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.content.key, "C", "Returned the expected name");
		simulateRemoveItem(aTarget, "C");

		assert.equal(aChanges[2].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[2].changeSpecificData.content.key, "D", "Returned the expected name");
		assert.equal(aChanges[2].changeSpecificData.content.index, 0, "Returned the expected index");
		simulateMoveItem(aTarget, "D", aChanges[2].changeSpecificData.content.index);

		assert.equal(aChanges[3].changeSpecificData.changeType, "addFilter", "Returned value is of correct type");
		assert.equal(aChanges[3].changeSpecificData.content.key, "F", "Returned the expected name");
		assert.equal(aChanges[3].changeSpecificData.content.index, 2, "Returned the expected index");
		simulateAddItem(aTarget, data.changedState[aChanges[3].changeSpecificData.content.index], aChanges[3].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (moving)' - 7", function(assert) {
		// adding removing moving
		// arrange
		const oAdaptationControl = this.oSelectionController.getAdaptationControl();
		const data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState: [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"}],
			changedState: [{"name":"D","key":"D"},{"name":"F","key":"F"}, {"name":"A","key":"A"}]
		};
		const aTarget = data.existingState;

		// act
		const aChanges = this.oSelectionController.getArrayDeltaChanges(data);
		// assert
		assert.equal(aChanges.length, 4, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "removeFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "B", "Returned the expected name");
		simulateRemoveItem(aTarget, "B");

		assert.equal(aChanges[1].changeSpecificData.changeType, "removeFilter", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.content.key, "C", "Returned the expected name");
		simulateRemoveItem(aTarget, "C");

		assert.equal(aChanges[2].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[2].changeSpecificData.content.key, "D", "Returned the expected name");
		assert.equal(aChanges[2].changeSpecificData.content.index, 0, "Returned the expected index");
		simulateMoveItem(aTarget, "D", aChanges[2].changeSpecificData.content.index);

		assert.equal(aChanges[3].changeSpecificData.changeType, "addFilter", "Returned value is of correct type");
		assert.equal(aChanges[3].changeSpecificData.content.key, "F", "Returned the expected name");
		assert.equal(aChanges[3].changeSpecificData.content.index, 1, "Returned the expected index");
		simulateAddItem(aTarget, data.changedState[aChanges[3].changeSpecificData.content.index], aChanges[3].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (moving)' - 8", function(assert) {
		// moving
		// arrange
		const oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState: [{"name":"A","key":"A"},{"name":"B","key":"B"},{"name":"C","key":"C"},{"name":"D","key":"D"},{"name":"E","key":"E"},{"name":"F","key":"F"}],
			changedState: [{"name":"A","key":"A"},{"name":"C","key":"C"},{"name":"D","key":"D"},{"name":"F","key":"F"},{"name":"B","key":"B"},{"name":"E","key":"E"}]
		};
		const aTarget = data.existingState;

		// act
		const aChanges = this.oSelectionController.getArrayDeltaChanges(data);

		// assert
		assert.equal(aChanges.length, 2, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "B", "Returned the expected name");
		assert.equal(aChanges[0].changeSpecificData.content.index, 5, "Returned the expected index");
		simulateMoveItem(aTarget, "B", aChanges[0].changeSpecificData.content.index);

		assert.equal(aChanges[1].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.content.key, "E", "Returned the expected name");
		assert.equal(aChanges[1].changeSpecificData.content.index, 5, "Returned the expected index");
		simulateMoveItem(aTarget, "E", aChanges[1].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (moving)' - 9 (CS20250009884917)", function(assert) {
		// moving
		// arrange
		const oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState: [
				{"name":"A","key":"A"},
				{"name":"B","key":"B"},
				{"name":"C","key":"C"},
				{"name":"D","key":"D"},
				{"name":"E","key":"E"},
				{"name":"F","key":"F"},
				{"name":"G","key":"G"}
			],
			changedState: [
				{"name":"A","key":"A"},
				{"name":"C","key":"C"},
				{"name":"B","key":"B"},
				{"name":"D","key":"D"},
				{"name":"F","key":"F"},
				{"name":"E","key":"E"},
				{"name":"G","key":"G"}
			]
		};
		const aTarget = data.existingState;

		// act
		const aChanges = this.oSelectionController.getArrayDeltaChanges(data);

		// assert
		assert.equal(aChanges.length, 2, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "C", "Returned the expected name");
		assert.equal(aChanges[0].changeSpecificData.content.index, 1, "Returned the expected index");
		simulateMoveItem(aTarget, "C", aChanges[0].changeSpecificData.content.index);

		assert.equal(aChanges[1].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.content.key, "F", "Returned the expected name");
		assert.equal(aChanges[1].changeSpecificData.content.index, 4, "Returned the expected index");
		simulateMoveItem(aTarget, "F", aChanges[1].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (moving)' - 10 (CS20250009884917)", function(assert) {
		// moving
		// arrange
		const oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"},
			existingState: [
				{"name":"1","key":"1"},
				{"name":"2","key":"2"},
				{"name":"3","key":"3"},
				{"name":"4","key":"4"},
				{"name":"5","key":"5"},
				{"name":"6","key":"6"},
				{"name":"7","key":"7"},
				{"name":"8","key":"8"},
				{"name":"9","key":"9"},
				{"name":"10","key":"10"}
			],

			changedState: [
				{"name":"1","key":"1"},
				{"name":"2","key":"2"},
				{"name":"4","key":"4"},
				{"name":"3","key":"3"},
				{"name":"5","key":"5"},
				{"name":"8","key":"8"},
				{"name":"6","key":"6"},
				{"name":"10","key":"10"},
				{"name":"9","key":"9"},
				{"name":"7","key":"7"}
			]
		};
		const aTarget = data.existingState;

		// act
		const aChanges = this.oSelectionController.getArrayDeltaChanges(data);

		// assert
		assert.equal(aChanges.length, 4, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "4", "Returned the expected name");
		assert.equal(aChanges[0].changeSpecificData.content.index, 2, "Returned the expected index");
		simulateMoveItem(aTarget, "4", aChanges[0].changeSpecificData.content.index);

		assert.equal(aChanges[1].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.content.key, "8", "Returned the expected name");
		assert.equal(aChanges[1].changeSpecificData.content.index, 5, "Returned the expected index");
		simulateMoveItem(aTarget, "8", aChanges[1].changeSpecificData.content.index);

		assert.equal(aChanges[2].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[2].changeSpecificData.content.key, "10", "Returned the expected name");
		assert.equal(aChanges[2].changeSpecificData.content.index, 7, "Returned the expected index");
		simulateMoveItem(aTarget, "10", aChanges[2].changeSpecificData.content.index);

		assert.equal(aChanges[3].changeSpecificData.changeType, "moveFilter", "Returned value is of correct type");
		assert.equal(aChanges[3].changeSpecificData.content.key, "9", "Returned the expected name");
		assert.equal(aChanges[3].changeSpecificData.content.index, 8, "Returned the expected index");
		simulateMoveItem(aTarget, "9", aChanges[3].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (adding/deleting moving up&down)'", function(assert){

		var aChanges;
		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"}
		};

		//adding/deleting moving up&down
		data.existingState = [
			{ name: "title", key: "title", visible: true, label: "Title", tooltip:"" },
			{ name: "descr", key: "descr", visible: true, label: "Description", tooltip:"" },
			{ name: "author_ID", key: "author_ID", visible: true, label: "Author ID", tooltip:"" },
			{ name: "price", key: "price", visible: true, label: "Price", tooltip:"" },
			{ name: "stock", key: "stock", visible: true, label: "Stock", tooltip:"" },
			{ name: "genre_code", key: "genre_code", visible: true, label: "Genre", tooltip:"" },
			{ name: "subgenre_code", key: "subgenre_code", visible: true, label: "Sub Genre", tooltip:"" }
		];
		data.changedState = [
			{ key: "genre_code", name: "genre_code", visible: true, label: "Genre", tooltip: "" },
			{ key: "stock", name: "stock", visible: true, label: "Stock", tooltip: "" },
			{ key: "price", name: "price", visible: true, label: "Price", tooltip: "" },
			{ key: "language_code", name: "language_code", visible: true, label: "Language", tooltip: "" },
			{ key: "metricsSyllables", name: "metricsSyllables", visible: true, label: "Syllables", tooltip: "" },
			{ key: "subgenre_code", name: "subgenre_code", visible: true, label: "Sub Genre", tooltip: "" },
			{ key: "author_ID", name: "author_ID", visible: true, label: "Author ID", tooltip: "" },
			{ key: "published", name: "published", visible: true, label: "Published", tooltip: "" },
			{ key: "modifiedAt", name: "modifiedAt", visible: true, label: "Changed On", tooltip: "" },
			{ key: "descr", name: "descr", visible: true, label: "Description", tooltip: "" },
			{ key: "metricsSentences", name: "metricsSentences", visible: true, label: "Sentences", tooltip: "" },
			{ key: "ID", name: "ID", visible: true, label: "Book ID", tooltip: "" },
			{ key: "metricsCharacters", name: "metricsCharacters", visible: true, label: "Characters", tooltip: "" },
			{ key: "classification_code", name: "classification_code", visible: true, label: "Classification", tooltip: "" },
			{ key: "createdAt", name: "createdAt", visible: true, label: "Created On", tooltip: "" },
			{ key: "currency_code", name: "currency_code", visible: true, label: "Currency", tooltip: "" },
			{ key: "detailgenre_code", name: "detailgenre_code", visible: true, label: "DetailGenre", tooltip: "" },
			{ key: "title", name: "title", visible: true, label: "Title", tooltip: "" }
		];
		data.changeOperations = { add: "addColumn", remove: "removeColumn", move: "moveColumn" };
		data.deltaAttributes = ['key', 'name'];
		const aTarget = data.existingState;

	    aChanges = this.oSelectionController.getArrayDeltaChanges(data);
		assert.equal(aChanges.length, 16, "Returned value is an array of change objects");

		const aExpectedChanges = [
			{ type: "moveColumn", key: "genre_code", index: 0 },
			{ type: "moveColumn", key: "stock", index: 4 },
			{ type: "moveColumn", key: "author_ID", index: 6 },
			{ type: "moveColumn", key: "descr", index: 6 },
			{ type: "moveColumn", key: "title", index: 6 },
			{ type: "addColumn", key: "language_code", index: 3 },
			{ type: "addColumn", key: "metricsSyllables", index: 4 },
			{ type: "addColumn", key: "published", index: 7 },
			{ type: "addColumn", key: "modifiedAt", index: 8 },
			{ type: "addColumn", key: "metricsSentences", index: 10 },
			{ type: "addColumn", key: "ID", index: 11 },
			{ type: "addColumn", key: "metricsCharacters", index: 12 },
			{ type: "addColumn", key: "classification_code", index: 13 },
			{ type: "addColumn", key: "createdAt", index: 14 },
			{ type: "addColumn", key: "currency_code", index: 15 },
			{ type: "addColumn", key: "detailgenre_code", index: 16 }
		];

		aExpectedChanges.forEach((oExpectedChange, index) => {
			const actualChange = aChanges[index].changeSpecificData;
			assert.equal(actualChange.changeType, oExpectedChange.type, `Returned value is of correct type for expected key '${oExpectedChange.key}'`);
			assert.equal(actualChange.content.key, oExpectedChange.key, "Returned the expected name");
			if (typeof oExpectedChange.index === "number"){
				assert.equal(actualChange.content.index, oExpectedChange.index, `Returned the expected index for expected key '${oExpectedChange.key}'`);
			}
			if (oExpectedChange.type === "moveColumn"){
				simulateMoveItem(aTarget, oExpectedChange.key, oExpectedChange.index);
			} else if (oExpectedChange.type === "addColumn"){
				simulateAddItem(aTarget, data.changedState[oExpectedChange.index], oExpectedChange.index);
			}
		});

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'getArrayDeltaChanges (adding/deleting with deltaAttributes)'", function(assert){

		var aChanges;
		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addFilter", remove: "removeFilter", move: "moveFilter"}
		};

		data.existingState = [{"name":"A","key":"A", descending:true, position:0},{"name":"B","key":"B",descending:true, position:1}];
		data.changedState  = [{"name":"B","key":"B", descending:false, sorted:true}];
		data.deltaAttributes = ["key", "name", "descending"];
		data.changeOperations = {add: "addSort", remove: "removeSort", move: "moveSort"};
		const aTarget = data.existingState;

		aChanges = this.oSelectionController.getArrayDeltaChanges(data);
		assert.equal(aChanges.length, 3, "Returned value is an array of change objects");

		assert.equal(aChanges[0].changeSpecificData.changeType, "removeSort", "Returned value is of correct type");
		assert.equal(aChanges[0].changeSpecificData.content.key, "A", "Returned the expected name");
		simulateRemoveItem(aTarget, "A");

		assert.equal(aChanges[1].changeSpecificData.changeType, "removeSort", "Returned value is of correct type");
		assert.equal(aChanges[1].changeSpecificData.content.key, "B", "Returned the expected name");
		simulateRemoveItem(aTarget, "B");

		assert.equal(aChanges[2].changeSpecificData.changeType, "addSort", "Returned value is of correct type");
		assert.equal(aChanges[2].changeSpecificData.content.key, "B", "Returned the expected name");
		assert.equal(aChanges[2].changeSpecificData.content.index, 0, "Returned the expected index");
		assert.equal(aChanges[2].changeSpecificData.content.descending, false, "Returned the descending info");
		simulateAddItem(aTarget, data.changedState[aChanges[2].changeSpecificData.content.index], aChanges[2].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check value to be true/false on add/remove", function(assert){

		var aChanges;
		var oAdaptationControl = this.oSelectionController.getAdaptationControl();

		var data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addItem", remove: "removeItem", move: "moveItem"},
			existingState:  [{"name":"A","key":"A"},{"name":"B","key":"B"}],  // is state
			changedState:   [{"name":"B","key":"B"}]   // target state
		};
		let aTarget = data.existingState;

		aChanges = this.oSelectionController.getArrayDeltaChanges(data);
		assert.equal(aChanges.length, 1, "One remove change");
		assert.equal(aChanges[0].changeSpecificData.content.value, false, "Value is set to false");
		simulateRemoveItem(aTarget, "A");

		assert.deepEqual(aTarget, data.changedState);

		data = {
			control: oAdaptationControl,
			deltaAttributes: ["key", "name"],
			changeOperations: {add: "addItem", remove: "removeItem", move: "moveItem"},
			existingState:  [{"name":"A","key":"A"}],  // is state
			changedState:   [{"name":"A","key":"A"},{"name":"B","key":"B"}]   // target state
		};
		aTarget = data.existingState;

		aChanges = this.oSelectionController.getArrayDeltaChanges(data);
		assert.equal(aChanges.length, 1, "One add change");
		assert.equal(aChanges[0].changeSpecificData.content.value, true, "Value is set to true");
		simulateAddItem(aTarget, data.changedState[aChanges[0].changeSpecificData.content.index], aChanges[0].changeSpecificData.content.index);

		assert.deepEqual(aTarget, data.changedState);
	});

	QUnit.test("check 'mixInfoAndState' has 'isRedundant' property", function(assert){
		// arrange
		const oHelper = this.initHelper();

		// act
		const aResult = this.oSelectionController.mixInfoAndState(oHelper);

		// assert
		assert.equal(aResult.items.length, oHelper.getProperties().length, "All properties are returned");
		assert.equal(aResult.items.filter((oItem) => "isRedundant" in oItem).length, oHelper.getProperties().length, "All properties have isRedundant property");
	});

	QUnit.test("check 'prepareAdaptationData' has 'isRedundant' property", function(assert){
		// arrange
		const oHelper = this.initHelper();

		const oSpy = sinon.spy(oHelper, "getRedundantProperties");

		// act
		const aResult = this.oSelectionController.prepareAdaptationData(oHelper);

		// assert
		assert.equal(aResult.items.length, oHelper.getProperties().length, "All properties are returned");
		assert.equal(aResult.items.filter((oItem) => "isRedundant" in oItem).length, oHelper.getProperties().length, "All properties have isRedundant property");
		assert.ok(oSpy.called, "getRedundantProperties is called");
	});

	QUnit.module("FlexUtil API 'getPropertySetterchanges' tests",{
		initHelper: function() {

			var oHelper = new MetadataHelper([
				{key: "fieldA", label: "Field A"},
				{key: "fieldB", label: "Field B"},
				{key: "fieldC", label: "Field C"}
			]);

			return oHelper;
		},
        beforeEach: function() {
			this.oTestControl = new Control();
			this.oSelectionController = new SelectionController({
				control: new Control(),
				targetAggregation: "dependents"
			});
        }
	});

	QUnit.test("Check 'getPropertySetterChanges' delta determination (no changes for same value)", function(assert){
		var aSetChanges = this.oSelectionController.getPropertySetterChanges({
			operation: "setSomeProperty",
			control: new Control(),
			deltaAttribute: "someProperty",
			existingState: [
				{name: "a", someProperty: "foo"}
			],
			changedState: [
				{name: "a", someProperty: "foo"}
			]
		});

		assert.equal(aSetChanges.length, 0, "No changes created as the value is the same");
	});

	QUnit.test("Check 'getPropertySetterChanges' (changes for new values)", function(assert){
		var aSetChanges = this.oSelectionController.getPropertySetterChanges({
			operation: "setSomeProperty",
			control: new Control(),
			deltaAttribute: "someProperty",
			existingState: [
				{name: "a"}
			],
			changedState: [
				{name: "a", someProperty: "foo"}
			]
		});

		assert.equal(aSetChanges.length, 1, "One change created as the value is added");
	});

	QUnit.test("Check 'getPropertySetterChanges' (changes for different values)", function(assert){
		var aSetChanges = this.oSelectionController.getPropertySetterChanges({
			operation: "setSomeProperty",
			control: new Control(),
			deltaAttribute: "someProperty",
			existingState: [
				{name: "a", someProperty: "foo"}
			],
			changedState: [
				{name: "a", someProperty: "bar"}
			]
		});

		assert.equal(aSetChanges.length, 1, "One change created as the value is changed");
	});

	QUnit.test("Check 'getKeyForItem' execution", function(assert){

		const oControl1 =  new Control("TestControl_1");
		const oControl2 =  new Control("TestControl_2");

		const oSelectionController = new SelectionController({
			control: new Control({
				dependents: [
					oControl1,
					oControl2
				]
			}),
			targetAggregation: "dependents",
			getKeyForItem: function(oItem) {
				return oItem.getId() + "_test";
			}
		});

		const aCurrentState = oSelectionController.getCurrentState();

		assert.equal(aCurrentState.length, 2, "Two items are returned");
		assert.equal(aCurrentState[0].key, "TestControl_1_test", "Correct key is returned");
		assert.equal(aCurrentState[1].key, "TestControl_2_test", "Correct key is returned");
		oControl1.destroy();
		oControl2.destroy();
	});

	QUnit.test("Check 'getKeyForItem' execution", function(assert){

		const oControl1 =  new Control("TestControl_1");
		const oControl2 =  new Control("TestControl_2");

		const oSelectionController = new SelectionController({
			control: new Control({
				dependents: [
					oControl1,
					oControl2
				]
			}),
			targetAggregation: "dependents",
			getKeyForItem: function(oItem) {
				return oItem.getId() + "_test";
			}
		});

		const aPresentState = oSelectionController._calcPresentState();
		assert.equal(aPresentState.length, 2, "Two items are returned");
		assert.equal(aPresentState[0].key, "TestControl_1_test", "Correct key is returned");
		assert.equal(aPresentState[1].key, "TestControl_2_test", "Correct key is returned");

		oSelectionController.getAdaptationControl().removeAllDependents();

		assert.equal(oSelectionController._calcPresentState().length, 0, "No items are returned");

		oSelectionController.getAdaptationControl().addDependent(oControl1);

		assert.equal(oSelectionController._calcPresentState().length, 1, "One item is returned");
		assert.equal(oSelectionController._calcPresentState()[0].key, "TestControl_1_test", "Correct key is returned");

		oControl1.destroy();
		oControl2.destroy();
	});
});