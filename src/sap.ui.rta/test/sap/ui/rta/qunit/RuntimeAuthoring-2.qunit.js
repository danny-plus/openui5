/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/base/util/isEmptyObject",
	"sap/m/Button",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Lib",
	"sap/ui/dt/plugin/ToolHooks",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/Util",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/TranslationAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/command/AnnotationCommand",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/plugin/Stretch",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	isEmptyObject,
	Button,
	MessageBox,
	MessageToast,
	Page,
	ComponentContainer,
	Lib,
	ToolHooks,
	ZIndexManager,
	DesignTime,
	DtUtil,
	FlexRuntimeInfoAPI,
	FlexInfoSession,
	Version,
	ChangesWriteAPI,
	ContextBasedAdaptationsAPI,
	ControlPersonalizationWriteAPI,
	FeaturesAPI,
	PersistenceWriteAPI,
	TranslationAPI,
	VersionsAPI,
	Layer,
	FlexUtils,
	AppVariantUtils,
	AppVariantFeature,
	AnnotationCommand,
	BaseCommand,
	Stack,
	Stretch,
	ReloadManager,
	RuntimeAuthoring,
	RtaUtils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
	const sReference = "FlexReferenceForRuntimeAuthoring2";
	const oComp = RtaQunitUtils.createAndStubAppComponent(sinon, sReference, {
		"sap.app": {
			id: sReference
		}
	}, new Page("mockPage"));
	new ComponentContainer({
		component: oComp
	}).placeAt("qunit-fixture");

	function givenAnFLP(fnFLPNavigateStub, fnFLPReloadStub, mShellParams) {
		sandbox.stub(FlexUtils, "getUshellContainer").returns({
			getServiceAsync() {
				return Promise.resolve({
					navigate: fnFLPNavigateStub,
					getHash() {
						return "Action-somestring";
					},
					parseShellHash() {
						const mHash = {
							semanticObject: "Action",
							action: "somestring"
						};

						if (mShellParams) {
							mHash.params = mShellParams;
						}
						return mHash;
					},
					getCurrentApplication() {},
					unregisterNavigationFilter() {},
					registerNavigationFilter() {},
					reloadCurrentApp: fnFLPReloadStub,
					getUser() {}
				});
			}
		});
	}

	function stubManifestChanges(oRta, bExist) {
		// we don't want to start RTA for these tests, so just setting the otherwise not set property,
		// that sinon cannot stub until it was set.
		oRta._oSerializer = {
			needsReload() {
				return Promise.resolve(bExist);
			},
			saveCommands() {}
		};
	}

	function whenNoManifestChangesExist(oRta) {
		stubManifestChanges(oRta, false);
	}

	function disableVersioning() {
		sandbox.stub(VersionsAPI, "initialize").callsFake(async function(...aArgs) {
			const oModel = await VersionsAPI.initialize.wrappedMethod.apply(this, aArgs);
			oModel.setProperty("/versioningEnabled", false);
			return oModel;
		});
	}

	function cleanInfoSessionStorage() {
		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oComp});
		window.sessionStorage.removeItem(`sap.ui.fl.info.${sFlexReference}`);
	}

	QUnit.module("Given that RTA gets started in FLP", {
		beforeEach() {
			this.fnFLPNavigateStub = sandbox.spy();
			this.fnTriggerRealoadStub = sandbox.stub();
			givenAnFLP(this.fnFLPNavigateStub, this.fnTriggerRealoadStub, {"sap-ui-fl-version": [Version.Number.Draft]});

			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			whenNoManifestChangesExist(this.oRta);
			this.fnEnableRestartSpy = sandbox.spy(RuntimeAuthoring, "enableRestart");
		},
		afterEach() {
			this.oRta.destroy();
			VersionsAPI.clearInstances();
			RuntimeAuthoring.disableRestart(Layer.CUSTOMER);
			RuntimeAuthoring.disableRestart(Layer.VENDOR);
			cleanInfoSessionStorage();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA is started and _determineReload returns true", function(assert) {
			assert.expect(4);
			sandbox.stub(ReloadManager, "handleReloadOnStart").resolves(true);
			const oFireFailedStub = sandbox.stub(this.oRta, "fireFailed");
			const fnRemovePopupFilterStub = sandbox.spy(ZIndexManager, "removePopupFilter");
			return this.oRta.start()
			.catch(function(oError) {
				assert.ok(true, "then the start promise rejects");
				assert.equal(oFireFailedStub.callCount, 0, "and fireFailed was not called");
				assert.equal(oError.message, "Reload triggered", "and the Error is 'Reload triggered'");
				assert.equal(fnRemovePopupFilterStub.callCount, 2, "then the popup filter from the old rta popupManager are removed from ZIndexManager");
			});
		});

		QUnit.test("when RTA gets started and DesignTime fails to start", function(assert) {
			assert.expect(3);
			sandbox.stub(DesignTime.prototype, "addRootElement").callsFake(function() {
				setTimeout(function() {
					this.fireSyncFailed({error: Error("DesignTime failed")});
				}.bind(this), 0);
			});
			const oFireFailedStub = sandbox.stub(this.oRta, "fireFailed");
			return this.oRta.start()
			.catch(function(oError) {
				assert.ok(true, "the start function rejects the promise");
				assert.equal(oError.message, "DesignTime failed", "with the correct Error");
				assert.equal(oFireFailedStub.callCount, 1, "and fireFailed was called");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring is created", {
		beforeEach() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
		},
		afterEach() {
			cleanInfoSessionStorage();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and started without ATO in prod system", async function(assert) {
			disableVersioning();
			await this.oRta.start();
			await RtaQunitUtils.showActionsMenu(this.oRta.getToolbar());
			assert.equal(this.oRta.getToolbar().getControl("restore").getVisible(), true, "then the Reset Button is still visible");
		});

		QUnit.test("when RTA is created with custom plugins and start is triggered", async function(assert) {
			const oStretchPlugin = new Stretch("nonDefaultStretch");
			const oToolHooksPlugin = new ToolHooks("nonDefaultRemovePlugin");

			this.oRta.setPlugins({
				toolHooks: oToolHooksPlugin,
				stretch: oStretchPlugin
			});
			const oPreparePluginsSpy = sinon.spy(this.oRta.getPluginManager(), "preparePlugins");

			await this.oRta.start();
			assert.equal(this.oRta.getPlugins().stretch.getId(), oStretchPlugin.getId(), " then the custom stretch is set");
			assert.equal(this.oRta.getPlugins().toolHooks.getId(), oToolHooksPlugin.getId(), " then the custom toolHooks is set");
			assert.equal(Object.keys(this.oRta.getPlugins()).length, 2, " and the default plugins are not loaded");
			assert.equal(oPreparePluginsSpy.callCount, 1, " and getPluginManager.preparePlugins() have been called once on oRta.start()");
		});

		function createCommandstackStub(oRta, bCanSave, bCanRedo) {
			return sandbox.stub(oRta, "getCommandStack").returns({
				canSave() {
					return bCanSave;
				},
				canRedo() {
					return bCanRedo;
				}
			});
		}

		QUnit.test("when _onUnload is called with changes", function(assert) {
			createCommandstackStub(this.oRta, true, true);
			const sMessage = this.oRta._onUnload();
			assert.equal(sMessage, this.oRta._getTextResources().getText("MSG_UNSAVED_CHANGES"), "then the function returns the correct message");
		});

		QUnit.test("when _onUnload is called with changes but 'showWindowUnloadDialog' set to false", function(assert) {
			createCommandstackStub(this.oRta, true, true);
			this.oRta.setShowWindowUnloadDialog(false);
			const sMessage = this.oRta._onUnload();
			assert.equal(sMessage, undefined, "then the function returns no message");
		});

		QUnit.test("when _onUnload is called without changes", function(assert) {
			createCommandstackStub(this.oRta, false, false);
			const sMessage = this.oRta._onUnload();
			assert.equal(sMessage, undefined, "then the function returns no message");
		});

		QUnit.test("when _onUnload is called after all changes were undone", function(assert) {
			createCommandstackStub(this.oRta, false, true);
			const sMessage = this.oRta._onUnload();
			assert.equal(sMessage, undefined, "then the function returns no message");
		});

		QUnit.test("when getSelection is called with a designtime started", function(assert) {
			this.oRta._oDesignTime = {
				getSelectionManager() {
					return {
						get() {
							return "foo";
						}
					};
				},
				destroy() {},
				getRootElements() {return [];}
			};

			assert.strictEqual(this.oRta.getSelection(), "foo", "the result of the getSelectionManager.get function is returned");
		});

		QUnit.test("when getSelection is called without a designtime started", function(assert) {
			assert.deepEqual(this.oRta.getSelection(), [], "an empty array is returned");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started", {
		beforeEach() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});

			this.oPreparePluginsSpy = sinon.spy(this.oRta.getPluginManager(), "preparePlugins");
			return this.oRta.start();
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
			cleanInfoSessionStorage();
		}
	}, function() {
		QUnit.test("when a new commandstack is being set", function(assert) {
			const oInitialCommandStack = this.oRta.getCommandStack();
			const oDetachSpy = sandbox.spy(oInitialCommandStack, "detachModified");
			assert.ok(oInitialCommandStack, "the command stack is automatically created");

			const oNewStack = new Stack();
			const oAttachSpy = sandbox.spy(oNewStack, "attachModified");
			this.oRta.setCommandStack(oNewStack);

			assert.strictEqual(oAttachSpy.callCount, 1, "the new stack was attached to");
			assert.strictEqual(oDetachSpy.callCount, 1, "the old stack was detached from");
		});

		QUnit.test("when RTA is stopped and destroyed, the default plugins get created and destroyed", function(assert) {
			const done = assert.async();
			const done2 = assert.async();
			const oSetBlockedStub = sandbox.stub(oComp.getRootControl(), "setBlocked");

			assert.equal(this.oPreparePluginsSpy.callCount, 1, " and getPluginManager.preparePlugins() have been called 1 time on oRta.start()");
			assert.ok(!isEmptyObject(this.oRta.getPlugins()), "then plugins are created on start");

			this.oRta.attachStop(function() {
				assert.ok(true, "the 'stop' event was fired");

				this.oRta.destroy();
				assert.strictEqual(document.querySelectorAll(".sapUiRtaToolbar").length, 0, "... and Toolbar is destroyed.");
				done();
			}.bind(this));
			this.oRta.stop().then(function() {
				assert.ok(true, "then the promise got resolved");
				assert.strictEqual(oSetBlockedStub.callCount, 1, "the setBlocked is called");
				assert.strictEqual(oSetBlockedStub.getCall(0).args[0], false, "blocked is set to false");
				done2();
			});
		});

		QUnit.test("when RTA is stopped it waits for pending actions", function(assert) {
			assert.expect(3);
			const done = assert.async();
			let fnResolve;
			let fnResolve2;
			let fnResolve3;
			const pPromise = new Promise(function(resolve) {
				fnResolve = resolve;
			});

			const oPushAndExecuteStub = sandbox.stub(this.oRta.getCommandStack(), "pushAndExecute").callsFake(function() {
				return new Promise(function(resolve) {
					fnResolve3 = resolve;
				});
			});

			const oWaitForBusyStub = sandbox.stub(this.oRta._oDesignTime, "waitForBusyPlugins").callsFake(function() {
				return new Promise(function(resolve) {
					fnResolve2 = resolve;

					this.oRta.getPluginManager().getDefaultPlugins().rename.fireElementModified({
						command: new BaseCommand()
					});

					fnResolve();
				}.bind(this));
			}.bind(this));

			this.oRta.stop().then(function() {
				assert.ok(true, "the function resolves");
				done();
			});

			pPromise.then(function() {
				assert.strictEqual(oWaitForBusyStub.callCount, 1, "the wait function was already called");
				assert.strictEqual(oPushAndExecuteStub.callCount, 1, "the command was pushed");
				fnResolve2();
				fnResolve3();
			});
		});

		QUnit.test("when Mode is changed from adaptation to navigation and back to adaptation", function(assert) {
			const oFireModeChangedStub = sandbox.stub(this.oRta, "fireModeChanged");
			const oStopCutPasteStub = sandbox.stub(this.oRta.getPluginManager(), "handleStopCutPaste");
			const oSetBlockedStub = sandbox.stub(oComp.getRootControl(), "setBlocked");

			this.oRta.setMode("navigation");
			assert.notOk(this.oRta._oDesignTime.getEnabled(), " in navigation mode the designTime property enabled is false");
			assert.strictEqual(oSetBlockedStub.callCount, 1, "setBlocked was called");
			assert.strictEqual(oSetBlockedStub.lastCall.args[0], false, "blocked is set to false");
			assert.strictEqual(oFireModeChangedStub.callCount, 1, "the event ModeChanged was fired");
			assert.deepEqual(oFireModeChangedStub.lastCall.args[0], {mode: "navigation"}, "the argument of the event is correct");
			assert.strictEqual(oStopCutPasteStub.callCount, 1, "the cut paste was stopped");

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey() {return "adaptation";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in adaption mode the designTime property enabled is true again");
			assert.strictEqual(oSetBlockedStub.callCount, 2, "setBlocked was called again");
			assert.strictEqual(oSetBlockedStub.lastCall.args[0], true, "blocked is set to true");
			assert.equal(oFireModeChangedStub.callCount, 2, "the event ModeChanged was fired again");
			assert.deepEqual(oFireModeChangedStub.lastCall.args[0], {mode: "adaptation"}, "the argument of the event is correct");
			assert.strictEqual(oStopCutPasteStub.callCount, 1, "the cut paste was not stopped again");
		});

		QUnit.test("when Mode is changed from adaptation to visualization and back to adaptation", function(assert) {
			oComp.getRootControl().addStyleClass("sapUiDtOverlayMovable");
			const oFireModeChangedStub = sandbox.stub(this.oRta, "fireModeChanged");
			const oStopCutPasteStub = sandbox.stub(this.oRta.getPluginManager(), "handleStopCutPaste");
			const oSetBlockedStub = sandbox.stub(oComp.getRootControl(), "setBlocked");

			this.oRta.setMode("visualization");
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in visualization mode the designTime property enabled is true");
			assert.strictEqual(oSetBlockedStub.callCount, 0, "setBlocked was not called");
			assert.equal(oFireModeChangedStub.callCount, 1, "the event ModeChanged was fired");
			assert.deepEqual(oFireModeChangedStub.lastCall.args[0], {mode: "visualization"}, "the argument of the event is correct");
			assert.equal(getComputedStyle(document.querySelector(".sapUiDtOverlayMovable")).cursor, "default", "the movable overlays switched to the default cursor");
			assert.strictEqual(oStopCutPasteStub.callCount, 1, "the cut paste was stopped");

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey() {return "adaptation";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in adaption mode the designTime property enabled is true");
			assert.strictEqual(oSetBlockedStub.callCount, 0, "setBlocked was not called");
			assert.equal(oFireModeChangedStub.callCount, 2, "the event ModeChanged was fired again");
			assert.deepEqual(oFireModeChangedStub.lastCall.args[0], {mode: "adaptation"}, "the argument of the event is correct");
			assert.equal(getComputedStyle(document.querySelector(".sapUiDtOverlayMovable")).cursor, "move", "the movable overlays switched back to the move cursor");
			oComp.getRootControl().removeStyleClass("sapUiDtOverlayMovable");
			assert.strictEqual(oStopCutPasteStub.callCount, 1, "the cut paste was not stopped again");
		});

		QUnit.test("when Mode is changed from visualization to navigation and back to visualization", function(assert) {
			oComp.getRootControl().addStyleClass("sapUiDtOverlayMovable");
			this.oRta.setMode("visualization");
			const oSetBlockedStub = sandbox.stub(oComp.getRootControl(), "setBlocked");
			const oFireModeChangedStub = sandbox.stub(this.oRta, "fireModeChanged");
			assert.equal(getComputedStyle(document.querySelector(".sapUiDtOverlayMovable")).cursor, "default", "the movable overlays switched to the default cursor");

			this.oRta.setMode("navigation");
			assert.notOk(this.oRta._oDesignTime.getEnabled(), " in navigation mode the designTime property enabled is false");
			assert.strictEqual(oSetBlockedStub.callCount, 1, "setBlocked was called");
			assert.strictEqual(oSetBlockedStub.lastCall.args[0], false, "blocked is set to false");
			assert.equal(oFireModeChangedStub.callCount, 1, "the event ModeChanged was fired");
			assert.deepEqual(oFireModeChangedStub.lastCall.args[0], {mode: "navigation"}, "the argument of the event is correct");
			assert.equal(getComputedStyle(document.querySelector(".sapUiDtOverlayMovable")).cursor, "move", "the movable overlays back to the move cursor");

			// simulate mode change from toolbar
			this.oRta.getToolbar().fireModeChange({item: { getKey() {return "visualization";}}});
			assert.ok(this.oRta._oDesignTime.getEnabled(), "in visualization mode the designTime property enabled is true again");
			assert.strictEqual(oSetBlockedStub.callCount, 2, "setBlocked was called");
			assert.strictEqual(oSetBlockedStub.lastCall.args[0], true, "blocked is set to true");
			assert.equal(oFireModeChangedStub.callCount, 2, "the event ModeChanged was fired again");
			assert.deepEqual(oFireModeChangedStub.lastCall.args[0], {mode: "visualization"}, "the argument of the event is correct");
			assert.equal(getComputedStyle(document.querySelector(".sapUiDtOverlayMovable")).cursor, "default", "the movable overlays switched again to the default cursor");
			oComp.getRootControl().removeStyleClass("sapUiDtOverlayMovable");
		});

		QUnit.test("when personalization changes are created in navigation mode", async function(assert) {
			const oMessageToastSpy = sandbox.stub(MessageToast, "show");
			this.oRta.setMode("navigation");
			await ControlPersonalizationWriteAPI.add({
				changes: [{
					selectorElement: oComp
				}]
			});
			const sExpectedErrorMessage = oTextResources.getText("MSG_NAVIGATION_MODE_CHANGES_WARNING");
			assert.ok(oMessageToastSpy.calledOnceWith(sExpectedErrorMessage), "then a warning is shown");
			oMessageToastSpy.resetHistory();

			await ControlPersonalizationWriteAPI.add({
				changes: [{
					selectorElement: oComp
				}]
			});
			assert.ok(oMessageToastSpy.notCalled, "then the toast is only shown once");
		});

		// when a dialog gets opened by the application it is added as a root element to the designtime
		QUnit.test("when rta mode is switched and stopped with multiple root elements", async function(assert) {
			const oButton = new Button("foo");
			const oButtonBlockedStub = sandbox.stub(oButton, "setBlocked");
			const oRootControlBlockedStub = sandbox.stub(oComp.getRootControl(), "setBlocked");
			this.oRta._oDesignTime.addRootElement(oButton);
			await DtUtil.waitForSynced(this.oRta._oDesignTime)();

			this.oRta.setMode("navigation");
			assert.strictEqual(oButtonBlockedStub.callCount, 1, "setBlocked is called");
			assert.strictEqual(oButtonBlockedStub.lastCall.args[0], false, "and set to false");
			assert.strictEqual(oRootControlBlockedStub.callCount, 1, "setBlocked is called");
			assert.strictEqual(oRootControlBlockedStub.lastCall.args[0], false, "and set to false");

			this.oRta.setMode("visualization");
			assert.strictEqual(oButtonBlockedStub.callCount, 2, "setBlocked is called");
			assert.strictEqual(oButtonBlockedStub.lastCall.args[0], true, "and set to true");
			assert.strictEqual(oRootControlBlockedStub.callCount, 2, "setBlocked is called");
			assert.strictEqual(oRootControlBlockedStub.lastCall.args[0], true, "and set to true");

			await this.oRta.stop();

			assert.strictEqual(oButtonBlockedStub.callCount, 3, "setBlocked is called");
			assert.strictEqual(oButtonBlockedStub.lastCall.args[0], false, "and set to false");
			assert.strictEqual(oRootControlBlockedStub.callCount, 3, "setBlocked is called");
			assert.strictEqual(oRootControlBlockedStub.lastCall.args[0], false, "and set to false");
		});
	});

	QUnit.module("Toolbar handling", {
		beforeEach() {
			sandbox.stub(FlexUtils, "getUShellServices").resolves({});
			this.oFlexSettings = {
				layer: Layer.CUSTOMER,
				developerMode: true
			};
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				flexSettings: this.oFlexSettings
			});
		},
		afterEach() {
			this.oRta.destroy();
			cleanInfoSessionStorage();
			sandbox.restore();
		}
	}, function() {
		function stubToolbarButtonsVisibility(bPublish, bSaveAs) {
			sandbox.stub(FeaturesAPI, "isPublishAvailable").returns(bPublish);
			sandbox.stub(AppVariantFeature, "isSaveAsAvailable").returns(bSaveAs);
		}

		QUnit.test("when RTA gets started", async function(assert) {
			await this.oRta.start();
			assert.strictEqual(document.querySelectorAll(".sapUiRtaToolbar").length, 1, "then Toolbar is visible.");

			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/enabled"), false, "then the 'AppVariant Overview' Menu Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/visible"), false, "then the 'AppVariant Overview' Menu Button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/enabled"), false, "then the 'AppVariant Overview' Icon Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/visible"), false, "then the 'AppVariant Overview' Icon Button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/enabled"), false, "then the saveAs Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/visible"), false, "then the saveAs Button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/modeSwitcher"), "adaptation", "then the mode is initially set to 'Adaptation'");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/redo/enabled"), false, "then the redo is disabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/undo/enabled"), false, "then the undo is disabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/restore/enabled"), false, "then the reset button is disabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/restore/visible"), false, "then the reset button is hidden");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/translation/enabled"), false, "then the translation button is disabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/translation/visible"), false, "then the translation button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/visualizationButton/visible"), true, "then the visualization button is visible");
			assert.strictEqual(this.oRta._oVersionsModel.getProperty("/publishVersionVisible"), false, "then the publish version button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/changesNeedHardReload"), false, "then no changes need a hard reload");
			assert.strictEqual(this.oRta.getToolbar().isA("sap.ui.rta.toolbar.Standalone"), true, "then the toolbar is of type Standalone");

			const oExpectedSettings = {
				flexSettings: this.oFlexSettings,
				rootControl: this.oRta.getRootControlInstance(),
				commandStack: this.oRta.getCommandStack()
			};
			assert.deepEqual(this.oRta.getToolbar().getRtaInformation(), oExpectedSettings, "the rta settings were passed to the toolbar");
		});

		QUnit.test("when RTA gets started in FLP context with original toolbar available", async function(assert) {
			givenAnFLP();
			sandbox.stub(RtaUtils, "getFiori2Renderer").returns({
				getRootControl() {
					return {
						getShellHeader() {
							return {
								addStyleClass: () => {},
								removeStyleClass: () => {}
							};
						}
					};
				}
			});
			stubToolbarButtonsVisibility(false, false);
			const oApiStub = sandbox.stub().returns("");
			sandbox.stub(RtaUtils, "isOriginalFioriToolbarAccessible").returns(true);
			RtaQunitUtils.stubSapUiRequire(sandbox, [{
				name: "sap/ushell/api/RTA",
				stub: {getLogo: oApiStub}
			}]);
			await this.oRta.start();

			assert.strictEqual(this.oRta.getToolbar().isA("sap.ui.rta.toolbar.Fiori"), true, "then the toolbar is of type Fiori");
			assert.deepEqual(this.oRta.getToolbar().getUshellApi(), {getLogo: oApiStub}, "then the api is passed to the toolbar");
		});

		QUnit.test("when RTA gets started with an enabled key user translation", async function(assert) {
			sandbox.stub(FeaturesAPI, "isKeyUserTranslationEnabled").resolves(true);
			sandbox.stub(TranslationAPI, "getSourceLanguages").resolves([]);

			await this.oRta.start();
			assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translation/visible"), true, "then the Translate Button is visible");
			assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translation/enabled"), false, "then the Translate Button is disabled");
		});

		QUnit.test("when RTA gets started with an enabled key user translation and already translatable changes", async function(assert) {
			let fnResolve;
			const oPromise = new Promise((resolve) => {
				fnResolve = resolve;
			});
			sandbox.stub(FeaturesAPI, "isKeyUserTranslationEnabled").resolves(true);
			sandbox.stub(TranslationAPI, "getSourceLanguages").returns(oPromise);

			await this.oRta.start();
			assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translation/visible"), true, "then the Translate Button is visible");
			assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translation/enabled"), false, "first Translate Button is disable");
			fnResolve(["en"]);
			return oPromise.then(function() {
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translation/enabled"), true, "then the Translate Button is enabled");
			}.bind(this));
		});

		QUnit.test("when the URL parameter set by Fiori tools is set to 'true'", async function(assert) {
			sandbox.stub(URLSearchParams.prototype, "has").callThrough().withArgs("fiori-tools-rta-mode").returns(true);
			sandbox.stub(URLSearchParams.prototype, "get").callThrough().withArgs("fiori-tools-rta-mode").returns("true");

			await this.oRta.start();
			const oToolbar = this.oRta.getToolbar();
			assert.notOk(oToolbar.getControl("visualizationSwitcherButton").getVisible(), "then the 'Visualization' tab is not visible");
		});

		QUnit.test("when the URL parameter set by Fiori tools is set to 'false'", async function(assert) {
			sandbox.stub(URLSearchParams.prototype, "has").callThrough().withArgs("fiori-tools-rta-mode").returns(true);
			sandbox.stub(URLSearchParams.prototype, "get").callThrough().withArgs("fiori-tools-rta-mode").returns("false");

			await this.oRta.start();
			const oToolbar = this.oRta.getToolbar();
			assert.ok(oToolbar.getControl("visualizationSwitcherButton").getVisible(), "then the 'Visualization' tab is visible");
		});

		QUnit.test("when the URL parameter used by Fiori tools is not set", async function(assert) {
			sandbox.stub(URLSearchParams.prototype, "has").callThrough().withArgs("fiori-tools-rta-mode").returns(false);

			await this.oRta.start();
			const oToolbar = this.oRta.getToolbar();
			assert.ok(oToolbar.getControl("visualizationSwitcherButton").getVisible(), "then the 'Visualization' tab is visible");
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for a (key user) but the manifest of an app is not supported", async function(assert) {
			stubToolbarButtonsVisibility(true, true);
			sandbox.stub(AppVariantUtils, "getManifirstSupport").resolves(false);
			sandbox.stub(FlexUtils, "getAppDescriptor").returns({"sap.app": {id: "1"}});
			sandbox.stub(FlexUtils, "isVariantByStartupParameter").returns(false);

			await this.oRta.start();
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/enabled"), false, "then the 'AppVariant Overview' Menu Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/visible"), false, "then the 'AppVariant Overview' Menu Button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/enabled"), false, "then the 'AppVariant Overview' Icon Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/visible"), true, "then the 'AppVariant Overview' Icon Button is visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/enabled"), false, "then the saveAs Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/visible"), true, "then the saveAs Button is visible");
			assert.strictEqual(this.oRta._oVersionsModel.getProperty("/publishVersionVisible"), true, "then the publish version button is not visible");
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for an (SAP) developer but the manifest of an app is not supported", async function(assert) {
			stubToolbarButtonsVisibility(true, true);
			sandbox.stub(AppVariantFeature, "isOverviewExtended").returns(true);
			sandbox.stub(AppVariantFeature, "isManifestSupported").resolves(false);
			sandbox.stub(FlexUtils, "isVariantByStartupParameter").returns(false);

			await this.oRta.start();
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/enabled"), false, "then the 'AppVariant Overview' Menu Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/visible"), true, "then the 'AppVariant Overview' Menu Button is visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/enabled"), false, "then the 'AppVariant Overview' Icon Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/visible"), false, "then the 'AppVariant Overview' Icon Button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/enabled"), false, "then the saveAs Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/visible"), true, "then the saveAs Button is visible");
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for an (SAP) developer but uses a pseudo sap-app-id", async function(assert) {
			stubToolbarButtonsVisibility(true, true);
			sandbox.stub(AppVariantFeature, "isOverviewExtended").returns(true);
			sandbox.stub(AppVariantFeature, "isManifestSupported").resolves(true);
			sandbox.stub(FlexUtils, "isVariantByStartupParameter").returns(true);

			await this.oRta.start();
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/enabled"), false, "then the 'AppVariant Overview' Menu Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/visible"), true, "then the 'AppVariant Overview' Menu Button is visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/enabled"), false, "then the 'AppVariant Overview' Icon Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/visible"), false, "then the 'AppVariant Overview' Icon Button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/enabled"), false, "then the saveAs Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/visible"), true, "then the saveAs Button is visible");
		});

		QUnit.test("when RTA is started without versioning", async function(assert) {
			stubToolbarButtonsVisibility(false, true);
			disableVersioning();
			await this.oRta.start();
			assert.strictEqual(this.oRta._oVersionsModel.getProperty("/publishVersionEnabled"), false, "then the publish version button is not enabled");
			assert.strictEqual(this.oRta._oVersionsModel.getProperty("/publishVersionVisible"), false, "then the publish version button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/restore/visible"), true, "then the reset button is visible");
		});

		QUnit.test("when RTA is started without versioning and hideReset set to true", async function(assert) {
			stubToolbarButtonsVisibility(false, true);
			disableVersioning();
			this.oRta.setHideReset(true);
			await this.oRta.start();
			assert.strictEqual(this.oRta._oVersionsModel.getProperty("/publishVersionEnabled"), false, "then the publish version button is not enabled");
			assert.strictEqual(this.oRta._oVersionsModel.getProperty("/publishVersionVisible"), false, "then the publish version button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/restore/visible"), false, "then the reset button is hidden");
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for a (key user) but the current app is a home page", async function(assert) {
			stubToolbarButtonsVisibility(true, true);
			sandbox.stub(AppVariantUtils, "getManifirstSupport").resolves(true);
			sandbox.stub(FlexUtils, "getAppDescriptor").returns({"sap.app": {id: "1"}});
			sandbox.stub(FlexUtils, "getUShellService")
			.callThrough()
			.withArgs("AppLifeCycle")
			.resolves({
				getCurrentApplication() {
					return {
						homePage: true
					};
				}
			});

			await this.oRta.start();
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/enabled"), false, "then the 'AppVariant Overview' Menu Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/visible"), false, "then the 'AppVariant Overview' Menu Button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/enabled"), false, "then the 'AppVariant Overview' Icon Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/visible"), false, "then the 'AppVariant Overview' Icon Button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/enabled"), false, "then the saveAs Button is not enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/visible"), false, "then the saveAs Button is not visible");
		});

		const DEFAULT_ADAPTATION = { id: "DEFAULT", type: "DEFAULT" };
		function stubCBA() {
			ContextBasedAdaptationsAPI.clearInstances();
			stubToolbarButtonsVisibility(true, false);
			sandbox.stub(FeaturesAPI, "isContextBasedAdaptationAvailable").resolves(true);
			this.oContextBasedAdaptationsAPILoadStub = sandbox.stub(ContextBasedAdaptationsAPI, "load").resolves({adaptations: [{id: "12345"}, DEFAULT_ADAPTATION]});
			this.oFlexUtilsGetManifest = sandbox.stub(FlexUtils, "getAppDescriptor").returns({"sap.app": {id: "1"}});
			sandbox.stub(FlexUtils, "getUShellService").callThrough().withArgs("AppLifeCycle").resolves({
				getCurrentApplication() {
					return {
						homePage: false
					};
				}
			});
		}
		QUnit.test("when RTA is started in the customer layer, context based adaptation feature is available for a (key user)", async function(assert) {
			stubCBA.call(this);
			await this.oRta.start();
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/contextBasedAdaptation/enabled"), true, "then the 'Context Based Adaptation' Menu Button is enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/contextBasedAdaptation/visible"), true, "then the 'Context Based Adaptation' Menu Button is visible");
			assert.strictEqual(this.oContextBasedAdaptationsAPILoadStub.callCount, 1, "CBA Model is load");
		});

		QUnit.test("when RTA is started in the customer layer, context based adaptation feature is available for a (key user) but the current app is an overview page", async function(assert) {
			stubCBA.call(this);
			this.oFlexUtilsGetManifest.returns({"sap.app": {id: "1"}, "sap.ovp": {}});

			await this.oRta.start();
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/contextBasedAdaptation/enabled"), true, "then the 'Context Based Adaptation' Menu Button is enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/contextBasedAdaptation/visible"), true, "then the 'Context Based Adaptation' Menu Button is visible");
		});

		QUnit.test("when RTA is started a 2nd time, context based adaptation feature is available and data has changed on the backend and another adaptation has been shown by end user", async function(assert) {
			stubCBA.call(this);

			FlexInfoSession.setByReference({adaptationId: "67890" }, sReference);
			await ContextBasedAdaptationsAPI.initialize({control: oComp, layer: "CUSTOMER"});
			this.oContextBasedAdaptationsAPILoadStub.resolves({adaptations: [{id: "12345"}, {id: "67890"}, DEFAULT_ADAPTATION]});

			await this.oRta.start();
			assert.strictEqual(this.oContextBasedAdaptationsAPILoadStub.callCount, 2, "CBA Model is loaded again");
			assert.deepEqual(this.oRta._oContextBasedAdaptationsModel.getProperty("/adaptations"), [{id: "12345", rank: 1}, {id: "67890", rank: 2}], "then the adaptations are up to date");
			assert.deepEqual(this.oRta._oContextBasedAdaptationsModel.getProperty("/displayedAdaptation/id"), "67890", "then the displayed adaptation is correct");
		});

		QUnit.test("when RTA is doing a restart during switch, context based adaptation feature is available", async function(assert) {
			stubCBA.call(this);

			FlexInfoSession.setByReference({adaptationId: "67890" }, sReference);
			await ContextBasedAdaptationsAPI.initialize({control: oComp, layer: "CUSTOMER"});
			this.oContextBasedAdaptationsAPILoadStub.resolves({adaptations: [{id: "12345"}, {id: "67890"}, DEFAULT_ADAPTATION]});
			sandbox.stub(ReloadManager, "needsAutomaticStart").resolves(true);

			await this.oRta.start();
			assert.strictEqual(this.oContextBasedAdaptationsAPILoadStub.callCount, 1, "CBA Model is not loaded again");
			assert.deepEqual(this.oRta._oContextBasedAdaptationsModel.getProperty("/adaptations"), [{id: "12345", rank: 1}], "then the adaptations are still the same");
			assert.deepEqual(this.oRta._oContextBasedAdaptationsModel.getProperty("/displayedAdaptation/id"), "12345", "then the displayed adaptation is correct");
		});

		QUnit.test("when RTA is started in the customer layer, app variant feature is available for a (key user) but the current app cannot be detected for home page check", async function(assert) {
			stubToolbarButtonsVisibility(true, true);
			sandbox.stub(AppVariantUtils, "getManifirstSupport").resolves(true);
			sandbox.stub(FlexUtils, "getAppDescriptor").returns({"sap.app": {id: "1"}});
			sandbox.stub(FlexUtils, "isVariantByStartupParameter").returns(false);
			sandbox.stub(FlexUtils, "getUShellService")
			.callThrough()
			.withArgs("AppLifeCycle")
			.resolves({
				getCurrentApplication() {
					return undefined;
				}
			});

			await this.oRta.start();
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/enabled"), true, "then the 'AppVariant Overview' Menu Button is enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/overview/visible"), false, "then the 'AppVariant Overview' Menu Button is not visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/enabled"), true, "then the 'AppVariant Overview' Icon Button is enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/manageApps/visible"), true, "then the 'AppVariant Overview' Icon Button is visible");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/enabled"), true, "then the saveAs Button is enabled");
			assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/appVariantMenu/saveAs/visible"), true, "then the saveAs Button is visible");
		});

		QUnit.test("when save is triggered via the toolbar with an manifest change", async function(assert) {
			let fnResolve;
			const oPromise = new Promise(function(resolve) {
				fnResolve = resolve;
			});
			const oCallbackStub = sandbox.stub().callsFake(function() {
				fnResolve();
			});

			await this.oRta.start();
			const oSerializeStub = sandbox.stub(this.oRta._oSerializer, "saveCommands").resolves();
			sandbox.stub(this.oRta._oSerializer, "needsReload").resolves(true);
			this.oRta.getToolbar().fireSave({
				callback: oCallbackStub
			});
			await oPromise;
			assert.ok(this.oRta._bSavedChangesNeedReload, "the flag was set");
			assert.strictEqual(oSerializeStub.callCount, 1, "the serialize function was called once");
			assert.strictEqual(oCallbackStub.callCount, 1, "the callback function was called once");
		});

		QUnit.test("when save is triggered via the toolbar with a translatable change", function(assert) {
			return new Promise(function(resolve) {
				this.oRta.start().then(function() {
					assert.equal(this.oRta.bPersistedDataTranslatable, false, "no translation is present");

					// simulate a translatable change was done
					this.oRta._oToolbarControlsModel.setProperty("/translation/enabled", true);

					this.oRta.getToolbar().fireSave({
						callback: resolve
					});
				}.bind(this));
			}.bind(this)).then(function() {
				assert.equal(this.oRta._oToolbarControlsModel.getProperty("/translation/enabled"), true, "the translation button is still enabled");
				assert.strictEqual(this.oRta.bPersistedDataTranslatable, true, "the serialize function was called once");
			}.bind(this));
		});

		QUnit.test("when a change needing a hard reload is made", async function(assert) {
			const done = assert.async();
			sandbox.stub(FeaturesAPI, "areAnnotationChangesEnabled").returns(true);
			await this.oRta.start();
			// annotation plugin creates changes that needs a hard reload
			const oAnnotationCommand = new AnnotationCommand({
				selector: {
					appComponent: {}
				}
			});
			const oAnnotationPlugin = this.oRta.getPlugins().annotation;
			sandbox.stub(oAnnotationCommand, "execute").resolves();
			sandbox.stub(ChangesWriteAPI, "create").returns({});
			sandbox.stub(PersistenceWriteAPI, "add");
			sandbox.stub(PersistenceWriteAPI, "save").resolves();
			sandbox.stub(PersistenceWriteAPI, "hasDirtyChanges").returns(true);

			this.oRta.attachEventOnce("undoRedoStackModified", async () => {
				assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/changesNeedHardReload"), true, "then the flag is set");

				this.oRta.attachEventOnce("undoRedoStackModified", () => {
					assert.strictEqual(this.oRta._oToolbarControlsModel.getProperty("/changesNeedHardReload"), true, "then the flag is set");
					done();
				});
				await this.oRta.stop(false, true, true);
			});

			oAnnotationPlugin.fireElementModified({command: oAnnotationCommand});
		});

		function waitForSaveAndReloadEventHandler(oReloadStub) {
			oReloadStub.reset();
			return new Promise((resolve) => {
				oReloadStub.callsFake(() => {
					resolve();
				});
			});
		}

		QUnit.test("when saveAndReload is triggered via the toolbar with unsaved changes", async function(assert) {
			await this.oRta.start();

			sandbox.stub(this.oRta, "canSave").returns(true);
			const oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			const oReloadStub = sandbox.stub(ReloadManager, "reloadPage");
			const oSaveStub = sandbox.stub(this.oRta, "save").resolves();
			const oStopStub = sandbox.stub(this.oRta, "stop").resolves();
			const oLoadDraftStub = sandbox.stub(VersionsAPI, "loadDraftForApplication").resolves();
			sandbox.stub(RtaUtils, "showMessageBox")
			.onCall(0).resolves(MessageBox.Action.CANCEL)
			.onCall(1).resolves(MessageBox.Action.OK)
			.onCall(2).resolves(MessageBox.Action.OK);

			this.oRta.getToolbar().fireSaveAndReload();
			assert.strictEqual(oSaveStub.callCount, 0, "the save function was not called");
			assert.strictEqual(oEnableRestartStub.callCount, 0, "the enableRestart function was not called");
			assert.strictEqual(oReloadStub.callCount, 0, "the reloadPage function was not called");
			assert.strictEqual(oStopStub.callCount, 0, "the stop function was not called");
			assert.strictEqual(oLoadDraftStub.callCount, 0, "the loadDraftForApplication function was not called");

			this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
			this.oRta.getToolbar().fireSaveAndReload();
			await waitForSaveAndReloadEventHandler(oReloadStub);
			assert.strictEqual(oSaveStub.callCount, 1, "the save function was called once");
			assert.strictEqual(oEnableRestartStub.callCount, 1, "the enableRestart function was called once");
			assert.strictEqual(oReloadStub.callCount, 1, "the reloadPage function was called once");
			assert.strictEqual(oStopStub.callCount, 1, "the stop function was called once");
			assert.strictEqual(oLoadDraftStub.callCount, 1, "the loadDraftForApplication function was called once");

			this.oRta._oVersionsModel.setProperty("/versioningEnabled", false);
			this.oRta.getToolbar().fireSaveAndReload();
			await waitForSaveAndReloadEventHandler(oReloadStub);
			assert.strictEqual(oSaveStub.callCount, 2, "the save function was called again");
			assert.strictEqual(oEnableRestartStub.callCount, 2, "the enableRestart function was called again");
			// due to the reset in waitForSaveAndReloadEventHandler, the callCount is 1 again
			assert.strictEqual(oReloadStub.callCount, 1, "the reloadPage function was called again");
			assert.strictEqual(oStopStub.callCount, 2, "the stop function was called again");
			assert.strictEqual(oLoadDraftStub.callCount, 1, "the loadDraftForApplication function was not called again");
		});
	});

	QUnit.done(function() {
		cleanInfoSessionStorage();
		oComp._restoreGetAppComponentStub();
		oComp.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});