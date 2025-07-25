sap.ui.define(["sap/ui/integration/Extension", 'sap/m/MessageToast'
], function (Extension, MessageToast) {
	"use strict";

	var CustomizedActionsExtension = Extension.extend("adaptivecard.embedded.CustomizedActionsExtension");

	CustomizedActionsExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	/* Custom event handler for the submit event.
	Intercepts submit action, performs validation and data modifications. */
	CustomizedActionsExtension.prototype._handleAction = function (oEvent) {
		var oCard = this.getCard(),
			sActionType = oEvent.getParameter("type"),
			mFormData = oEvent.getParameter("formData");

		if (sActionType !== "Submit") {
			return;
		}

		oEvent.preventDefault();

		// Validates and modifies data before submitting it
		if (mFormData.Name === "Enter your name") {
			oCard.showMessage("Please enter your name", "Error");
		} else if (mFormData.Name === "") {
			oCard.showMessage("Submission of an empty name is not allowed.", "Error");
		} else {
			// Submits to a mock server
			oCard.request({
				"url": "../adaptive/extensionSample/MOCK.json",
				"method": "GET",
				"parameters": mFormData
			}).then(function () {
				oCard.showMessage("Your name has been submitted successfully", "Success");
			}).catch(function(oErrorInfo) {
				oCard.showMessage(oErrorInfo.message, "Error");
			});
		}

		MessageToast.show("This submit action was modified with extension module", {
			at: "center center",
			width: "25rem"
		});
	};

	return CustomizedActionsExtension;
});
