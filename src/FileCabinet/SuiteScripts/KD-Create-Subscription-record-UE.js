/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

define(['N/record', 'N/format', 'N/search', 'N/runtime'],
    function (record, format, search, runtime) {

        function SetLimitMonth(LimitSubscriptionQuantity, InitialDate){
            //get the date from the SO
            var DateFormatted = new Date(InitialDate);
            //add months to set limit
            DateFormatted.setMonth(DateFormatted.getMonth()+LimitSubscriptionQuantity);
            //SuiteScript method to work with dates
            var parsedDateStringAsRawDateObject = format.parse({
                value: DateFormatted,
                type: format.Type.DATE
            });

            log.debug(parsedDateStringAsRawDateObject, 'parse date string limit month');
            return parsedDateStringAsRawDateObject;

        }

        /*function SetLimitYear(LimitSubscriptionQuantity, InitialDate){
                //get the date from the SO
                var DateFormatted = new Date(InitialDate);
                //add months
                DateFormatted.setMonth(DateFormatted.getMonth()+LimitSubscriptionQuantity);

                //SuiteScript method to work with dates

                var parsedDateStringAsRawDateObject = format.parse({
                    value: DateFormatted,
                    type: format.Type.DATE
                });
                log.debug('date in setlimit formatted', parsedDateStringAsRawDateObject);
                return parsedDateStringAsRawDateObject;

            }*/

        function SetNextRenewal(NextRenewal, InitialDate){
            //get the date from the SO
            var DateFormatted = new Date(InitialDate);
            //add days
            DateFormatted.setDate(DateFormatted.getDate() + NextRenewal);
            //SuiteScript method to work with dates
            var parsedDateStringAsRawDateObject = format.parse({
                value: DateFormatted,
                type: format.Type.DATE
            });

            log.debug('date as object', parsedDateStringAsRawDateObject);
            return parsedDateStringAsRawDateObject;
        }

        function afterSubmit(context) {
            try {
                if (context.type === context.UserEventType.CREATE){
                    var customerRecord = context.newRecord;
                    var lineCount = customerRecord.getLineCount({ sublistId: 'item' });
                    var customer = customerRecord.getValue({ fieldId: 'entity' });
                    var soId = customerRecord.getValue({ fieldId: 'id' });
                    var dateSale = customerRecord.getValue({ fieldId: 'trandate' }); //! check if this field is ok.
                    var LimitList = customerRecord.getValue({ fieldId: 'custbody_kd_subscription_limit'});
                    var subDelivery = customerRecord.getValue({ fieldId: 'custbody_kd_sub_delivery_freq'});
                    var subItems = customerRecord.getValue({ fieldId: 'custbody_kd_subscription_items_array'});
                    var NextRenewal = null;
                    var LimitSubscription = customerRecord.getValue({ fieldId: 'custbody_kd_subscription_limit' });
                    var IsPayUpFront = customerRecord.getValue({ fieldId: 'custbody_kd_is_pay_upfront'});
                    var hasSubscription = false;
                    var LimitDate = 0;

                    log.debug(LimitSubscription, 'limit subscription');
                    log.debug('limit list', LimitList);

                    switch (parseInt(LimitSubscription)){
                        case 1:
                            log.debug('subscription limit 3 months', LimitSubscription);
                            LimitDate = SetLimitMonth(3, dateSale);
                            break;
                        case 2:
                            log.debug('subscription limit 6 months', LimitSubscription);
                            LimitDate = SetLimitMonth(6, dateSale);
                            break;
                        default:
                            LimitDate = 0;
                            break;
                    }
                    log.debug('limit month date', LimitDate);

                    if(subDelivery){ //if delivery frequency
                        hasSubscription = true;
                        var subItemsArray = JSON.parse(subItems); //array with every item, its qty and grind option
                        var rcdSubscription = record.create({
                            type: 'customrecord_kd_subcription_record_data',
                            isDynamic: true,
                        });
                        rcdSubscription.setValue({
                            fieldId: 'custrecord_kd_subcription_customer',
                            value: customer
                        });
                        rcdSubscription.setValue({
                            fieldId: 'custrecord_kd_subcription_sale_order',
                            value: soId
                        })
                        rcdSubscription.setValue({
                            fieldId: 'custrecord_kd_subcription_date_updated',
                            value: dateSale
                        })
                        rcdSubscription.setValue({
                            fieldId: 'custrecord_kd_subscription_rcd_freq',
                            value: subDelivery
                        })
                        if(LimitSubscription){
                            rcdSubscription.setValue({
                                fieldId: 'custrecord_kd_subscription_rcd_limit',
                                value: LimitSubscription
                            })
                        }
                        rcdSubscription.setValue({
                            fieldId: 'custrecord_kd_subcription_status',
                            value: 3
                        })
                        if(IsPayUpFront){
                            rcdSubscription.setValue({
                                fieldId: 'custrecord_kd_is_payupfront',
                                value: IsPayUpFront
                            })
                        }
                        if(LimitDate !== 0){
                            rcdSubscription.setValue({
                                fieldId: 'custrecord_kd_enddate_subs',
                                value: LimitDate
                            })
                        }
                        log.debug('subscription before switch', subDelivery);
                        var CheckSubscription = parseInt(subDelivery);
                        switch (CheckSubscription){
                            case 1:
                                log.debug('subscription period 1 week', subDelivery);
                                NextRenewal = SetNextRenewal(7, dateSale);

                                break;
                            case 2:
                                log.debug('subscription period 2 week', subDelivery);
                                NextRenewal = SetNextRenewal(14, dateSale);
                                break;
                            case 3:
                                log.debug('subscription period 3 week', subDelivery);
                                NextRenewal = SetNextRenewal(21, dateSale);
                                break;
                            case 4:
                                log.debug('subscription period 4 week', subDelivery);
                                NextRenewal = SetLimitMonth(1, dateSale);
                                break;
                        }
                        log.debug('next renewal date', NextRenewal);

                        if(NextRenewal){
                            rcdSubscription.setValue({
                                fieldId: 'custrecord_kd_next_renewal_date',
                                value: NextRenewal
                            })
                        }
                        var rcdId = rcdSubscription.save();
                        log.debug('recordid', rcdId);
                        //here create child records for each item
                        subItemsArray.forEach(function(item, index){
                            var itemSubrecord = record.create({
                                type: 'customrecord_kd_subscription_item_rcd',
                                isDynamic: true,
                            });
                            itemSubrecord.setValue({
                                fieldId: 'custrecord_kd_sub_item_rcd_item',
                                value: item.itemId
                            });
                            itemSubrecord.setValue({
                                fieldId: 'custrecord_kd_sub_item_rcd_qty',
                                value: parseInt(item.quantity)
                            });
                            itemSubrecord.setValue({
                                fieldId: 'custrecord_kd_sub_item_rcd_grind',
                                value: item.grind
                            });
                            itemSubrecord.setValue({
                                fieldId: 'custrecord_kd_sub_item_rcd_parent',
                                value: rcdId
                            });
                            itemSubrecord.setValue({
                                fieldId: 'custrecord_kd_sub_item_rcd_delivery',
                                value: item.delivery
                            });
                            var itemRcdId = itemSubrecord.save();
                        })

                        record.submitFields({
                            type: record.Type.SALES_ORDER,
                            id: soId,
                            values:{
                                custbody_kd_subscription_sale_order: true
                            }
                        })
                    }
                }

            } catch (e) {
                log.error('Error',e);
            }
        }
        return {
            afterSubmit: afterSubmit
            //,beforeSubmit: beforeSubmit
        };
    });

