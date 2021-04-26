

<section class='Subscriptions'>
<h2 class="Subscriptions__title">Subscriptions</h2>
{{#if message}}
<div class="case-list-results-container">
    <table class="case-list-recordviews-table">
        <thead class="case-list-content-table">
            <tr class="case-list-content-table-header-row">
                <th class="case-list-content-table-header-row-title  row-item">
                    <span>Subscription Type</span>
                </th>
                <th class="case-list-content-table-header-row-status">
                    <span>Status</span>
                </th>
                <th class="case-list-content-table-header-row-status">
                    <span>Date Updated</span>
                </th>
                <th class="case-list-content-table-header-row-status row-endDate">
                    <span>End Date</span>
                </th>
                
                <!--
                 <th class="case-list-content-table-header-row-status">
                    <span>Edit Subscription</span>
                </th>
                -->
            </tr>
        </thead>
        <tbody >
            {{# each message}}
            <tr class="recordviews-row row-selector-subscription" onclick="location.href='#/subscription-details?status={{status}}&rcdId={{recordId}}&updated={{dateUpdate}}&endDate={{endDate}}&subscriptionLimit={{subscriptionLimit}}&nextRenewal={{nextRenewal}}'">
                
                    <td class="case-list-content-table-header-row-title">{{#if subscriptionLimit}}{{subscriptionLimit}} Subscription{{else}}Ongoing Subscription{{/if}}</td>
                    <td class="case-list-content-table-header-row-status" >
                        <span class="subscription-list-mobile-title">Status: </span> {{status}}
                    </td>
                    <td class="case-list-content-table-header-row-status" >
                            <span class="subscription-list-mobile-title">Date Updated: </span> {{dateUpdate}}
                    </td>
                    <td class="case-list-content-table-header-row-status row-endDate">
                            <span class="subscription-list-mobile-title">End date: </span>
                                {{endDate}}
                    </td>
                    
                    <!--
                    <td class="case-list-content-table-header-row-status" >
                        {{#if endDate}}
                            <a class="list-edit-subscription-btn" href="/subscription-details?item={{itemId}}&status={{status}}&rcdId={{recordId}}&updated={{dateUpdate}}&subscriptionFreq={{subscriptionFreq}}&endDate={{endDate}}&quantity={{quantity}}&grind={{grind}}">View</a>
                        {{else}}
                            <a class="list-edit-subscription-btn" href="/subscription-details?item={{itemId}}&status={{status}}&rcdId={{recordId}}&updated={{dateUpdate}}&subscriptionFreq={{subscriptionFreq}}&endDate={{endDate}}&quantity={{quantity}}&grind={{grind}}">Edit</a>
                        {{/if}}
                    </td>
                -->
                
            </tr> 
            {{/each}}
     
        </tbody>
    </table>

    <ul id='customPagination'>
    </ul>
    
</div>
{{else}}
    <div class='SubscriptionsUser'>
        <p>You have no active subscriptions. Find your subscriptions in the <a href='#' data-touchpoint="home" data-hashtag="/subscriptions">store</a></p>
    </div>
{{/if}}
</section>
<!--
  Available helpers:
  {{ getExtensionAssetsPath "img/image.jpg"}} - reference assets in your extension
  
  {{ getExtensionAssetsPathWithDefault context_var "img/image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the extension assets folder
  
  {{ getThemeAssetsPath context_var "img/image.jpg"}} - reference assets in the active theme
  
  {{ getThemeAssetsPathWithDefault context_var "img/theme-image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the theme assets folder
-->