
define(
	'Kodella.KDSubAccount.KDSubAccount'
,   [
		'Kodella.KDSubAccount.KDSubAccount.View'
		,'Kodella.KDSubAccount.KDSubAccount.View.List'
		,'Profile.Model'
		
	]
,   function (
		 KDSubAccountView
		,KDSubAccountViewList
		,ProfileModel
		
	)
{
	'use strict';

	return  {
		mountToApp: function mountToApp (container)
		{
			// using the 'Layout' component we add a new child view inside the 'Header' existing view 
			// (there will be a DOM element with the HTML attribute data-view="Header.Logo")
			// more documentation of the Extensibility API in
			// https://system.netsuite.com/help/helpcenter/en_US/APIs/SuiteCommerce/Extensibility/Frontend/index.html
			
			/** @type {LayoutComponent} */
			var layout = container.getComponent('Layout'); 
			var myaccountmenu = container.getComponent("MyAccountMenu");
			var pageType = container.getComponent('PageType');

			var maxRows;
			var totalRows;
			var totalPages;
			var activePage;

			var subscriptionL = {
				id: 'subscription_list',
				index: 1,
				groupid: "subscriptionsMenu",
				url: '/subscription-list',
				name: _.translate('Subscriptions List')
			  }

			var subscriptionLOverview = {
				id: 'subscription_list_ov',
				index: 9,
				groupid: "overview",
				url: 'overview',
				name: _.translate('Subscriptions List')
			  }

			var subscriptionsMenu = {
				id: "subscriptionsMenu",
				name: "Subscriptions",
				index: 6,
				permissionoperator: "OR",
				permission: []
			}

			if(myaccountmenu){
				debugger;
				myaccountmenu.addGroup(subscriptionsMenu);
				myaccountmenu.addGroupEntry(subscriptionL);
				myaccountmenu.addGroupEntry(subscriptionLOverview);
		
				pageType.registerPageType({
					name: 'subscList',
					routes: ['/subscription-list'],
					view: KDSubAccountViewList,
					defaultTemplate: {
						name: 'Kodella_kdsubaccount_kdsubaccount_list.tpl',
						displayName: 'Subscriptions List'
					}
				});
				//debugger;
				pageType.registerPageType({
					name: 'subscDetails',
					routes: ['/subscription-details?item','/subscription-details','/subscription-details?id','#/subscription-details'],
					view: KDSubAccountView,
					defaultTemplate: {
						name: 'kodella_kdsubaccount_kdsubaccount_details.tpl',
						displayName: 'Subscriptions Details'
					}
				});
			}
			
			if(layout)
			{
				// layout.addChildView('Overview.Banner', function(){
				// 	return new KDSubAccountViewList();
				// });
				// layout.addChildViews('Overview.Banner', 
				// 	{
				// 		'List-Subscriptions':
				// 		{
				// 			childViewIndex: 1
				// 			, childViewConstructor: function(){
				// 				return new KDSubAccountViewList();
				// 			}
				// 		}
				// 	}
				// );
				layout.addChildView('List-Subscriptions', function(){
					return new KDSubAccountViewList();
				});

				layout.on('afterShowContent', function(){
					if(!jQuery('[data-view="List-Subscriptions"]')){
						document.querySelector('#MyAccountOverview').appendChild('<div data-view="List-Subscriptions"><div>');
					}
					if(jQuery('.Subscriptions')){
						totalRows = document.querySelectorAll('table.case-list-recordviews-table tbody tr').length;
						maxRows = 10;
						totalPages = totalRows / maxRows;
						activePage = 0;

						createPagination();
						showPage(activePage, maxRows);

						jQuery('ul#customPagination li').click(function(e){
							var pageSelected = jQuery(this).attr('data-target');
							var isPrev = ( jQuery(this).attr('id') == 'page-prev' );
							var isNext = ( jQuery(this).attr('id') == 'page-next' );
						
							if(pageSelected){
								showPage(pageSelected, maxRows);
							} else if(isPrev){
								if(activePage == 0){
									showPage( 0, maxRows );
								} else{
									showPage( activePage-1, maxRows );
								}
							} else if(isNext){
								if(activePage == totalPages - 1){
									showPage( activePage, maxRows );
								} else{
									showPage( activePage+1, maxRows );
								}
							}
						});
					}
				})
			}


			//---pagination functions ---//
			function createPagination(){
				var paginationDiv = document.querySelector('#customPagination');
			
				if(totalPages > 1){
					var paginationHTML = `<li id="page-prev">View Previous</li>`;
					
					for(var i=0; i < totalPages; i++){
						paginationHTML += `<li data-target="${i}">${i+1}</li>`;
					}
			
					paginationHTML += `<li id="page-next">View Next</li>`;
					paginationDiv.innerHTML= paginationHTML;
				}
			}
			
			function showPage(pageIndex, rows){
				jQuery('ul#customPagination li').removeClass('active');
				jQuery('table.case-list-recordviews-table tbody tr').hide();
				var startPosition = rows * pageIndex;
				var currentPage = jQuery('table.case-list-recordviews-table tbody tr').slice(startPosition, startPosition+rows);
				currentPage.show();
				activePage = pageIndex;
				jQuery('ul#customPagination li[data-target='+ activePage + ']').addClass('active');
			}


		}
	};
});
