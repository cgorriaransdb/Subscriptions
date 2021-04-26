
define(
	'Kodella.KDSubscriptionStep.KDSubscriptionStep'
,   [
		'Kodella.KDSubscriptionStep.KDSubscriptionStep.View',
		'Kodella.KDSubscriptionStep.KDSubscriptionStep.ViewCartPreview',
		'OrderWizard.Module.CartSummary',
		'OrderWizard.Module.PromocodeForm',
		'Wizard.View',
		'LiveOrder.Model', 
		'SC.Configuration',
		'Cart.Summary.View',
		'Profile.Model',
		'Utils',
		'underscore'
	]
,   function (
		KDSubscriptionStepView,
		KDSubscriptionStepCartPreview,
		OrderWizardModuleCartSummary,
		OrderWizardModulePromocodeForm,
		WizardView,
		LiveOrderModel,
		Configuration,
		CartSummaryView,
		ProfileModel,
		Utils,
		_
	)
{
	'use strict';

	return  {
		mountToApp: function mountToApp (container)
		{
			
			// using the 'Layout' component we add a new child view inside the 'Header' existing view 
			// (there will be a DOM element with the HTML attribute data-view="Header.Logo")
			// more documentation of the Extensibility API in
			// https://system.netsuite.com/help/helpcenter/en_US/APIs/SuiteCommerce/Extensibility/Frontend/index.html
			
			/** @type {LayoutComponent} */
			var layout = container.getComponent('Layout');
			var checkout = container.getComponent('Checkout');
			var subsTotal = "";
			var newTotal = "";
			var orderLines = LiveOrderModel.getInstance().attributes.lines.models;
			var newQtyObj = { lines: [] };
			var inSubscriptionStep;
			var orderDeliveryFreq;
			var orderDeliveryFreqLabel;
			var subscriptionItems = { items: [] }


			if(checkout){
			//-------------------------------------------------------- auxiliar functions -------------------------------------------------------------------//
				//function for processing 'custcol_kd_subscriptions' values list
				function deliveryOptions(opt){
					if(opt == "Weekly"){
						return 7;
					} else if(opt == "Fortnightly"){
						return 14;
					} else if(opt == "3 weeks"){
						return 21;
					} else{
						return 1;
					}
				}

				//function for processing 'custbody_kd_subscription_limit'

				function subLimitOptions(value){
					if(value == "1"){
						return 3; 
					} else if(value == "2"){
						return 6;
					} else{
						return 12;
					}
				}

				//Date functions
				var currentDate = new Date();
				var day1 = currentDate.getDate();
				var month1 = currentDate.getMonth() + 1; //month1 is month - 1
				var year1 = currentDate.getFullYear();
			
				//setting date in x months 
				function endingDate(months){
					var day2 = day1;
					var month2 = month1 + months;
					var year2 = year1;
			
					if(month2 > 12){
						month2 = month2 - 12;
						year2++;
					}
			
					return new Date(month2 + '/' + day2 + '/' + year2);
				}
			
				function calculateDays(date1, date2){
					return parseInt((date2-date1)/(24*3600*1000));
				}

				//calculating new amount
				function subscriptionCalc(psublimit, ppurchase, pcartlines){
					//var cart = container.getComponent('Cart');
					//debugger;
					
					newTotal = 0;
					subsTotal = 0;
					newQtyObj.lines = [];
					subscriptionItems.items = [];


					for(var i=0; i < orderLines.length; i++){
						if(orderLines[i].deliveryFrequency){							

							if(psublimit == 99){
								// debugger;
								 orderLines[i].fullSubAmount = orderLines[i].attributes.rate * orderLines[i].attributes.quantity * 0.85;
								//orderLines[i].fullSubAmount = orderLines[i].attributes.amount;

								if(ppurchase == 'ispurchase'){

									newQtyObj.lines.push({
										itemid: orderLines[i].attributes.item.attributes.internalid,
										originalQuantity: parseInt(orderLines[i].attributes.quantity),
										newquantity: parseInt(orderLines[i].attributes.quantity) * 1,
										freq: orderLines[i].deliveryFreqID
									}); 
									//console.log('after setting', newQtyObj);
								}

							} else{
								//debugger;
								//setting amount of deliveries within subscription limit
								var subEnd = endingDate(subLimitOptions(psublimit));
							
								//if deliveryFrequency is monthly, then there is as many deliveries as months subscribed
								if(orderLines[i].deliveryFrequency == 1){
									var totalDeliveries = subLimitOptions(psublimit);
								} else {
									var totalDeliveries = parseInt(calculateDays(currentDate, subEnd) / orderLines[i].deliveryFrequency);
								}

								orderLines[i].fullSubAmount = orderLines[i].attributes.rate * orderLines[i].attributes.quantity * 0.85 * totalDeliveries;
								//orderLines[i].fullSubAmount = orderLines[i].attributes.amount * totalDeliveries;


								//-------------- to be used only if item options are going to be updated
								if(ppurchase == 'ispurchase'){
									//debugger;
									newQtyObj.lines.push({
										itemid: orderLines[i].attributes.item.attributes.internalid,
										originalQuantity: parseInt(orderLines[i].attributes.quantity) * 1,
										newquantity: parseInt(orderLines[i].attributes.quantity) * parseInt(totalDeliveries),
										freq: orderLines[i].deliveryFreqID
									}); 
									//sessionStorage.setItem('subItemName', orderLines[i].attributes.item.attributes.displayname);
									sessionStorage.setItem('subItemDeliveries', totalDeliveries);
									// sessionStorage.setItem('subItemName' + [i], orderLines[i].attributes.item.attributes.displayname);
									// sessionStorage.setItem('subItemDeliveries' + [i], totalDeliveries);
								}
							}

							subsTotal += parseFloat(orderLines[i].fullSubAmount); //value used in cards
							newTotal += parseFloat(orderLines[i].fullSubAmount);

							//debugger;
							var subItemAdded = false;
							orderLines[i].attributes.options.models.forEach(function(option, index){
								if(!subItemAdded){
									if(option.attributes.cartOptionId == "custcol_kd_grind"){
										subscriptionItems.items.push({
											itemId: orderLines[i].attributes.item.attributes.internalid,
											quantity: orderLines[i].attributes.quantity,
											grind: option.attributes.value.internalid,
											delivery: orderLines[i].deliveryFreqID
										})
										subItemAdded = true;
									} else if(index == (orderLines[i].attributes.options.models.length - 1)){
										//only if this is the only option remaining and it is not grind, then we will add
										//an item with no grind
										subscriptionItems.items.push({
											itemId: orderLines[i].attributes.item.attributes.internalid,
											quantity: orderLines[i].attributes.quantity,
											grind: '',
											delivery: orderLines[i].deliveryFreqID
										})
										subItemAdded = true;
									}
								}
							})		
							
							
						} else {
							//if item is not subscription, the price is directly added to the newTotal
							newTotal += parseFloat(orderLines[i].attributes.amount);

							//commented this bit: was live and did not break, but still- it makes no sense
							// newQtyObj.lines.push({
							// 	itemid: orderLines[i].attributes.item.attributes.internalid,
							// 	newquantity: parseInt(orderLines[i].attributes.quantity),
							// 	freq: ''
							// }); 

							sessionStorage.setItem('subItemName' + [i], '');
							sessionStorage.setItem('subItemDeliveries' + [i], '')
						}
					}

					if(ppurchase == 0){
						if(SC.CONFIGURATION.KDSubscriptionStep.config){
							if(psublimit == 99){
								var shipMethod = LiveOrderModel.getInstance().get('shipmethod');
								var shippingCost = _.findWhere(LiveOrderModel.getInstance().get('shipmethods').models, {id: shipMethod}).attributes.rate_formatted;
								document.getElementById(psublimit + '-sub-card-monthly-price').innerHTML = subsTotal.toFixed(2) + '<br> + ' + shippingCost + ' shipping';
							} else{
								document.getElementById(psublimit + '-sub-card-monthly-price').innerHTML = subsTotal.toFixed(2);
							}
						}
					}
				}

				function summaryDeliveries(){
					// var summaryArr = [];
					//debugger;
					// for(var i=0; i<orderLines.length; i++){
					// 	var name = sessionStorage.getItem('subItemName' + [i]);
					// 	var deliveries = sessionStorage.getItem('subItemDeliveries' + [i]);

					// 	if(name){
					// 		summaryArr.push({
					// 			name: name,
					// 			deliveries: deliveries
					// 		});
					// 	}
					// }

					var summaryArr = [{name: '', deliveries: sessionStorage.getItem('subItemDeliveries')}];
					return summaryArr;
				}
			

			// if(layout)
			// {
			checkout.on("beforeShowContent", function() {
						
			checkout.getCurrentStep().then(function(step){
				
				//debugger;

					var isSubscriptionOrder = false;
					if(orderLines.length == 0){
						orderLines = LiveOrderModel.getInstance().attributes.lines.models;
					}

					orderLines.forEach(function(line){

						var hasSubOptions = false;

						line.attributes.options.models.forEach(function(option){
							if(option.attributes.cartOptionId === 'custcol_kd_subscriptions'){
								hasSubOptions = true;
								line.deliveryFrequency = deliveryOptions(option.attributes.value.label);
								line.deliveryFreqID = option.attributes.value.internalid;
								line.deliveryFrequencyLabel = option.attributes.value.label;
							}
						})
						
						if(hasSubOptions){
							isSubscriptionOrder = true;
							orderDeliveryFreq = line.deliveryFreqID;
							orderDeliveryFreqLabel = line.deliveryFrequencyLabel;
						}

					})

					LiveOrderModel.getInstance().get('options')['custbody_kd_sub_delivery_freq'] = orderDeliveryFreq;
				
					//we will only generate this modules if this is an order with subscription/s
					if(isSubscriptionOrder){
						// if (step.url == 'billing'){
							// Creating a new stepGroup, step and module
							checkout.addStepsGroup({group: {
								index: 4, 
								name: 'Subscriptions', 
								url: 'subscription-step' 
							}})
				
							.done(function () {
								
								checkout.addStep({step: {
									group_name: 'Subscriptions', 
									index: 5, 
									isActive: function () {}, 
									name: 'Subscriptions', 
									showStep: function () {return true}, 
									url: 'subscription-step/sub' 
								}})
				
								.done(function () {
									
									checkout.addModuleToStep({
										step_url: 'subscription-step/sub', 
										module: { 
											id: 'subscriptionitemsmodule', 
											index: 0, 
											classname: 'Kodella.KDSubscriptionStep.KDSubscriptionStep.ViewCartPreview'
										}
									})
									checkout.addModuleToStep({
										step_url: 'subscription-step/sub', 
										module: { 
											id: 'subscriptionmodule', 
											index: 1, 
											classname: 'Kodella.KDSubscriptionStep.KDSubscriptionStep.View'
										}
									})
									//add the modules for summary
									checkout.addModuleToStep({
										step_url: 'subscription-step/sub', 
										module: { 
											id: 'subscription_cart_summary', 
											index: 2, 
											classname: 'OrderWizard.Module.CartSummary', 
											options: {container: '#wizard-step-content-right'}
										}
									})
									checkout.addModuleToStep({
										step_url: 'subscription-step/sub', 
										module: { 
											id: 'subscription_promocodeform', 
											index: 3, 
											classname: 'OrderWizard.Module.PromocodeForm', 
											options: {container: '#wizard-step-content-right'}
										}
									})
									checkout.addModuleToStep({
										step_url: 'subscription-step/sub', 
										module: { 
											id: 'subscription_cartitems_ship', 
											index: 4, 
											classname: 'OrderWizard.Module.CartItems.Ship', 
											options: {container: '#wizard-step-content-right'}
										}
									})
									
								});
							});
						//}
					
						var hasSubModule = step.modules.filter(function(e) { 
							return e.id === 'subscriptionmodule'; 
						}).length > 0;

						
						if(step.url == 'review' && !hasSubModule){ //adding the subscriptionmodule to the review step only once.
							inSubscriptionStep = false;

							checkout.addModuleToStep({
								step_url: 'review',
								module: {
									id: 'subscriptionmodule',
									index: 99,
									classname: 'Kodella.KDSubscriptionStep.KDSubscriptionStep.View'
								}
							});
						} 
						

					} //ends if isSubOrder
					
				}); //ends getCurrentStep

			}); //ends before show content	

					

					//---------------calculating prices when paying upfront -------------------//
					WizardView.prototype.submit = _.wrap(WizardView.prototype.submit, function (fn, e) {
						//var self = this;
						debugger;
						var subCheck = false;
						if(this.currentStep.step_url == 'subscription-step/sub'){
							
							//var isPayUpfront = document.querySelector('input[name="custbody_kd_is_pay_upfront"]:checked');
							var subLimit = document.querySelector('input[name="custbody_kd_subscription_limit"]:checked');
							debugger;
							LiveOrderModel.getInstance().get('options')['custbody_kd_sub_delivery_freq'] = orderDeliveryFreq;
							LiveOrderModel.getInstance().get('options')['custbody_kd_subscription_items_array'] = JSON.stringify(subscriptionItems.items);
							LiveOrderModel.getInstance().save();

							//if(subLimit && isPayUpfront){
							if (subLimit) {
								jQuery('.custom-subscription-alert').addClass('hidden');
								this.wizard.getCurrentStep().submit(e);
							} else {
								jQuery('.custom-subscription-alert').removeClass('hidden');
								return jQuery.Deferred().reject(); 
							}

							subCheck = true;

						} else if (this.currentStep.step_url === 'review' && 
						LiveOrderModel.getInstance().get('options')['custbody_kd_sub_payupfront_subtotal'] && 
						SC.CONFIGURATION.KDSubscriptionStep.config)
						{
							debugger;
							newQtyObj = JSON.parse(LiveOrderModel.getInstance().get('options')['custbody_kd_sub_payupfront_subtotal']);
							newQtyObj.purchase = true;
							newQtyObj.totalDeliveries = sessionStorage.getItem('subItemDeliveries');
							console.log(newQtyObj, 'newqtyobj');
							LiveOrderModel.getInstance().get('options')['custbody_kd_sub_payupfront_subtotal'] = JSON.stringify(newQtyObj);
							LiveOrderModel.getInstance().save();
							this.wizard.getCurrentStep().submit(e);	

						} else {
							this.wizard.getCurrentStep().submit(e);							
						}

					});

					//mark options if they are already selected
					checkout.on("afterShowContent", function() {
						//var orderLines = LiveOrderModel.getInstance().attributes.lines.models;

						checkout.getCurrentStep().then(function(step){
							var orderOptions = LiveOrderModel.getInstance().attributes.options;
							
							if(step.url == 'subscription-step/sub'){
								document.querySelector('.order-wizard-cart-summary-shipping-cost-applied').style.display= 'none';
								inSubscriptionStep = true;

								document.querySelector('.order-wizard-step-button-back').disabled = false;
								document.querySelector('.order-wizard-step-button-continue').disabled = false;
								
								if(orderOptions.custbody_kd_is_pay_upfront == 'F'){
									document.querySelector('input[name="custbody_kd_subscription_limit"][value="99"]').click();
								} else if(orderOptions.custbody_kd_subscription_limit){
									document.querySelector('input[name="custbody_kd_subscription_limit"][value="'+orderOptions.custbody_kd_subscription_limit+'"]').click();
								}
								
								subscriptionCalc(99, 0);
								subscriptionCalc(1, 0);
								subscriptionCalc(2, 0);

								var subLimitButton = jQuery('input[name="custbody_kd_subscription_limit"]');

								subLimitButton.click(function(e){
									var subLimit = document.querySelector('input[name="custbody_kd_subscription_limit"]:checked');
									subscriptionCalc(subLimit.value, 'ispurchase');
									console.log(SC.CONFIGURATION.KDSubscriptionStep.config, 'config checkbox')
									if(subLimit.value !== '99'){
										if(SC.CONFIGURATION.KDSubscriptionStep.config){
											newQtyObj.totalDeliveries = sessionStorage.getItem('subItemDeliveries');
											LiveOrderModel.getInstance().get('options')['custbody_kd_is_pay_upfront'] = 'T';
										} else {
											newQtyObj.totalDeliveries = 1;
										}
										LiveOrderModel.getInstance().get('options')['custbody_kd_subscription_limit'] = subLimit.value;
									}else{
										LiveOrderModel.getInstance().get('options')['custbody_kd_is_pay_upfront'] = 'F';
										LiveOrderModel.getInstance().get('options')['custbody_kd_subscription_limit'] = '';
										newQtyObj.totalDeliveries = 1;
									}

									//setting new values in live order model
									
									// console.log(newQtyObj, 'object for deliveries')
									LiveOrderModel.getInstance().get('options')['custbody_kd_sub_payupfront_subtotal'] = JSON.stringify(newQtyObj);
									LiveOrderModel.getInstance().save();
								})
								
							}
							
							if(jQuery('#review-subscription-cost') && step.url == 'review'){
									var subDuration = orderOptions.custbody_kd_subscription_limit;
									var payUpfront = orderOptions.custbody_kd_is_pay_upfront;
									var subDeliveryFreq = orderOptions.custbody_kd_sub_delivery_freq;
									
									if(payUpfront == "T"){
										subscriptionCalc(subDuration);
									}else{
										subscriptionCalc(99);
									}

									if(subsTotal){
										if(subsTotal < 70 && payUpfront !== "T"){
											var shipMethod = LiveOrderModel.getInstance().get('shipmethod');
											var shippingCost = _.findWhere(LiveOrderModel.getInstance().get('shipmethods').models, {id: shipMethod}).attributes.rate;
											subsTotal += shippingCost;
										}
										jQuery('#review-subscription-cost').html(subsTotal.toFixed(2));
									}

									if(subDuration === "1"){
										jQuery('#review-subscription-duration').html('3 month subscription');
									} else if(subDuration === "2"){
										jQuery('#review-subscription-duration').html('6 month subscription');
									} 

									// if(subDeliveryFreq){
									// 	jQuery('#review-subscription-delivery').html(orderDeliveryFreqLabel);
									// }
							}
						})

					});

					//summary changes
					OrderWizardModuleCartSummary.prototype.getContext = _.wrap(OrderWizardModuleCartSummary.prototype.getContext, function(fn){
						
						var context = fn.apply(this, _.toArray(arguments).slice(1));		
						
						//debugger;
						if(LiveOrderModel.getInstance().attributes.options.custbody_kd_is_pay_upfront == 'F'){
							context.summaryDeliveryRow = '';
						} else{
							var summaryDeliveryArr = summaryDeliveries();
							context.summaryDeliveryRow = summaryDeliveryArr;
						}

						if(inSubscriptionStep){
							context.inSubscriptionStep = true;
						} else{
							context.inSubscriptionStep = false;
						}
						
						return context;
	
					});
					///---end summary changes

				}
		}
	};
});
