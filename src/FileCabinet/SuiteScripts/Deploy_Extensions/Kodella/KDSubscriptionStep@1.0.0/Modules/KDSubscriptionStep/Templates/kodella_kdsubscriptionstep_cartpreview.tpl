

{{#if isSubscription}}

<div id="checkout-cartpreview-table-container">
    <table class="checkout-cartpreview-table">
        <thead>
            <tr>
                <th scope="col" colspan="2">Item</th>
                <th scope="col">Price</th>
                <th scope="col">Quantity</th>
                <th scope="col">Total</th>
            </tr>
        </thead>
        <tbody>
            {{#each orderLines}}
            
                <tr {{#if hasSubOptions}}
                    class="cartpreview-active-row"
                {{/if}}>

                    <td>
                        <img src="
                            {{#if item.itemImage}}

                                {{item.itemImage}}

                            {{else}}
                                
                                /site/Item-Images/{{item.itemid}}-MAIN

                            {{/if}}

                        ">
                    </td>
                    <td>
                        <p class="cartpreview-itemName">{{item.itemid}}<p>
                        <p class="cartpreview-itemOptions">
                            {{#each options.models}}
                                <b>{{label}}</b>: {{value.label}}<br>
                            {{/each}}
                        </p>
                        
                        <p class="cartpreview-mobile-info">
                            <b>Unit price: </b>{{rate_formatted}}<br>
                            <b>Quantity: </b>{{quantity}}<br>
                            <b>Amount: </b>{{#if subAmount}}{{subAmount}}{{else}}{{amount_formatted}}{{/if}}<br>
                        </p>
                        
                    </td>
                    <td class="cartpreview-mobile-extra-cell">
                            {{rate_formatted}}
                    </td>
                    <td class="cartpreview-mobile-extra-cell">
                            {{quantity}}
                    </td>
                    <td class="cartpreview-mobile-extra-cell">
                        {{#if subAmount}}
                            {{subAmount}}
                        {{else}}
                            {{amount_formatted}}
                        {{/if}}
                    </td>
                </tr>
                
            {{/each}}
        </tbody>
    </table>
</div>
{{/if}}