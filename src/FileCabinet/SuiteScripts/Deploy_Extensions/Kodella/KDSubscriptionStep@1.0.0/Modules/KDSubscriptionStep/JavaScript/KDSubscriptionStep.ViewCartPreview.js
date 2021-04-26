// @module Kodella.KDSubscriptionStep.KDSubscriptionStep
define('Kodella.KDSubscriptionStep.KDSubscriptionStep.ViewCartPreview'
,	[
    'kodella_kdsubscriptionstep_cartpreview.tpl'
	
	,	'Kodella.KDSubscriptionStep.KDSubscriptionStep.SS2Model'
	
	,	'Backbone'

	,	'Wizard.Module'

	,	'LiveOrder.Model',
    ]
, function (
	kodella_kdsubscriptionstep_cartpreview_tpl
	
	,	KDSubscriptionStepSS2Model
	
	,	Backbone
	
	,	WizardModule

	,	LiveOrderModel
)
{
    'use strict';

	// @class Kodella.KDSubscriptionStep.KDSubscriptionStep.View @extends Backbone.View
	//return Backbone.View.extend({
	return WizardModule.extend({

		template: kodella_kdsubscriptionstep_cartpreview_tpl
		
		//this doesn't work if initialize is set.
	// ,	initialize: function (options) {
			
	// 		//this.options.el = "wizard-step-content"
	// 		/*  Uncomment to test backend communication with an example service
	// 			(you'll need to deploy and activate the extension first)
	// 		*/

	// 		 console.log(this, 'holiholilhoih');
    //      	// this.model.fetch().done(function(result) {
	// 		// 	self.message = result.message;
	// 		// 	self.render()
    //   		// });
	// 	}

	,	events: {
		}

	,	bindings: {
		}

	, 	childViews: {

		}

		//@method getContext @return Kodella.KDSubscriptionStep.KDSubscriptionStep.View.Context
	,	getContext: function getContext()
		{
			var orderLines = LiveOrderModel.getInstance().attributes.lines.models;
			
			orderLines.forEach(function(line){
				var hasSubOptions = line.attributes.options.models.filter(function(e) { 
					return e.attributes.cartOptionId === 'custcol_kd_subscriptions'; 
				}).length > 0;


				var subAmount = line.attributes.rate * line.attributes.quantity * 0.85;
				// var subAmount = line.attributes.amount;

				if(_.where(line.attributes.item.attributes.itemimages_detail, 'url')[0]){
					if(_.where(line.attributes.item.attributes.itemimages_detail, 'url')[0].url){
						line.attributes.item.attributes.itemImage = _.where(line.attributes.item.attributes.itemimages_detail, 'url')[0].url;
					} else if(_.where(line.attributes.item.attributes.itemimages_detail, 'url')[0].urls){
						line.attributes.item.attributes.itemImage = _.where(line.attributes.item.attributes.itemimages_detail, 'url')[0].urls[0].url;
					}
				} else{
					line.attributes.item.attributes.itemImage = SC.CONFIGURATION.imageNotAvailable;
				}

				if(hasSubOptions){
					line.attributes.hasSubOptions = true;
					line.attributes.subAmount = '$'+ subAmount.toFixed(2);
				}
			})
			//@class Kodella.KDSubscriptionStep.KDSubscriptionStep.View.Context
			
			 return {
				 isSubscription: this.step.step_url == 'subscription-step/sub',
				 orderLines: orderLines
			 };
		}
	});
});
