/*jshint funcscope:true*/
/*exported beforeInstall*/
/*exported afterInstall*/
/*exported afterUpdate*/
/*exported beforeUninstall*/
/* jshint evil:true */
function beforeInstall()
{
	nlapiLogExecution('DEBUG', 'SC-CPQ', 'beforeInstall');
	try
	{
		var config = nlapiLoadConfiguration('companypreferences');
		var path = config && config.getFieldValue('custscript_sc_extmech_api_path');
		nlapiLogExecution('DEBUG', 'SC-CPQ beforeInstall path', path);
		var file = path && nlapiLoadFile(path);
	}
	catch(error){}
	
	if (!config || !path || !file)
	{
		throw nlapiCreateError('SCE_EXTMECH_ERROR', 'The Extension Management Bundle it\'s not installed or not configured correctly');
	}
}
function afterInstall()
{
	nlapiLogExecution('DEBUG', 'SC-CPQ', 'afterInstall');
	var config = nlapiLoadConfiguration('companypreferences');
	var path = config && config.getFieldValue('custscript_sc_extmech_api_path');
	
	if (path)
	{
		nlapiLogExecution('DEBUG', 'SC-CPQ afterInstall path', path);
		var file = nlapiLoadFile(path);
		eval(file.getValue());
		SCExtension.afterInstall();
	}
	else
	{
		throw nlapiCreateError('SCE_EXTMECH_ERROR', 'The Extension Management Bundle it\'s not installed or not configured correctly');
	}
}
function afterUpdate()
{
	nlapiLogExecution('DEBUG', 'SC-CPQ', 'afterUpdate');
	var config = nlapiLoadConfiguration('companypreferences');
	var path = config && config.getFieldValue('custscript_sc_extmech_api_path');
	
	if (path)
	{
		nlapiLogExecution('DEBUG', 'SC-CPQ afterUpdate path', path);
		var file = nlapiLoadFile(path);
		eval(file.getValue());
		SCExtension.afterUpdate();
	}
	else
	{
		throw nlapiCreateError('SCE_EXTMECH_ERROR', 'The Extension Management Bundle it\'s not installed or not configured correctly');
	}
}
function beforeUninstall()
{
	nlapiLogExecution('DEBUG', 'SC-CPQ', 'beforeUninstall');
	var config = nlapiLoadConfiguration('companypreferences');
	var path = config && config.getFieldValue('custscript_sc_extmech_api_path');
	
	if (path)
	{
		nlapiLogExecution('DEBUG', 'SC-CPQ beforeUninstall path', path);
		var file = nlapiLoadFile(path);
		eval(file.getValue());
		SCExtension.beforeUninstall();
	}
	else
	{
		throw nlapiCreateError('SCE_EXTMECH_ERROR', 'The Extension Mechanism Bundle it\'s not installed or not configured correctly');
	}
}