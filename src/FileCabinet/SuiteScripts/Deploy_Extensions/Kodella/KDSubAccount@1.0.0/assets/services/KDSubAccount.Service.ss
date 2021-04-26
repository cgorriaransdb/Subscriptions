
function service(request, response)
{
	'use strict';
	try 
	{
		require('Kodella.KDSubAccount.KDSubAccount.ServiceController').handle(request, response);
	} 
	catch(ex)
	{
		console.log('Kodella.KDSubAccount.KDSubAccount.ServiceController ', ex);
		var controller = require('ServiceController');
		controller.response = response;
		controller.request = request;
		controller.sendError(ex);
	}
}