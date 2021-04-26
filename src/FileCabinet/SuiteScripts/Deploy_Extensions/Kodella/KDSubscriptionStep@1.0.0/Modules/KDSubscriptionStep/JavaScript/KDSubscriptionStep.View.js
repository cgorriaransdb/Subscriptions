// @module Kodella.KDSubscriptionStep.KDSubscriptionStep
define('Kodella.KDSubscriptionStep.KDSubscriptionStep.View'
,	[
	'kodella_kdsubscriptionstep_kdsubscriptionstep.tpl'
	
	,	'Kodella.KDSubscriptionStep.KDSubscriptionStep.Model'
	
	,	'Backbone'

	,	'Wizard.Module'

	,	'LiveOrder.Model'
    ]
, function (
	kodella_kdsubscriptionstep_kdsubscriptionstep_tpl
	
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

		template: kodella_kdsubscriptionstep_kdsubscriptionstep_tpl

	,	events: {
		}
	, getList: function(){
		var self = this;
		var model = new KDSubscriptionStepSS2Model()
		//debugger;
		model.fetch({async: false}).done(function(result) {
			//debugger;
			self.customList = result;
			//self.render
		  });
	}

	,	bindings: {
		}

	, 	childViews: {

		}

		//@method getContext @return Kodella.KDSubscriptionStep.KDSubscriptionStep.View.Context
	,	getContext: function getContext()
		{
			//debugger;
			this.getList();
			var orderLines = LiveOrderModel.getInstance().attributes.lines.models;
			var deliveryFreq = LiveOrderModel.getInstance().get('options').custbody_kd_sub_delivery_freq;
			var deliveryText;
			if(deliveryFreq == "1"){
				deliveryText = 'every week';
			} else if(deliveryFreq == "2"){
				deliveryText = 'every 2 weeks';
			} else if(deliveryFreq == "3"){
				deliveryText = 'every 3 weeks';
			} else if(deliveryFreq == "4"){
				deliveryText = 'every month';
			}
			//@class Kodella.KDSubscriptionStep.KDSubscriptionStep.View.Context
			
			 return {
				 isSubscription: this.step.step_url == 'subscription-step/sub',
				 orderLines: orderLines,
				 customList: this.customList,
				 deliveryText: deliveryText,
				 enablePayUpfront: SC.CONFIGURATION.KDSubscriptionStep.config
			 };
		}
	});
});
