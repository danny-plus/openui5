/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog"
], function(
	Element,
	AddIFrameDialog
) {
	"use strict";

	return async function editIFrame(oIFrame) {
		const oAddIFrameDialog = new AddIFrameDialog();
		const oInitialSettings = oIFrame.get_settings();
		const mRenameInfo = oIFrame.getRenameInfo();

		// The title of the iFrame container could have changed
		// so we need to retrieve it before opening the dialog
		if (mRenameInfo) {
			const oContainer = Element.getElementById(mRenameInfo.sourceControlId);
			oInitialSettings.title = oContainer.getProperty(mRenameInfo.propertyName);
		}

		const mURLParameters = await AddIFrameDialog.buildUrlBuilderParametersFor(oIFrame);
		const mDialogSettings = {
			parameters: mURLParameters,
			frameUrl: oInitialSettings.url,
			frameWidth: oInitialSettings.width,
			frameHeight: oInitialSettings.height,
			title: oInitialSettings.title,
			asContainer: !!oInitialSettings.title,
			useLegacyNavigation: oInitialSettings.useLegacyNavigation,
			updateMode: true
		};
		const mSettings = await oAddIFrameDialog.open(mDialogSettings, oIFrame);
		if (!mSettings) {
			return []; // No change
		}
		const aChanges = [];
		let bContentChanged = false;
		const oNewContent = {
			url: oInitialSettings.url,
			height: oInitialSettings.height,
			width: oInitialSettings.width,
			useLegacyNavigation: oInitialSettings.useLegacyNavigation
		};

		if (mSettings.frameHeight + mSettings.frameHeightUnit !== oInitialSettings.height) {
			bContentChanged = true;
			oNewContent.height = mSettings.frameHeight + mSettings.frameHeightUnit;
		}
		if (mSettings.frameWidth + mSettings.frameWidthUnit !== oInitialSettings.width) {
			bContentChanged = true;
			oNewContent.width = mSettings.frameWidth + mSettings.frameWidthUnit;
		}
		if (mSettings.frameUrl !== oInitialSettings.url) {
			bContentChanged = true;
			oNewContent.url = mSettings.frameUrl;
		}
		if (mSettings.useLegacyNavigation !== !!oInitialSettings.useLegacyNavigation) {
			bContentChanged = true;
			oNewContent.useLegacyNavigation = mSettings.useLegacyNavigation;
		}

		if (bContentChanged) {
			aChanges.push({
				selectorControl: oIFrame,
				changeSpecificData: {
					changeType: "updateIFrame",
					content: oNewContent
				}
			});
		}

		// If the title changes a rename change must be created
		if (mSettings.title !== oInitialSettings.title) {
			const mRenameChange = {
				selectorControl: Element.getElementById(mRenameInfo.selectorControlId),
				changeSpecificData: {
					changeType: "rename",
					content: {
						value: mSettings.title
					}
				}
			};
			aChanges.push(mRenameChange);
		}
		return aChanges;
	};
});