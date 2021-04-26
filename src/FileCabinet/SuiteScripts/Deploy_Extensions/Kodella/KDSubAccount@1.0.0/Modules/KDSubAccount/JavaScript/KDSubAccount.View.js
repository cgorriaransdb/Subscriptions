// @module Kodella.KDSubAccount.KDSubAccount
define('Kodella.KDSubAccount.KDSubAccount.View'
,	[
	'kodella_kdsubaccount_kdsubaccount_details.tpl'
	,	'Kodella.KDSubAccount.KDSubAccount.SS2Model'
	,	'Kodella.KDSubAccount.KDSubAccount.Model'
	,	'Backbone'
	, 	'Utils'
    ]
, function (
	kodella_kdsubaccount_kdsubaccount_details_tpl
	,	KDSubAccountSS2Model
	, 	KDSubcriptionsModel
	,	Backbone
	,	Utils
)
{
    'use strict';

	// @class Kodella.KDSubAccount.KDSubAccount.View @extends Backbone.View
	return Backbone.View.extend({

		template: kodella_kdsubaccount_kdsubaccount_details_tpl

		, initialize: function (options) {
			debugger;
			this.layout = options.container.getComponent('Layout');
			var url = Utils;
			url.getParameterByName(location.href,'options')
			/*  Uncomment to test backend communication with an example service
				(you'll need to deploy and activate the extension first)
			*/
			var itemId = '';
			var rcdId = url.getParameterByName(location.href,'rcdId');

			var self = this;
			self.recordData = {
				recordId: rcdId,
				status: url.getParameterByName(location.href,'status'),
				// subscriptionFreq: url.getParameterByName(location.href,'subscriptionFreq'),
				update: url.getParameterByName(location.href,'updated'),
				endDate: url.getParameterByName(location.href,'endDate'),
				subscriptionLimit: url.getParameterByName(location.href,'subscriptionLimit'),
				price: 0,
				nextRenewal: url.getParameterByName(location.href,'nextRenewal')
			}

			//get item subrecords
			this.model = new KDSubcriptionsModel();
			this.model.fetch({ async: false, data: { rcdId: rcdId } }).done(function (result) { 
				self.subItems = result;
				self.allowRemove = (self.subItems.length > 1);
				
				self.subItems.forEach(function(subItem, index){
					subItem.quantity = parseInt(subItem.quantity);
					subItem.info = self.getItemInfo(subItem.itemId);
					subItem.info.unitaryPrice = subItem.info.subsPrice;
					if(subItem.info.options.filter(function(element){ return element.internalid == 'custcol_kd_grind' }).length){
						subItem.info.grindOptions = subItem.info.options.filter(function(element){ return element.internalid == 'custcol_kd_grind' })[0].values;
					}
					//get subscription options dynamically
					if(index == 0){
						self.deliveryOptions = subItem.info.options.filter(function(element){ return element.internalid == 'custcol_kd_subscriptions' })[0].values
					}
					self.recordData.price += parseFloat(subItem.info.subsPrice) * parseInt(subItem.quantity);
				})
				self.recordData.price = self.recordData.price.toFixed(2);
				//self.render();
			});

			//get subscription items from subscription commerce category
			this.model.fetch({ async: false, data: { init: true } }).done(function (result) { 
				debugger;
				self.availableSubs = result.subItems;
			});
		}

		, events: {
			'click [data-action="update"]': 'updated'
			, 'change [data-edit="subscription-blend"]': 'searchItem'
			, 'change [data-edit="subscription-size"]': 'searchItem'
			, 'blur [data-edit="subscription-quantity"]': 'setQty'
			//, 'change [id="custcol_kd_subscriptions-sub"]': 'changeFreq'
			, 'change [data-edit="subscription-grind"]': 'changeGrind'
			, 'change [data-edit="subscription-delivery"]': 'changeItemFreq'
			//, 'change [id="status"]': 'changeStatus'
			, 'click [data-action="subscription-edit"]': 'editSub'
			, 'click [data-action="sub-back-button"]': 'goBack'
			, 'click [data-action="remove-item"]': 'deleteItem'
		}

		, bindings: {
		}
		, getItemInfo: function(item){
			var resp = [];
			
			//* alternative for item API var shoppingDomain = SC.ENVIRONMENT.shoppingDomain;
			var companyId = SC.ENVIRONMENT.companyId;
			var nid = SC.ENVIRONMENT.siteSettings.id;
			var currency = SC.SESSION.currency.code;
			$.ajax({
				url: `/api/items?c=${companyId}&currency=${currency}&fieldset=details&include=facets&n=${nid}&offset=0&id=` + item,
				async: false,
				type: 'GET'
			}).done(function (res) {
				debugger;
				resp.displayName = res.items[0].displayname;
				//resp.size = res.items[0].custitem_coffee_bag_sku;
				if(res.items[0].itemimages_detail.main){
					resp.image = res.items[0].itemimages_detail.main.urls[0].url
				// } else if(res.items[0].itemimages_detail){
				// 	resp.image = _.where(res.items[0].itemimages_detail, 'url')[0].url;
				} else{
					resp.image = SC.CONFIGURATION.imageNotAvailable;
				}
				resp.options = res.items[0].itemoptions_detail.fields;
				resp.subsPrice = (res.items[0].onlinecustomerprice_detail.onlinecustomerprice * 0.85).toFixed(2);
			});
			return resp;
		}
		, childViews: {

		},
		updated: function (e) {
			debugger;
			var self = this;
			var model = new KDSubcriptionsModel();
			// debugger;
			//global info
			//var subscriptionFreq = jQuery('select[id="frequency"] option:selected').val();
			var status = jQuery('select[id="status"] option:selected').val();
			var rcordId = this.recordData.recordId;
			var data = {
				// subscriptionFreq: subscriptionFreq,
				status: status,
				rcordId: rcordId,
				items: []
			}
			//each item info
			this.subItems.forEach(function(item){
				var itemid = document.querySelector('[id="item-id-'+item.recordId+'"]').value;
				var editItem = document.querySelector('[id="edit-subscription-'+item.recordId+'"]').checked;
				var qty = document.querySelector('[data-recordid="'+item.recordId+'"][data-edit="subscription-quantity"]').value;
				var delivery = document.querySelector('[data-recordid="'+item.recordId+'"][data-edit="subscription-delivery"]').value;
				var grind = '';
				if( document.querySelector('[data-recordid="'+item.recordId+'"][data-edit="subscription-grind"]') ){
					grind = document.querySelector('[data-recordid="'+item.recordId+'"][data-edit="subscription-grind"]').value;
				}
				data.items.push({
					edit: editItem,
					recordId: item.recordId,
					itemId: parseInt(itemid),
					quantity: qty,
					grind: grind,
					delivery: delivery
				});
			})

			e.preventDefault()
			
			model.save(data).done(function (res) {
				// debugger;
				self.layout.showMessage({
					message: 'Successfully updated.',
					type: 'success',
					selector: 'success-updated',
					timeout: 2000
				});
				setTimeout(function () {
					Backbone.history.navigate('#subscription-list', { trigger: true });
				}, 2000);
				
			});
			
		}

		, searchItem: function(e){
			//* this function searches for the new item. Has an alternative for child items but selection variable needs to be specified
			var childItems = [];
			var itemSelected = {};
			var self = this;
			debugger;
			var itemRcdId = e.currentTarget.getAttribute('data-recordid');
			var itemid = parseInt( jQuery('[data-recordid="'+itemRcdId+'"][data-edit="subscription-blend"]').val() );
			var model = new KDSubcriptionsModel();
			
			jQuery('[data-action="update"]').attr('disabled', false);
			var itemDetails = self.getItemInfo(itemid);
			jQuery('[id=sub-item-price-'+itemRcdId+']').attr('data-itemprice', itemDetails.subsPrice);
			jQuery('#sub-item-price-'+itemRcdId).html(itemDetails.subsPrice);
			self.setQty(e);
			if(itemDetails.image){
				jQuery('#subscription-image-'+itemRcdId).attr('src', itemDetails.image);
			} else{
				jQuery('#subscription-image-'+itemRcdId).attr('src', SC.CONFIGURATION.imageNotAvailable);
			}
			jQuery('#subscription-displayname-'+itemRcdId).html(itemDetails.displayname);
			jQuery('#item-id-'+itemRcdId).val(itemid);
			//self.calculatePrice();
			
			
			//* ---- items w parent alternative ----//
			//!size as sample, could be any other matrix variable
			// var size = jQuery('[data-recordid="'+itemRcdId+'"][data-edit="subscription-size"]').val();
			// model.fetch({ async: true, data: { parent: itemid } }).done(function (res) {
			// 	childItems = res;
			// 	itemSelected = _.filter(childItems,function(item){
			// 		return item.size == size
			// 	})[0];

			// 	if(itemSelected){
			// 		jQuery('[data-action="update"]').attr('disabled', false);
			// 		jQuery('#size-alert-'+itemRcdId).css('display','none');
			// 		var itemDetails = self.getItemInfo(itemSelected.id);
			// 		jQuery('[id=sub-item-price-'+itemRcdId+']').attr('data-itemprice', itemDetails.subsPrice);
			// 		jQuery('#sub-item-price-'+itemRcdId).html(itemDetails.subsPrice);
			// 		self.setQty(e);
			// 		debugger;
			// 		if(itemDetails.image){
			// 			jQuery('#subscription-image-'+itemRcdId).attr('src', itemDetails.image);
			// 		} else{
			// 			jQuery('#subscription-image-'+itemRcdId).attr('src', SC.CONFIGURATION.imageNotAvailable);
			// 			// jQuery('#subscription-image').attr('src', "https://5458369-sb1.app.netsuite.com/core/media/media.nl?id=914009&c=5458369_SB1&h=vHaOoIG9pT5dP7Mmi3TWo1E1TW7W2Tu589idbma5Hg1QUJ33");
			// 			// PROD jQuery('#subscription-image').attr('src', "https://5458369.secure.netsuite.com/c.5458369/sca-dev-2020-1/img/no_image_available.jpeg");
			// 		}
			// 		jQuery('#subscription-displayname-'+itemRcdId).html(itemSelected.displayname + ' ' + size);
			// 		jQuery('#item-id-'+itemRcdId).val(itemSelected.id);
			// 		//self.calculatePrice();
			// 	} else{
			// 		jQuery('[data-action="update"]').attr('disabled', true);
			// 		jQuery('#size-alert-name-'+itemRcdId).html( jQuery('[data-recordid="'+itemRcdId+'"][data-edit="subscription-blend"] option:selected').text() );
			// 		jQuery('#size-alert-'+itemRcdId).css('display','block');
			// 	}
			// });
		}

		, setQty: function(e){
			var itemRcdId = e.currentTarget.getAttribute('data-recordid');
			if(jQuery('[data-recordid="'+itemRcdId+'"][data-edit="subscription-quantity"]').val() && jQuery('[data-recordid="'+itemRcdId+'"][data-edit="subscription-quantity"]').val() != '0'){
				// debugger;
				var qty = parseInt(jQuery('[data-recordid="'+itemRcdId+'"][data-edit="subscription-quantity"]').val());
				var newPrice = parseFloat( jQuery('[id=sub-item-price-'+itemRcdId+']').attr('data-itemprice') ) * qty;

				jQuery('#sub-display-qty-'+itemRcdId).html(qty);
				jQuery('#subscription-price-'+itemRcdId).html(newPrice.toFixed(2));
				jQuery('[data-recordid="'+itemRcdId+'"][data-edit="subscription-quantity"]').removeClass('custom-invalid-input-value');
				jQuery('[data-action="update"]').attr('disabled', false);
				this.calculatePrice();
			} else {
				jQuery('[data-recordid="'+itemRcdId+'"][data-edit="subscription-quantity"]').addClass('custom-invalid-input-value');
				jQuery('[data-action="update"]').attr('disabled', true);

			}
		}

		,	changeFreq: function(e){
			jQuery('#sub-display-freq').html( jQuery('select[id="custcol_kd_subscriptions-sub"] option:selected').text() );
		}

		,	changeGrind: function(e){
			var itemRcdId = e.currentTarget.getAttribute('data-recordid');
			jQuery('#sub-display-grind-'+itemRcdId).html( jQuery('[data-recordid="'+itemRcdId+'"][data-edit="subscription-grind"] option:selected').text() );
		}

		,	changeItemFreq: function(e){
			var itemRcdId = e.currentTarget.getAttribute('data-recordid');
			jQuery('#sub-display-delivery-'+itemRcdId).html( jQuery('[data-recordid="'+itemRcdId+'"][data-edit="subscription-delivery"] option:selected').text() );
		}

		,	changeStatus: function(e){
			jQuery('#sub-display-status').html( jQuery('select[id="status"] option:selected').text() );
		}

		, 	editSub: function(e){
			var itemRcdId = e.currentTarget.getAttribute('data-recordid');
			jQuery('[data-recordid="'+itemRcdId+'"].product-subscription-wrapper').toggleClass('overlap-on overlap-off');
			var label = document.querySelector('[id="label-edition-'+itemRcdId+'"]');
			if(label.innerHTML == 'Edit item'){
				label.innerHTML = 'Cancel'
			} else{
				label.innerHTML = 'Edit item'
			}
		}
		,	goBack: function(e){
			location.href = '#overview';
		}

		,	calculatePrice: function(){
			// debugger;
			if(this.recordData.endDate) return;
			var itemPriceArr = document.querySelectorAll('.item-price-span');
			var totalPrice = 0;
			for(var i=0; i<itemPriceArr.length; i++){
				var itemRecord = itemPriceArr[i].getAttribute('data-recordid');
				var qty = parseInt(jQuery('[data-recordid="' + itemRecord + '"][data-edit="subscription-quantity"]').val());
				totalPrice += parseFloat(itemPriceArr[i].getAttribute('data-itemprice')) * qty;
			}
			if(document.getElementById('subscription-main-price')){
				document.getElementById('subscription-main-price').innerHTML = '$' + totalPrice.toFixed(2);
			} 
		}

		,	deleteItem: function(e){
			debugger;
			if(this.subItems.length == 1) return;
			var self = this;
			var model = new KDSubcriptionsModel();
			var recordId = e.currentTarget.getAttribute('data-recordid');
			var data = {deleteRecord: true, recordId: parseInt(recordId)};
			console.log(data, 'to delete');
			
			model.save(data).done(function (res) {
				// debugger;
				jQuery("#subscription-delete-" + recordId).modal('hide');
				self.layout.showMessage({
					message: 'Successfully updated.',
					type: 'success',
					selector: 'success-updated',
					timeout: 2000
				});

				setTimeout(function () {
					Backbone.history.navigate('#subscription-list', { trigger: true });
				}, 2000);
				
			});

		}

		//@method getContext @return Kodella.KDSubscriptions.KDSubcriptions.View.Context
		, getContext: function getContext() {
			//@class Kodella.KDSubscriptions.KDSubcriptions.View.Context
			return {
				itemDetails: this.itemDetails,
				subItems: this.subItems,
				recordData: this.recordData,
				availableSubs: this.availableSubs,
				deliveryOptions: this.deliveryOptions,
				allowRemove: this.allowRemove,
				isPayUpfront: (SC.CONFIGURATION.KDSubscriptionStep.config && this.recordData.endDate)
			};
		}
	});
});
