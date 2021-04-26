<div id="custom-subscription-step">
    <!--starts subscription section-->
    {{#if isSubscription}}
    
    <form>
        <div class="custom-subscription-alert hidden">
          Please select your subscription options
        </div>
    
        {{#if customList}}
        <h2 class="order-wizard-step-title">
          Subscription duration
        </h2>


          <div class="checkout-sub-card-row">
              <div class="checkout-sub-card">
                  <div class="checkout-sub-card-header">
                      <p class="checkout-sub-card-lead">
                          Ongoing subscription
                      </p>
                  </div>
                  {{#if enablePayUpfront}}
                    <div class="checkout-sub-card-content">
                        <p class="checkout-sub-card-description">
                          <b class="checkout-sub-price"> $<span id="99-sub-card-monthly-price"></span></b>
                          <br>
                          {{deliveryText}}
                        </p>
                    </div>
                  {{/if}}
                  <div class="checkout-sub-card-footer">
                    <input type="radio" name="custbody_kd_subscription_limit" id="99-sub-choice" value="99" class="checkout-sub-card-footer-radio-button">
                    <label for="99-sub-choice" class="checkout-sub-card-footer-radio-label checkout-sub-radio-label">
                      Select
                    </label>
                  </div>
              </div>
            {{#each customList}}
              <div class="checkout-sub-card">
                  <div class="checkout-sub-card-header {{#if enablePayUpfront}}border-bottom-title{{/if}}">
                      <p class="checkout-sub-card-lead">
                          {{name}} subscription
                      </p>
                  </div>
                  
                    <div class="checkout-sub-card-content" {{#unless ../enablePayUpfront}}style="display:none"{{/unless}}>
                        <p class="checkout-sub-card-description">
                          <br>
                          <b class="checkout-sub-price"> $<span id="{{id}}-sub-card-monthly-price"></span> </b>
                        </p>
                    </div>
                
                  <div class="checkout-sub-card-footer">
                    <input type="radio" name="custbody_kd_subscription_limit" id="{{id}}-sub-choice" value="{{id}}" class="checkout-sub-card-footer-radio-button">
                    <label for="{{id}}-sub-choice" class="checkout-sub-card-footer-radio-label checkout-sub-radio-label">
                      Select
                    </label>
                  </div>
              </div>
              {{/each}}
          </div>
        {{/if}}

        <!----------- pay upfront 
        <h2 class="order-wizard-step-title">
          Payment options
        </h2>

        <div id="custom-subscription-alert-sub-duration" class="custom-subscription-alert hidden">
          Please select a subscription duration
        </div>

        <div id="pay-upfront-options">
          <input type="radio" name="custbody_kd_is_pay_upfront" id="is-pay-upfront" value="T" class="checkout-sub-card-footer-radio-button">
          <label for="is-pay-upfront" class="checkout-sub-card-footer-radio-label checkout-sub-radio-label">
            Pay Upfront
          </label>
          <input type="radio" name="custbody_kd_is_pay_upfront" id="not-pay-upfront" value="F" class="checkout-sub-card-footer-radio-button">
          <label for="not-pay-upfront" class="checkout-sub-card-footer-radio-label checkout-sub-radio-label">
            Pay as you go
          </label>
        </div>
        ------------->

    </form>

{{else}}
  <div class="custom-review-subscription-options-section">
      <h3 class="order-wizard-showpayments-module-section-header">
              Subscription
      </h3>

      <div class="custom-review-subscription-options-wrapper">
        <!--<p class="custom-review-option-line"> 
          <span class="custom-review-title">
              Delivery Frequency: 
          </span>
          <span id="review-subscription-delivery"></span>
        </p> -->
        <p class="custom-review-option-line"> 
          <span class="custom-review-title">
            {{#if this.model.options.custbody_kd_subscription_limit}}
              <span id="review-subscription-duration"></span> 
            {{else}}
              Ongoing subscription
            {{/if}}
          </span>
        </p>  

        <p class="custom-review-option-line">
          <span class="custom-review-title">Cost: </span>
          $<span id="review-subscription-cost"></span>
        </p> 
        
        <!--
        <p class="custom-review-option-line">
          <span class="custom-review-title">Subscription duration: </span>
          <span id="review-subscription-duration"></span>  
        </p>
        -->
      </div>

  </div>
{{/if}}

</div>

<!--
  Available helpers:
  {{ getExtensionAssetsPath "img/image.jpg"}} - reference assets in your extension
  
  {{ getExtensionAssetsPathWithDefault context_var "img/image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the extension assets folder
  
  {{ getThemeAssetsPath context_var "img/image.jpg"}} - reference assets in the active theme
  
  {{ getThemeAssetsPathWithDefault context_var "img/theme-image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the theme assets folder
-->