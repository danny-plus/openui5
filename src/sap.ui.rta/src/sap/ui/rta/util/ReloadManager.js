/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils"
], function(
	merge,
	FlexRuntimeInfoAPI,
	ReloadInfoAPI,
	VersionsAPI,
	Layer,
	FlUtils,
	Utils
) {
	"use strict";

	/**
	 * Static class to handle all the reload related functionality for UI Adaptation
	 *
	 * @class
	 * @namespace sap.ui.rta.util.ReloadManager
	 * @alias sap.ui.rta.util.ReloadManager
	 * @since 1.104
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	const ReloadManager = {};

	let mUShellServices = {};

	function getReloadMessageOnStart(oReloadInfo) {
		let sReason;
		const bIsCustomerLayer = oReloadInfo.layer === Layer.CUSTOMER;

		if (oReloadInfo.hasHigherLayerChanges && oReloadInfo.isDraftAvailable) {
			sReason = bIsCustomerLayer ? "MSG_VIEWS_OR_PERSONALIZATION_AND_DRAFT_EXISTS" : "MSG_HIGHER_LAYER_CHANGES_AND_DRAFT_EXISTS";
		} else if (oReloadInfo.hasHigherLayerChanges && oReloadInfo.allContexts) {
			sReason = "MSG_RESTRICTED_CONTEXT_EXIST_AND_PERSONALIZATION";
		} else if (oReloadInfo.hasHigherLayerChanges) {
			sReason = bIsCustomerLayer ? "MSG_PERSONALIZATION_OR_PUBLIC_VIEWS_EXISTS" : "MSG_HIGHER_LAYER_CHANGES_EXIST";
		} else if (oReloadInfo.isDraftAvailable) {
			sReason = "MSG_DRAFT_EXISTS";
		} else if (oReloadInfo.allContexts) {
			sReason = "MSG_RESTRICTED_CONTEXT_EXIST";
		}// TODO add app descr changes case for start?
		return sReason;
	}

	function getReloadMessageOnExit(oReloadInfo) {
		const bIsCustomerLayer = oReloadInfo.layer === Layer.CUSTOMER;

		if (oReloadInfo.hasHigherLayerChanges) {
			if (!bIsCustomerLayer) {
				return "MSG_RELOAD_WITH_ALL_CHANGES";
			}
			if (oReloadInfo.isDraftAvailable) {
				return "MSG_RELOAD_WITH_VIEWS_PERSONALIZATION_AND_WITHOUT_DRAFT";
			}
			if (oReloadInfo.allContexts) {
				return "MSG_RELOAD_WITH_PERSONALIZATION_AND_RESTRICTED_CONTEXT";
			}
			if (oReloadInfo.switchEndUserAdaptation) {
				return "MSG_RELOAD_WITH_PERSONALIZATION_AND_CONTEXT_BASED_ADAPTATION";
			}
			return "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS";
		}

		if (oReloadInfo.changesNeedReload) {
			return "MSG_RELOAD_NEEDED";
		}

		if (oReloadInfo.initialDraftGotActivated || oReloadInfo.activeVersionNotSelected) {
			return "MSG_RELOAD_ACTIVATED_DRAFT";
		}

		if (oReloadInfo.isDraftAvailable) {
			return "MSG_RELOAD_WITHOUT_DRAFT";
		}

		if (oReloadInfo.allContexts) {
			return "MSG_RELOAD_WITHOUT_ALL_CONTEXT";
		}

		if (oReloadInfo.switchEndUserAdaptation) {
			return "MSG_RELOAD_OTHER_CONTEXT_BASED_ADAPTATION";
		}
		return undefined;
	}

	async function handleReloadMessageBoxOnExit(oReloadReasons) {
		const sReason = getReloadMessageOnExit(oReloadReasons);

		if (sReason) {
			await Utils.showMessageBox("information", sReason, {
				titleKey: "HEADER_RELOAD_NEEDED"
			});
		}
	}

	async function triggerReloadOnStart(oReloadInfo) {
		if (mUShellServices.Navigation && oReloadInfo.versioningEnabled) {
			// clears FlexState and triggers reloading of the flex data without blocking
			if (oReloadInfo.isDraftAvailable) {
				await VersionsAPI.loadDraftForApplication({
					control: oReloadInfo.selector,
					layer: oReloadInfo.layer,
					allContexts: oReloadInfo.allContexts,
					adaptationId: oReloadInfo.adaptationId
				});
			} else {
				await VersionsAPI.loadVersionForApplication({
					control: oReloadInfo.selector,
					layer: oReloadInfo.layer,
					allContexts: oReloadInfo.allContexts,
					adaptationId: oReloadInfo.adaptationId
				});
			}
		}
		const sReason = getReloadMessageOnStart(oReloadInfo);
		// showing messages in visual editor is leading to blocked screen. In this case we should reload without message
		if (!oReloadInfo.developerMode) {
			await Utils.showMessageBox("information", sReason);
		}
		ReloadManager.enableAutomaticStart(oReloadInfo.layer, oReloadInfo.selector);
		oReloadInfo.onStart = true;
		ReloadManager.triggerReload(oReloadInfo);
		return true;
	}

	ReloadManager.setUShellServices = function(mPassedUShellServices) {
		mUShellServices = mPassedUShellServices;
	};

	/**
	 * Enables automatic key user adaptation start.
	 *
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 * @param {sap.ui.core.Control} oRootControl - Root control for which key user adaptation was started
	 */
	ReloadManager.enableAutomaticStart = function(sLayer, oRootControl) {
		const sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oRootControl});
		const vParameter = sFlexReference || true;
		window.sessionStorage.setItem(`sap.ui.rta.restart.${sLayer}`, vParameter);
	};

	/**
	 * Disable automatic key user adaptation start
	 *
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 */
	ReloadManager.disableAutomaticStart = function(sLayer) {
		window.sessionStorage.removeItem(`sap.ui.rta.restart.${sLayer}`);
	};

	/**
	 * Checks if the flag for an automatic key user adaptation start is set.
	 *
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 * @returns {boolean} <code>true</code> if restart is needed
	 */
	ReloadManager.needsAutomaticStart = function(sLayer) {
		return !!window.sessionStorage.getItem(`sap.ui.rta.restart.${sLayer}`);
	};

	/**
	 * Triggers the reload of the page. Can either be a soft reload inside the FLP or a hard reload.
	 *
	 * @param {object} oReloadInfo - Information needed for the reload
	 * @param {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
	 * @param {boolean} oReloadInfo.ignoreMaxLayerParameter - Indicates if the max layer parameter should be ignored
	 * @param {string} oReloadInfo.versionSwitch - Indicates if we are in a version switch scenario
	 * @param {string} oReloadInfo.version - Version we want to switch to
	 * @param {string} oReloadInfo.removeVersionParameter - Indicates if version parameter should be removed
	 * @param {string} oReloadInfo.removeDraft - Indicates if draft parameter should be removed
	 */
	ReloadManager.triggerReload = function(oReloadInfo) {
		if (oReloadInfo.onStart) {
			ReloadInfoAPI.handleReloadInfoOnStart(oReloadInfo);
		} else {
			ReloadInfoAPI.handleReloadInfo(oReloadInfo);
		}
		if (FlUtils.getUshellContainer()) {
			mUShellServices.AppLifeCycle.reloadCurrentApp();
		} else {
			ReloadManager.reloadPage();
		}
	};

	/**
	 * Reloads the page via the browsers window object.
	 */
	ReloadManager.reloadPage = function() {
		window.location.reload();
	};

	/**
	 * Sets the given parameters as <code>document.location.search</code> which will trigger a browser reload.
	 * @param {string} sParameters - URL parameters
	 */
	ReloadManager.setUriParameters = function(sParameters) {
		document.location.search = sParameters;
	};

	/**
	 * Checks if there are personalization changes/draft changes and restarts the application without/with them.
	 * Warns the user that the application will be restarted without personalization / with draft changes.
	 * Checks if it is necessary to load all contexts.
	 * @param {object} mProperties - Object with additional information
	 * @param {sap.ui.fl.Layer} mProperties.layer - Current layer
	 * @param {sap.ui.fl.Selector} mProperties.selector - Root control
	 * @param {boolean} mProperties.versioningEnabled - Whether versioning is enabled
	 * @param {boolean} mProperties.developerMode - Whether the developer mode is set
	 * @param {string} mProperties.adaptationId - Context-based adaptation ID of the currently displayed adaptation
	 *
	 * @return {Promise<boolean>} Resolving to <code>false</code> means that reload is not necessary
	 */
	ReloadManager.handleReloadOnStart = async function(mProperties) {
		merge(mProperties, {
			ignoreMaxLayerParameter: false,
			includeCtrlVariants: true
		});
		const oReloadInfo = await ReloadInfoAPI.getReloadReasonsForStart(mProperties);
		if (
			oReloadInfo.hasHigherLayerChanges
			|| oReloadInfo.isDraftAvailable
			|| oReloadInfo.allContexts
		) {
			return triggerReloadOnStart(merge(mProperties, oReloadInfo));
		}
		return undefined;
	};

	/**
	 * When exiting key user adaptation and personalization changes exist, the user can choose to
	 * reload the app with personalization or stay in the app without the personalization.
	 * @param {object} mProperties - Object with additional information
	 * @param {sap.ui.fl.Layer} mProperties.layer - Current layer
	 * @param {sap.ui.fl.Selector} mProperties.selector - Root control
	 * @param {boolean} mProperties.versioningEnabled - Whether versioning is enabled
	 * @param {boolean} mProperties.isDraftAvailable - Whether a draft is available
	 * @param {boolean} mProperties.activeVersion - Number of the active version
	 * @param {Promise} mProperties.changesNeedReloadPromise - Resolves to whether any change needs a reload
	 * @param {boolean} bSkipRestart - Stop key user adaptation without reloading the app in any way
	 *
	 * @return {Promise<object>} Resolving to an object containing information about whether a reload is needed and how to handle it
	 */
	ReloadManager.checkReloadOnExit = async function(mProperties) {
		const bChangesNeedReload = await mProperties.changesNeedReloadPromise;
		mProperties.changesNeedReload = bChangesNeedReload;
		const oReloadInfo = ReloadInfoAPI.getReloadInfo(mProperties);
		await handleReloadMessageBoxOnExit(oReloadInfo);
		return oReloadInfo;
	};

	/**
	 * Reloads the app inside FLP or standalone by removing max layer / draft parameter;
	 *
	 * @param {object} oReloadInfo - Information needed for the reload
	 * @param {boolean} oReloadInfo.hasHigherLayerChanges - Indicates if higher layer changes exist
	 */
	ReloadManager.handleReloadOnExit = function(oReloadInfo) {
		if (oReloadInfo.reloadNeeded) {
			oReloadInfo.removeVersionParameter = true;
			ReloadManager.triggerReload(oReloadInfo);
		}
	};

	return ReloadManager;
});