// Request interceptor script - runs in page context
// This file is injected into the page to intercept fetch and XMLHttpRequest

(function() {
  'use strict';
  
  if (window.__lccRequestInterceptorInjected) {
    return;
  }
  window.__lccRequestInterceptorInjected = true;
  
  console.log('Live Chess Cloud: Request interceptor injected');
  
  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    return originalFetch.apply(this, args)
      .then(response => {
        if (typeof url === 'string' && url.includes('/get/') && url.includes('.json')) {
          const clonedResponse = response.clone();
          clonedResponse.json().then(data => {
            console.log('Live Chess Cloud: Captured JSON response', url);
            window.postMessage({
              source: 'lcc-request-interceptor',
              type: 'jsonResponse',
              url: url,
              data: data
            }, '*');
          }).catch(() => {});
        }
        return response;
      });
  };

  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._lccUrl = url;
    return originalOpen.apply(this, [method, url, ...rest]);
  };
  
  XMLHttpRequest.prototype.send = function(...args) {
    this.addEventListener('load', function() {
      if (this._lccUrl && this._lccUrl.includes('/get/') && this._lccUrl.includes('.json')) {
        try {
          const data = JSON.parse(this.responseText);
          console.log('Live Chess Cloud: Captured XHR JSON response', this._lccUrl);
          window.postMessage({
            source: 'lcc-request-interceptor',
            type: 'jsonResponse',
            url: this._lccUrl,
            data: data
          }, '*');
        } catch (e) {
          // Not JSON or parse error
        }
      }
    });
    return originalSend.apply(this, args);
  };
})();

