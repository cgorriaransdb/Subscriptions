// Model.js
// -----------------------
// @module Case
define("Kodella.KDSubscriptionStep.KDSubscriptionStep.SS2Model", ["Backbone", "Utils"], function(
    Backbone,
    Utils
) {
    "use strict";

    // @class Case.Fields.Model @extends Backbone.Model
    return Backbone.Model.extend({
        //@property {String} urlRoot
        urlRoot: Utils.getAbsoluteUrl(
            getExtensionAssetsPath(
                "Modules/KDSubscriptionStep/SuiteScript2/KDSubscriptionStep.Service.ss"
            ),
            true
        )
});
});
