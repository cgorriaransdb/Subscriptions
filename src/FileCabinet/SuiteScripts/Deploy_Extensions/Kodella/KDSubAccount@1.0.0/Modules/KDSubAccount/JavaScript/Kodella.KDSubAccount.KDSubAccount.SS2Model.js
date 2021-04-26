// Model.js
// -----------------------
// @module Case
define("Kodella.KDSubAccount.KDSubAccount.SS2Model", ["Backbone", "Utils"], function(
    Backbone,
    Utils
) {
    "use strict";

    // @class Case.Fields.Model @extends Backbone.Model
    return Backbone.Model.extend({
        //@property {String} urlRoot
        urlRoot: Utils.getAbsoluteUrl(
            getExtensionAssetsPath(
                "Modules/KDSubAccount/SuiteScript2/KDSubAccount.Service.ss"
            ),
            true
        )
});
});
