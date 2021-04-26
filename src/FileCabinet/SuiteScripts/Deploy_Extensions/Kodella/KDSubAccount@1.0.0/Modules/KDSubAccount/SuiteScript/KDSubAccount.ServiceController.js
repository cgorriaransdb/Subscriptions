define("Kodella.KDSubAccount.KDSubAccount.ServiceController", ["ServiceController"], function(
  ServiceController
) {
  "use strict";

  return ServiceController.extend({
    name: "Kodella.KDSubAccount.KDSubAccount.ServiceController",

    // The values in this object are the validation needed for the current service.
    options: {
      common: {}
    },

    get: function get() {
      try {
        nlapiLogExecution('audit', 'this.data libraries_ext.js == GET', this.request.getParameter('customer'));
        var objResponse = '';
        //var itemId = this.request.getParameter('itemid');
        var init = this.request.getParameter('init');
        var customerId = this.request.getParameter('customer');
        var parent = this.request.getParameter('parent');
        var rcdId = this.request.getParameter('rcdId');

        if (init) {
          var ss = nlapiSearchRecord('customrecord_kd_available_sub_items',null,null,[new nlobjSearchColumn('custrecord_kd_available_sub_item_fld')])
          var ret = [];
          if(ss){
            for(var i=0;i<ss.length;i++){
              ret.push({name:ss[i].getText("custrecord_kd_available_sub_item_fld"),id:ss[i].getValue("custrecord_kd_available_sub_item_fld")})
            }
          }
          objResponse = JSON.stringify({arr: ret});

        } else if(customerId){
          nlapiLogExecution('audit', 'customerId', customerId);
          var url = nlapiResolveURL('SUITELET', 'customscript_kd_get_subscriptions', 'customdeploy_kd_get_subscriptions_dpy', true);
          var ret = nlapiRequestURL(url + '&customer=' + customerId);
          nlapiLogExecution('audit', 'return body customer', ret.getBody());
          if (ret.getBody()) objResponse = ret.getBody();

        } else if (parent){
          nlapiLogExecution('audit', 'parent id in subs my account', parent);
            var url = nlapiResolveURL('SUITELET', 'customscript_kd_get_item_details', 'customdeploy_get_item_details_dpy', true); 
            var ret = nlapiRequestURL(url + "&parent=" + parent);
            nlapiLogExecution('audit', 'return body parent', ret.getBody());
            if (ret.getBody()) objResponse = ret.getBody();
        } else if (rcdId){
            nlapiLogExecution('audit', 'record id in subs my account', rcdId);
            var url = nlapiResolveURL('SUITELET', 'customscript_kd_get_subscriptions', 'customdeploy_kd_get_subscriptions_dpy', true); 
            var ret = nlapiRequestURL(url + "&rcdId=" + rcdId);
            nlapiLogExecution('audit', 'return body subitems', ret.getBody());
            if (ret.getBody()) objResponse = ret.getBody();
        }
      } catch (e) {
        nlapiLogExecution('audit', 'Error', JSON.stringify(e));
      }
      return (objResponse);

    },

    post: function post(data) {
      try {
        var ret='';
        var updatedInfo = ''
        var newData = this.data;
        //nlapiLogExecution('audit', 'newdata', JSON.stringify(newData));
        var date = nlapiDateToString(new Date())
        //update subscription record with status and frequency. 
        
        //delete record
        if(newData.deleteRecord){
          try{
            nlapiLogExecution('audit', 'record to delete', newData.recordId);
            nlapiDeleteRecord('customrecord_kd_subscription_item_rcd', newData.recordId);
            updatedInfo += newData.recordId;
          } catch (e) {
            nlapiLogExecution('audit', 'error in deleting record ' + newData.recordId, e);
          }

        } else{

          if(newData.status){
            nlapiSubmitField('customrecord_kd_subcription_record_data', newData.rcordId, 'custrecord_kd_subcription_status', newData.status);
            updatedInfo += newData.status + ' - '
          }
          if(newData.subscriptionFreq){
            nlapiSubmitField('customrecord_kd_subcription_record_data', newData.rcordId, 'custrecord_kd_subscription_rcd_freq', newData.subscriptionFreq);
            updatedInfo += newData.subscriptionFreq + ' - '
          }
          
          //update item records with qty, grind, and item id; depending on edit (on or off)
          newData.items.forEach(function(item){
            if(item.edit){
              updatedInfo += item.recordId + ' - '
              nlapiLogExecution('audit', 'in record -- item', item.recordId + ' ' + item.itemId);
              if(item.itemId){
                nlapiSubmitField('customrecord_kd_subscription_item_rcd', item.recordId, 'custrecord_kd_sub_item_rcd_item', item.itemId);
                updatedInfo += item.itemId + ' - '
              }
              if(item.grind){
                nlapiSubmitField('customrecord_kd_subscription_item_rcd', item.recordId, 'custrecord_kd_sub_item_rcd_grind', item.grind);
                updatedInfo += item.grind + ' - '
              }
              if(item.delivery){
                nlapiSubmitField('customrecord_kd_subscription_item_rcd', item.recordId, 'custrecord_kd_sub_item_rcd_delivery', item.delivery);
                updatedInfo += item.delivery + ' - '
              }
              if(item.quantity){
                nlapiSubmitField('customrecord_kd_subscription_item_rcd', item.recordId, 'custrecord_kd_sub_item_rcd_qty', item.quantity);
                updatedInfo += item.quantity;
              }
            }
          })
          if(updatedInfo){
            nlapiSubmitField('customrecord_kd_subcription_record_data', newData.rcordId, 'custrecord_kd_subcription_date_updated', date);
          }
          nlapiLogExecution('audit', 'submitted fields', updatedInfo);
        }

      } catch (e) {
        nlapiLogExecution('audit', 'error', e);
      }
      if(updatedInfo){
        return { rcd: updatedInfo};
      }else{
        return ret;
      }
    },

    put: function put() {
      // not implemented
    },

    delete: function() {
      // not implemented
    }
  });
});
