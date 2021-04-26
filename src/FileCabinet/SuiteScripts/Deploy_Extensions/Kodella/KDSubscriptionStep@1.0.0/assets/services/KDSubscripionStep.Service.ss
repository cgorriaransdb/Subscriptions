
function service(request, response)
{
	'use strict';
	try 
	{
		require('Kodella.KDSubscriptionStep.KDSubscripionStep.ServiceController').handle(request, response);
	} 
	catch(ex)
	{
		console.log('Kodella.KDSubscriptionStep.KDSubscripionStep.ServiceController ', ex);
		var controller = require('ServiceController');
		controller.response = response;
		controller.request = request;
		controller.sendError(ex);
	}
}