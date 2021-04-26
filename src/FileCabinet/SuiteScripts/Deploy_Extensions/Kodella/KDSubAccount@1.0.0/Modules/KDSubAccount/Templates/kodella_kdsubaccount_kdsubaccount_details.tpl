<div data-view="success-updated"></div>

<div class="warranty-rma-form-container">
    <form id="warranty-rma-form">
        <fieldset>
            <legend>
                <h2 class="warranty-rma-form__title">Subscription Details</h2>
            </legend>
            <br>
            <br>

            <div class="row product-subscription-row">
                <div class="product-subscription-wrapper global-sub-info">
                    <div class="product-subscription-left">
                        <p class="subscription-description-title">
                            {{#if recordData.subscriptionLimit}}
                                {{recordData.subscriptionLimit}} subscription
                            {{else}}
                                Ongoing subscription
                            {{/if}}
                        </p>
                            
                        <p class="p_enddate">
                            <span class=" subscription-description-title">Next delivery: </span>
                            <span id="subscription-price" class="subscription-description-value">{{recordData.nextRenewal}}</span>
                        </p>

                        {{#if recordData.endDate}}
                            <p class="p_enddate">
                                <span class="transaction-line-views-quantity-amount-label price-suscription">End date: </span>
                                <span id="subscription-price" class="transaction-line-views-quantity-amount-item-amount">{{recordData.endDate}}</span>
                            </p>
                        {{else}}
                            <p class="p_price">
                                <span id="subscription-main-price" class="transaction-line-views-quantity-amount-item-amount">${{recordData.price}}</span>
                            </p>
                        {{/if}}

                        <p>
                            <span class="subscription-description-title">Status: </span>
                            <span>
                                <select class='subscription-details-input' name="" id="status" {{#if isPayUpfront}}disabled style="border: 0"{{/if}}>
                                    <option value="1" {{#ifEquals recordData.status 'Paused'}}selected{{/ifEquals}}>
                                        Paused</option>
                                    <option value="2" {{#ifEquals recordData.status 'Cancel'}}selected{{/ifEquals}}>
                                        Cancel</option>
                                    <option value="3" {{#ifEquals recordData.status 'Active'}}selected{{/ifEquals}}>
                                        Active</option>
                                </select>
                            </span>
                            <!--<span id="sub-display-status" class="subscription-description-value">recordData.status</span>-->
                        </p>
                    </div>
                </div>
            </div>
            <br>

            {{#unless isPayUpfront}}
                <div class="subscription-btn-wrapper">
                    <button type="button" class='button-update-suscription' data-action="update" class="rma-button-primary button-suscription">Update subscription</button>
                </div>
            {{/unless}}

            <legend>
                <h2 class="warranty-rma-form__title">Item Details</h2>
            </legend>

            <br>
            <br>
            {{#each subItems}}
            <div class="row product-subscription-row">
                <div data-recordid="{{recordId}}" data-itemid="{{itemId}}" class="product-subscription-wrapper overlap-on">
                    <div class="product-subscription-left">
                        <span class="transaction-line-views-cell-actionable-name-viewonly name-suscription" id="subscription-displayname-{{recordId}}">{{info.displayName}} {{info.size}}</span>

                        <div class="transaction-line-views-cell-actionable-thumbnail col-xs-12 col-sm-12 img-suscription">
                            <img id="subscription-image-{{recordId}}" src="{{info.image}}" alt="{{info.displayName}}">
                        </div>
                        <input id="item-id-{{recordId}}" type="number" style="display:none" value="{{itemId}}">
                        <p>
                            <span class="subscription-description-title">Item Price: </span>
                            <span class="subscription-description-value item-price-span" data-recordid="{{recordId}}" data-itemprice="{{info.unitaryPrice}}" id="sub-item-price-{{recordId}}">{{info.subsPrice}}</span>
                        </p>
                        <p>
                            <span class="subscription-description-title">Quantity: </span>
                            <span class="subscription-description-value" id="sub-display-qty-{{recordId}}">{{quantity}}</span>
                        </p>

                        {{#if grindLabel}}
                            <p>
                                <span class="subscription-description-title">Grind: </span>
                                <span class="subscription-description-value" id="sub-display-grind-{{recordId}}">{{grindLabel}}</span>
                            </p>
                        {{/if}}

                        {{#if deliveryLabel}}
                            <p>
                                <span class="subscription-description-title">Delivery Frequency: </span>
                                <span class="subscription-description-value" id="sub-display-delivery-{{recordId}}">{{deliveryLabel}}</span>
                            </p>
                        {{/if}}

                        {{#unless ../isPayUpfront}}
                            <input type="checkbox" data-action="subscription-edit" data-recordid="{{recordId}}" id="edit-subscription-{{recordId}}" style="display:none">
                            <label for="edit-subscription-{{recordId}}" id="label-edition-{{recordId}}" class='button-update-suscription rma-button-primary button-suscription'>Edit item</label>
                        {{/unless}}

                    </div>

                    <div class="product-subscription-right">
                        <!--here the possible blends-->
                        <div>
                            <select data-recordid="{{recordId}}" data-edit="subscription-blend" class="subscription-details-input">
                                {{#if ../availableSubs}}
                                    {{#each ../availableSubs}}
                                        <option value="{{id}}" {{#ifEquals id ../itemId}} selected {{/ifEquals}}>
                                            {{name}}
                                        </option>
                                    {{/each}}
                                {{else}}
                                    <option value="{{itemId}}" selected>
                                        {{info.displayName}}
                                    </option>
                                {{/if}}
                            </select>
                        </div>

                        {{#if info.sizeOptions}}
                            <!-- size -->
                            <div>
                                <select data-recordid="{{recordId}}" data-edit="subscription-size" class="subscription-details-input">
                                    {{#each info.sizeOptions}}
                                        {{#if internalid}}
                                            <option value="{{label}}" {{#ifEquals label ../info.size}} selected{{/ifEquals}}>
                                                {{label}}
                                            </option>
                                        {{/if}}
                                    {{/each}}
                                </select>
                            </div>
                            <div id="size-alert-{{recordId}}" class="size-alert" style="display:none">
                                <span id='size-alert-name-{{recordId}}'></span> is currently unavailable in this size
                            </div>
                        {{/if}}

                        <!-- quantity -->
                        <div>
                            <input data-recordid="{{recordId}}" type="number" class="subscription-details-input"
                                data-edit="subscription-quantity" placeholder="Quantity" min="1"
                                value="{{quantity}}">
                        </div>

                        {{#if info.grindOptions}}
                            <!-- grind -->
                            <div>
                                <select data-recordid="{{recordId}}" data-edit="subscription-grind"
                                    class="subscription-details-input">
                                    {{#each info.grindOptions}}
                                        {{#if internalid}}
                                            <option value="{{internalid}}" {{#ifEquals internalid ../grind}} selected {{/ifEquals}}>
                                                {{label}}
                                            </option>
                                        {{/if}}
                                    {{/each}}
                                </select>
                            </div>
                        {{/if}}

                        {{#if deliveryLabel}}
                        <!-- delivery frequency -->
                            <div>
                                <select data-recordid="{{recordId}}" data-edit="subscription-delivery" class="subscription-details-input">
                                {{#each ../deliveryOptions}}
                                    {{#if internalid}}
                                        <option value="{{internalid}}" {{#ifEquals label ../deliveryLabel}}selected{{/ifEquals}}>
                                            {{label}}
                                        </option>
                                    {{/if}}
                                {{/each}}
                                </select>
                            </div>
                        {{/if}}

                        {{#if ../allowRemove}}
                            <button class="sub-delete-item" data-toggle="modal" data-target="#subscription-delete-{{recordId}}" data-recordid="{{recordId}}" type="button">Remove item</button>
                        {{/if}}
                    </div>
                </div>
            </div>
            <!-- custom delete modal -->
            <div class="modal fade in subscription-delete-modal" id="subscription-delete-{{recordId}}" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="delete-content">
                            <p>Remove {{info.displayName}} from your subscription?</p>
                        </div>
                        <div class="button-row">
                            <button class="sub-delete-item" type="button" data-recordid="{{recordId}}" data-action="remove-item">Remove item</button>
                            <button data-dismiss="modal" type="button" class="button-tertiary">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
            <br>
            {{/each}}

            <div class="subscription-btn-wrapper">
                {{#if isPayUpfront}}
                    <button type="button" class='button-update-suscription' data-action="sub-back-button" class="rma-button-primary button-suscription">Back</button>
                {{else}}
                    <button type="button" class='button-update-suscription' data-action="update" class="rma-button-primary button-suscription">Update subscription</button>
                    <br>
                    <button type="button" class='button-update-suscription' data-action="sub-back-button" class="rma-button-primary button-suscription">Back</button>
                    <br>
                {{/if}}
            </div>
        </fieldset>
    </form>
</div>

<!--
  Available helpers:
  {{ getExtensionAssetsPath "img/image.jpg"}} - reference assets in your extension

  {{ getExtensionAssetsPathWithDefault context_var "img/image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the extension assets folder

  {{ getThemeAssetsPath context_var "img/image.jpg"}} - reference assets in the active theme

  {{ getThemeAssetsPathWithDefault context_var "img/theme-image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the theme assets folder
-->