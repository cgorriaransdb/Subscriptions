define("Kodella.KDSubscriptionStep.KDSubscriptionStep.ServiceController", ["ServiceController"], function(
  ServiceController
) {
  "use strict";

  return ServiceController.extend({
    name: "Kodella.KDSubscriptionStep.KDSubscriptionStep.ServiceController",

    // The values in this object are the validation needed for the current service.
    options: {
      common: {}
    },

    get: function get() {
      try{
      var ss = nlapiSearchRecord('customrecord_kd_subscription_limit_list',null,null,[new nlobjSearchColumn('name')])
      var ret = [];
      if(ss){
        for(var i=0;i<ss.length;i++){
          ret.push({name:ss[i].getValue("name"),id:ss[i].getId()})
        }
      }
    }
    catch(e){
      nlapiLogExecution('audit', 'ERROR IN GET LIST', e);   
    }
    return JSON.stringify(ret);
    },

    post: function post() {
      // not implemented
    },

    put: function put() {
      // not implemented
    },

    delete: function() {
      // not implemented
    }
  });
});
