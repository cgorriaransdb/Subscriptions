/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record','N/search'], function(record,search) {
    function onRequest(context) {

        var customer = context.request.parameters.customer;
        var rcdId = context.request.parameters.rcdId;
        var arrSubscriptions=[];
        var arrItems=[];

        if(customer){
            var customrecord_kd_subcription_record_dataSearchObj = search.create({
                type: "customrecord_kd_subcription_record_data",
                filters:
                    [
                        ["custrecord_kd_subcription_customer","anyof",customer],
                        "AND",
                        ["isinactive","is","F"],
                        "AND",
                        ["custrecord_kd_subcription_status","noneof","4"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        }),
                        search.createColumn({name: "scriptid", label: "Script ID"}),
                        search.createColumn({name: "custrecord_kd_subcription_customer", label: "Customer"}),
                        search.createColumn({name: "custrecord_kd_subcription_sale_order", label: "Sale Order"}),
                        search.createColumn({name: "custrecord_kd_subcription_status", label: "Status"}),
                        search.createColumn({name: "custrecord_kd_subcription_date_updated", label: "Date updated"}),
                        search.createColumn({name: "custrecord_kd_subscription_rcd_freq", label: "Subcription Frequency"}),
                        search.createColumn({name: "custrecord_kd_enddate_subs", label: "End Date"}),
                        search.createColumn({name: "custrecord_kd_subscription_rcd_limit", label: "Subscription Limit"}),
                        search.createColumn({name: "custrecord_kd_next_renewal_date", label: "Next Renewal Date"})
                    ]
            });
            var searchResultCount = customrecord_kd_subcription_record_dataSearchObj.runPaged().count;
            log.debug("customrecord_kd_subcription_record_dataSearchObj result count",searchResultCount);
            subRecordArr = customrecord_kd_subcription_record_dataSearchObj.run().getRange({
                start: 0,
                end: 100
            })
            subRecordArr.forEach(function(result){
                arrSubscriptions.push({
                    recordId:result.id,
                    customer:result.getValue("custrecord_kd_subcription_customer"),
                    soId:result.getValue("custrecord_kd_subcription_sale_order"),
                    subscriptionFreq:result.getText("custrecord_kd_subscription_rcd_freq"),
                    endDate: result.getValue("custrecord_kd_enddate_subs"),
                    dateUpdate:result.getValue("custrecord_kd_subcription_date_updated"),
                    status:result.getText("custrecord_kd_subcription_status"),
                    subscriptionLimit:result.getText("custrecord_kd_subscription_rcd_limit"),
                    nextRenewal:result.getValue("custrecord_kd_next_renewal_date")
                })
                //return true;
            });

            context.response.write(JSON.stringify(arrSubscriptions));
        } else if(rcdId){
            try{
                var itemRecordSearch = search.create({
                    type: "customrecord_kd_subscription_item_rcd",
                    filters:
                        [
                            ["custrecord_kd_sub_item_rcd_parent","anyof", rcdId],
                            "AND",
                            ["isinactive","is","F"]
                        ],
                    columns:
                        [
                            // search.createColumn({
                            //    name: "id",
                            //    sort: search.Sort.ASC,
                            //    label: "ID"
                            // }),
                            search.createColumn({name: "scriptid", label: "Script ID"}),
                            search.createColumn({name: "custrecord_kd_sub_item_rcd_item", label: "Item ID"}),
                            search.createColumn({name: "custrecord_kd_sub_item_rcd_qty", label: "Quantity"}),
                            search.createColumn({name: "custrecord_kd_sub_item_rcd_grind", label: "Grind"}),
                            search.createColumn({name: "custrecord_kd_sub_item_rcd_delivery", label: "Delivery Freq"})
                        ]
                });
                var searchResultCount = itemRecordSearch.runPaged().count;
                log.debug("itemRecordSearch result count",searchResultCount);
                itemSearchArr = itemRecordSearch.run().getRange({
                    start: 0,
                    end: 100
                })
                itemSearchArr.forEach(function(result){
                    log.debug("item id",result.getValue("custrecord_kd_sub_item_rcd_item"));
                    arrItems.push({
                        recordId:result.id,
                        itemId:result.getValue("custrecord_kd_sub_item_rcd_item"),
                        itemName:result.getText("custrecord_kd_sub_item_rcd_item"),
                        quantity:result.getValue("custrecord_kd_sub_item_rcd_qty"),
                        grind: result.getValue("custrecord_kd_sub_item_rcd_grind"),
                        grindLabel: result.getText("custrecord_kd_sub_item_rcd_grind"),
                        delivery: result.getValue("custrecord_kd_sub_item_rcd_delivery"),
                        deliveryLabel: result.getText("custrecord_kd_sub_item_rcd_delivery")
                    })
                    //return true;
                });

            }catch(e){
                log.debug("error in search of items",e);
            }

            context.response.write(JSON.stringify(arrItems));
        } else {
            context.response.write(JSON.stringify({text: "No Customer or Record ID"}));
        }


    }

    return {
        onRequest: onRequest
    };
});