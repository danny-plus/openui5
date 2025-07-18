/*!
 * ${copyright}
 */

// Provides control sap.m.PDFViewer.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/m/PDFViewerRenderManager",
	"sap/m/PDFViewerRenderer",
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Lib"
],
	function(
		library,
		Control,
		Device,
		PDFViewerRenderManager,
		PDFViewerRenderer,
		Log,
		assert,
		jQuery,
		CoreLib
	) {
		"use strict";

		var PDFViewerDisplayType = library.PDFViewerDisplayType;

		/**
		 * Definition of PDFViewer control
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * <p>This control enables you to display PDF documents within your app.
		 * It can be embedded in your user interface layout, or you can set it to open in a popup dialog.</p>
		 * <p>Please note that the PDF Viewer control can be fully displayed on desktop devices only. On mobile
		 * devices, only the toolbar with a download button is visible.</p>
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.48
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.PDFViewer
		 * @see {@link topic:cd80a8bca4ac450b86547d78f0653330 PDF Viewer}
		 */
		var PDFViewer = Control.extend("sap.m.PDFViewer",
			/** @lends sap.m.PDFViewer.prototype */
			{
				metadata: {
					library: "sap.m",
					properties: {
						/**
						 * Defines the height of the PDF viewer control, respective to the height of
						 * the parent container. Can be set to a percent, pixel, or em value.
						 */
						height: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%"},
						/**
						 * Defines the width of the PDF viewer control, respective to the width of the
						 * parent container. Can be set to a percent, pixel, or em value.
						 */
						width: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%"},
						/**
						 * Specifies the path to the PDF file to display. Can be set to a relative or
						 * an absolute path.<br>
						 * Optionally, this property can also be set to a data URI path or a blob URL
						 * in all major web browsers except Internet Explorer and Microsoft Edge, provided
						 * that this data URI or blob URL is allowed in advance. For more information about
						 * URL filtering, see {@link topic:91f3768f6f4d1014b6dd926db0e91070 URLList Validator Filtering}.
						 */
						source: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},
						/**
						 * A custom error message that is displayed when the PDF file cannot be loaded.
						 * @deprecated As of version 1.50.0, replaced by {@link sap.m.PDFViewer#getErrorPlaceholderMessage}.
						 */
						errorMessage: {type: "string", group: "Misc", defaultValue: null, deprecated: true},
						/**
						 * A custom text that is displayed instead of the PDF file content when the PDF
						 * file cannot be loaded.
						 */
						errorPlaceholderMessage: {type: "string", group: "Misc", defaultValue: null},
						/**
						 * A custom title for the PDF viewer popup dialog. Works only if the PDF viewer
						 * is set to open in a popup dialog.
						 * @deprecated As of version 1.50.0, replaced by {@link sap.m.PDFViewer#getTitle}.
						 */
						popupHeaderTitle: {type: "string", group: "Misc", defaultValue: null, deprecated: true},

						/**
						 * A custom title for the PDF viewer.
						 */
						title: {type: "string", group: "Misc", defaultValue: null},

						/**
						* Shows or hides the download button.
						*/
						showDownloadButton: {type: "boolean", group: "Misc", defaultValue: true},

						/**
						* Defines how the PDF viewer should be displayed.
						* <ul>
						* <li>If set to <code>Link</code>, the PDF viewer appears as a toolbar with a download
						* button that can be used to download the PDF file.<br>
						* When the {@link #open} method is called, the user can either open the PDF file in a
						* new tab or download it.</li>
						* <li>If set to <code>Embedded</code>, the PDF viewer appears embedded in the parent
						* container and displays either the PDF document or the message defined by the
						* <code>errorPlaceholderMessage</code> property.</li>
						* <li>If set to <code>Auto</code>, the appearance of the PDF viewer depends on the
						* device being used:
						* <ul>
						* <li>On mobile devices (phones, tablets), the PDF viewer appears as a toolbar with
						* a download button.</li>
						* <li>On desktop devices, the PDF viewer is embedded in its parent container.</li>
						* </ul>
						* </li>
						* </ul>
						*/
						displayType: {type: "sap.m.PDFViewerDisplayType", group: "Misc", defaultValue: PDFViewerDisplayType.Auto},
						/**
						 * Parameter to determine if the given PDF is from a trusted source. If the source is valid this property can be set to true.
						 * If isTrustedSource is set to true, the PDFViewer opens with the displayType set to "Embedded" on desktop devices. This means that the PDF content is directly shown within the PDFViewer. Set this property to true only when the PDF is generated by the application or the PDF is scanned for viruses.
						 * If isTrustedSource is set to false, the PDFViewer opens with the displayType set to "Link" on desktop devices. This means that any configuration that has been provided by the application for the property displayType is overridden. In this case, the user would need to download the PDF to view its content.
						 */
						isTrustedSource: {type: "boolean", group: "Misc", defaultValue: false}
					},
					aggregations: {
						/**
						 * A custom control that can be used instead of the error message specified by the
						 * errorPlaceholderMessage property.
						 */
						errorPlaceholder: {type: "sap.ui.core.Control", multiple: false},
						/**
						 * A multiple aggregation for buttons that can be added to the footer of the popup
						 * dialog. Works only if the PDF viewer is set to open in a popup dialog.
						 */
						popupButtons: {type: "sap.m.Button", multiple: true, singularName: "popupButton"},
						/**
						 * An illustrated message is displayed when pdf cannot be displayed
						 * @private
						 */
						_illustratedMessage: { type: "sap.m.IllustratedMessage", multiple: false, visibility: "hidden" },
						/**
						 * An illustrated message is displayed when the property isTrustedSource = false
						 * @private
						 */
						_nonTrustedIllustratedMessage: { type: "sap.m.IllustratedMessage", multiple: false, visibility: "hidden" }
					},
					events: {
						/**
						 * This event is fired when a PDF file is loaded. If the PDF is loaded in smaller chunks,
						 * this event is fired as often as defined by the browser's plugin. This may happen after
						 * a couple chunks are processed.
						 */
						loaded: {},
						/**
						 * This event is fired when there is an error loading the PDF file.
						 */
						error: {
							parameters : {
								/**
								 * The iframe element.
								 */
								target : {type: "any"}
							}
						},
						/**
						 * This event is fired when the PDF viewer control cannot check the loaded content. For
						 * example, the default configuration of the Mozilla Firefox browser may not allow checking
						 * the loaded content. This may also happen when the source PDF file is stored in a different
						 * domain.
						 * If you want no error message to be displayed when this event is fired, call the
						 * preventDefault() method inside the event handler.
						 */
						sourceValidationFailed: {}
					}
				},

				renderer: PDFViewerRenderer
			});


		/**
		 * Lifecycle method
		 *
		 * @private
		 */
		PDFViewer.prototype.init = function () {
			// helper object that holds the references of nested objects
			this._objectsRegister = {};

			// state variable that shows the state of popup (rendering of pdf in popup requires it)
			this._bIsPopupOpen = false;
			this._isError = false;

			this._initPopupControl();
			this._initPopupDownloadButtonControl();
			this._initErrorPlaceholderIllustratedMessageControl();
			this._initToolbarDownloadButtonControl();
			this._initOverflowToolbarControl();

			this._initControlState();
		};

		/**
		 * Setup state variables to default state
		 *
		 * @private
		 */
		PDFViewer.prototype._initControlState = function () {
			// state property that control if the embedded pdf should or should not rendered.
			this._bRenderPdfContent = true;
		};

		PDFViewer.prototype.setWidth = function (sWidth) {
			this.setProperty("width", sWidth, true);
			var oDomRef = this.$();
			if (oDomRef === null) {
				return this;
			}

			oDomRef.css("width", this._getRenderWidth());
			return this;
		};

		PDFViewer.prototype.setHeight = function (sHeight) {
			this.setProperty("height", sHeight, true);
			var oDomRef = this.$();
			if (oDomRef === null) {
				return this;
			}

			oDomRef.css("height", this._getRenderHeight());
			return this;
		};

		PDFViewer.prototype.onBeforeRendering = function () {
			try {
				//unbind all iFrame events before rendering
				var oIframeElement = this._getIframeDOMElement();
				oIframeElement.remove();
			} catch (error) {
				Log.info(error);
			}
		};

		/**
		 * Lifecycle method
		 *
		 * @private
		 */
		PDFViewer.prototype.onAfterRendering = function () {
			var fnInitIframeElement = function () {
				// cant use attachBrowserEvent because it attach event to component root node (this.$())
				// load event does not bubble so it has to be bind directly to iframe element
				var oIframeElement = this._getIframeDOMElement();

				oIframeElement.on("load", this._onLoadListener.bind(this));
				oIframeElement.on("error", this._onErrorListener.bind(this));
			}.bind(this);

			try {
				this.setBusy(true);
				fnInitIframeElement();
			} catch (error) {
				Log.info(error);
				if (this._isError) {
					this._isError = false;
					this._objectsRegister.getErrorPlaceholderIllustratedMessageControl().invalidate();
				}
				this.setBusy(false);
			}
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._fireErrorEvent = function (oEventTarget) {
			this._renderErrorState();
			this.fireError({
				target: oEventTarget || null
			});
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._renderErrorState = function () {
			var oDownloadButton = this._objectsRegister.getToolbarDownloadButtonControl();
			oDownloadButton.setEnabled(false);

			var oDownloadButton = this._objectsRegister.getPopupDownloadButtonControl();
			oDownloadButton.setEnabled(false);

			this.setBusy(false);
			this._bRenderPdfContent = false;
			// calls controls invalidate because the error state should be render.
			// It is controlled by the state variable called _bRenderPdfContent
			// The main invalidate set the state of the control to the default and tries to load and render pdf
			Control.prototype.invalidate.call(this);
			//this._isError = true;
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._fireLoadedEvent = function () {
			this._bRenderPdfContent = true;
			this.setBusy(false);
			try {
				this._getIframeDOMElement().removeClass("sapMPDFViewerLoading");
			} catch (err) {
				Log.fatal("Iframe not found in loaded event");
				Log.fatal(err);
			}
			this.fireEvent("loaded");
		};

		/**
		 * @param {string} [src] - url of pdf
		 * @param {string} [method] - GET or HEAD mothod
		 * @returns - content-type header from the response header
		 * @description - this method fetches response headers from server to validate content-type.
		 * @private
		 */
		PDFViewer.prototype._getHeaderInfo = function (src, sMethod) {
			if (window.fetch) {
				// Trigger fetch call to retrieve the content-type header for the given PDF
				return window.fetch(src, { method: sMethod })
					.then(function(response) {
						if (response.status === 200) {
							// If the HEAD request is successful, return the content-type header
							return response.headers.get("content-type");
						} else if (response.status === 404) {
							// If the HEAD request fails to fetch the content defined in source, an error event is triggered and LoadingError IllustratedMessage is displayed.
							var error = new Error("Error fetching header: " + response.statusText);
							error.status = response.status;
							throw error;
						} else {
							// If the HEAD request fails for any other reason, throw an error
							var error = new Error("Error in fetching header with method " + sMethod + ", status " + response.status + ", statusText " + response.statusText);
							error.status = response.status;
							throw error;
						}
					});
			} else {
				return new Promise(function(resolve, reject) {
					var oXMLHttpRequest = new window.XMLHttpRequest();
					oXMLHttpRequest.open(sMethod, src, false);
					oXMLHttpRequest.onload = function() {
						var sStatus = oXMLHttpRequest.status;
						if (sStatus === 200) {
							var response = oXMLHttpRequest.getAllResponseHeaders().toLowerCase().trim();
							var items = response.split("\n");
							var responseHeader = [];
							for (var i = 0; i < items.length; i++) {
								var parts = items[i].split(': ');
								responseHeader[parts[0].trim()] = parts[1].trim();
							}
							resolve(responseHeader['content-type']);
						} else if (sStatus === 404) {
							// If the HEAD request fails to fetch the content defined in source, an error event is triggered and LoadingError IllustratedMessage is displayed.
							var error = new Error("Error fetching header: " + oXMLHttpRequest.statusText);
							error.status = oXMLHttpRequest.status;
							reject(error);
						} else {
							var error = new Error("Error in fetching header with method " + sMethod + ", status " + oXMLHttpRequest.status + " and statusText " + oXMLHttpRequest.statusText);
							error.status = oXMLHttpRequest.status;
							reject(error);
						}
					};
					oXMLHttpRequest.onerror = function(error) {
						var error = new Error("Error in fetching header with method " + sMethod + ", status " + oXMLHttpRequest.status + " and statusText " + oXMLHttpRequest.statusText);
						error.status = oXMLHttpRequest.status;
						reject(error);
					};
					oXMLHttpRequest.send(null);
				});
			}
		};

		/**
		 * @param oEvent
		 * @private
		 */
		PDFViewer.prototype._onLoadListener = function (oEvent) {
			try {
				var oTarget = jQuery(oEvent.target);
				var bContinue = true, sCurrentContentType = '';

				//HTML body.children can be accessed only in scenario when chrome://flags/#pdf-oopif = disabled OR invalid path given to the iframe src
				try {
					var aTargetChildren = oTarget[0]?.contentWindow?.document?.body?.children;
				} catch (error) {
					/* Firefox
						https://bugzilla.mozilla.org/show_bug.cgi?id=911444
						because of the embedded pdf plugin in firefox it is not possible to check contentType of the iframe document
						if the content is pdf. If the content is not a pdf and it is from the same origin, it can be accessed.
						Other browsers allow access to the mimeType of the iframe's document if the content is from the same origin.
						If browser is Firefox we triggerHEADRequest to fetch the ContentType.
					*/
					if (Device.browser.firefox) {
						aTargetChildren = [];
					}
				}
				//If chrome://flags/#pdf-oopif = disabled follow the existing approach to validate contentType.
				if (aTargetChildren?.length) {
					try {
						// browsers render pdf in iframe as html page with embed tag
						var aEmbeds = oTarget[0].contentWindow.document.embeds;
						bContinue = !!aEmbeds && aEmbeds.length === 1;
						if (bContinue) {
							sCurrentContentType = aEmbeds[0].attributes.getNamedItem("type").value;
						}
					} catch (error) {
						// even though the sourceValidationFailed event is fired, the default behaviour is to continue.
						// when preventDefault is on event object is called, the rendering ends up with error
						if (!Device.browser.firefox && this.fireEvent("sourceValidationFailed", {}, true)) {
							this._fireLoadedEvent();
							return;
						}
					}
					/*	LoadedEvent will be triggered if all the below criteria matches and PDF is displayed
							1. If embed tag is present.
							2. If ContentType = "application/pdf" / "application/x-google-chrome-pdf".
							3. If Browser PDFPlugin is enabled.
						else the ErrorEvent will be triggered, It will also be triggered if an invalid path is proveded as src for the iframe and LoadingError IllustratedMessage is displayed.
					*/
					if (bContinue && PDFViewerRenderer._isSupportedMimeType(sCurrentContentType) && PDFViewerRenderer._isPdfPluginEnabled()) {
						this._fireLoadedEvent();
					} else {
						this._fireErrorEvent(oEvent.target);
					}
				} else {
					// Check if PDF plugin is enabled before proceeding
					if (!PDFViewerRenderer._isPdfPluginEnabled()) {
						this._fireErrorEvent(oEvent.target);
						return;
					}
					//If chrome://flags/#pdf-oopif = enabled trigger the HEAD Request
					var sMethod = 'HEAD';
					this._getHeaderInfo(this._sParametrizedSource, sMethod)
					.then(function(sCurrentContentType) {
						/*	LoadedEvent will be triggered if all the below criteria matches
								1. If ContentType = "application/pdf" / "application/x-google-chrome-pdf".
								2. If Browser PDFPlugin is enabled.
							else the ErrorEvent will be triggered and LoadingError IllustratedMessage is displayed.
						*/
						if (PDFViewerRenderer._isSupportedMimeType(sCurrentContentType)) {
							this._fireLoadedEvent();
						} else {
							this._fireErrorEvent(oEvent.target);
						}
					}.bind(this)).catch(function(error) {
						if (error.status === 404) {
							//If the HEAD Request fails to get the content defined in source, the ErrorEvent is triggered and LoadingError IllustratedMessage is displayed.
							this._fireErrorEvent(oEvent.target);
						} else {
							// If the HEAD Requets fails for any other scenario, the default behaviour is to continue the display of PDF based on isTrustedSource.
							Log.warning("PDF is displayed based on isTrustedSource property skipping the content type validation.");
							this._fireLoadedEvent();
							this.fireEvent("sourceValidationFailed", {}, true);
						}
					}.bind(this));
				}
			} catch (error) {
				//Generic Error Handling
				this._fireErrorEvent(oEvent.target);
				Log.fatal(false, "Fatal error during the handling of load event happened.");
				Log.fatal(false, error.message);
			}
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._onErrorListener = function () {
			this._fireErrorEvent();
		};

		/**
		 * Downloads the PDF file.
		 *
		 * @public
		 */
		PDFViewer.prototype.downloadPDF = function () {
			var oWindow = window.open(this.getSource());
			oWindow.opener = null;
			oWindow.focus();
		};

		/**
		 * @param oEvent
		 * @private
		 */
		PDFViewer.prototype._onAfterPopupClose = function (oEvent) {
			var oPopup = this._objectsRegister.getPopup();
			// content has to be cleared from dom
			oPopup.removeAllContent();
			this._bIsPopupOpen = false;
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._shouldRenderPdfContent = function () {
			return PDFViewerRenderer._isPdfPluginEnabled() && this._bRenderPdfContent && this._isSourceValidToDisplay();
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._isSourceValidToDisplay = function () {
			var sSource = this.getSource();
			return sSource !== null && sSource !== "" && typeof sSource !== "undefined";
		};

		/**
		 * Triggers rerendering of this element and its children.
		 *
		 * @param {sap.ui.base.ManagedObject} [oOrigin] Child control for which the method was called
		 *
		 * @public
		 */
		PDFViewer.prototype.invalidate = function (oOrigin) {
			this._initControlState();
			Control.prototype.invalidate.call(this, oOrigin);
		};

		/**
		 * Opens the PDF viewer in a popup dialog.
		 *
		 * @public
		 */
		PDFViewer.prototype.open = function () {
			if (!this._isSourceValidToDisplay()) {
				assert(false, "The PDF file cannot be opened with the given source. Given source: " + this.getSource());
				return;
			} else if (!PDFViewerRenderer._isPdfPluginEnabled()) {
				Log.warning("The PDF plug-in is not available on this device.");
			}

			if (this._isEmbeddedModeAllowed() && this.getIsTrustedSource()) {
				this._openOnDesktop();
			} else {
				this._openOnMobile();
			}
		};

		/**
		 * Handles opening on desktop devices
		 * @private
		 */
		PDFViewer.prototype._openOnDesktop = function () {
			var oPopup = this._objectsRegister.getPopup();

			if (this._bIsPopupOpen) {
				return;
			}

			this._initControlState();
			this._preparePopup(oPopup);
			oPopup.addContent(this);

			this._bIsPopupOpen = true;
			oPopup.open();
		};

		/**
		 * Handles opening on mobile/tablet devices
		 * @private
		 */
		PDFViewer.prototype._openOnMobile = function () {
			var oWindow = window.open(this.getSource());
			oWindow.opener = null;
			oWindow.focus();
		};

		/**
		 * Gets the iframe element from rendered DOM
		 * @returns {*} jQuery object of iframe
		 * @private
		 */
		PDFViewer.prototype._getIframeDOMElement = function () {
			var oIframeElement = this.$("iframe");
			if (oIframeElement.length === 0) {
				throw Error("Underlying iframe was not found in DOM.");
			}
			if (oIframeElement.length > 1) {
				Log.fatal("Initialization of iframe fails. Reason: the control somehow renders multiple iframes");
			}
			return oIframeElement;
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._isEmbeddedModeAllowed = function () {
			//Allow Embedding only if PDFViewer plugin is present
			return this._isDisplayTypeAuto() ? Device.system.desktop : this._isDisplayTypeEmbedded();
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._isDisplayTypeAuto = function () {
			return this.getDisplayType() === PDFViewerDisplayType.Auto;
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._isDisplayTypeEmbedded = function () {
			return this.getDisplayType() === PDFViewerDisplayType.Embedded;
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._isDisplayTypeLink = function () {
			return this.getDisplayType() === PDFViewerDisplayType.Link;
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._isDisplayDownloadButton = function () {
			return this.getShowDownloadButton() || this._isDisplayTypeLink() || (this._isDisplayTypeAuto() && !this._isEmbeddedModeAllowed());
		};

		/**
		 * @returns {module:sap/base/i18n/ResourceBundle}
		 * @private
		 */
		PDFViewer.prototype._getLibraryResourceBundle = function () {
			return CoreLib.getResourceBundleFor("sap.m");
		};

		/**
		 * @returns {string}
		 * @private
		 */
		PDFViewer.prototype._getIllustratedMessageErrorMessage = function () {
			return this.getErrorPlaceholderMessage() ? this.getErrorPlaceholderMessage() :
				this._getLibraryResourceBundle().getText("PDF_VIEWER_PLACEHOLDER_ERROR_TEXT");
		};

		/**
		 * @returns {string}
		 * @private
		 */
		PDFViewer.prototype._getRenderWidth = function () {
			return this._bIsPopupOpen ? '100%' : this.getWidth();
		};

		/**
		 * @returns {string}
		 * @private
		 */
		PDFViewer.prototype._getRenderHeight = function () {
			if (this._bIsPopupOpen) {
				return '100%';
			}

			if (!this._isEmbeddedModeAllowed()) {
				return 'auto';
			}

			return this.getHeight();
		};

		/**
		 * Lifecycle method
		 * @private
		 */
		PDFViewer.prototype.exit = function () {
			jQuery.each(this._objectsRegister, function (iIndex, fnGetObject) {
				var oObject = fnGetObject(true);
				if (oObject) {
					oObject.destroy();
				}
			});

			try {
				//unbind all iFrame events before rendering
				var oIframeElement = this._getIframeDOMElement();
				oIframeElement.off();
			} catch (error) {
				Log.info(error);
			}
		};

		PDFViewerRenderManager.extendPdfViewer(PDFViewer);

		return PDFViewer;
	});
