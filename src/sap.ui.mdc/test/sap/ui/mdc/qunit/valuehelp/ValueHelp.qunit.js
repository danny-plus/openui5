// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelp",
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/base/Container",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/ValueHelpPropagationReason",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/core/Icon",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/Device"
],  (
		ValueHelp,
		ValueHelpDelegate,
		Container,
		Condition,
		ConditionValidated,
		FieldDisplay,
		OperatorName,
		ValueHelpPropagationReason,
		ValueHelpSelectionType,
		Icon,
		FormatException,
		ParseException,
		nextUIUpdate,
		Device
	) => {
	"use strict";

	let oValueHelp;
	let oContainer;
//	var iPopoverDuration = 355;
	let oField;
	let oField2;
	let iDisconnect = 0;
	let iSelect = 0;
	let aSelectConditions;
	let bSelectAdd;
	let bSelectClose;

	const _myDisconnectHandler = (oEvent) => {
		iDisconnect++;
	};

	const _mySelectHandler = (oEvent) => {
		iSelect++;
		aSelectConditions = oEvent.getParameter("conditions");
		bSelectAdd = oEvent.getParameter("add");
		bSelectClose = oEvent.getParameter("close");
	};

	const _fPressHandler = (oEvent) => {}; // just dummy handler to make Icon focusable

	let iNavigate = 0;
	let oNavigateCondition;
	let sNavigateItemId;
	let bNavigateLeaveFocus;
	let bNavigateCaseSensitive;
	const _myNavigateHandler = (oEvent) => {
		iNavigate++;
		oNavigateCondition = oEvent.getParameter("condition");
		sNavigateItemId = oEvent.getParameter("itemId");
		bNavigateLeaveFocus = oEvent.getParameter("leaveFocus");
		bNavigateCaseSensitive = oEvent.getParameter("caseSensitive");
	};

	let iTypeaheadSuggested = 0;
	let oTypeaheadCondition;
	let sTypeaheadFilterValue;
	let sTypeaheadItemId;
	let iTypeaheadItems;
	let bTypeaheadCaseSensitive;
	const _myTypeaheadHandler = (oEvent) => {
		iTypeaheadSuggested++;
		oTypeaheadCondition = oEvent.getParameter("condition");
		sTypeaheadFilterValue = oEvent.getParameter("filterValue");
		sTypeaheadItemId = oEvent.getParameter("itemId");
		iTypeaheadItems = oEvent.getParameter("items");
		bTypeaheadCaseSensitive = oEvent.getParameter("caseSensitive");
	};

	let iVisualFocusSet = 0;
	const _myVisualFocusSetHandler = (oEvent) => {
		iVisualFocusSet++;
	};

	let iClosed = 0;
	const _myClosedHandler = (oEvent) => {
		iClosed++;
	};

	let oModel;

	/* use dummy control to simulate Field */

//	var oClock;
	const _initFields = async () => {
		oField = new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		oField2 = new Icon("I2", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});

		oField.placeAt("content");
		oField2.placeAt("content");
		await nextUIUpdate();
		oField.focus();
//		oClock = sinon.useFakeTimers();
	};

	const _teardown = () => {
//		if (oClock) {
//			oClock.restore();
//			oClock = undefined;
//		}
		oValueHelp.destroy();
		oValueHelp = undefined;
		oContainer = undefined;
		oField.destroy();
		oField = undefined;
		oField2.destroy();
		oField2 = undefined;
		iDisconnect = 0;
		iSelect = 0;
		aSelectConditions = undefined;
		bSelectAdd = undefined;
		bSelectClose = undefined;
		iNavigate = 0;
		oNavigateCondition = undefined;
		sNavigateItemId = undefined;
		bNavigateLeaveFocus = undefined;
		bNavigateCaseSensitive = undefined;
		iTypeaheadSuggested = 0;
		oTypeaheadCondition = undefined;
		sTypeaheadFilterValue = undefined;
		sTypeaheadItemId = undefined;
		iTypeaheadItems = undefined;
		bTypeaheadCaseSensitive = undefined;
		iVisualFocusSet = 0;
		iClosed = 0;
		if (oModel) {
			oModel.destroy();
			oModel = undefined;
		}
	};

	QUnit.module("basic features", {
		beforeEach: async () => {
			oValueHelp = new ValueHelp("F1-H", {
				disconnect: _myDisconnectHandler
			});
			await _initFields();
		},
		afterEach: _teardown
	});

	QUnit.test("default values", async (assert) => {

		assert.equal(oValueHelp.getConditions().length, 0, "Conditions");
		assert.equal(oValueHelp.getFilterValue(), "", "FilterValue");

		/**
	 	 *  @deprecated As of version 1.137
	 	 */
		assert.notOk(await oValueHelp.shouldOpenOnClick(), "shouldOpenOnClick");
		/**
	 	 *  @deprecated As of version 1.137
	 	 */
		assert.notOk(await oValueHelp.shouldOpenOnFocus(), "shouldOpenOnFocus");

		assert.notOk(oValueHelp.isFocusInHelp(), "isFocusInHelp");

	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("isTypeaheadSupported", (assert) => {

		const oPromise = oValueHelp.isTypeaheadSupported();
		assert.ok(oPromise instanceof Promise, "isTypeaheadSupported returns promise");

		return oPromise?.then((bSupported) => {
			assert.strictEqual(bSupported, false, "TypeAhead not supported per default");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

	QUnit.test("getIcon", (assert) => {

		assert.notOk(oValueHelp.getIcon(), "without Container no icon returned");

	});

	QUnit.test("isValidationSupported", (assert) => {

		assert.notOk(oValueHelp.isValidationSupported(), "without Typeahed Container not supported");

	});

	QUnit.test("connect", async (assert) => {

		oField.setFieldGroupIds(["myFieldGroup"]);
		oField2.setFieldGroupIds(["myFieldGroup2"]);
		sinon.spy(ValueHelpDelegate, "onControlConnect");

		oValueHelp.connect(oField, {test: "X"});
		await new Promise((resolve) => {setTimeout(resolve,0);});
		assert.ok(ValueHelpDelegate.onControlConnect.calledOnce, "ValueHelpDelegate.onControlConnect called");

		assert.equal(iDisconnect, 0, "Disconnect not fired");
		assert.deepEqual(oValueHelp.getProperty("_config"), {test: "X"}, "Config stored");
		assert.equal(oValueHelp._oControl, oField, "Field internally stored");
		assert.deepEqual(oValueHelp._getFieldGroupIds(), ["myFieldGroup"], "FieldGroupIDs of Field used"); // as _getFieldGroupIds is used in UIArea to determine current FieldGroup

		oValueHelp.setConditions([Condition.createItemCondition("1", "Test")]);
		oValueHelp.setFilterValue("A");

		oValueHelp.connect(oField2, {test: "Y"});
		await new Promise((resolve) => {setTimeout(resolve,0);});
		assert.ok(ValueHelpDelegate.onControlConnect.calledTwice, "ValueHelpDelegate.onControlConnect called twice");

		assert.equal(iDisconnect, 1, "Disconnect fired");
		assert.equal(oValueHelp.getConditions().length, 0, "Conditions");
		assert.equal(oValueHelp.getFilterValue(), "", "FilterValue");
		assert.deepEqual(oValueHelp.getProperty("_config"), {test: "Y"}, "Config stored");
		assert.equal(oValueHelp._oControl, oField2, "Field internally stored");
		assert.deepEqual(oValueHelp._getFieldGroupIds(), ["myFieldGroup2"], "FieldGroupIDs of Field used"); // as _getFieldGroupIds is used in UIArea to determine current FieldGroup

		ValueHelpDelegate.onControlConnect.restore();

	});

	QUnit.test("getAriaAttributes", (assert) => {

		const oCheckAttributes = {
			contentId: undefined,
			ariaHasPopup: null,
			role: null,
			roleDescription: null,
			valueHelpEnabled: false,
			autocomplete: null
		};
		const oAttributes = oValueHelp.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("getControl", (assert) => {

		oValueHelp.connect(oField);
		const oMyField = oValueHelp.getControl();
		assert.equal(oMyField.getId(), "I1", "field using connect");

	});

	QUnit.test("getDisplay", (assert) => {

		assert.equal(oValueHelp.getDisplay(), FieldDisplay.Value, "Default");

		oValueHelp.setProperty("_config", {display: FieldDisplay.Description});
		assert.equal(oValueHelp.getDisplay(), FieldDisplay.Description, "from Config");

	});

	QUnit.test("onControlChange", (assert) => {

		return oValueHelp._getControlDelegatePromise().then((oDelegate) => {
			oValueHelp.connect(oField);
			sinon.spy(oDelegate, "onConditionPropagation");
			sinon.spy(oValueHelp, "setBindingContext");

			oValueHelp.onControlChange();
			assert.ok(oDelegate.onConditionPropagation.calledWith(oValueHelp, ValueHelpPropagationReason.ControlChange), "ValueHelpDelegate.onConditionPropagation called");
			assert.ok(oValueHelp.setBindingContext.calledOnce, "oValueHelp.setBindingContext called");
			oDelegate.onConditionPropagation.restore();
		});

	});


	QUnit.module("with Typeahed", {
		beforeEach: async () => {
			oContainer = new Container("C1", {
				title: "Test"
			});
			oValueHelp = new ValueHelp("F1-H", {
				typeahead: oContainer,
				delegate: {name: "sap/ui/mdc/ValueHelpDelegate", payload: {x: "X"}},
				disconnect: _myDisconnectHandler,
				navigated: _myNavigateHandler,
				visualFocusSet: _myVisualFocusSetHandler,
				typeaheadSuggested: _myTypeaheadHandler,
				select: _mySelectHandler,
				closed: _myClosedHandler
			});
			await _initFields();
		},
		afterEach: _teardown
	});

	QUnit.test("connect", (assert) => {

		oField.setFieldGroupIds(["myFieldGroup"]);
		oField2.setFieldGroupIds(["myFieldGroup2"]);
		sinon.spy(oContainer, "onConnectionChange");
		oValueHelp.connect(oField, {test: "X"});
		oValueHelp.connect(oField2, {test: "Y"});
		assert.ok(oContainer.onConnectionChange.calledOnce, "onConnectionChange called for Container");
		assert.deepEqual(oContainer._getFieldGroupIds(), ["myFieldGroup2"], "FieldGroupIDs of Field used"); // as _getFieldGroupIds is used in UIArea to determine current FieldGroup

	});

	QUnit.test("open", (assert) => {

		sinon.spy(oContainer, "open");
		sinon.spy(ValueHelpDelegate, "retrieveContent");
		sinon.spy(oValueHelp, "fireOpen");
		sinon.spy(oValueHelp, "fireOpened");


		const fnDone = assert.async();
		oValueHelp.connect(oField); // to attach events
		oValueHelp.open(false); //-> check nothing happens
		assert.notOk(oContainer.open.called, "Container open not called for Dialog opening");

		oValueHelp.open(true);
		assert.ok(oValueHelp.fireOpen.called, "ValueHelp open event fired for typeahead opening");
		assert.equal(oValueHelp.fireOpen.lastCall.args[0].container, oContainer, "ValueHelp open event carries correct container");

		setTimeout(() => { // Delegate is called async
			assert.ok(oContainer.open.calledOnce, "Container open called for typeahead opening");
			assert.equal(oContainer.open.lastCall.args[1], true, "Container open called with bTypeahead");
			assert.ok(ValueHelpDelegate.retrieveContent.called, "ValueHelpDelegate.retrieveContent called for typeahead opening");
			oContainer.fireOpened({itemId: "MyItem", items: 3, focused: true});
			assert.ok(oValueHelp.fireOpened.called, "ValueHelp opened event fired for typeahead opening");
			assert.equal(oValueHelp.fireOpened.lastCall.args[0].container, oContainer, "ValueHelp opened event carries correct container");
			assert.equal(oValueHelp.fireOpened.lastCall.args[0].itemId, "MyItem", "ValueHelp opened event carries itemId");
			assert.equal(oValueHelp.fireOpened.lastCall.args[0].items, 3, "ValueHelp opened event carries items");

			ValueHelpDelegate.retrieveContent.restore();
			oValueHelp.fireOpen.restore();
			oValueHelp.fireOpened.restore();
			fnDone();
		}, 0);

	});

	QUnit.test("do not close open/opening containers if they are the same instance", (assert) => {
		sinon.spy(oContainer, "open");
		sinon.spy(oContainer, "close");
		sinon.stub(oContainer, "getUseAsValueHelp").returns(true);
		oValueHelp.open(false);
		assert.ok(oContainer.open.called, "Container open called for dialog opening");
		sinon.stub(oContainer, "isOpen").returns(true);
		oValueHelp.open(false);
		assert.notOk(oContainer.close.called, "Container close was not called for already open container");
	});

	QUnit.test("close", (assert) => {

		sinon.spy(oContainer, "close");

		oValueHelp.close();
		assert.notOk(oContainer.close.called, "Container close not called if not open");

		sinon.stub(oContainer, "isOpen").returns(true);
		oValueHelp.close();
		assert.ok(oContainer.close.called, "Container close called if open");
	});

	QUnit.test("close handling", (assert) => {

		oValueHelp.connect(oField); // to attach events
		sinon.spy(oValueHelp, "close");
		oContainer.handleClose();
		oContainer.handleClosed(); // TODO: change to event?
		assert.equal(iClosed, 1, "Close event fired");

	});

	QUnit.test("toggleOpen", (assert) => {

		sinon.spy(oValueHelp, "open");
		sinon.spy(oValueHelp, "close");

		oValueHelp.toggleOpen(false);
		assert.notOk(oValueHelp.open.called, "ValueHelp open not called for Dialog opening");

		oValueHelp.toggleOpen(true);
		assert.ok(oValueHelp.open.calledWith(true), "ValueHelp open called for typeahead opening");

		sinon.stub(oContainer, "isOpen").returns(true);
		oValueHelp.toggleOpen(true);
		assert.ok(oValueHelp.close.called, "ValueHelp close called if open for typeahead");

		oValueHelp.close.reset();
		oValueHelp.toggleOpen(false);
		assert.notOk(oValueHelp.close.called, "ValueHelp close not called if open for dialog but no dialog exist");

		sinon.stub(oContainer, "getUseAsValueHelp").returns(true);
		oValueHelp.close.reset();
		oValueHelp.toggleOpen(false);
		assert.ok(oValueHelp.close.called, "ValueHelp close called if open for dialog and Typeahed used as valueHelp");

	});

	QUnit.test("isOpen", (assert) => {

		assert.notOk(oValueHelp.isOpen(), "ValueHelp not open per default");

		sinon.stub(oContainer, "isOpen").returns(true);
		assert.ok(oValueHelp.isOpen(), "ValueHelp open if Container open");

	});

	QUnit.test("skipOpening", (assert) => {

		sinon.spy(oContainer, "close");
		oValueHelp.skipOpening();
		assert.notOk(oContainer.close.called, "Container close not called");

		sinon.stub(oContainer, "isOpening").returns(true);
		oValueHelp.skipOpening();
		assert.ok(oContainer.close.called, "Container close called");

	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("isTypeaheadSupported - not supported(default)", (assert) => {

		sinon.spy(ValueHelpDelegate, "retrieveContent");
		const oPromise = oValueHelp.isTypeaheadSupported();
		assert.ok(oPromise instanceof Promise, "isTypeaheadSupported returns promise");

		return oPromise?.then((bSupported) => {
			assert.strictEqual(bSupported, false, "TypeAhead not supported");
			assert.ok(ValueHelpDelegate.retrieveContent.called, "ValueHelpDelegate.retrieveContent called to check if search supported");
			ValueHelpDelegate.retrieveContent.restore();
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
			ValueHelpDelegate.retrieveContent.restore();
		});

	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("isTypeaheadSupported - supported", (assert) => {

		sinon.spy(ValueHelpDelegate, "retrieveContent");
		sinon.stub(oContainer, "isTypeaheadSupported").returns(true);
		const oPromise = oValueHelp.isTypeaheadSupported();
		assert.ok(oPromise instanceof Promise, "isTypeaheadSupported returns promise");

		return oPromise?.then((bSupported) => {
			assert.strictEqual(bSupported, true, "TypeAhead supported");
			assert.ok(ValueHelpDelegate.retrieveContent.called, "ValueHelpDelegate.retrieveContent called to check if search supported");
			ValueHelpDelegate.retrieveContent.restore();
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
			ValueHelpDelegate.retrieveContent.restore();
		});

	});

	QUnit.test("getItemForValue with result", (assert) => {

		sinon.stub(oContainer, "getItemForValue").returns(Promise.resolve({key: "X", description: "Text"}));
		const oConfig = {
				parsedValue: "A",
				value: "a",
				bindingContext: "BC",
				checkKey: true,
				checkDescription: true,
				exception: ParseException
		};
		const oCheckConfig = {
				parsedValue: "A",
				value: "a",
				bindingContext: "BC",
				checkKey: true,
				checkDescription: true,
				exception: ParseException,
				caseSensitive: false
		};
		const oPromise = oValueHelp.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.ok(true, "Promise Then must be called");
			assert.ok(oContainer.getItemForValue.calledWith(oCheckConfig), "getItemForValue called on Container with Config");
			assert.deepEqual(oItem, {key: "X", description: "Text"}, "Item returned");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

	QUnit.test("getItemForValue with error", (assert) => {

		sinon.stub(oContainer, "getItemForValue").returns(Promise.reject(new ParseException("Error")));
		const oConfig = {
				parsedValue: "A",
				value: "a",
				inParameters: null,
				outParameters: null,
				bindingContext: "BC",
				checkKey: true,
				checkDescription: true,
				exception: ParseException
		};
		const oPromise = oValueHelp.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise?.then((oItem) => {
			assert.notOk(true, "Promise Then must not be called");
		}).catch((oError) => {
			assert.ok(true, "Promise Catch called");
			assert.ok(oError instanceof ParseException, "Exception returned");
			assert.equal(oError.message, "Error", "Error text");
		});

	});

	QUnit.test("getIcon", (assert) => {

		sinon.stub(oContainer, "getValueHelpIcon").returns("X");
		const sIcon = oValueHelp.getIcon();
		assert.ok(oContainer.getValueHelpIcon(), "Container getValueHelpIcon called");
		assert.equal(sIcon, "X", "Icon of Container returned");

	});

	QUnit.test("isValidationSupported", (assert) => {

		sinon.stub(oContainer, "isValidationSupported").returns(true);
		assert.ok(oValueHelp.isValidationSupported(), "Typeahed result returned");
		assert.ok(oContainer.isValidationSupported.called, "Container.isValidationSupported called");

	});

	QUnit.test("getDomRef", (assert) => {

		sinon.stub(oContainer, "getDomRef").returns(oField.getDomRef()); // just fake
		let oDomRef = oValueHelp.getDomRef();
		assert.notOk(oContainer.getDomRef.called, "Container getDomRef not called if closed");
		assert.notOk(oDomRef, "no DomRef returned if closed");

		sinon.stub(oContainer, "isOpening").returns(true);
		oDomRef = oValueHelp.getDomRef();
		assert.ok(oContainer.getDomRef.called, "Container getDomRef called");
		assert.equal(oDomRef, oField.getDomRef(), "DomRef returned if opening");
		oContainer.isOpening.reset();

		sinon.stub(oContainer, "isOpen").returns(true);
		oDomRef = oValueHelp.getDomRef();
		assert.ok(oContainer.getDomRef.called, "Container getDomRef called");
		assert.equal(oDomRef, oField.getDomRef(), "DomRef returned if open");
		oContainer.isOpen.reset();

		oContainer.getDomRef.reset();

	});

	QUnit.test("getAriaAttributes", (assert) => {

		const oCheckAttributes = {
			contentId: undefined,
			ariaHasPopup: "listbox",
			role: "combobox",
			roleDescription: null,
			valueHelpEnabled: false,
			autocomplete: "none"
		};
		let oAttributes = oValueHelp.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes on closed typeahead");

		oCheckAttributes.contentId = null; // will only be set by content
		sinon.stub(oContainer, "isOpen").returns(true);
		oAttributes = oValueHelp.getAriaAttributes();
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes on open typeahead");

		sinon.stub(oContainer, "getUseAsValueHelp").returns(true);
		oAttributes = oValueHelp.getAriaAttributes();
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes on open typeahead used as dialog");

	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("shouldOpenOnFocus", async (assert) => {

		sinon.stub(oContainer, "shouldOpenOnFocus").returns(Promise.resolve(true));
		let bShouldOpen = await oValueHelp.shouldOpenOnFocus();
		assert.notOk(bShouldOpen, "if only typeahed no opening on focus");

		sinon.stub(oContainer, "getUseAsValueHelp").returns(true);
		bShouldOpen = await oValueHelp.shouldOpenOnFocus();
		assert.ok(bShouldOpen, "returns value of container (true) if used as valueHelp");

		oContainer.shouldOpenOnFocus.returns(Promise.resolve(false));
		bShouldOpen = await oValueHelp.shouldOpenOnFocus();
		assert.notOk(bShouldOpen, "returns value of container (false) if used as valueHelp");

	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("shouldOpenOnClick", async (assert) => {

		sinon.stub(oContainer, "shouldOpenOnClick").returns(Promise.resolve(true));
		let bShouldOpen = await oValueHelp.shouldOpenOnClick();
		assert.notOk(bShouldOpen, "if only typeahed no opening on click");

		sinon.stub(oContainer, "getUseAsValueHelp").returns(true);
		bShouldOpen = await oValueHelp.shouldOpenOnClick();
		assert.ok(bShouldOpen, "returns value of container if used as valueHelp");

	});

	QUnit.test("isFocusInHelp", (assert) => {

		sinon.stub(oContainer, "isFocusInHelp").returns(true);
		assert.notOk(oValueHelp.isFocusInHelp(), "focus stays in field in TypeAhead");

		sinon.stub(oContainer, "getUseAsValueHelp").returns(true);
		assert.ok(oValueHelp.isFocusInHelp(), "returns value of container if used as valueHelp");

	});

	QUnit.test("removeVisualFocus", (assert) => {

		sinon.spy(oContainer, "removeVisualFocus");
		oValueHelp.removeVisualFocus();
		assert.ok(oContainer.removeVisualFocus.called, "Container.removeVisualFocus called");

	});

	QUnit.test("setVisualFocus", (assert) => {

		sinon.spy(oContainer, "setVisualFocus");
		oValueHelp.setVisualFocus();
		assert.ok(oContainer.setVisualFocus.called, "Container.setVisualFocus called");

	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("navigate", (assert) => {

		oValueHelp.connect(oField); // to attach events
		sinon.spy(oContainer, "navigate");
		sinon.spy(oContainer, "open");
		oValueHelp.navigate(1);

		const fnDone = assert.async();
		setTimeout(() => { // as Promise used inside
			assert.ok(oContainer.navigate.calledWith(1), "Container.navigate called");
			assert.notOk(oContainer.open.called, "Container not opened");
			fnDone();
		}, 0);

	});

	QUnit.test("navigated event", (assert) => {

		oValueHelp.connect(oField); // to attach events
		const oCondition = Condition.createItemCondition("Test");
		oContainer.fireNavigated({condition: oCondition, itemId: "I1", leaveFocus: true, caseSensitive: true});

		assert.equal(iNavigate, 1, "Navigated Event fired");
		assert.deepEqual(oNavigateCondition, oCondition, "Navigated condition");
		assert.equal(sNavigateItemId, "I1", "Navigated itemId");
		assert.ok(bNavigateLeaveFocus, "Navigated leaveFocus");
		assert.ok(bNavigateCaseSensitive, "Navigated caseSensitive");

	});

	QUnit.test("typeahedSuggested event", (assert) => {

		oValueHelp.connect(oField); // to attach events
		const oCondition = Condition.createItemCondition("kéy", "Description");
		oContainer.fireTypeaheadSuggested({condition: oCondition, filterValue: "k", itemId: "I1", items: 3, caseSensitive: true});

		assert.equal(iTypeaheadSuggested, 1, "TypeahedSuggested Event fired");
		assert.deepEqual(oTypeaheadCondition, oCondition, "Typeahead condition");
		assert.equal(sTypeaheadFilterValue, "k", "Typeahead filterValue");
		assert.equal(sTypeaheadItemId, "I1", "Typeahead itemId");
		assert.equal(iTypeaheadItems, 3, "Typeahead items");
		assert.equal(bTypeaheadCaseSensitive, true, "Typeahead caseSensitive");

	});

	QUnit.test("visualFocusSet event", (assert) => {

		oValueHelp.connect(oField); // to attach events
		oContainer.fireVisualFocusSet();
		assert.equal(iVisualFocusSet, 1, "visualFocusSet event fired");

	});

	QUnit.test("isNavigationEnabled", (assert) => {

		sinon.stub(oContainer, "isNavigationEnabled").returns("X"); // "X" - just for testing return value
		assert.equal(oValueHelp.isNavigationEnabled(1), "X", "Navigation if closed and no dialog: Result of Container returned");
		assert.ok(oContainer.isNavigationEnabled.calledWith(1), "isNavigationEnabled of Container called with step");
		sinon.stub(oContainer, "isOpen").returns(true);
		assert.equal(oValueHelp.isNavigationEnabled(2), "X", "Navigation if open and no dialog: Result of Container returned");
		assert.ok(oContainer.isNavigationEnabled.calledWith(2), "isNavigationEnabled of Container called with step");
		sinon.stub(oValueHelp, "getDialog").returns(true);
		oContainer.isOpen.returns(false);
		assert.notOk(oValueHelp.isNavigationEnabled(3), "Navigation if closed and Dialog: disabled");
		assert.notOk(oContainer.isNavigationEnabled.calledWith(3), "isNavigationEnabled of Container not called with step");
		oContainer.isOpen.returns(true);
		assert.ok(oValueHelp.isNavigationEnabled(4), "Navigation if open and dialog: Result of Container returned");
		assert.ok(oContainer.isNavigationEnabled.calledWith(4), "isNavigationEnabled of Container called with step");
		oValueHelp.getDialog.restore();

	});

	QUnit.test("Selection handling", (assert) => {

		return oValueHelp.initControlDelegate().then(() => {
			oValueHelp.connect(oField); // to attach events
			// set
			let aSelectConditions = [
				Condition.createCondition(OperatorName.EQ, ["X"]),
				Condition.createCondition(OperatorName.BT, ["A", "C"])
			];
			oContainer.fireSelect({type: ValueHelpSelectionType.Set, conditions: aSelectConditions});
			let aConditions = oValueHelp.getConditions();
			assert.deepEqual(aConditions, aSelectConditions, "Set: Selected condtions set on ValueHelp");

			// add
			aSelectConditions = [
					Condition.createCondition(OperatorName.EQ, ["X"]),
					Condition.createCondition(OperatorName.EQ, ["Y"])
					];
			oContainer.fireSelect({type: ValueHelpSelectionType.Add, conditions: aSelectConditions});
			let aCheckConditions = [
					Condition.createCondition(OperatorName.EQ, ["X"]),
					Condition.createCondition(OperatorName.BT, ["A", "C"]),
					Condition.createCondition(OperatorName.EQ, ["Y"])
					];
			aConditions = oValueHelp.getConditions();
			assert.deepEqual(aConditions, aCheckConditions, "Add: Conditions added");

			// remove
			aSelectConditions = [
					Condition.createCondition(OperatorName.EQ, ["X"])
					];
			oContainer.fireSelect({type: ValueHelpSelectionType.Remove, conditions: aSelectConditions});
			aCheckConditions = [
					Condition.createCondition(OperatorName.BT, ["A", "C"]),
					Condition.createCondition(OperatorName.EQ, ["Y"])
					];
			aConditions = oValueHelp.getConditions();
			assert.deepEqual(aConditions, aCheckConditions, "Remove: Condition removed");

			// singleSelection
			oValueHelp.setConditions([]);
			oValueHelp.setProperty("_config", {maxConditions: 1});

			aSelectConditions = [
					Condition.createCondition(OperatorName.EQ, ["X"]),
					Condition.createCondition(OperatorName.EQ, ["Y"])
					];
			oContainer.fireSelect({type: ValueHelpSelectionType.Add, conditions: aSelectConditions});
			aCheckConditions = [
					Condition.createCondition(OperatorName.EQ, ["X"])
					];
			aConditions = oValueHelp.getConditions();
			assert.deepEqual(aConditions, aCheckConditions, "SingleSelect - Add: Only first condition taken");

			oContainer.fireSelect({type: ValueHelpSelectionType.Remove, conditions: []});
			aConditions = oValueHelp.getConditions();
			assert.deepEqual(aConditions, [], "SingleSelect - Remove: Condition removed");
		});
	});

	QUnit.test("Confirmation handling", (assert) => {

		sinon.spy(oValueHelp, "close");
		const aConditions = [
						   Condition.createCondition(OperatorName.EQ, ["X", "X"], undefined, undefined, ConditionValidated.Validated),
						   Condition.createCondition(OperatorName.BT, ["A", "C"], undefined, undefined, ConditionValidated.NotValidated),
						   {operator: OperatorName.EQ, values: [], isEmpty: true, validated: ConditionValidated.NotValidated},
						   {operator: OperatorName.EQ, values: [1, undefined], isInitial: true, validated: ConditionValidated.NotValidated, isEmpty: null}
						   ];
		const aCheckConditions = [
						   Condition.createCondition(OperatorName.EQ, ["X", "X"], undefined, undefined, ConditionValidated.Validated),
						   Condition.createCondition(OperatorName.BT, ["A", "C"], undefined, undefined, ConditionValidated.NotValidated),
						   Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.NotValidated)
						   ];

		return oValueHelp.initControlDelegate().then(() => {
			oValueHelp.connect(oField); // to attach events
			oValueHelp.setConditions(aConditions);
			oContainer.fireConfirm({});
			assert.equal(iSelect, 1, "Select event fired");
			assert.deepEqual(aSelectConditions, aCheckConditions, "conditions");
			assert.ok(bSelectAdd, "'add' property");
			assert.notOk(bSelectClose, "'close' property");
			assert.notOk(oValueHelp.close.called, "ValueHelp close not called");

			sinon.stub(oContainer, "isMultiSelect").returns(true);
			oContainer.fireConfirm({close: true});
			assert.equal(iSelect, 2, "Select event fired");
			assert.deepEqual(aSelectConditions, aCheckConditions, "conditions");
			assert.notOk(bSelectAdd, "'add' property");
			assert.ok(bSelectClose, "'close' property");
			assert.ok(oValueHelp.close.called, "ValueHelp close called");
			oValueHelp.close.reset();

			// single-select
			oContainer.isMultiSelect.restore();
			oValueHelp.setProperty("_config", {maxConditions: 1});
			oContainer.fireConfirm({});
			assert.equal(iSelect, 3, "Select event fired");
			assert.deepEqual(aSelectConditions, aCheckConditions, "conditions");
			assert.notOk(bSelectAdd, "'add' property");
			assert.ok(bSelectClose, "'close' property");
			assert.ok(oValueHelp.close.called, "ValueHelp close called");

			// no event is state is invalid
			oValueHelp.setProperty("_valid", false);
			oContainer.fireConfirm({});
			assert.equal(iSelect, 3, "Select event not fired");
		});
	});

	QUnit.test("Cancelling handling", (assert) => {

		oValueHelp.connect(oField); // to attach events
		sinon.spy(oValueHelp, "close");
		oContainer.fireCancel({});
		assert.ok(oValueHelp.close.called, "ValueHelp close called");

	});

	QUnit.test("RequestDelegateContent event", (assert) => {

		oValueHelp.connect(oField); // to attach events
		sinon.spy(ValueHelpDelegate, "retrieveContent");
		oContainer.fireRequestDelegateContent({container: oContainer});

		const fnDone = assert.async();
		setTimeout(() => { // Delegate is called async
			assert.ok(ValueHelpDelegate.retrieveContent.calledWith(oValueHelp, oContainer), "ValueHelpDelegate.retrieveContent called for typeahead");

			ValueHelpDelegate.retrieveContent.restore();
			fnDone();
		}, 0);

	});

	QUnit.test("SwitchToValueHelp event", (assert) => {

		let bFired = false;
		oValueHelp.attachSwitchToValueHelp((oEvent) => {
			bFired = true;
		});

		oValueHelp.connect(oField); // to attach events
		oContainer.fireRequestSwitchToDialog({container: oContainer});
		assert.ok(bFired, "Event fired");

	});

	function _testClonedTypeahead(assert) {

		const oClone = oValueHelp.clone("MyClone");
		const oCloneContainer = oClone.getTypeahead();

		assert.ok(oCloneContainer, "Typeahead cloned");

		// events of clone must not be handled by original
		sinon.spy(oValueHelp, "close");
		sinon.spy(oValueHelp, "fireOpened");
		sinon.spy(oValueHelp, "fireClosed");
		sinon.spy(oValueHelp, "fireSelect");
		sinon.spy(oValueHelp, "fireSwitchToValueHelp");
		sinon.spy(oValueHelp, "fireNavigated");
		sinon.spy(oValueHelp, "fireVisualFocusSet");
		sinon.spy(oValueHelp, "fireTypeaheadSuggested");
		return Promise.all([oValueHelp.initControlDelegate(), oClone.initControlDelegate()]).then(() => {
			if (!oValueHelp.getControl()) {
				oValueHelp.connect(oField); // to attach events
			}
			oClone.connect(oField2); // to attach events
			const aSelectConditions = [
				Condition.createCondition(OperatorName.EQ, ["X"])
			];
			oCloneContainer.fireSelect({type: ValueHelpSelectionType.Set, conditions: aSelectConditions});
			const aConditions = oValueHelp.getConditions();
			assert.equal(aConditions.length, 0, "Select");
			oCloneContainer.fireConfirm();
			assert.notOk(oValueHelp.fireSelect.called, "Confirm");
			oCloneContainer.fireCancel({});
			assert.notOk(oValueHelp.close.called, "Cancel");
			oCloneContainer.fireOpened({});
			assert.notOk(oValueHelp.fireOpened.called, "Opened");
			oCloneContainer.fireClosed();
			assert.notOk(oValueHelp.fireClosed.called, "Closed");
			oCloneContainer.fireRequestSwitchToDialog();
			assert.notOk(oValueHelp.fireSwitchToValueHelp.called, "RequestSwitchToDialog");
			oCloneContainer.fireNavigated();
			assert.notOk(oValueHelp.fireNavigated.called, "Navigated");
			oCloneContainer.fireVisualFocusSet();
			assert.notOk(oValueHelp.fireVisualFocusSet.called, "VisualFocusSet");
			oCloneContainer.fireTypeaheadSuggested();
			assert.notOk(oValueHelp.fireTypeaheadSuggested.called, "TypeaheadSuggested");
			oClone.destroy();
		});

	}

	QUnit.test("Clone", (assert) => {

		return _testClonedTypeahead(assert);

	});

	QUnit.test("Clone - connected", (assert) => {

		oValueHelp.connect(oField); // to attach events
		return _testClonedTypeahead(assert);

	});

	QUnit.test("isRestrictedToFixedValues", (assert) => {

		sinon.stub(oContainer, "isRestrictedToFixedValues").returns(false);
		assert.notOk(oValueHelp.isRestrictedToFixedValues(), "Result");

		oContainer.isRestrictedToFixedValues.returns(true);
		assert.ok(oValueHelp.isRestrictedToFixedValues(), "Result");

	});

	QUnit.module("with Dialog", {
		beforeEach: async () => {
			oContainer = new Container("C1", {
				title: "Test"
			});
			oValueHelp = new ValueHelp("F1-H", {
				dialog: oContainer,
				disconnect: _myDisconnectHandler,
				navigated: _myNavigateHandler,
				select: _mySelectHandler,
				closed: _myClosedHandler
			});
			await _initFields();
		},
		afterEach: _teardown
	});

	QUnit.test("connect", (assert) => {

		assert.deepEqual(oContainer._getFieldGroupIds(), [], "FieldGroupIDs empty"); // as _getFieldGroupIds is used in UIArea to determine current FieldGroup

		oField.setFieldGroupIds(["myFieldGroup"]);
		oField2.setFieldGroupIds(["myFieldGroup2"]);
		sinon.spy(oContainer, "onConnectionChange");
		oValueHelp.connect(oField, {test: "X"});
		oValueHelp.connect(oField2, {test: "Y"});
		assert.ok(oContainer.onConnectionChange.calledOnce, "onConnectionChange called for Container");
		assert.deepEqual(oContainer._getFieldGroupIds(), ["myFieldGroup2"], "FieldGroupIDs of Field used"); // as _getFieldGroupIds is used in UIArea to determine current FieldGroup

	});

	QUnit.test("open", (assert) => {

		sinon.spy(oContainer, "open");
		sinon.spy(ValueHelpDelegate, "retrieveContent");
		sinon.spy(oValueHelp, "fireOpen");
		sinon.spy(oValueHelp, "fireOpened");

		const fnDone = assert.async();
		oValueHelp.connect(oField); // to attach events
		oValueHelp.open(true); //-> check nothing happens
		assert.notOk(oContainer.open.called, "Container open not called for typeahead opening");

		oValueHelp.open(false);
		assert.ok(oValueHelp.fireOpen.called, "ValueHelp open event fired for typeahead opening");
		assert.equal(oValueHelp.fireOpen.lastCall.args[0].container, oContainer, "ValueHelp open event carries correct container");

		setTimeout(() => { // Delegate is called async
			assert.ok(oContainer.open.called, "Container open called for dialog opening");
			assert.ok(ValueHelpDelegate.retrieveContent.called, "ValueHelpDelegate.retrieveContent called for opening");
			oContainer.handleOpened();
			assert.ok(oValueHelp.fireOpened.called, "ValueHelp opened event fired for typeahead opening");
			assert.equal(oValueHelp.fireOpened.lastCall.args[0].container, oContainer, "ValueHelp opened event carries correct container");

			ValueHelpDelegate.retrieveContent.restore();
			oValueHelp.fireOpen.restore();
			oValueHelp.fireOpened.restore();
			fnDone();
		}, 0);

	});

	QUnit.test("close open/opening containers when opening in another mode", (assert) => {
		sinon.spy(oContainer, "open");
		sinon.spy(oContainer, "close");

		//var fnDone = assert.async();
		oValueHelp.connect(oField); // to attach events
		oValueHelp.open(false);
		assert.ok(oContainer.open.called, "Container open called for dialog opening");
		oValueHelp.open(true);
		assert.ok(oContainer.close.called, "Container close called for already open container");
	});

	QUnit.test("close", (assert) => {

		sinon.spy(oContainer, "close");

		oValueHelp.connect(oField); // to attach events
		oValueHelp.close();
		assert.notOk(oContainer.close.called, "Container close not called if not open");

		sinon.stub(oContainer, "isOpen").returns(true);
		oValueHelp.close();
		assert.ok(oContainer.close.called, "Container close called if open");

	});

	QUnit.test("close handling", (assert) => {

		sinon.spy(oValueHelp, "close");
		oValueHelp.connect(oField); // to attach events
		oContainer.handleClose();
		oContainer.handleClosed(); // TODO: change to event?
		assert.equal(iClosed, 1, "Close event fired");

	});

	QUnit.test("toggleOpen", (assert) => {

		sinon.spy(oValueHelp, "open");
		sinon.spy(oValueHelp, "close");

		oValueHelp.connect(oField); // to attach events
		oValueHelp.toggleOpen(true);
		assert.notOk(oValueHelp.open.called, "ValueHelp open not called for Typeahed opening");

		oValueHelp.toggleOpen(false);
		assert.ok(oValueHelp.open.calledWith(false), "ValueHelp open called for Dialog opening");

		sinon.stub(oContainer, "isOpen").returns(true);
		oValueHelp.toggleOpen(false);
		assert.ok(oValueHelp.close.called, "ValueHelp close called if open for dialog");

		oValueHelp.close.reset();
		oValueHelp.toggleOpen(true);
		assert.notOk(oValueHelp.close.called, "ValueHelp close not called if open for typeahead but no Typeahead exist");

	});

	QUnit.test("isOpen", (assert) => {

		assert.notOk(oValueHelp.isOpen(), "ValueHelp not open per default");

		sinon.stub(oContainer, "isOpen").returns(true);
		assert.ok(oValueHelp.isOpen(), "ValueHelp open if Container open");

	});

	QUnit.test("skipOpening", (assert) => {

		sinon.spy(oContainer, "close");
		oValueHelp.skipOpening();
		assert.notOk(oContainer.close.called, "Container close not called");

		sinon.stub(oContainer, "isOpening").returns(true);
		oValueHelp.skipOpening();
		assert.ok(oContainer.close.called, "Container close called");

	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("isTypeaheadSupported", (assert) => {

		sinon.spy(ValueHelpDelegate, "retrieveContent");
		const oPromise = oValueHelp.isTypeaheadSupported();
		assert.ok(oPromise instanceof Promise, "isTypeaheadSupported returns promise");

		return oPromise.then((bSupported) => {
			assert.strictEqual(bSupported, false, "TypeAhead not supported");
			assert.notOk(ValueHelpDelegate.retrieveContent.called, "ValueHelpDelegate.retrieveContent not called for dialog");
			ValueHelpDelegate.retrieveContent.restore();
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
			ValueHelpDelegate.retrieveContent.restore();
		});

	});

	QUnit.test("getItemForValue", (assert) => {

		sinon.spy(oContainer, "getItemForValue");
		const oConfig = {
				parsedValue: "A",
				value: "a",
				bindingContext: "BC",
				checkKey: true,
				exception: ParseException,
				caseSensitive: true
		};
		const oPromise = oValueHelp.getItemForValue(oConfig);
		assert.ok(oPromise instanceof Promise, "getItemForValue returns promise");

		return oPromise.then((sText) => {
			assert.notOk(true, "Promise Then must not be called");
		}).catch((oError) => {
			assert.ok(true, "Promise Catch called");
			assert.notOk(oContainer.getItemForValue.called, "getItemForValue not called on Container");
		});

	});

	QUnit.test("getIcon", (assert) => {

		sinon.stub(oContainer, "getValueHelpIcon").returns("X");
		const sIcon = oValueHelp.getIcon();
		assert.ok(oContainer.getValueHelpIcon(), "Container getValueHelpIcon called");
		assert.equal(sIcon, "X", "Icon of Container returned");

	});

	QUnit.test("isValidationSupported", (assert) => {

		sinon.stub(oContainer, "isValidationSupported").returns(true);
		assert.notOk(oValueHelp.isValidationSupported(), "Not supported");
		assert.notOk(oContainer.isValidationSupported.called, "Container.isValidationSupported not called");

	});

	QUnit.test("getDomRef", (assert) => {

		sinon.stub(oContainer, "getDomRef").returns(oField.getDomRef()); // just fake
		let oDomRef = oValueHelp.getDomRef();
		assert.notOk(oContainer.getDomRef.called, "Container getDomRef not called if closed");
		assert.notOk(oDomRef, "no DomRef returned if closed");

		sinon.stub(oContainer, "isOpening").returns(true);
		oDomRef = oValueHelp.getDomRef();
		assert.ok(oContainer.getDomRef.called, "Container getDomRef called");
		assert.equal(oDomRef, oField.getDomRef(), "DomRef returned if opening");

		sinon.stub(oContainer, "isClosing").returns(true);
		oDomRef = oValueHelp.getDomRef();
		assert.ok(oContainer.getDomRef.called, "Container getDomRef called");
		assert.notOk(oDomRef, "no DomRef returned if open but closing");

		oContainer.isClosing.reset();
		oContainer.isOpening.reset();

		sinon.stub(oContainer, "isOpen").returns(true);
		oDomRef = oValueHelp.getDomRef();
		assert.ok(oContainer.getDomRef.called, "Container getDomRef called");
		assert.equal(oDomRef, oField.getDomRef(), "DomRef returned if open");
		oContainer.isOpen.reset();

		oContainer.getDomRef.reset();

	});

	QUnit.test("getAriaAttributes", (assert) => {

		const oCheckAttributes = {
			contentId: undefined,
			ariaHasPopup: "dialog",
			role: "combobox",
			roleDescription: null,
			valueHelpEnabled: true,
			autocomplete: "none"
		};

		sinon.stub(oContainer, "getAriaAttributes").returns({
			contentId: "X",
			ariaHasPopup: "dialog",
			role: "combobox",
			roleDescription: null,
			valueHelpEnabled: true,
			autocomplete: "none"
		});

		let oAttributes = oValueHelp.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes on closed typeaheas");

		oCheckAttributes.contentId = "X";
		sinon.stub(oContainer, "isOpen").returns(true);
		oAttributes = oValueHelp.getAriaAttributes();
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes on open typeaheas");

	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("shouldOpenOnFocus", (assert) => {

		sinon.stub(oContainer, "shouldOpenOnFocus").returns(true);
		assert.ok(oValueHelp.shouldOpenOnFocus(), "returns value of container");

	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("shouldOpenOnClick", (assert) => {

		sinon.stub(oContainer, "shouldOpenOnClick").returns(true);
		assert.ok(oValueHelp.shouldOpenOnClick(), "returns value of container");

	});

	QUnit.test("isFocusInHelp", (assert) => {

		sinon.stub(oContainer, "isFocusInHelp").returns(true);
		assert.ok(oValueHelp.isFocusInHelp(), "returns value of container");

	});

	QUnit.test("removeVisualFocus", (assert) => {

		sinon.spy(oContainer, "removeVisualFocus");
		oValueHelp.removeVisualFocus();
		assert.notOk(oContainer.removeVisualFocus.called, "Container.removeVisualFocus not called as only supported for Typeahead");

	});

	QUnit.test("navigate", (assert) => {

		// nothing must happen as onyl supported for Typeahead
		oValueHelp.connect(oField); // to attach events
		sinon.spy(oContainer, "navigate");
		sinon.spy(ValueHelpDelegate, "retrieveContent");
		const oPromise = oValueHelp.navigate(1);
		assert.notOk(oPromise, "navigate returns nothing");

		const fnDone = assert.async();
		setTimeout(() => { // to check if something is async called
			assert.notOk(oContainer.navigate.called, "Container.navigate not called");
			assert.notOk(ValueHelpDelegate.retrieveContent.called, "ValueHelpDelegate.retrieveContent not called");
			ValueHelpDelegate.retrieveContent.restore();
			fnDone();
		}, 0);

	});

	QUnit.test("isNavigationEnabled", (assert) => {

		assert.notOk(oValueHelp.isNavigationEnabled(1), "Navigation if closed: disabled if no typeahead");

	});

	QUnit.test("Selection handling", (assert) => {


		return oValueHelp.initControlDelegate().then(() => {
			oValueHelp.connect(oField); // to attach events
			// Just test event is processed, Details are tested in TypeAhead (there is no check for kind of content)
			const aSelectConditions = [
				Condition.createCondition(OperatorName.EQ, ["X"]),
				Condition.createCondition(OperatorName.BT, ["A", "C"])
			];
			oContainer.fireSelect({type: ValueHelpSelectionType.Set, conditions: aSelectConditions});
			const aConditions = oValueHelp.getConditions();
			assert.deepEqual(aConditions, aSelectConditions, "Set: Selected condtions set on ValueHelp");
		});
	});

	QUnit.test("Confirmation handling", (assert) => {

		// Just test event is processed, Details are tested in TypeAhead (there is no check for kind of content)
		return oValueHelp.initControlDelegate().then(() => {
			sinon.spy(oValueHelp, "close");
			oValueHelp.connect(oField); // to attach events
			oContainer.fireConfirm({});
			assert.equal(iSelect, 1, "Select event fired");
			assert.deepEqual(aSelectConditions, [], "conditions");
			assert.ok(bSelectAdd, "'add' property");
			assert.notOk(bSelectClose, "'close' property");
			assert.notOk(oValueHelp.close.called, "ValueHelp close not called");
		});
	});

	QUnit.test("Cancelling handling", (assert) => {

		sinon.spy(oValueHelp, "close");
		oValueHelp.connect(oField); // to attach events
		oContainer.fireCancel({});
		assert.ok(oValueHelp.close.called, "ValueHelp close called");

	});

	function _testClonedDialog(assert) {

		const oClone = oValueHelp.clone("MyClone");
		const oCloneContainer = oClone.getDialog();

		assert.ok(oCloneContainer, "Typeahead cloned");

		// events of clone must not be handled by original
		sinon.spy(oValueHelp, "close");
		sinon.spy(oValueHelp, "fireOpened");
		sinon.spy(oValueHelp, "fireClosed");
		sinon.spy(oValueHelp, "fireSelect");
		return Promise.all([oValueHelp.initControlDelegate(), oClone.initControlDelegate()]).then(() => {
			if (!oValueHelp.getControl()) {
				oValueHelp.connect(oField); // to attach events
			}
			oClone.connect(oField2); // to attach events
			const aSelectConditions = [
				Condition.createCondition(OperatorName.EQ, ["X"])
			];
			oCloneContainer.fireSelect({type: ValueHelpSelectionType.Set, conditions: aSelectConditions});
			const aConditions = oValueHelp.getConditions();
			assert.equal(aConditions.length, 0, "Select");
			oCloneContainer.fireConfirm();
			assert.notOk(oValueHelp.fireSelect.called, "Confirm");
			oCloneContainer.fireCancel({});
			assert.notOk(oValueHelp.close.called, "Cancel");
			oCloneContainer.fireOpened({});
			assert.notOk(oValueHelp.fireOpened.called, "Opened");
			oCloneContainer.fireClosed();
			assert.notOk(oValueHelp.fireClosed.called, "Closed");
			oClone.destroy();
		});

	}

	QUnit.test("Clone", (assert) => {

		return _testClonedDialog(assert);

	});

	QUnit.test("Clone - connected", (assert) => {

		oValueHelp.connect(oField); // to attach events
		return _testClonedDialog(assert);

	});

	QUnit.module("with Dialog and Typeahead", {
		beforeEach: async () => {
			this.typeahead = new Container("C1", {
				title: "Typeahead"
			});
			this.dialog = new Container("C2", {
				title: "Dialog"
			});
			oValueHelp = new ValueHelp("F1-H", {
				typeahead: this.typeahead,
				dialog: this.dialog
			});
			await _initFields();
		},
		afterEach: () => {
			this.typeahead.destroy();
			this.typeahead = undefined;
			this.dialog.destroy();
			this.dialog = undefined;
			_teardown();
		}
	});

	QUnit.test("fireClosed", (assert) => {

		sinon.spy(oValueHelp, "fireClosed");
		oValueHelp.connect(oField); // to attach events

		this.dialog.handleClose();
		this.dialog.handleClosed();
		assert.ok(oValueHelp.fireClosed.called, "fireClosed called.");
		oValueHelp.fireClosed.reset();

		sinon.stub(this.typeahead, "isOpen").returns(true);
		this.dialog.handleClose();
		this.dialog.handleClosed();
		assert.notOk(oValueHelp.fireClosed.called, "fireClosed not called as typeahead is still open.");
		this.typeahead.isOpen.restore();


		sinon.stub(this.dialog, "isOpen").returns(true);
		this.typeahead.handleClose();
		this.typeahead.handleClosed();
		assert.notOk(oValueHelp.fireClosed.called, "fireClosed not called as typeahead is still open.");
		this.dialog.isOpen.restore();

		oValueHelp.fireClosed.restore();
	});



	let oDeviceStub;
	QUnit.module("Phone support", {
		beforeEach: async () => {
			const oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

			oDeviceStub = sinon.stub(Device, "system").value(oSystem);

			oContainer = new Container("C1", {
				title: "Test"
			});
			oValueHelp = new ValueHelp("F1-H", {
				typeahead: oContainer,
				delegate: {name: "sap/ui/mdc/ValueHelpDelegate", payload: {x: "X"}},
				disconnect: _myDisconnectHandler,
				navigated: _myNavigateHandler,
				visualFocusSet: _myVisualFocusSetHandler,
				typeaheadSuggested: _myTypeaheadHandler,
				select: _mySelectHandler,
				closed: _myClosedHandler
			});
			await _initFields();
		},
		afterEach: () => {
			_teardown();
			oDeviceStub.restore();
		}
	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("shouldOpenOnFocus", (assert) => {

		sinon.stub(oContainer, "shouldOpenOnFocus").returns(true);
		assert.ok(oValueHelp.shouldOpenOnFocus(), "if only typeahed opening on focus in phone mode");


	});

	/**
	 *  @deprecated As of version 1.137
	 */
	QUnit.test("shouldOpenOnClick", (assert) => {

		sinon.stub(oContainer, "shouldOpenOnClick").returns(true);
		assert.ok(oValueHelp.shouldOpenOnClick(), "if only typeahed no opening on click in phone mode");

	});

	QUnit.test("setHighlightId", (assert) => {
		sinon.spy(oContainer, "setHighlightId");
		oValueHelp.setHighlightId("x");
		assert.ok(oContainer.setHighlightId.calledWith("x"), "ValueHelp.setHighlightId calls Container.setHighlightId with argument");
	});
});
