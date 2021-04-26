/**
 * Scriptable Cart
 *
 * Version: 1.0.0
 * Date: 2019-11-19
 * Author: Fabian
 **/
var firstTime = true;
var summaryObj = {
	total:0,
	subtotal:0,
	shipping:0,
	tax:0
}

var kdScriptableCart = function edenScriptableCart() {
	var isProcessing = false;
	var isProcessingCart = false;
	var infiniteProtect = 0;

	var fieldChanged = function fieldChanged(name,field){
		var context = nlapiGetContext();
		if(context.getExecutionContext()!=='webstore')return;

		// var isPayUpfront= nlapiGetFieldValue('custbody_kd_is_pay_upfront');
		var newQTY = nlapiGetFieldValue('custbody_kd_sub_payupfront_subtotal');

		if( newQTY && field == 'custbody_kd_sub_payupfront_subtotal' ) {
			nlapiLogExecution( 'DEBUG', 'FIELD CHANGE', 'subtotal changed' );
			// We are not modifying subscription lines anymore. If we have a payupfront sub, then we'll modify
			//check if is payupfront and set shipping as ship*months
			var currentShipping = nlapiGetFieldValue('shippingcost');
			var currentSubtotal = nlapiGetFieldValue('subtotal');
			var currentTotal = nlapiGetFieldValue('total');
			var currentTaxTotal = nlapiGetFieldValue('taxtotal');
			nlapiLogExecution( 'DEBUG', 'IS first time', firstTime );
			if(firstTime){
				summaryObj = {
					total:currentTotal,
					subtotal:currentSubtotal,
					shipping:currentShipping,
					tax:currentTaxTotal
				}
				firstTime = false;
			}

			var fieldInfo = JSON.parse( nlapiGetFieldValue('custbody_kd_sub_payupfront_subtotal') );
			var totalDeliveries = parseInt(fieldInfo.totalDeliveries);

			nlapiSetFieldValue('shippingcost', summaryObj.shipping * totalDeliveries);
			nlapiSetFieldValue('subtotal', summaryObj.subtotal * totalDeliveries);
			nlapiSetFieldValue('total', summaryObj.total * totalDeliveries);
			nlapiSetFieldValue('taxtotal', summaryObj.tax * totalDeliveries);

			nlapiLogExecution('debug', 'shipping cost to change', summaryObj.shipping * totalDeliveries);
			nlapiLogExecution('debug', 'subtotal to change', summaryObj.subtotal * totalDeliveries);
			nlapiLogExecution('debug', 'total to change', summaryObj.total * totalDeliveries);
			nlapiLogExecution('debug', 'taxtotal to change', summaryObj.tax * totalDeliveries);
		}

	}

	/**
	 * Recalc Function
	 **/
	var recalc = function recalc() {
		//return;
		nlapiLogExecution( 'DEBUG', 'DEBUG recalc recalc', 'IN recalc' );
		infiniteProtect++;
		if( infiniteProtect > 1000 ) {
			jswj_log( 'Infinite Protect Activated', 'ERROR' );
			return false;
		}
		try {
			updateCartItems();
		} catch( errorData ) {
			jswj_log('recalc updateCartItems error: ' + JSON.stringify( errorData ) );
			isProcessingCart = false;
		}
		isProcessing = false;
	};
	// END recalc()

	/**
	 * Update Cart Items
	 * --Apply Property Management Pricing
	 * --Set Custom Line Item Fields
	 **/
	function updateCartItems() {
		//return;
		nlapiLogExecution( 'DEBUG', 'DEBUG UPDATE ITEMS', 'IN UPDATE' );
		infiniteProtect++;
		if( infiniteProtect > 1000 ) { jswj_log('Infinite Protect Activated'); return; }

		/**
		 * Protect Against Infinite Loops
		 **/
		if( isProcessingCart ) { return; }
		isProcessingCart = true;
		/**
		 * Loop Through Cart Items
		 **/
		try{
			var lines = nlapiGetLineItemCount('item');
			//var line1id = nlapiGetLineItemText( 'item', 'item', 1 );
			//var line2id = nlapiGetLineItemText( 'item', 'item', 2 );
			//nlapiLogExecution( 'DEBUG', 'LineCount--', lines);
			//nlapiLogExecution( 'audit', 'line 1 and 2 id', line1id + '-' + line2id);

			for( var i = 1; i <= lines; i++ ) {
				// Select Current Item
				//nlapiLogExecution( 'DEBUG', 'Currently in line--', i + '-' + nlapiGetLineItemText( 'item', 'item' , i));
				nlapiSelectLineItem( 'item', i );
				//nlapiLogExecution( 'DEBUG', 'After selecting line', i);
				// Init Variables For Item
				var onpurchase = false;
				var currentItemName = nlapiGetCurrentLineItemText( 'item', 'item' );
				var currentItem = currentItemName.substring( 0, currentItemName.indexOf(' ') );
				//nlapiLogExecution( 'DEBUG', 'DEBUG subscription normal item id--', currentItemName);

				var subscription =  parseInt( nlapiGetCurrentLineItemValue( 'item', 'custcol_kd_subscriptions' ) );
				nlapiLogExecution( 'DEBUG', 'DEBUG subscription', subscription);


				if(!isNaN(subscription)){
					var currentQuantity = parseInt( nlapiGetCurrentLineItemValue( 'item', 'quantity' ) );
					var price = parseFloat(nlapiGetCurrentLineItemValue( 'item', 'rate'));

					if( nlapiGetFieldValue('custbody_kd_sub_payupfront_subtotal') ){
						//nlapiLogExecution( 'DEBUG', 'recalc subscription new qty value--', nlapiGetFieldValue('custbody_kd_sub_payupfront_subtotal'));
						var newnewQty = JSON.parse( nlapiGetFieldValue('custbody_kd_sub_payupfront_subtotal') );
						var newQtyLines = newnewQty.lines;
						nlapiLogExecution( 'DEBUG', 'new qty--', newQtyLines[i-1].itemid + ': ' + newQtyLines[i-1].newquantity);
						//nlapiLogExecution( 'DEBUG', 'new qty item id--', newQtyLines[i-1].itemid);
						//nlapiLogExecution( 'DEBUG', 'new qty item freq--', newQtyLines[i-1].freq);

						for( var j = 0; j < newQtyLines.length; j++){
							if( parseInt(newQtyLines[j].itemid) == parseInt( nlapiGetCurrentLineItemValue( 'item', 'item' ) ) &&
								parseInt(newQtyLines[j].freq) == subscription){
								nlapiLogExecution( 'DEBUG', 'inside second condition -', parseInt(newQtyLines[j].itemid) == parseInt(nlapiGetCurrentLineItemValue( 'item', 'item' )));
								currentQuantity = parseInt( newQtyLines[j].newquantity );
								//break;
							}
						}

						// if(newnewQty.purchase){
						// 	//onpurchase = true;
						// 	//currentQuantity = parseInt( nlapiGetCurrentLineItemValue( 'item', 'quantity' ) );
						//     //nlapiSetCurrentLineItemValue( 'item', 'quantity', currentQuantity, true, true );
						// 	nlapiSetCurrentLineItemValue( 'item', 'rate', (price*currentQuantity), true, true );
						// } else {
						// }
						nlapiSetCurrentLineItemValue( 'item', 'amount', (price*currentQuantity), true, true );


					} else{
						//currentQuantity = parseInt( nlapiGetCurrentLineItemValue( 'item', 'quantity' ) );
						//nlapiLogExecution( 'DEBUG', 'set quantity as current -', currentQuantity);
					}
					//nlapiLogExecution( 'DEBUG', 'currentqty -', currentQuantity);
					//var currentQuantity = parseInt( nlapiGetCurrentLineItemValue( 'item', 'quantity' ) );

					//var subscriptionDiscount = 0.85;
					//nlapiSetCurrentLineItemValue( 'item', 'quantity', currentQuantity, true, true );
					//nlapiSetCurrentLineItemValue( 'item', 'rate', price, true, true );
					//nlapiSetCurrentLineItemValue( 'item', 'quantity', realQty, true, true );
					nlapiCommitLineItem( 'item' );
					//nlapiLogExecution( 'DEBUG', 'subprice after commit',  nlapiGetLineItemValue('item', 'amount', i));
				} else{

					if(currentItemName){
						nlapiCommitLineItem( 'item' );
					}

				}



			} // END for - Sales Order Lines



			//nlapiSetFieldValue('custbody_kd_sub_payupfront_subtotal', '');
			//nlapiLogExecution('debug', 'new qty array after set ', nlapiGetFieldValue('custbody_kd_sub_payupfront_subtotal'));

		}catch(e){
			nlapiLogExecution('AUDIT', 'Error after SO loop: ', e);
			isProcessingCart = true;
		}

		//return;
		/**
		 * Protect Against Infinite Loops
		 **/
		isProcessingCart = false;
		return;
	} // END updateCartItems()


	/*** SUPPORT FUNCTIONS ***/
	/**
	 * Write Data To Log
	 *
	 * @param message - String / Object / Array
	 * @param logLevel - String - DEBUG, ERROR
	 * @param logTitle - String
	 **/
	function jswj_log( message, logLevel, logTitle ) {
		if( typeof logLevel === 'undefined' || logLevel === '' || logLevel === 'undefined' ) {
			logLevel = 'DEBUG';
		}
		if( typeof logTitle === 'undefined' || logTitle === '' || logTitle === 'undefined' ) {
			logTitle = 'Eden Scriptable Cart';
		}
		if( typeof message !== 'string' ) {
			message = JSON.stringify( message );
		}
		nlapiLogExecution( logLevel, logTitle, message );
	} // END jswj_log()
	/**
	 * Get Property Managment Session Data
	 *
	 * @return object / false
	 **/
	return {
		fieldChanged: fieldChanged,
		recalc: recalc
	};
}();