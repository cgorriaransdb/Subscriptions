/**
 * @NApiVersion 2.0
 * @NScriptType mapreducescript
 *
 */
define(['N/search', 'N/record', 'N/log', 'N/error', 'N/runtime', 'N/format', 'N/task', 'N/file'],
    function (search, record, log, error, runtime, format, task, file) {
        return {
            getInputData: function (context) {
                try {

                    var scriptObj = runtime.getCurrentScript();
                    var pIndex = scriptObj.getParameter({ name: 'custscript_index' })
                    var folderID = scriptObj.getParameter({ name: 'custscript_folderid' })
                    var allResults = []
                    var startRow = 0;
                    var endRow = 10;
                    var resultCount = 0;
                    var dayFolder;
                    if(!folderID){
                        dayFolder = createFolderForFiles();
                    } else{
                        dayFolder = parseInt(folderID);
                    }
                    log.debug({
                        title: 'Folder ID after creation',
                        details: folderID
                    })

                    var subcriptionSearch = search.create({
                        type: 'customrecord_kd_subcription_record_data',
                        filters: [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["custrecord_kd_next_renewal_date", "on", "today"],  //["custrecord_kd_next_renewal_date", "on", "today"],
                            "AND",
                            ["custrecord_kd_subcription_status", "anyof", "3"],
                            "AND",
                            ["custrecord_kd_subcription_sale_order", "isnotempty", ""]
                        ],
                        columns: [{
                            name: 'id'
                        },
                            {
                                name: 'custrecord_kd_subcription_customer'
                            },
                            {
                                name: 'custrecord_kd_subcription_sale_order'
                            },
                            {
                                name: 'custrecord_kd_subcription_status'
                            }, {
                                name: 'custrecord_kd_subcription_date_updated'
                            }, {
                                name: 'custrecord_kd_subscription_rcd_freq'
                            },
                            {
                                name: 'custrecord_kd_is_payupfront'
                            },
                            {
                                name: 'custrecord_kd_enddate_subs'
                            },
                            {
                                name: 'custrecord_kd_subscription_rcd_limit'
                            }]
                    });
                    //concatenate all the result
                    var searchResultCount = subcriptionSearch.runPaged().count
                    //log.debug(subcriptionSearch, 'subscription search');
                    log.debug('searchResultCount=>', searchResultCount);
                    if (pIndex) {
                        startRow = parseInt(pIndex);
                        if (searchResultCount - pIndex < 5) endRow = searchResultCount - pIndex
                    }

                    var allResults = subcriptionSearch.run().getRange({
                        start: startRow,
                        end: startRow + endRow
                    });
                    var newIndex = startRow + endRow
                    // do {
                    //     var subcriptionResults = subcriptionSearch.run().getRange({
                    //         start: startRow,
                    //         end: endRow
                    //     });
                    //     if (subcriptionResults) {
                    //         resultCount = subcriptionResults.length;
                    //         allResults = allResults.concat(subcriptionResults);
                    //         startRow = endRow;
                    //         endRow = endRow + 1000;
                    //     }
                    // } while (resultCount > 999);

                    var soToCreate = [];
                    log.audit({ title: ' subcription_record ', details: allResults.length })

                    var discounts = getDiscountItems();
                    log.audit({ title: ' discount items ', details: JSON.stringify(discounts) })

                    if (allResults.length > 0) {

                        for (var x = 0; x < allResults.length; x++) {
                            var rcd = allResults[x].id;
                            var idRecord = allResults[x].getValue('id');
                            var items = getChildItems(idRecord)
                            log.debug({title: 'recordId', details: idRecord})
                            log.debug({title: 'Items', details: items})
                            var saleOrder = allResults[x].getValue('custrecord_kd_subcription_sale_order');
                            var customer = allResults[x].getValue('custrecord_kd_subcription_customer');
                            //var item = allResults[x].getValue('custrecord_kd_subcription_item');
                            //var quantity = allResults[x].getValue('custrecord_kd_subscription_quantity');

                            //--uncomment to get price by loading record
                            //var currentPrice = GetItemPrice(item, quantity);
                            //--
                            //var today = new Date();
                            // today = Date.parse(today);
                            var dateUpdated = allResults[x].getValue('custrecord_kd_subcription_date_updated');
                            // if (dateUpdated) dateUpdated = Date.parse(dateUpdated);
                            var frequency = allResults[x].getValue('custrecord_kd_subscription_rcd_freq');
                            var isPayUpFront = allResults[x].getValue('custrecord_kd_is_payupfront');
                            var NextDate = allResults[x].getValue('custrecord_kd_next_renewal_date');
                            var limitRecord = allResults[x].getValue('custrecord_kd_enddate_subs');
                            var limitList = allResults[x].getValue('custrecord_kd_subscription_rcd_limit');
                            //var itemOptionID = allResults[x].getValue('custrecord_kd_subscription_grind');
                            var today = new Date();
                            if (limitRecord) {
                                var limitSubscription = new Date(limitRecord);
                            }

                            //var testitemOption = GetItemOption(item);
                            // var date_1 = new Date(dateUpdated);
                            //var date_2 = new Date(today);
                            // var day_as_milliseconds = 86400000;
                            // var diff_in_millisenconds = date_2 - date_1;
                            // var diff_in_days = diff_in_millisenconds / day_as_milliseconds;
                            // var contdias = Math.round(diff_in_days/(1000*60*60*24));
                            //  log.audit({ title: ' diff_in_days ', details:contdias })
                            var subcriptionDays = 1;
                            if (frequency !== '4') subcriptionDays = parseInt(frequency) * 7;

                            if (isPayUpFront && today.getTime() <= limitSubscription.getTime()) {

                                log.debug({ title: 'will be created', details: 'will be created' })

                                soToCreate.push({
                                    recordId: rcd,
                                    customer: customer,
                                    items: items,
                                    saleOrder: saleOrder,
                                    price: 0,
                                    subscriptionType: subcriptionDays,
                                    subscriptionLimit: limitList,
                                    isPayUpFront: isPayUpFront,
                                    totalResults: searchResultCount,
                                    newIndex: newIndex,
                                    subFrequency: frequency,
                                    dayFolder: dayFolder,
                                    discount: discounts.full
                                })


                            } else if (isPayUpFront && today.getTime() > limitSubscription.getTime() || (!isPayUpFront && (limitSubscription && today.getTime() > limitSubscription.getTime() ))) {
                                soToCreate.push({
                                    recordId: rcd,
                                    delete: true,
                                    totalResults: searchResultCount,
                                    newIndex: newIndex,
                                    dayFolder: dayFolder
                                })
                                //here will be setted the record as inactive
                            } else if (!isPayUpFront && (!limitSubscription || today.getTime() <= limitSubscription.getTime() ) ) {
                                soToCreate.push({
                                    recordId: rcd,
                                    customer: customer,
                                    items: items,
                                    saleOrder: saleOrder,
                                    price: '',
                                    subscriptionType: subcriptionDays,
                                    isPayUpFront: isPayUpFront,
                                    totalResults: searchResultCount,
                                    newIndex: newIndex,
                                    subFrequency: frequency,
                                    dayFolder: dayFolder,
                                    discount: discounts.partial
                                })
                            }
                        }
                    }
                } catch (e) {
                    log.debug({
                        title: 'GetInputData',
                        details: 'Error: ' + e
                    })
                }

                log.audit({ title: ' soToCreate ', details: soToCreate })
                var obj = {};
                obj.dataForSo = soToCreate;
                return obj;
            },

            map: function (context) {
                log.debug({ title: "contextmap", details: context })
                try {
                    var valuesEntry = JSON.parse(context.value);
                    log.debug({ title: 'values entry', details: valuesEntry });

                } catch (e) {
                    log.debug({ title: 'Error map', details: JSON.stringify(e) });
                }

                context.write({
                    key: context.key,
                    value: valuesEntry
                });
            },

            reduce: function (context) {

                log.debug({ title: "contextreduce Key", details: context.key })
                log.debug({ title: "contextreduce val", details: context.values })
                context.write({
                    key: context.key,
                    value: context.values
                });

            },

            summarize: function (context) {

                try {

                    log.debug({ title: 'summarize context', details: context })
                    log.debug({ title: 'summarize value', details: context.value })
                    log.debug({ title: 'summarize key', details: context.key })
                    var soCreated = [];
                    var recordFinalized = []
                    var allResults;
                    var newIndex;
                    var folderID;

                    context.output.iterator().each(function (key, value) {

                        var json = JSON.parse(value);
                        log.debug({ title: 'json', details: json })
                        log.debug({ title: 'summarize value', details: json })

                        var jsonvalues = JSON.parse(json[0])
                        if (jsonvalues.length > 0) {

                            for (var i = 0; i < jsonvalues.length; i++) {

                                if(jsonvalues[i].saleOrder){
                                    allResults = jsonvalues[i].totalResults;
                                    newIndex = jsonvalues[i].newIndex;
                                    var forDelete = jsonvalues[i].delete;
                                    var rcdId = jsonvalues[i].recordId;
                                    folderID = jsonvalues[0].dayFolder;

                                    if (forDelete) {
                                        var inactive = record.submitFields({
                                            type: 'customrecord_kd_subcription_record_data',
                                            id: rcdId,
                                            values: {
                                                'custrecord_kd_subcription_status': '4'
                                            },
                                        })
                                        recordFinalized.push(inactive);
                                    } else {
                                        var soId = createSaleOrder(jsonvalues[i])
                                        if (soId) soCreated.push(soId);


                                        var date = new Date();
                                        var fileObj = file.create({
                                            name: "newSO" + date + soId + ".txt",
                                            fileType: file.Type.PLAINTEXT,
                                            contents: JSON.stringify(jsonvalues[i]),
                                            description: "subscription created",
                                            encoding: file.Encoding.UTF8,
                                            folder: folderID,
                                            isOnline: true,
                                        });
                                        var fileid = fileObj.save();

                                        log.audit({
                                            title: 'created file--',
                                            details: fileid
                                        })
                                    }

                                }
                            }
                        }

                        return true;

                    });

                    if (allResults > newIndex) {
                        log.audit({
                            title: 'allResults - newIndex',
                            details: task+' - '+newIndex
                        })
                        var task = againRunMap(newIndex, folderID);
                        log.audit({
                            title: 'Task --',
                            details: task
                        })
                    }

                } catch (e) {
                    log.audit({
                        title: 'Summary',
                        details: 'ERROR ' + JSON.stringify(e)
                    })
                }

                log.audit({
                    title: 'Summary So creates',
                    details: soCreated
                })
                log.audit({
                    title: 'Summary rcd finalized',
                    details: recordFinalized
                })
            }
        }

        function loadSalesOrder(soId, pItem) {

            if (soId) {
                var objRecord = record.load({
                    type: record.Type.SALES_ORDER,
                    id: soId,
                });

                var lineCount = objRecord.getLineCount({ sublistId: 'item' });
                var customer = objRecord.getValue({ fieldId: 'entity' });

                for (var i = 0; i < lineCount; i++) {
                    var amountLine = '0'
                    var item = objRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i,
                    });
                    if (pItem === item) {

                        amountLine = objRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line: i,
                        });
                        return amountLine;
                    }

                }
            }

            return amountLine;
        }

        function createSaleOrder(data) {
            var recordId;
            var currrentUser = runtime.getCurrentUser();
            var dateFormat = currrentUser.getPreference('DATEFORMAT');
            // log.audit({
            //     title: 'dateFormat',
            //     details: dateFormat
            // })
            try {

                if (data && data.saleOrder) {

                    log.debug({title:'log item', details:JSON.stringify(data.items)})

                    var soRecord = record.create({
                        type: record.Type.SALES_ORDER,
                        isDynamic: true
                    });
                    soRecord.setValue({
                        fieldId: 'entity',
                        value: data.customer
                    });

                    log.audit({
                        title: 'data.isPayUpFront',
                        details: data.isPayUpFront
                    })

                    soRecord.setValue({
                        fieldId: 'custbody_kd_subcription_sale_order',
                        value: 'true'
                    });

                    soRecord.setValue({
                        fieldId: 'custbody_kd_sub_parent_record',
                        value: data.recordId
                    });

                    // GetItemOption(data.item)

                    if (data.isPayUpFront) {

                        soRecord.setValue({
                            fieldId: 'custbody_kd_is_pay_upfront',
                            value: data.isPayUpFront
                        });

                        soRecord.setValue({
                            fieldId: 'custbody_kd_subscription_limit',
                            value: data.subscriptionLimit
                        });


                        data.items.forEach(function(item, index){
                            soRecord.selectNewLine({
                                sublistId: 'item'
                            });
                            soRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_kd_subscriptions',
                                value: data.subFrequency
                            });
                            soRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: item.itemId
                            });

                            soRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                value: '0.00'
                            });

                            if(item.grind){
                                soRecord.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_kd_grind',
                                    value: item.grind
                                });
                            }

                            if(item.delivery){
                                soRecord.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_kd_subscriptions',
                                    value: item.delivery
                                });
                            }

                            soRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: item.quantity
                            });

                            soRecord.commitLine({
                                sublistId: 'item'
                            });
                        })

                        //Item discount with 100% to get 0 price if pay upfront
                        soRecord.setValue({
                            fieldId: 'discountitem',
                            value: data.discount
                        });

                        soRecord.setValue({
                            fieldId: 'shippingcost',
                            value: 0
                        });


                    } else {

                        data.items.forEach(function(item, index){
                            soRecord.selectNewLine({
                                sublistId: 'item'
                            });
                            soRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_kd_subscriptions',
                                value: data.subFrequency
                            });
                            soRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: item.itemId
                            });

                            if(item.grind){
                                soRecord.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_kd_grind',
                                    value: item.grind
                                });
                            }

                            if(item.delivery){
                                soRecord.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_kd_subscriptions',
                                    value: item.delivery
                                });
                            }

                            soRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: item.quantity
                            });

                            soRecord.commitLine({
                                sublistId: 'item'
                            });
                        })

                        //Item discount with 15%
                        soRecord.setValue({
                            fieldId: 'discountitem',
                            value: data.discount
                        });
                    }

                    recordId = soRecord.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    });

                    if (recordId) {

                        var tranDate = search.lookupFields({
                            type: search.Type.SALES_ORDER,
                            id: recordId,
                            columns: ['trandate']
                        });
                        var nextRenewal;
                        if (data.subscriptionType !== 1) nextRenewal = SetNextRenewal(data.subscriptionType, tranDate.trandate);
                        if (data.subscriptionType === 1) nextRenewal = SetLimitMonth(data.subscriptionType, tranDate.trandate);

                        var today = format.format({ value: new Date(), type: format.Type.DATE });


                        var updateRecordId = record.submitFields({
                            type: 'customrecord_kd_subcription_record_data',
                            id: data.recordId,
                            values: {
                                'custrecord_kd_subcription_date_updated': today,
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }

                        });
                        var updateRecordId2 = record.submitFields({
                            type: 'customrecord_kd_subcription_record_data',
                            id: data.recordId,
                            values: {
                                'custrecord_kd_next_renewal_date': nextRenewal,
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    }
                }
            } catch (e) {
                log.audit({
                    title: 'error createSaleOrder',
                    details: e
                })
                var date = new Date();
                var fileObj = file.create({
                    name: "Error in creating SO " + date + ".txt",
                    fileType: file.Type.PLAINTEXT,
                    contents: JSON.stringify(data),
                    description: "error in creating subscription",
                    encoding: file.Encoding.UTF8,
                    folder: data.dayFolder,
                    isOnline: true,
                });
                var fileid = fileObj.save();
            }
            return recordId;
        }


        function againRunMap(index, folderid) {

            log.debug({ title: 'scriptTaskId index ', details: index });
            var scriptTask = task.create({ taskType: task.TaskType.MAP_REDUCE });
            scriptTask.scriptId = 'customscript_kd_saleorder_verification';
            scriptTask.deploymentId = null;
            scriptTask.params = {
                custscript_index: index,
                custscript_folderid: folderid
            }
            try {
                var scriptTaskId = scriptTask.submit();

                log.debug({ title: 'scriptTaskId id ', details: scriptTaskId });
            } catch (e) {

                log.debug({
                    title: 'ERROR run map extensive field again ',
                    details: e.message
                })
            }
        }

        function SetNextRenewal(NextRenewal, InitialDate) {
            /*
            var date = InitialDate.split('/')
            date = date[1] + '/' + date[0] + '/' + date[2];
            var DateFormatted = new Date(date);
            //Set the total of subscriptions in months
            //Reset the date to prevent leap years bugs and 30-31 days
            var DayToParse = DateFormatted.getDate();
            var MonthToParse = DateFormatted.getMonth();
            var YearToParse = DateFormatted.getFullYear();

           

            var YearValidation = parseInt(YearToParse);
            var MonthValidation = parseInt(MonthToParse);
            var DayValidation = parseInt(DayToParse) + NextRenewal;
            log.debug('DayValidation', DayValidation);

            //The end of the subscription is formatted and will we setted on the record
            var CheckedDate = new Date(YearValidation, MonthValidation, DayValidation);
            var ToRecord = CheckedDate.getDate() + "/" + parseInt(CheckedDate.getMonth() + 1) + "/" + CheckedDate.getFullYear();
            log.debug('to record', ToRecord);
            //SuiteScript method to work with dates
            var parsedDateStringAsRawDateObject = format.parse({
                value: ToRecord,
                type: format.Type.DATE
            });
            log.debug('date as object', parsedDateStringAsRawDateObject);*/
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

        function SetLimitMonth(LimitSubscriptionQuantity, InitialDate) {
            /*
            var date = InitialDate.split('/')
            date = date[1] + '/' + date[0] + '/' + date[2];
            var DateFormatted = new Date(date);
            //Set the total of subscriptions in months
            var LimitDateSubscription = DateFormatted.setMonth(DateFormatted.getMonth() + LimitSubscriptionQuantity)
            //Reset the date to prevent leap years bugs and 30-31 days
            var DayToParse = DateFormatted.getDate();
            var MonthToParse = DateFormatted.getMonth();
            var YearToParse = DateFormatted.getFullYear();

            var YearValidation = parseInt(YearToParse);
            var MonthValidation = parseInt(MonthToParse);
            var DayValidation = parseInt(DayToParse);

            //The end of the subscription is formatted and will we setted on the record 
            var CheckedDate = new Date(YearValidation, MonthValidation, DayValidation);
            var MonthPlusOne = parseInt(CheckedDate.getMonth()) + 1;
            var ToRecord = CheckedDate.getDate() + "/" + MonthPlusOne + "/" + CheckedDate.getFullYear();
            log.debug('to record when month', ToRecord);
            //SuiteScript method to work with dates
            var parsedDateStringAsRawDateObject = format.parse({
                value: ToRecord,
                type: format.Type.DATE
            });*/

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


        function GetItemOption(itemid){
            var itemRecord = record.load({
                type: record.Type.ASSEMBLY_ITEM,
                id: itemid,
                isDynamic: true,
            });
            var itemoption = itemRecord.getLineCount({ sublistId: 'custcol_kd_grind' });
            log.debug({title: 'item option', details: itemRecord});
            return itemoption;


        }

        //create folder for this day
        function createFolderForFiles() {
            var folderSearchObj = search.create({
                type: "folder",
                filters:
                    [
                        ["name","startswith","KD Subscription Logs"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        })
                    ]
            });
            var folders = folderSearchObj.run().getRange({
                start: 0,
                end: 100
            });
            log.debug('folders search results', folders);
            var idfolder = folders[0].id


            var date = new Date();

            var chilDfolderId;
            var chilDfolder = record.create({
                type: record.Type.FOLDER,
                isDynamic: true
            });
            chilDfolder.setValue({
                fieldId: 'name',
                value: 'Subscription-SO-in-' + date.toISOString()
            });
            chilDfolder.setValue({
                fieldId: 'parent',
                value: idfolder
            });
            chilDfolderId = chilDfolder.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            return chilDfolderId
        }

        function getChildItems(parentId) {
            try{
                var childrenArr = [];
                var childrenSearch = search.create({
                    type: 'customrecord_kd_subscription_item_rcd',
                    filters: [
                        ["custrecord_kd_sub_item_rcd_parent", "is", parentId],
                    ],
                    columns: [{
                        name: 'internalid'
                    },
                        {
                            name: 'custrecord_kd_sub_item_rcd_item'
                        },
                        {
                            name: 'custrecord_kd_sub_item_rcd_qty'
                        }, {
                            name: 'custrecord_kd_sub_item_rcd_grind'
                        }, {
                            name: 'custrecord_kd_sub_item_rcd_delivery'
                        }]
                });
                var allResults = childrenSearch.run().getRange({
                    start: 0,
                    end: 100
                });

                allResults.forEach(function(item){
                    childrenArr.push({
                        rcdId: item.getValue('internalid'),
                        itemId: item.getValue('custrecord_kd_sub_item_rcd_item'),
                        quantity: item.getValue('custrecord_kd_sub_item_rcd_qty'),
                        grind: item.getValue('custrecord_kd_sub_item_rcd_grind'),
                        delivery: item.getValue('custrecord_kd_sub_item_rcd_delivery')
                    })
                })
                return childrenArr;
            } catch(e){
                log.error({
                    title: 'error in getting child items',
                    details: e
                })
                return [];
            }
        }

        function getDiscountItems(){
            var discounts = {};

            try{
                var itemSearchObj = search.create({
                    type: "item",
                    filters:
                        [
                            ["name","haskeywords","KD Subscription Discount"],
                            "AND",
                            ["type","anyof","Discount"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({name: "type", label: "Type"}),
                            search.createColumn({name: "baseprice", label: "Base Price"})
                        ]
                });
                var discountSearch = itemSearchObj.run().getRange({start: 0, end: 100});
                if(discountSearch){
                    for(var y=0; y<discountSearch.length; y++){
                        var result = discountSearch[y];
                        if(result.getValue('baseprice').includes('-15%')){
                            discounts.partial = result.id;
                        } else if (result.getValue('baseprice').includes('-100%')){
                            discounts.full = result.id;
                        }
                    }
                }

            } catch(e){
                log.debug('error in discount search', e);
            }

            return discounts;
        }


    });