// @module Kodella.KDSubAccount.KDSubAccount
define('Kodella.KDSubAccount.KDSubAccount.View.List'
,	[
	'Kodella_kdsubaccount_kdsubaccount_list.tpl'
	,	'Kodella.KDSubAccount.KDSubAccount.SS2Model'
	,	'Backbone'
	,   'Kodella.KDSubAccount.KDSubAccount.Model'
	,   'Profile.Model'
	
    ]
, function (
	kodella_kdsubaccount_kdsubaccount_list_tpl
	,	KDSubAccountSS2Model
	,	Backbone
	,   KDSubAccountModel
	,   ProfileModel
)
{
	'use strict';
	
	

	// @class Kodella.KDSubscriptions.KDSubcriptions.View @extends Backbone.View
	return Backbone.View.extend({

		template: kodella_kdsubaccount_kdsubaccount_list_tpl

	,	initialize: function (options) {
		debugger;
			/*  Uncomment to test backend communication with an example service
				(you'll need to deploy and activate the extension first)
			*/
			
			var profileModel = ProfileModel.getInstance();
			var customerId = profileModel.id;
			
			this.model = new KDSubAccountModel();
			var self = this;
			this.model.fetch({ async: false, data: { customer: customerId } }).done(function(result) {
				console.log(result, 'result sub list')
				self.message = result.reverse();
				//self.render();
			});
		}

	,	events: {
		//'click ["ul#customPagination li"]': 'navigatePages'
		}

	,	bindings: {
		}

	, 	childViews: {

		}

		//@method getContext @return Kodella.KDSubscriptions.KDSubcriptions.View.Context
	,	getContext: function getContext()
		{
			//@class Kodella.KDSubscriptions.KDSubcriptions.View.Context
			this.message = this.message || 'Hello World!!'
			return {
				message: this.message
			};
		}
	});
});
