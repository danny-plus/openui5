/* global QUnit */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/test/opaQunit",
	"./pages/Home",
	"./pages/Category",
	"./pages/Product",
	"./pages/Cart",
	"./pages/Checkout",
	"./pages/OrderCompleted",
	"./pages/Welcome"
], (Localization, opaTest) => {
	"use strict";

	const sDefaultLanguage = Localization.getLanguage();

	QUnit.module("Buy Product Journey", {
		before() {
			Localization.setLanguage("en-US");
		},
		after() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	opaTest("Should see the category list", (Given, When, Then) => {
		// Arrangements
		Given.iStartMyApp();

		// Assertions
		Then.onHome.iShouldSeeTheCategoryList().
			and.iShouldSeeSomeEntriesInTheCategoryList();
	});

	//We are still on the second category
	opaTest("Should see the product list", (Given, When, Then) => {
		// Actions
		When.onHome.iPressOnTheFlatScreensCategory();

		// Assertions
		Then.onTheCategory.iShouldBeTakenToTheFlatScreensCategory().
			and.iShouldSeeTheProductList().
			and.iShouldSeeSomeEntriesInTheProductList();
	});

	opaTest("Should see an avatar button on the product page", (Given, When, Then) => {
		// Actions
		When.onTheCategory.iPressOnTheFirstProduct();
		// Assertions
		Then.onTheProduct.iShouldSeeAnAvatarButton();

	});

	opaTest("Should add a product to the cart", (Given, When, Then) => {
		// Actions
		When.onTheProduct.iAddTheDisplayedProductToTheCart();

		When.onTheProduct.iToggleTheCart();

		// Assertions
		Then.onTheCart.iShouldSeeTheProductInMyCart()
			.and.iShouldSeeTheTotalPriceUpdated();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Should keep the cart when reloading", (Given, When, Then) => {
		// Arrangements
		Given.iStartMyApp({
			keepStorage: true
		});

		// Actions
		When.onHome.iPressOnTheFlatScreensCategory();
		When.onTheWelcomePage.iToggleTheCart();

		// Assertions
		Then.onTheCart.iShouldSeeTheProductInMyCart();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Should start the app with a bookmarkable cart product", (Given, When, Then) => {
		//Arrangement
		Given.iStartMyApp({
			keepStorage: true,
			hash: "category/FS/product/HT-1254/cart"
		});
		//Assertions
		Then.onTheProduct.iShouldSeeTheRightProduct();
	});

	opaTest("Should navigate to checkout", (Given, When, Then) => {

		// Actions
		When.onTheCart.iPressOnTheProceedButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});

	opaTest("Should return to the home", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheReturnToShopButton();

		// Assertions
		Then.onHome.iShouldSeeTheCategoryList().
			and.iShouldSeeSomeEntriesInTheCategoryList();
	});


	// Checkout with Credit Card
	opaTest("Should return to checkout", (Given, When, Then) => {

		// Actions
		When.onTheWelcomePage.iToggleTheCart();
		When.onTheCart.iPressOnTheProceedButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});

	opaTest("Should navigate to Payment Step", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepPaymentTypeStep();
	});

	opaTest("Should navigate to Credit Card Step", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldNotSeeTheStep4Button("creditCardStep");
	});

	opaTest("Should see Step 4 Button", (Given, When, Then) => {

		// Actions
		When.onCheckout.iEnterCreditCardInformation("My name", "1234567891234567", "123", "01/2020");

		// Assertions
		Then.onCheckout.iShouldSeeTheStep4Button();
	});

	opaTest("Should not see Step 4 Button when an information is missing", (Given, When, Then) => {

		// Actions
		When.onCheckout.iEnterCreditCardInformation("My name", "1234567891234567", "13", "01/2020");

		// Assertions
		Then.onCheckout.iShouldNotSeeTheStep4Button("creditCardStep").
			and.iShouldSeeTheFooterWithTheErrorButton();
	});

	opaTest("Should see a message popover window", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheButtonInTheFooter();

		// Assertions
		Then.onCheckout.iShouldSeeTheMessagePopover();
	});

	opaTest("Should see Step 4 Button", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressTheCloseButton().
			and.iEnterCreditCardInformation("My name", "1234567891234567", "123", "01/2020");

		// Assertions
		Then.onCheckout.iShouldSeeTheStep4Button();
	});

	opaTest("Should navigate to invoice Step", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldNotSeeTheStep4Button("invoiceStep");
	});

	opaTest("Should invalidate Step 5", (Given, When, Then) => {

		// Actions
		When.onCheckout.iEnterInvoiceAddressText("MyStr. 2", "1m", "someLetters", "1234");

		// Assertions
		Then.onCheckout.iShouldNotSeeTheStep4Button("invoiceStep");
	});

	opaTest("Should activate Step 5 Button", (Given, When, Then) => {

		// Actions
		When.onCheckout.iEnterInvoiceAddressText("MyStreet.2", "MyCity", "1234", "DE");

		// Assertions
		Then.onCheckout.iShouldSeeTheStep5Button();
	});

	opaTest("Should navigate to Delivery Type Step", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheDeliveryTypeStep();
	});

	opaTest("Should navigate to order summary", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheOrderSummary();
	});

	// Checkout with Bank Transfer
	opaTest("Should return to checkout", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheEditButtonBacktoList();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});

	opaTest("Should select Bank Transfer", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheBankTransferButton().and.iPressOnTheYesButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep3Button();
	});

	opaTest("Should navigate to Bank Transfer", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep4Button();
	});

	opaTest("Should navigate to invoice step", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep5Button();
	});


	opaTest("Should navigate to Delivery Type Step", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheDeliveryTypeStep();
	});

	opaTest("Should navigate to order summary", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheOrderSummary();
	});

	// Checkout with Cash on Delivery
	opaTest("Should return to checkout", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheEditButtonBackToPaymentType();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});

	opaTest("Should select Cash On Delivery", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheCashOnDeliveryButton().and.iPressOnTheYesButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep3Button();
	});

	opaTest("Should navigate to Cash On Delivery", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldNotSeeTheStep4Button("cashOnDeliveryStep");
	});

	opaTest("Should invalidate Step 4 Button", (Given, When, Then) => {

		// Actions
		When.onCheckout.iEnterCashOnDeliveryText("FirstName", "LastName", "+4911111111", "inf");

		// Assertions
		Then.onCheckout.iShouldNotSeeTheStep4Button("cashOnDeliveryStep").
			and.iShouldGetErrorMessageTextDoesNotMatchTypeForEmailField("inf");
	});

	opaTest("Should invalidate Step 4 Button", (Given, When, Then) => {

		// Actions
		When.onCheckout.iEnterCashOnDeliveryText("FirstName", "LastName", "+4911111111", "inf.shop.com");

		// Assertions
		Then.onCheckout.iShouldNotSeeTheStep4Button("cashOnDeliveryStep").
			and.iShouldGetErrorMessageTextDoesNotMatchTypeForEmailField("inf.shop.com");
	});

	opaTest("Should activate Step 4 Button", (Given, When, Then) => {

		// Actions
		When.onCheckout.iEnterCashOnDeliveryText("FirstName", "LastName", "+4911111111", "inf@shop.com");

		// Assertions
		Then.onCheckout.iShouldSeeTheStep4Button();
	});

	opaTest("Should navigate to invoice Step", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep5Button();
	});
	opaTest("Should navigate to Delivery Type Step", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheDeliveryTypeStep();
	});

	opaTest("Should navigate to order summary", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheOrderSummary();
	});

	opaTest("Should return to checkout", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheEditButtonBackToInvoiceAddress();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});

	// Checkout with Different Delivery Address
	opaTest("Should navigate to Delivery Address Step", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnDifferentAddressCheckbox().and.iPressOnTheYesButton().and.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheDeliveryAddressStep();
	});

	opaTest("Should activate Step 6 Button", (Given, When, Then) => {

		// Actions
		When.onCheckout.iEnterDeliveryAddressText();

		// Assertions
		Then.onCheckout.iShouldSeeTheDeliveryStepButton();
	});

	opaTest("Should navigate to Delivery Type Step", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheDeliveryTypeStep();
	});

	opaTest("Should navigate to order summary", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheOrderSummary();
	});


	//Checkout with different Delivery Type
	opaTest("Should return to checkout", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheEditButtonBackToDeliveryType();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});


	opaTest("Should select Express Delivery and navigate to order summary", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheExpressDeliveryButton().and.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheOrderSummary().and.iShouldSeeExpressDelivery();
	});


	// submit order
	opaTest("Should submit order and navigate to order completed", (Given, When, Then) => {

		// Actions
		When.onCheckout.iPressOnTheSubmitButton().and.iPressOnTheYesButton();

		// Assertions
		Then.onOrderCompleted.iShouldSeeTheOrderCompletedPage();
	});

	opaTest("Should return to the shop welcome screen", (Given, When, Then) => {

		// Actions
		When.onOrderCompleted.iPressOnTheReturnToShopButton();

		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();

		// Cleanup
		Then.iTeardownMyApp();
	});
});
