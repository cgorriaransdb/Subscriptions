
function service(request, response)
{
	'use strict';
	try 
	{
		require('Kodella.KDSubscriptionStep.KDSubscriptionStep.ServiceController').handle(request, response);
	} 
	catch(ex)
	{
		console.log('Kodella.KDSubscriptionStep.KDSubscriptionStep.ServiceController ', ex);
		var controller = require('ServiceController');
		controller.response = response;
		controller.request = request;
		controller.sendError(ex);
	}
}