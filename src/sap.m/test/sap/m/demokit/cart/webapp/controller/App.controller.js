sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], (BaseController, JSONModel) => {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.App", {
		onInit() {
			const oViewModel = new JSONModel({
				busy: true,
				delay: 0,
				layout: "TwoColumnsMidExpanded",
				smallScreenMode: true
			});
			this.setModel(oViewModel, "appView");

			const iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			const fnSetAppNotBusy = () => {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// since then() has no "reject"-path attach to the MetadataFailed-Event to disable the busy indicator in case of an error
			this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});
});