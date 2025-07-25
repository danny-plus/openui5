/*!
 * ${copyright}
 */

/* global Set */

// Provides class sap.ui.base.DataType
sap.ui.define([
	'sap/base/future',
	'sap/base/util/ObjectPath',
	"sap/base/assert",
	"sap/base/Log",
	"sap/base/util/isPlainObject",
	'sap/base/util/resolveReference',
	"sap/base/i18n/date/_EnumHelper"
], function(future, ObjectPath, assert, Log, isPlainObject, resolveReference, _EnumHelper) {
	"use strict";

	/**
	 * Pseudo-Constructor for class <code>DataType</code>, never to be used.
	 *
	 * @class Represents the type of properties in a <code>ManagedObject</code> class.
	 *
	 * Each type provides some metadata like its {@link #getName qualified name} or its
	 * {@link #getBaseType base type} in case of a derived type. Array types provide information
	 * about the allowed {@link #getComponentType type of components} in an array, enumeration types
	 * inform about the set of their allowed {@link #getEnumValues keys and values}.
	 *
	 * Each type has a method to {@link #isValid check whether a value is valid} for a property
	 * of that type.
	 *
	 * Already defined types can be looked up by calling {@link #.getType DataType.getType}, new
	 * types can only be created by calling the factory method {@link #.createType DataType.createType},
	 * calling the constructor will throw an error.
	 *
	 * @author SAP SE
	 * @since 0.9.0
	 * @alias sap.ui.base.DataType
	 * @public
	 * @hideconstructor
	 * @throws {Error} Constructor must not be called, use {@link #.createType DataType.createType} instead
	 */
	var DataType = function() {
		// Avoid construction of a DataType.
		// DataType is only a function to support the "instanceof" operator.
		throw new Error();
	};

	/**
	 * The qualified name of the data type.
	 *
	 * @returns {string} Name of the data type
	 * @public
	 */
	DataType.prototype.getName = function() {
		return undefined;
	};

	/**
	 * The base type of this type or undefined if this is a primitive type.
	 * @returns {sap.ui.base.DataType|undefined} Base type or <code>undefined</code>
	 * @public
	 */
	DataType.prototype.getBaseType = function() {
		return undefined;
	};

	/**
	 * Returns the most basic (primitive) type that this type has been derived from.
	 *
	 * If the type is a primitive type by itself, <code>this</code> is returned.
	 *
	 * @returns {sap.ui.base.DataType} Primitive type of this type
	 * @public
	 */
	DataType.prototype.getPrimitiveType = function() {
		/*eslint-disable consistent-this*/
		var oType = this;
		/*eslint-enable consistent-this*/
		while (oType.getBaseType()) {
			oType = oType.getBaseType();
		}
		return oType;
	};

	/**
	 * Returns the component type of this type or <code>undefined</code> if this is not an array type.
	 *
	 * @returns {sap.ui.base.DataType|undefined} Component type or <code>undefined</code>
	 * @public
	 */
	DataType.prototype.getComponentType = function() {
		return undefined;
	};

	/**
	 * The default value for this type. Each type must define a default value.
	 * @returns {any} Default value of the data type. The type of the returned value
	 *    must match the JavaScript type of the data type (a string for string types etc.)
	 * @public
	 */
	DataType.prototype.getDefaultValue = function() {
		return undefined;
	};

	/**
	 * Whether this type is an array type.
	 * @returns {boolean} Whether this type is an array type
	 * @public
	 */
	DataType.prototype.isArrayType = function() {
		return false;
	};

	/**
	 * Whether this type is an enumeration type.
	 * @returns {boolean} Whether this type is an enum type
	 * @public
	 */
	DataType.prototype.isEnumType = function() {
		return false;
	};

	/**
	 * Returns the object with keys and values from which this enum type was created
	 * or <code>undefined</code> if this is not an enum type.
	 *
	 * @returns {Object<string,string>|undefined} Object with enum keys and values or <code>undefined</code>
	 * @public
	 */
	DataType.prototype.getEnumValues = function() {
		return undefined;
	};

	/**
	 * Parses the given string value and converts it into the specific data type.
	 * @param {string} sValue String representation for a value of this type
	 * @returns {any} Value in the correct internal format
	 * @public
	 */
	DataType.prototype.parseValue = function(sValue) {
		return sValue;
	};

	/**
	 * Checks whether the given value is valid for this type.
	 *
	 * To be implemented by concrete types.
	 * @param {any} vValue Value to be checked
	 * @returns {boolean} Whether the given value is valid for this data type (without conversion)
	 * @public
	 * @function
	 */
	DataType.prototype.isValid = undefined;
	// Note that <code>isValid</code> must be assigned a falsy value here as it otherwise
	// would be called in addition to any <code>isValid</code> implementation in subtypes.
	// See <code>createType</code> for details.

	/**
	 * Set or unset a normalizer function to be used for values of this data type.
	 *
	 * When a normalizer function has been set, it will be applied to values of this type
	 * whenever {@link #normalize} is called. <code>ManagedObject.prototype.setProperty</code>
	 * calls the <code>normalize</code> method before setting a new value to a property
	 * (normalization is applied on-write, not on-read).
	 *
	 * The <code>fnNormalize</code> function has the signature
	 * <pre>
	 *   fnNormalize(value:any) : any
	 * </pre>
	 * It will be called with a value for this type and should return a normalized
	 * value (which also must be valid for the this type). There's no mean to reject a value.
	 * The <code>this</code> context of the function will be this type.
	 *
	 * This method allows applications or application frameworks to plug-in a generic value
	 * normalization for a type, e.g. to convert all URLs in some app-specific way before
	 * they are applied to controls. It is not intended to break-out of the value range
	 * defined by a type.
	 *
	 * @param {function(any):any} fnNormalizer Function to apply for normalizing
	 * @public
	 */
	DataType.prototype.setNormalizer = function(fnNormalizer) {
		assert(typeof fnNormalizer === "function", "DataType.setNormalizer: fnNormalizer must be a function");
		this._fnNormalizer = typeof fnNormalizer === "function" ? fnNormalizer : undefined;
	};

	/**
	 * Normalizes the given value using the specified normalizer for this data type.
	 *
	 * If no normalizer has been set, the original value is returned.
	 *
	 * @param {any} oValue Value to be normalized
	 * @returns {any} Normalized value
	 * @public
	 */
	DataType.prototype.normalize = function(oValue) {
		return this._fnNormalizer ? this._fnNormalizer(oValue) : oValue;
	};

	function createType(sName, mSettings, oBase) {

		mSettings = mSettings || {};

		// create a new type object with the base type as prototype
		var oBaseObject = oBase || DataType.prototype;
		var oType = Object.create(oBaseObject);

		// getter for the name
		oType.getName = function() {
			return sName;
		};

		// if a default value is specified, create a getter for it
		if ( mSettings.hasOwnProperty("defaultValue") ) {
			var vDefault = mSettings.defaultValue;
			oType.getDefaultValue = function() {
				return vDefault;
			};
		}

		// if a validator is specified either chain it with the base type validator
		// or set it if no base validator exists
		if ( mSettings.isValid ) {
			var fnIsValid = mSettings.isValid;
			oType.isValid = oBaseObject.isValid ? function(vValue) {
				if ( !oBaseObject.isValid(vValue) ) {
					return false;
				}
				return fnIsValid(vValue);
			} : fnIsValid;
		}

		if ( mSettings.parseValue ) {
			oType.parseValue = mSettings.parseValue;
		}

		// return the base type
		oType.getBaseType = function() {
			return oBase;
		};

		return oType;
	}

	var mTypes = {

		"any" :
			createType("any", {
				defaultValue : null,
				isValid : function(vValue) {
					return true;
				}
			}),

		"boolean" :
			createType("boolean", {
				defaultValue : false,
				isValid : function(vValue) {
					return typeof vValue === "boolean";
				},
				parseValue: function(sValue) {
					return sValue == "true";
				}
			}),

		"int" :
			createType("int", {
				defaultValue : 0,
				isValid : function(vValue) {
					return typeof vValue === "number" && (isNaN(vValue) || Math.floor(vValue) == vValue);
				},
				parseValue: function(sValue) {
					return parseInt(sValue);
				}
			}),

		"float" :
			createType("float", {
				defaultValue : 0.0,
				isValid : function(vValue) {
					return typeof vValue === "number";
				},
				parseValue: function(sValue) {
					return parseFloat(sValue);
				}
			}),

		"string" :
			createType("string", {
				defaultValue : "",
				isValid : function(vValue) {
					return typeof vValue === "string" || vValue instanceof String;
				},
				parseValue: function(sValue) {
					return sValue;
				}
			}),

		"object" :
			createType("object", {
				defaultValue : null,
				isValid : function(vValue) {
					return typeof vValue === "object" || typeof vValue === "function";
				},
				parseValue: function(sValue) {
					return sValue ? JSON.parse(sValue) : null;
				}
			}),

		"function" :
			createType("function", {
				defaultValue : null,
				isValid : function(vValue) {
					return vValue == null || typeof vValue === 'function';
				},
				/*
				 * Note: the second parameter <code>_oOptions</code> is a hidden feature for internal use only.
				 * Its structure is subject to change. No code other than the XMLTemplateProcessor must use it.
				 */
				parseValue: function(sValue, _oOptions) {
					if ( sValue === "" ) {
						return undefined;
					}

					if ( !/^\.?[A-Z_\$][A-Z0-9_\$]*(\.[A-Z_\$][A-Z0-9_\$]*)*$/i.test(sValue) ) {
						throw new Error(
							"Function references must consist of dot separated " +
							"simple identifiers (A-Z, 0-9, _ or $) only, but was '" + sValue + "'");
					}

					var fnResult,
						oContext = _oOptions && _oOptions.context,
						oLocals = _oOptions && _oOptions.locals;

					fnResult = resolveReference(sValue,
						Object.assign({".": oContext}, oLocals));

					if ( fnResult && this.isValid(fnResult) ) {
						return fnResult;
					}

					throw new TypeError("The string '" + sValue + "' couldn't be resolved to a function");
				}
			})

	};

	// The generic "array" type must not be exposed by DataType.getType to avoid direct usage
	// as type of a managed property. It is therefore not stored in the mTypes map
	var arrayType = createType("array", {
		defaultValue : []
	});

	function createArrayType(componentType) {
		assert(componentType instanceof DataType, "DataType.<createArrayType>: componentType must be a DataType");

		// create a new type object with the base type as prototype
		var oType = Object.create(DataType.prototype);

		// getter for the name
		oType.getName = function() {
			return componentType.getName() + "[]";
		};

		// getter for component type
		oType.getComponentType = function() {
			return componentType;
		};

		// array validator
		oType.isValid = function(aValues) {
			if (aValues === null) {
				return true;
			}
			if (Array.isArray(aValues)) {
				for (var i = 0; i < aValues.length; i++) {
					if (!componentType.isValid(aValues[i])) {
						return false;
					}
				}
				return true;
			}
			return false;
		};

		// array parser
		oType.parseValue = function(sValue) {
			var aValues = sValue.split(",");
			for (var i = 0; i < aValues.length; i++) {
				aValues[i] = componentType.parseValue(aValues[i]);
			}
			return aValues;
		};

		// is an array type
		oType.isArrayType = function() {
			return true;
		};

		// return the base type
		oType.getBaseType = function() {
			return arrayType;
		};

		return oType;
	}

	const mEnumRegistry = Object.create(null);

	function createEnumType(sTypeName, oEnum) {

		var mValues = {},
			sDefaultValue;
		for (var sName in oEnum) {
			var sValue = oEnum[sName];
			// the first entry will become the default value
			if (!sDefaultValue) {
				sDefaultValue = sValue;
			}
			if ( typeof sValue !== "string") {
				throw new Error("Value " + sValue + " for enum type " + sTypeName + " is not a string");
			}
			// if there are multiple entries with the same value, the one where name
			// and value are matching is taken
			if (!mValues.hasOwnProperty(sValue) || sName == sValue) {
				mValues[sValue] = sName;
			}
		}

		var oType = Object.create(DataType.prototype);

		// getter for the name
		oType.getName = function() {
			return sTypeName;
		};

		// enum validator
		oType.isValid = function(v) {
			return typeof v === "string" && mValues.hasOwnProperty(v);
		};

		// enum parser
		oType.parseValue = function(sValue) {
			return oEnum[sValue];
		};

		// default value
		oType.getDefaultValue = function() {
			return sDefaultValue;
		};

		// return the base type
		oType.getBaseType = function() {
			return mTypes.string;
		};

		// is an enum type
		oType.isEnumType = function() {
			return true;
		};

		// enum values are best represented by the existing global object
		oType.getEnumValues = function() {
			return oEnum;
		};

		return oType;
	}

	const oLoggedErrors = new Set();

	/**
	 * Logs an error only once per class name and property name combination.
	 *
	 * If the class name and property name are not given, the message is logged.
	 *
	 * @param {string} sClassName - The name of the class where the error occurred.
	 * @param {string} sPropertyName - The name of the property causing the error.
	 * @param {string} sMessage - Additional message to log.
	 */
	function logErrorOnce(sClassName, sPropertyName, sMessage) {
		if (sClassName && sPropertyName) {
			const sKey = `${sClassName}::${sPropertyName}`;
			if (!oLoggedErrors.has(sKey)) {
				oLoggedErrors.add(sKey);
				Log.error(`Property "${sPropertyName}" of "${sClassName}": ${sMessage}`);
			}
		} else {
			Log.error(sMessage);
		}
	}

	/**
	 * Looks up the type with the given name and returns it.
	 *
	 * See {@link topic:ac56d92162ed47ff858fdf1ce26c18c4 Defining Control Properties} for
	 * a list of the built-in primitive types and their semantics.
	 *
	 * The lookup consists of the following steps:
	 * <ul>
	 * <li>When a type with the given name is already known, it will be returned</li>
	 * <li>When the name ends with a pair of brackets (<code>[]</code>), a type with the name
	 *     in front of the brackets (<code>name.slice(0,-2)</code>) will be looked up and an
	 *     array type will be created with the looked-up type as its component type. If the
	 *     component type is <code>undefined</code>, <code>undefined</code> will be returned</li>
	 * <li>When a global property exists with the same name as the type and when the value of that
	 *     property is an instance of <code>DataType</code>, that instance will be returned</li>
	 * <li>When a global property exists with the same name as the type and when the value of that
	 *     property is a plain object (its prototype is <code>Object</code>), then an enum type will
	 *     be created, based on the keys and values in that object. The <code>parseValue</code> method
	 *     of the type will accept any of the keys in the plain object and convert them to the
	 *     corresponding value; <code>isValid</code> will accept any of the values from the plain
	 *     object's keys. The <code>defaultValue</code> will be the value of the first key found in
	 *     the plain object</li>
	 * <li>When a global property exist with any other, non-falsy value, a warning is logged and the
	 *     primitive type 'any' is returned</li>
	 * <li>If no such global property exist, an error is logged and <code>undefined</code>
	 *     is returned</li>
	 * </ul>
	 *
	 * <b<Note:</b> UI Libraries and even components can introduce additional types. This method
	 * only checks for types that either have been defined already, or that describe arrays of
	 * values of an already defined type or types whose name matches the global name of a plain
	 * object (containing enum keys and values). This method doesn't try to load modules that
	 * might contain type definitions. So before being able to lookup and use a specific type,
	 * the module containing its definition has to be loaded. For that reason it is suggested that
	 * controls (or <code>ManagedObject</code> classes in general) declare a dependency to all
	 * modules (typically <code>some/lib/library.js</code> modules) that contain the type definitions
	 * needed by the specific control or class definition.
	 *
	 * @param {string} sTypeName Qualified name of the type to retrieve
	 * @param {sap.ui.base.ManagedObject.MetaOptions.Property} [oProperty] Metadata of the property
	 * @returns {sap.ui.base.DataType|undefined} Type object or <code>undefined</code> when
	 *     no such type has been defined yet
	 * @public
	 */
	DataType.getType = function(sTypeName, oProperty) {
		assert( sTypeName && typeof sTypeName === 'string', "sTypeName must be a non-empty string");

		var oType = mTypes[sTypeName];
		if ( !(oType instanceof DataType) ) {
			// check for array types
			if (sTypeName.indexOf("[]", sTypeName.length - 2) > 0) {
				var sComponentTypeName = sTypeName.slice(0, -2),
					oComponentType = this.getType(sComponentTypeName);
				oType = oComponentType && createArrayType(oComponentType);
				if ( oType ) {
					mTypes[sTypeName] = oType;
				}
			} else if ( sTypeName !== 'array') {
				// check if we have a valid pre-registered enum
				oType = mEnumRegistry[sTypeName];

				/**
				 * If an enum was not registered beforehand (either explicitly via registerEnum or
				 * via a Proxy in the library namespace), we have to look it up in the global object.
				 * @deprecated since 1.120
				 */
				if (oType == null) {
					oType = ObjectPath.get(sTypeName);
					if (oType != null) {
						logErrorOnce(oProperty?._oParent.getName(), oProperty?.name,
						`[DEPRECATED] The type '${sTypeName}' was accessed via globals. Defining types via globals is deprecated. ` +
						`In case the referenced type is an enum: require the module 'sap/ui/base/DataType' and call the static 'DataType.registerEnum' API. ` +
						`In case the referenced type is non-primitive, please note that only primitive types (and those derived from them) are supported for ManagedObject properties. ` +
						`If the given type is an interface or a subclass of ManagedObject, you can define a "0..1" aggregation instead of a property`);
					}
				}

				if ( oType instanceof DataType ) {
					mTypes[sTypeName] = oType;
				} else if ( isPlainObject(oType) ) {
					oType = mTypes[sTypeName] = createEnumType(sTypeName, oType);
					delete mEnumRegistry[sTypeName];
				} else if ( oType ) {
					future.warningThrows("'" + sTypeName + "' is not a valid data type. Falling back to type 'any'.");
					oType = mTypes.any;
				} else {
					future.errorThrows("data type '" + sTypeName + "' could not be found.");
					oType = undefined;
				}
			}
		}
		return oType;
	};

	/**
	 * Derives a new type from a given base type.
	 *
	 * Example:<br>
	 * <pre>
	 *
	 *   var fooType = DataType.createType('foo', {
	 *       isValid : function(vValue) {
	 *           return /^(foo(bar)?)$/.test(vValue);
	 *       }
	 *   }, DataType.getType('string'));
	 *
	 *   fooType.isValid('foo'); // true
	 *   fooType.isValid('foobar'); // true
	 *   fooType.isValid('==foobar=='); // false
	 *
	 * </pre>
	 *
	 * If <code>mSettings</code> contains an implementation for <code>isValid</code>,
	 * then the validity check of the newly created type will first execute the check of the
	 * base type and then call the given <code>isValid</code> function.
	 *
	 * Array types and enumeration types cannot be created with this method. They're created
	 * on-the-fly by {@link #.getType DataType.getType} when such a type is looked up.
	 *
	 * <b>Note:</b> The creation of new primitive types is not supported. When a type is created
	 * without a base type, it is automatically derived from the primitive type <code>any</code>.
	 *
	 * <b>Note:</b> If a type has to be used in classes, then the implementation of
	 * <code>isValid</code> must exactly have the structure shown in the example above (single
	 * return statement, regular expression literal of the form <code>/^(...)$/</code>, calling
	 * <code>/regex/.test()</code> on the given value).
	 * Only the inner part of the regular expression literal can be different.
	 *
	 * @param {string} sName Unique qualified name of the new type
	 * @param {object} [mSettings] Settings for the new type
	 * @param {any} [mSettings.defaultValue] Default value for the type (inherited if not given)
	 * @param {function} [mSettings.isValid] Additional validity check function for values of the
	 *                       type (inherited if not given)
	 * @param {function} [mSettings.parseValue] Parse function that converts a locale independent
	 *                       string into a value of the type (inherited if not given)
	 * @param {sap.ui.base.DataType|string} [vBase='any'] Base type for the new type
	 * @returns {sap.ui.base.DataType} The newly created type object
	 * @public
	 */
	DataType.createType = function(sName, mSettings, vBase) {
		assert(typeof sName === "string" && sName, "DataType.createType: type name must be a non-empty string");
		assert(vBase == null || vBase instanceof DataType || typeof vBase === "string" && vBase,
				"DataType.createType: base type must be empty or a DataType or a non-empty string");
		if ( /[\[\]]/.test(sName) ) {
			future.errorThrows(
				"DataType.createType: array types ('something[]') must not be created with createType, " +
				"they're created on-the-fly by DataType.getType");
		}
		if ( typeof vBase === "string" ) {
			vBase = DataType.getType(vBase);
		}
		vBase = vBase || mTypes.any;
		if ( vBase.isArrayType() || vBase.isEnumType() ) {
			future.errorThrows("DataType.createType: base type must not be an array- or enum-type");
		}
		if ( sName === 'array' || mTypes[sName] instanceof DataType ) {
			if ( sName === 'array' || mTypes[sName].getBaseType() == null ) {
				throw new Error("DataType.createType: primitive or hidden type " + sName + " can't be re-defined");
			}
			future.warningThrows("DataTypes.createType: type " + sName + " is redefined. " +
				"This is an unsupported usage of DataType and might cause issues." );
		}
		var oType = mTypes[sName] = createType(sName, mSettings, vBase);
		return oType;
	};


	// ---- minimal support for interface types -------------------------------------------------------------------

	var oInterfaces = new Set();

	/**
	 * Registers the given array of type names as known interface types.
	 * Only purpose is to enable the {@link #isInterfaceType} check.
	 * @param {string[]} aTypes interface types to be registered
	 * @private
	 * @ui5-restricted sap.ui.core.Core
	 */
	DataType.registerInterfaceTypes = function(aTypes) {
		aTypes.forEach(function(sType) {
			oInterfaces.add(sType);

			/**
			 * @deprecated
			 */
			(() => {
				// Defining the interface on global namespace for compatibility reasons.
				// This has never been a public feature and it is strongly discouraged it be relied upon.
				// An interface must always be referenced by a string literal, not via the global namespace.
				ObjectPath.set(sType, sType);
			})();
		});
	};

	/**
	 * Registers an enum under the given name.
	 * With version 2.0, registering an enum becomes mandatory when said enum is to be used in
	 * properties of a {@link sap.ui.base.ManagedObject ManagedObject} subclass.
	 *
	 * Example:<br>
	 * <pre>
	 *    DataType.registerEnum("my.enums.Sample", {
	 *       "A": "A",
	 *       "B": "B",
	 *       ...
	 *    });
	 * </pre>
	 *
	 * @param {string} sTypeName the type name in dot syntax, e.g. sap.ui.my.EnumType
	 * @param {object} mContent the enum content
	 * @public
	 * @since 1.120.0
	 */
	DataType.registerEnum = function(sTypeName, mContent) {
		mEnumRegistry[sTypeName] = mContent;
	};

	/**
	 * Checks if the given object contains only static content
	 * and can be regarded as an enum candidate.
	 *
	 * @param {object} oObject the enum candidate
	 * @returns {boolean} whether the given object can be regarded as an enum candidate
	 * @private
	 * @ui5-restricted sap.ui.core.Lib
	 */
	DataType._isEnumCandidate = function(oObject) {
		return !Object.keys(oObject).some((key) => {
			const propertyType = typeof oObject[key];
			return propertyType === "object" || propertyType === "function";
		});
	};

	/**
	 * @param {string} sType name of type to check
	 * @returns {boolean} whether the given type is known to be an interface type
	 * @private
	 * @ui5-restricted sap.ui.base.ManagedObject
	 */
	DataType.isInterfaceType = function(sType) {
		return oInterfaces.has(sType);
	};


	/**
	 * A string type representing an ID or a name.
	 *
	 * Allowed is a sequence of characters (capital/lowercase), digits, underscores, dashes, points and/or colons.
	 * It may start with a character or underscore only.
	 *
	 * @typedef {string} sap.ui.core.ID
	 * @final
	 * @public
	 * @ui5-module-override sap/ui/core/library ID
	 */
	DataType.createType('sap.ui.core.ID', {
			isValid : function(vValue) {
				return /^([A-Za-z_][-A-Za-z0-9_.:]*)$/.test(vValue);
			}
		},
		DataType.getType('string')
	);

	// The enum helper receives the final registerEnum function and ensures
	// that all early collected enums are correctly registered
	_EnumHelper.inject(DataType.registerEnum);

	return DataType;

}, /* bExport= */ true);
