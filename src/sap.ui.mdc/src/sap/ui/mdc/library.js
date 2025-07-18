/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.mdc.
 */
sap.ui.define([
	"sap/ui/base/DataType",
	"sap/ui/core/Lib",
	"sap/ui/core/library", // library dependency
	"sap/m/library" // library dependency
], (DataType, Library) => {
	"use strict";

	/**
	 * OpenUI5 library that contains metadata-driven composite controls, which can be extended
	 * for use with any SAPUI5 model and data protocol.
	 *
	 * @namespace
	 * @alias sap.ui.mdc
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.80
	 * @public
	 */
	const thisLib = Library.init({
		apiVersion: 2,
		version: "${version}",
		name: "sap.ui.mdc",
		dependencies: ["sap.ui.core", "sap.m"],
		...{
			interactionDocumentation: true
		},
		designtime: "sap/ui/mdc/designtime/library.designtime",
		types: [
			"sap.ui.mdc.TableType",
			"sap.ui.mdc.TableP13Mode",
			"sap.ui.mdc.GrowingMode",
			"sap.ui.mdc.RowAction",
			"sap.ui.mdc.RowCountMode",
			"sap.ui.mdc.SelectionMode",
			"sap.ui.mdc.FilterExpression",
			"sap.ui.mdc.MultiSelectMode"
		],
		interfaces: [
			"sap.ui.mdc.IFilterSource",
			"sap.ui.mdc.IFilter",
			"sap.ui.mdc.IxState",
			"sap.ui.mdc.valuehelp.base.ITypeaheadContent",
			"sap.ui.mdc.valuehelp.base.IDialogContent",
			"sap.ui.mdc.valuehelp.base.ITypeaheadContainer",
			"sap.ui.mdc.valuehelp.base.IDialogContainer"

		],
		controls: [
			"sap.ui.mdc.Table",
			"sap.ui.mdc.FilterBar",
			"sap.ui.mdc.field.FieldBase",
			"sap.ui.mdc.field.FieldInput",
			"sap.ui.mdc.field.FieldMultiInput",
			"sap.ui.mdc.field.FieldSelect",
			"sap.ui.mdc.valuehelp.base.DefineConditionPanel",
			"sap.ui.mdc.Field",
			"sap.ui.mdc.FilterField",
			"sap.ui.mdc.MultiValueField",
			"sap.ui.mdc.link.Panel",
			"sap.ui.mdc.Chart",
			"sap.ui.mdc.p13n.PersistenceProvider"
		],
		elements: [
			"sap.ui.mdc.table.Column",
			"sap.ui.mdc.table.CreationRow",
			"sap.ui.mdc.table.DragDropConfig",
			"sap.ui.mdc.table.TableTypeBase",
			"sap.ui.mdc.table.GridTableType",
			"sap.ui.mdc.table.ResponsiveTableType",
			"sap.ui.mdc.table.RowSettings",
			"sap.ui.mdc.chart.Item",
			"sap.ui.mdc.chart.ChartSelectionDetails",
			"sap.ui.mdc.chart.SelectionButton",
			"sap.ui.mdc.chart.SelectionButtonItem",
			"sap.ui.mdc.chart.DrillBreadcrumbs",
			"sap.ui.mdc.chart.SelectionDetailsActions",
			"sap.ui.mdc.field.CustomFieldInfo",
			"sap.ui.mdc.field.FieldInfoBase",
			"sap.ui.mdc.field.ListFieldHelpItem",
			"sap.ui.mdc.filterbar.aligned.FilterItemLayout",
			"sap.ui.mdc.Link",
			"sap.ui.mdc.link.LinkItem",
			"sap.ui.mdc.link.PanelItem",
			"sap.ui.mdc.link.SemanticObjectUnavailableAction",
			"sap.ui.mdc.link.SemanticObjectMapping",
			"sap.ui.mdc.link.SemanticObjectMappingItem",
			"sap.ui.mdc.ushell.SemanticObjectUnavailableAction",
			"sap.ui.mdc.ushell.SemanticObjectMapping",
			"sap.ui.mdc.ushell.SemanticObjectMappingItem",
			"sap.ui.mdc.field.MultiValueFieldItem",
			"sap.ui.mdc.ValueHelp",
			"sap.ui.mdc.valuehelp.Popover",
			"sap.ui.mdc.valuehelp.Dialog",
			"sap.ui.mdc.valuehelp.content.Bool",
			"sap.ui.mdc.valuehelp.content.Conditions",
			"sap.ui.mdc.valuehelp.content.FixedList",
			"sap.ui.mdc.valuehelp.content.FixedListItem",
			"sap.ui.mdc.valuehelp.content.MDCTable",
			"sap.ui.mdc.valuehelp.content.MTable"
		],
		extensions: {
			flChangeHandlers: {
				"sap.ui.mdc.Table": "sap/ui/mdc/flexibility/Table",
				"sap.ui.mdc.Chart": "sap/ui/mdc/flexibility/Chart",
				"sap.ui.mdc.FilterBar": "sap/ui/mdc/flexibility/FilterBar",
				"sap.ui.mdc.filterbar.p13n.AdaptationFilterBar": "sap/ui/mdc/flexibility/FilterBar",
				"sap.ui.mdc.filterbar.vh.FilterBar": "sap/ui/mdc/flexibility/FilterBar",
				"sap.ui.mdc.valuehelp.FilterBar": "sap/ui/mdc/flexibility/FilterBar",
				"sap.ui.mdc.link.PanelItem": "sap/ui/mdc/flexibility/PanelItem",
				"sap.ui.mdc.link.Panel": "sap/ui/mdc/flexibility/Panel",
				"sap.ui.mdc.ActionToolbar": "sap/ui/mdc/flexibility/ActionToolbar",
				"sap.ui.mdc.actiontoolbar.ActionToolbarAction": "sap/ui/mdc/flexibility/ActionToolbarAction"
			},
			"sap.ui.support": {
				publicRules: true
			}
		},
		noLibraryCSS: false
	});

	/**
	 *
	 * Interface for valuehelp {@link sap.ui.mdc.valuehelp.base.Container Containers} / {@link sap.ui.mdc.valuehelp.base.Content Contents} supporting typeahead functionality
	 *
	 * @since 1.95
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent
	 * @interface
	 * @public
	 */

	/**
	 * This event is fired if the change is cancelled.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.cancel
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @public
	 */

	/**
	 * This event is fired if a change of the content is confirmed.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.confirm
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {boolean} oControlEvent.getParameters.close <code>true</code> if the value help needs to be closed
	 * @public
	 */

	/**
	 * This event is fired if the selected condition has changed.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.select
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {sap.ui.mdc.enums.ValueHelpSelectionType} oControlEvent.getParameters.type Type of the selection change (add, remove)
	 * @param {object[]} oControlEvent.getParameters.conditions Changed conditions <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
	 * @public
	 */

	/**
	 * Returns a title for the given Content
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.getTitle
	 * @function
	 * @returns {string} Content title as string
	 * @public
	 */

	/**
	 * Returns info if the given content is in multi select mode
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.isMultiSelect
	 * @function
	 * @returns {boolean} <code>true</code> if multi-selection is active.
	 * @public
	 */

	/**
	 * Loads additional dependencies, creates and returns displayed content.
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.getContent
	 * @function
	 * @returns {Promise<sap.ui.core.Control>} Promise resolving in displayed content
	 * @public
	 */


	/**
	 * Determines the item (key and description) for a given value.
	 *
	 * The content checks if there is an item with a key or description that fits this value.
	 *
	 * <b>Note:</b> This function must only be called by the <code>Container</code> element.
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.getItemForValue
	 * @function
	 * @param {sap.ui.mdc.valuehelp.base.ItemForValueConfiguration} oConfig Configuration
	 * @returns {Promise<sap.ui.mdc.valuehelp.base.ValueHelpItem>} Promise returning object containing description, key and payload.
	 * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
	 * @public
	 */

	/**
	 * Navigates the typeaheads values (optional)
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.navigate
	 * @function
	 * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
	 * @public
	 */

	/**
	 * This optional event is fired if a navigation has been executed in the content.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.navigated
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {boolean} oControlEvent.getParameters.leaveFocus Indicates that the source control should be focused again
	 * @param {object} oControlEvent.getParameters.condition Provides the target condition of the navigation <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
	 * @param {string} oControlEvent.getParameters.itemId Provides the navigated item's ID (used for ARIA attributes)
	 * @param {boolean} oControlEvent.getParameters.caseSensitive If <code>true</code> the filtering was executed case sensitive
	 * @public
	 */

	/**
	 * This optional event is fired after a suggested item for type-ahead has been found.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.typeaheadSuggested
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {object} oControlEvent.getParameters.condition Provides the target condition of the suggested item. <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}
	 * @param {string} oControlEvent.getParameters.filterValue Provides the used filter value. (as the event might be fired asynchronously, and the current user input might have changed.)
	 * @param {string} oControlEvent.getParameters.itemId Provides the ID of the suggested item (used for ARIA attributes)
	 * @param {string} oControlEvent.getParameters.items Provides number of found items
	 * @param {boolean} oControlEvent.getParameters.caseSensitive If <code>true</code> the filtering was executed case sensitive
	 * @public
	 * @since 1.120.0
	 */

	/**
	 * This optional event can be fired by typeahead contents also supporting dialog mode.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.requestSwitchToDialog
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @public
	 */

	/**
	 * This optional event is fired if the visual focus is set to the value help.
	 *
	 * In this case the visual focus needs to be removed from the opening field, but the real focus must stay there.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.visualFocusSet
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @public
	 * @since 1.127.0
	 */

	/**
	 * If the container is used for typeahead it might be wanted that the same content should also be shown as valuehelp. If not, the field should not show a valuehelp icon.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.getUseAsValueHelp
	 * @function
	 * @returns {boolean} <code>true</code> if the typeahead content can be used as value help
	 * @public
	 */

	/**
	 * Defines if the typeahead can be used for input validation.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.isValidationSupported
	 * @function
	 * @returns {boolean} True if the typeahead container can be used for input validation
	 * @public
	 */

	/**
	 * Defines if the typeahead containers values can be navigated without visibly opening the help
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.shouldOpenOnNavigate?
	 * @function
	 * @returns {boolean} If <code>true</code>, the value help should open when user used the arrow keys in the connected field control
	 * @public
	 * @deprecated As of version 1.137 with no replacement.
	 */

	/**
	 * Defines if the typeahead content desires opening the typeahead whenever a user clicks on a connected control
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.shouldOpenOnClick?
	 * @function
	 * @returns {boolean} If <code>true</code>, the value help should open when user clicks into the connected field control
	 * @public
	 * @deprecated As of version 1.137 with no replacement.
	 */

	/**
	 * The focus visualization of the field help needs to be removed as the user starts typing into the source control.
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.removeVisualFocus
	 * @function
	 * @public
	 */

	/**
	 * The focus visualization of the field help needs to be set as the user starts naigation into the value help items.
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContent.setVisualFocus
	 * @function
	 * @public
	 * @since 1.127.0
	 */


	/**
	 *
	 * Interface for valuehelp {@link sap.ui.mdc.valuehelp.base.Container Containers} supporting typeahead functionality
	 *
	 *
	 * @since 1.95
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer
	 * @interface
	 * @public
	 */

	/**
	 * This event is fired if the change is cancelled.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.cancel
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @public
	 */

	/**
	 * This event is fired if a change of the value help is confirmed.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.confirm
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {boolean} oControlEvent.getParameters.close <code>true</code> if the value help needs to be closed
	 * @public
	 */

	/**
	 * This event is fired if the container requests the delegate content.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.requestDelegateContent
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.contentId Content wrapper ID for which contents are requested
	 * @public
	 */

	/**
	 * This event is fired if the selected condition has changed.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.select
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {sap.ui.mdc.enums.ValueHelpSelectionType} oControlEvent.getParameters.type Type of the selection change (add, remove)
	 * @param {object[]} oControlEvent.getParameters.conditions Changed conditions <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
	 * @public
	 */

	/**
	 * This event is fired if the value help is opened.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.opened
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.itemId ID of the initially selected item
	 * @public
	 */

	/**
	 * This event is fired if the value help is closed.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.closed
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @public
	 */

	/**
	 * Opens the container
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.open
	 * @function
	 * @param {Promise} oValueHelpContentPromise Promise for content request
	 * @param {boolean} bTypeahead Flag indicating whether the container is opened as type-ahead or dialog-like help
	 * @returns {Promise} This promise resolves after the container completely opened.
	 * @public
	 */

	/**
	 * Closes the container
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.close
	 * @function
	 * @param {boolean} bDoNotRestoreFocus If set, closing must not restore the focus on the field
	 * @public
	 */

	/**
	 * Determines the item (key and description) for a given value.
	 *
	 * The value help checks if there is an item with a key or description that fits this value.
	 *
	 * <b>Note:</b> This function must only be called by the control the <code>ValuedHelp</code> element
	 * belongs to, not by the application.
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.getItemForValue
	 * @function
	 * @param {sap.ui.mdc.valuehelp.base.ItemForValueConfiguration} oConfig Configuration
	 * @returns {Promise<sap.ui.mdc.valuehelp.base.ValueHelpItem>} Promise returning object containing description, key and payload.
	 * @throws {sap.ui.model.FormatException|sap.ui.model.ParseException} if entry is not found or not unique
	 * @public
	 */

	/**
	 * Navigates the typeaheads values (optional)
	 *
	 * As this could be asyncronous as data might be loaded a promise is returned.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.navigate
	 * @function
	 * @param {int} iStep Number of steps for navigation (e.g. 1 means next item, -1 means previous item)
	 * @returns {Promise<object>} Promise fulfilled after navigation is evecuted
	 * @public
	 */

	/**
	 * This optional event is fired if a navigation has been executed in the content of the container.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.navigated
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {boolean} oControlEvent.getParameters.leaveFocus Indicates that the source control should be focused again
	 * @param {object} oControlEvent.getParameters.condition Provides the target condition of the navigation <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
	 * @param {string} oControlEvent.getParameters.itemId Provides the navigated item's ID (used for ARIA attributes)
	 * @param {boolean} oControlEvent.getParameters.caseSensitive If <code>true</code> the filtering was executed case sensitive
	 * @public
	 */

	/**
	 * This optional event is fired after a suggested item for type-ahead has been found.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.typeaheadSuggested
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {object} oControlEvent.getParameters.condition Provides the target condition of the suggested item. <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}
	 * @param {string} oControlEvent.getParameters.filterValue Provides the used filter value. (as the event might be fired asynchronously, and the current user input might have changed.)
	 * @param {string} oControlEvent.getParameters.itemId Provides the ID of the suggested item (used for ARIA attributes)
	 * @param {string} oControlEvent.getParameters.items Provides number of found items
	 * @param {boolean} oControlEvent.getParameters.caseSensitive If <code>true</code> the filtering was executed case sensitive
	 * @public
	 * @since 1.120.0
	 */

	/**
	 * This optional event can be fired by typeahead contents also supporting dialog mode.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.requestSwitchToDialog
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @public
	 */

	/**
	 * This optional event is fired if the visual focus is set to the value help.
	 *
	 * In this case the visual focus needs to be removed from the opening field, but the real focus must stay there.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.visualFocusSet
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @public
	 * @since 1.127.0
	 */

	/**
	 If the container is used for type-ahead it might be wanted that the same content should also be shown as valuehelp. If not, the field should not show a valuehelp icon.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.getUseAsValueHelp
	 * @function
	 * @returns {boolean} <code>true</code> if the typeahead content can be used as value help
	 * @public
	 */

	/**
	 * Defines if the typeahead can be used for input validation.
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.isValidationSupported
	 * @function
	 * @returns {boolean} True if the typeahead container can be used for input validation
	 * @public
	 */

	/**
	 * Defines if the typeahead containers values can be navigated without visibly opening the help
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.shouldOpenOnNavigate?
	 * @function
	 * @returns {boolean} If <code>true</code>, the value help should open when user used the arrow keys in the connected field control
	 * @public
	 * @deprecated As of version 1.137 with no replacement.
	 */

	/**
	 * Defines if the typeahead container desires to be opened whenever a user focuses a connected control
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.shouldOpenOnFocus?
	 * @function
	 * @returns {Promise<boolean>} If <code>true</code>, the value help should open when user focuses the connected field control
	 * @public
	 * @deprecated As of version 1.137 with no replacement.
	 */

	/**
	 * Defines if the typeahead container desires to be opened whenever a user clicks on a connected control
	 *
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.shouldOpenOnClick?
	 * @function
	 * @returns {Promise<boolean>} If <code>true</code>, the value help should open when user clicks into the connected field control
	 * @public
	 * @deprecated As of version 1.137 with no replacement.
	 */

	/**
	 * The focus visualization of the field help needs to be removed as the user starts typing into the source control.
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.removeVisualFocus
	 * @function
	 * @public
	 */

	/**
	 * The focus visualization of the field help needs to be set as the user starts naigation into the value help items.
	 * @name sap.ui.mdc.valuehelp.base.ITypeaheadContainer.setVisualFocus
	 * @function
	 * @public
	 * @since 1.127.0
	 */


	/**
	 *
	 * Interface for valuehelp containers / contents supporting dialog functionality
	 *
	 * @since 1.95
	 * @name sap.ui.mdc.valuehelp.base.IDialogContent
	 * @interface
	 * @borrows sap.ui.mdc.valuehelp.base.ITypeaheadContent.getTitle as #getTitle
	 * @borrows sap.ui.mdc.valuehelp.base.ITypeaheadContent.isMultiSelect as #isMultiSelect
	 * @borrows sap.ui.mdc.valuehelp.base.ITypeaheadContent.getContent as #getContent
	 * @public
	 */

	/**
	 * This event is fired if the change is cancelled.
	 *
	 * @name sap.ui.mdc.valuehelp.base.IDialogContent.cancel
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @public
	 */

	/**
	 * This event is fired if a change of the content is confirmed.
	 *
	 * @name sap.ui.mdc.valuehelp.base.IDialogContent.confirm
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {boolean} oControlEvent.getParameters.close <code>true</code> if the value help needs to be closed
	 * @public
	 */

	/**
	 * This event is fired if the selected condition has changed.
	 *
	 * @name sap.ui.mdc.valuehelp.base.IDialogContent.select
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {sap.ui.mdc.enums.ValueHelpSelectionType} oControlEvent.getParameters.type Type of the selection change (add, remove)
	 * @param {object[]} oControlEvent.getParameters.conditions Changed conditions <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
	 * @public
	 */

	/**
	 *
	 * Returns number of relevant conditions for this content
	 *
	 * @name sap.ui.mdc.valuehelp.base.IDialogContent.getCount
	 * @function
	 * @param {sap.ui.mdc.condition.ConditionObject[]} aConditions Array of conditions
	 * @returns {number} Number of relevant conditions
	 * @public
	 */


	/**
	 *
	 * Interface for valuehelp containers shown on a dialog
	 *
	 * @since 1.95
	 * @name sap.ui.mdc.valuehelp.base.IDialogContainer
	 * @interface
	 * @borrows sap.ui.mdc.valuehelp.base.ITypeaheadContainer.open as #open
	 * @borrows sap.ui.mdc.valuehelp.base.ITypeaheadContainer.close as #close
	 * @public
	 */

	/**
	 * This event is fired if the change is cancelled.
	 *
	 * @name sap.ui.mdc.valuehelp.base.IDialogContainer.cancel
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @public
	 */

	/**
	 * This event is fired if a change of the value help is confirmed.
	 *
	 * @name sap.ui.mdc.valuehelp.base.IDialogContainer.confirm
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {boolean} oControlEvent.getParameters.close <code>true</code> if the value help needs to be closed
	 * @public
	 */

	/**
	 * This event is fired if the container requests the delegate content.
	 *
	 * @name sap.ui.mdc.valuehelp.base.IDialogContainer.requestDelegateContent
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.contentId Content wrapper ID for which contents are requested
	 * @public
	 */

	/**
	 * This event is fired if the selected condition has changed.
	 *
	 * @name sap.ui.mdc.valuehelp.base.IDialogContainer.select
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {sap.ui.mdc.enums.ValueHelpSelectionType} oControlEvent.getParameters.type Type of the selection change (add, remove)
	 * @param {object[]} oControlEvent.getParameters.conditions Changed conditions <br> <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
	 * @public
	 */

	/**
	 * This event is fired if the value help is opened.
	 *
	 * @name sap.ui.mdc.valuehelp.base.IDialogContainer.opened
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.itemId ID of the initially selected item
	 * @public
	 */

	/**
	 * This event is fired if the value help is closed.
	 *
	 * @name sap.ui.mdc.valuehelp.base.IDialogContainer.closed
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @public
	 */


	/**
	 *
	 * Interface for controls or entities which are able to return a set of present conditions.
	 * The controls or entities have to implement the following APIs: <code>getConditions</code>.
	 *
	 * @since 1.80
	 * @name sap.ui.mdc.IFilterSource
	 * @interface
	 * @public
	 */

	/**
	 * The function 'getConditions' is used to retrieve a set of present conditions as defined per {@link sap.ui.mdc.IFilterSource} interface.
	 *
	 * @name sap.ui.mdc.IFilterSource.getConditions
	 * @returns {map} a map containing the conditions as used in the {@link sap.ui.mdc.FilterBar}
	 * @since 1.80
	 * @method
	 */

	/**
	 *
	 * Interface for controls or entities which can serve as filters in the <code>sap.ui.mdc.Table</code> & <code>sap.ui.mdc.Chart</code>.
	 *
	 * The following methods need to be implemented:
	 *
	 * <ul>
	 * <li><code>getConditions</code> - Part of the {@link sap.ui.mdc.IFilterSource} interface.</li>
	 * <li><code>validate</code> - The <code>validate</code> method should return a promise which resolves after the IFilter interface has handled its inner validation. The <code>getConditions</code> method will be called subsequently by the filtered control.</li>
	 * <li><code>getSearch</code> - <b>Note:</b> The <code>getSearch</code> method can optionally be implemented and should return a string for approximate string matching implemented in the backend.</li>
	 * </ul>
	 *
	 * The following events need to be implemented:
	 *
	 * <ul>
	 * <li><code>search</code> - This event should be fired once a filtering should be executed on the IFilter using control.</li>
	 * <li><code>filtersChanged</code> - <b>Note:</b> The <code>filtersChanged</code> event can optionally be implemented and should be fired whenever a filter value has changed. This event will be used to display an overlay on the IFilter consuming control.</li>
	 * </ul>
	 *
	 * @since 1.70
	 * @extends sap.ui.mdc.IFilterSource
	 * @name sap.ui.mdc.IFilter
	 * @interface
	 * @public
	 */

	/**
	 * The <code>validate</code> method should return a promise which resolves after the IFilter interface has handled its inner validation.
	 * The <code>getConditions</code> method will be called subsequently by the filtered control.</li>
	 *
	 * @name sap.ui.mdc.IFilter.validate
	 * @param {boolean} bSuppressSearch Determines whether the search should be suppressed. The default is <code>null<code>.
	 * @returns {Promise} A promise resolving once the necessary result validation has been handled
	 * @since 1.80
	 * @function
	 * @public
	 */

	/**
	 * <b>Note:</b> The <code>getSearch</code> method can optionally be implemented and should return a string for approximate string matching implemented in the backend.</li>
	 *
	 * @name sap.ui.mdc.IFilter.getSearch
	 * @returns {string} The search string to be used for an approximate string matching
	 * @since 1.80
	 * @function
	 * @public
	 */

	/**
	 *
	 * Fired when a filter value changes to display an overlay on the <code>sap.ui.mdc.Table</code> & <code>sap.ui.mdc.Chart</code> control.
	 *
	 * @name ap.ui.mdc.IFilter#filtersChanged
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 */

	/**
	 * Fired when a filter value changes to display an overlay on the <code>sap.ui.mdc.Table</code> & <code>sap.ui.mdc.Chart</code> control.
	 *
	 * @name ap.ui.mdc.IFilter#search
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 */

	/**
	 *
	 * Interface for controls or entities which support the appliance of an externalized state representation.
	 * The controls or entities have to implement the following APIs: <code>getCurrentState</code> & <code>initialized</code> methods.
	 *
	 * @since 1.75
	 * @name sap.ui.mdc.IxState
	 * @interface
	 * @public
	 */

	/**
	 * Defines the personalization mode of the filter bar.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 * @since 1.74
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.FilterBarP13nMode}
	 */
	thisLib.FilterBarP13nMode = {
		/**
		 * Filter item personalization is enabled.
		 *
		 * @public
		 */
		Item: "Item",
		/**
		 * Condition personalization is enabled.
		 *
		 * @public
		 */
		Value: "Value"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.FilterBarP13nMode", thisLib.FilterBarP13nMode);

	/**
	 * Defines the type of table used in the MDC table.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.58
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.TableType}
	 */
	thisLib.TableType = {
		/**
		 * Grid table ({@link sap.ui.table.Table} control) is used (default)
		 *
		 * @public
		 */
		Table: "Table",
		/**
		 * Tree table ({@link sap.ui.table.TreeTable} control) is used.
		 *
		 * @private
		 */
		TreeTable: "TreeTable",
		/**
		 * Responsive table ({@link sap.m.Table} control) is used.
		 *
		 * @public
		 */
		ResponsiveTable: "ResponsiveTable"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.TableType", thisLib.TableType);

	/**
	 * Defines the personalization mode of the table.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.fe
	 * @since 1.62
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.TableP13nMode}
	 */
	thisLib.TableP13nMode = {
		/**
		 * Column personalization is enabled.
		 *
		 * @public
		 */
		Column: "Column",
		/**
		 * Sort personalization is enabled.
		 *
		 * @public
		 */
		Sort: "Sort",
		/**
		 * Filter personalization is enabled.
		 *
		 * @public
		 */
		Filter: "Filter",
		/**
		 * Group personalization is enabled.
		 *
		 * @public
		 */
		Group: "Group",
		/**
		 * Aggregation personalization is enabled.
		 *
		 * @public
		 */
		Aggregate: "Aggregate"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.TableP13nMode", thisLib.TableP13nMode);

	/**
	 * Defines the growing options of the responsive table.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.65
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.TableGrowingMode}
	 */
	thisLib.GrowingMode = {
		/**
		 * Growing does not take place (<code>growing</code> is not set in the responsive table)
		 *
		 * @public
		 */
		None: "None",
		/**
		 * Basic growing takes place (<code>growing</code> is set in the responsive table)
		 *
		 * @public
		 */
		Basic: "Basic",
		/**
		 * Growing with <code>scroll</code> takes place (<code>growing</code> and <code>growingScrollToLoad</code> are set in the responsive table)
		 *
		 * @public
		 */
		Scroll: "Scroll"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.GrowingMode", thisLib.GrowingMode);

	/**
	 * Defines the row count mode of the GridTable.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.65
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.TableRowCountMode}
	 */
	thisLib.RowCountMode = {
		/**
		 * The table automatically fills the height of the surrounding container.
		 *
		 * @public
		 */
		Auto: "Auto",
		/**
		 * The table always has as many rows as defined in the <code>rowCount</code> property of <code>GridTableType</code>.
		 *
		 * @public
		 */
		Fixed: "Fixed"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.RowCountMode", thisLib.RowCountMode);

	/**
	 * Defines the types of chart actions in the toolbar.<br>
	 * Can be used to remove some of the default <code>ToolbarAction</code>. For more information, see {@link sap.ui.mdc.Chart#ignoreToolbarActions}.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.64
	 * @ui5-restricted sap.ui.mdc
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.ChartToolbarActionType}
	 */
	thisLib.ChartToolbarActionType = {
		/**
		 * Zoom-in and zoom-out action.
		 *
		 * @public
		 */
		ZoomInOut: "ZoomInOut",
		/**
		 * Drill-down and drill-up action.
		 *
		 * @public
		 */
		DrillDownUp: "DrillDownUp",
		/**
		 * Legend action.
		 *
		 * @public
		 */
		Legend: "Legend"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.ChartToolbarActionType", thisLib.ChartToolbarActionType);

	/**
	 * Defines the personalization mode of the chart.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.75
	 * @ui5-restricted sap.ui.mdc
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.ChartP13nMode}
	 */
	thisLib.ChartP13nMode = {
		/**
		 * Item personalization is enabled.
		 *
		 * @public
		 */
		Item: "Item",
		/**
		 * Sort personalization is enabled.
		 *
		 * @public
		 */
		Sort: "Sort",
		/**
		 * Chart type personalization is enabled.
		 *
		 * @public
		 */
		Type: "Type",
		/**
		 * Filter personalization is enabled.
		 *
		 * @public
		 */
		Filter: "Filter"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.ChartP13nMode", thisLib.ChartP13nMode);

	/**
	 * Defines the mode of the table.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.58
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.TableSelectionMode}
	 */
	thisLib.SelectionMode = {
		/**
		 * No rows/items can be selected (default).
		 * @public
		 */
		None: "None",
		/**
		 * Only one row/item can be selected at a time.
		 * @public
		 */
		Single: "Single",
		/**
		 * Only one row/item can be selected at a time. Should be used for navigation scenarios to indicate the navigated row/item. If this selection
		 * mode is used, no <code>rowPress</code> event is fired.
		 * @public
		 */
		SingleMaster: "SingleMaster",
		/**
		 * Multiple rows/items can be selected at a time.
		 * @public
		 */
		Multi: "Multi"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.SelectionMode", thisLib.SelectionMode);

	/**
	 * Defines the actions that can be used in the table.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.60
	 * @deprecated As of version 1.115, replaced by {@link sap.ui.mdc.enums.TableRowActionType}
	 */
	thisLib.RowAction = {
		/**
		 * Navigation arrow (chevron) is shown in the table rows/items.
		 *
		 * @public
		 */
		Navigation: "Navigation"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.RowAction", thisLib.RowAction);

	/**
	 * Defines the filter expression types.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.61
	 * @deprecated since 1.115.0 - No replacement available
	 */
	thisLib.FilterExpression = {
		/**
		 * Single interval value.
		 * @public
		 */
		Interval: "Interval",
		/**
		 * Single value.
		 * @public
		 */
		Single: "Single",
		/**
		 * Multiple value
		 * @public
		 */
		Multi: "Multi"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.FilterExpression", thisLib.FilterExpression);

	/**
	 * @enum {string}
	 * @private
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.ChartItemType}
	 */
	thisLib.ChartItemType = {
		/**
		 * Dimension Item
		 * @public
		 */
		Dimension: "Dimension",
		/**
		 * Measure Item
		 * @public
		 */
		Measure: "Measure"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.ChartItemType", thisLib.ChartItemType);

	/**
	 * @enum {string}
	 * @private
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.ChartItemRoleType}
	 */
	thisLib.ChartItemRoleType = {
		/**
		 * All dimensions with role "category" are assigned to the feed uid "categoryAxis".
		 *
		 * <b>NOTE:</b> If the chart type requires at least one dimension on the feed "categoryAxis" (true for all chart types except pie and donut), but no dimension has the role "category" or "category2", then the first visible dimension is assigned to the "categoryAxis".
		 *
		 * @public
		 */
		category: "category",
		/**
		 * All dimensions with role "series" are assigned to the feed uid "color".
		 * @public
		 */
		series: "series",
		/**
		 * If a chart type does not use the feed uid "categoryAxis2", then all dimensions with role "category2" are treated as dimension with role "category" (appended).
		 * @public
		 */
		category2: "category2",
		/**
		 * General Rules for all chart types
		 * <ol>
		 *   <li>All measures with role "axis1" are assigned to feed uid "valueaxis". All measures with role "axis2" are assigned to feed uid "valueaxis2". All measures with role "axis3" are assigned to feed uid "bubbleWidth".</li>
		 *   <li>If a chart type does not use the feed uid "valueaxis2", then all measures with role "axis2" are treated as measures with role "axis1".</li>
		 *   <li>If a chart type requires at least 1 measure on the feed uid "valueaxis" (true for all non-"dual" chart types), but there is no measure with role "axis1", then the first measure with role "axis2" is assigned to feed uid "valueaxis"</li>
		 *   <li>If the chart type requires at least one measure on the feed uid "valueaxis2" (true for all "dual" chart types"), but there is no measure with role "axis2", then the first measure with role "axis3" or "axis4" or (if not exists) the last measure with role "axis1" is assigned to feed uid "valueaxis2".</li>
		 * </ol>
		 * @public
		 */
		axis1: "axis1",
		/**
		 * Measures with role "axis2" are assigned to feed uid "valueaxis2" if used.
		 * If a chart type does not use the feed uid "bubbleWidth" (true for all chart types except bubble and radar), then all measures with role "axis3" or "axis4" are treated as measures with role "axis2".
		 * @public
		 */
		axis2: "axis2",
		/**
		 * Measures with role "axis3" are assigned to feed uid "bubbleWidth" if used.
		 * @public
		 */
		axis3: "axis3"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.ChartItemRoleType", thisLib.ChartItemRoleType);

	/**
	 * Enumeration of the <code>multiSelectMode</code> in <code>ListBase</code>.
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.TableMultiSelectMode}
	 */
	thisLib.MultiSelectMode = {
		/**
		 * Renders the <code>selectAll</code> checkbox (default behavior).
		 * @public
		 */
		Default: "Default",

		/**
		 * Renders the <code>clearAll</code> icon.
		 * @public
		 */
		ClearAll: "ClearAll"
	};

	/**
	 * @deprecated As of version 1.121
	 */
	DataType.registerEnum("sap.ui.mdc.MultiSelectMode", thisLib.MultiSelectMode);

	/**
	 * @typedef {object} sap.ui.mdc.TypeConfig
	 * @property {string} [className] Model-specific data type
	 * @property {sap.ui.model.SimpleType} typeInstance Type instance for given data type
	 * @property {string} baseType Basic type category for given data type
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * @typedef {object} sap.ui.mdc.DelegateConfig
	 * @property {string} name Delegate module path
	 * @property {*} payload Delegate payload
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * Enumerations for MDC library
	 * @namespace
	 * @name sap.ui.mdc.enum
	 * @since 1.74.0
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums}
	 */

	/**
	 * Enumerations for <code>sap.ui.mdc</code> library
	 * @namespace
	 * @name sap.ui.mdc.enums
	 * @since 1.74.0
	 * @public
	 */

	/**
	 * @namespace
	 * @name sap.ui.mdc.mixin
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */

	/**
	 * Modules for {@link sap.ui.mdc.FilterBar FilterBar}
	 * @namespace
	 * @name sap.ui.mdc.filterbar
	 * @public
	 * @since 1.112.0
	 */

	/**
	 * Utilities for <code>sap.ui.mdc</code> library
	 * @namespace
	 * @name sap.ui.mdc.util
	 * @since 1.74.0
	 * @public
	 */

	/**
	 * @namespace
	 * @name sap.ui.mdc.chart
	 * @public
	 */

	/**
	 * @namespace
	 * @name sap.ui.mdc.State
	 * @public
	 * @since 1.113.0
	 */
	/**
	 * @namespace
	 * @name sap.ui.mdc.State.XCondition
	 * @public
	 */
	/**
	 * @namespace
	 * @name sap.ui.mdc.State.Items
	 * @public
	 */
	/**
	 * @namespace
	 * @name sap.ui.mdc.State.Sorters
	 * @public
	 */
	/**
	 * @namespace
	 * @name sap.ui.mdc.State.GroupLevels
	 * @public
	 */
	/**
	 * @namespace
	 * @name sap.ui.mdc.State.Aggregations
	 * @public
	 */
	/**
	 * Defines the values for each filter field path of a condition.
	 *
	 * @typedef {object} sap.ui.mdc.State.XCondition
	 * @property {string} operator of the condition
	 * @property {Array} values of the condition
	 *
	 * @public
	 */
	/**
	 * Defines the <code>items</code> to be added to the controls default aggregation.
	 *
	 * @typedef {object} sap.ui.mdc.State.Items
	 * @property {string} key of the item
	 * @property {int} [position] of the item in the aggregation
	 * @property {boolean} [visible = true] State of the item
	 *
	 * @public
	 */
	/**
	 * Defines the <code>sorters</code> to be added to the controls sorting state.
	 *
	 * @typedef {object} sap.ui.mdc.State.Sorters
	 * @property {string} key of the sorted item
	 * @property {boolean} descending Sort order for this item
	 * @property {boolean} [sorted = true] Defines if the item has to be sorted
	 *
	 * @public
	 */
	/**
	 * Defines the <code>groupes</code> to be added to the controls grouping state.
	 *
	 * @typedef {object} sap.ui.mdc.State.GroupLevels
	 * @property {string} key of the grouped item
	 * @property {boolean} [grouped = true] Defines if the item has to be grouped
	 *
	 * @public
	 */
	/**
	 * Defines the <code>aggregations</code> to be added to the controls agreggation state.
	 *
	 * Defines whether there is an aggregation for each item.
	 *
	 * @typedef {object} sap.ui.mdc.State.Aggregations
	 * @property {boolean} [aggregated = true] Defines if the item has to be aggregated
	 *
	 * @public
	 */
	/**
	 * The <code>State</code> object describes the interface to apply and retrieve the current adaptation state from mdc controls.
	 * The {@link sap.mdc.p13n.StateUtil StateUtil} class can be used to programatically apply changes considered for
	 * the controls personalization to be part of its persistence.
	 *
	 * @typedef {object} sap.ui.mdc.State
	 * @property {Object.<string, sap.ui.mdc.State.XCondition[]>} [filter] Describes the filter conditions
	 * @property {sap.ui.mdc.State.Items[]} [items] Describes the filter fields
	 * @property {sap.ui.mdc.State.Sorters[]} [sorters] Describes the sorter fields
	 * @property {sap.ui.mdc.State.GroupLevels[]} [groupLevels] Describes the grouped fields
	 * @property {sap.ui.mdc.State.Aggregations} [aggregations] Describes the aggregated fields
	 *
	 * @public
	 */

	/**
	 * Map-like configuration object for filter creation.<br/>
	 * The keys for this object must be aligned with any {@link sap.ui.mdc.util.FilterTypeConfig} the <code>FilterConditionMap</code> is combined with during filter creation.<br/>
	 *
	 *
	 * <b>Structure:</b> Object.&lt;string, {@link sap.ui.mdc.condition.ConditionObject sap.ui.mdc.condition.ConditionObject[]}&gt;
	 *
	 * @typedef sap.ui.mdc.util.FilterConditionMap
	 * @type {Object.<string, sap.ui.mdc.condition.ConditionObject[]>}
	 * @public
	 * @since 1.121.0
	 */

	/**
	 * Configuration object for filter creation.
	 *
	 * @typedef {object} sap.ui.mdc.util.FilterTypeConfigEntry
	 * @property {sap.ui.model.Type} type Type instance
	 * @property {boolean} [caseSensitive] Indicates if a created filter is case-sensitive
	 * @property {sap.ui.mdc.enums.BaseType} [baseType] BaseType configuration for the given type useful for externalization/internalization of filter values
	 * @public
	 * @since 1.121.0
	 */

	/**
	 * Map-like configuration object for filter creation.<br/>
	 * The keys for this object must be aligned with any {@link sap.ui.mdc.util.FilterConditionMap} the <code>FilterTypeConfig</code> is combined with during filter creation.
	 *
	 *
	 * <b>Structure:</b> Object.&lt;string, {@link sap.ui.mdc.util.FilterTypeConfigEntry}&gt;
	 *
	 * @typedef sap.ui.mdc.util.FilterTypeConfig
	 * @type {Object.<string, sap.ui.mdc.util.FilterTypeConfigEntry>}
	 * @public
	 * @since 1.121.0
	 */


	return thisLib;
});