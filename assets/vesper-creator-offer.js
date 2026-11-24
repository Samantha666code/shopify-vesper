(function () {
  'use strict';

  var script = document.currentScript;
  var attributionId = script ? script.dataset.attributionId || '' : '';
  var discountCode = script ? script.dataset.discountCode || '' : '';
  var propertyName = script ? script.dataset.propertyName || 'Creator benefit' : 'Creator benefit';
  var propertyValue = script ? script.dataset.propertyValue || '3-Year Warranty Included' : '3-Year Warranty Included';
  var storageDays = script ? parseInt(script.dataset.storageDays || '30', 10) : 30;
  var storageKey = 'vesper_creator_offer_v1';
  var cookieName = 'vesper_creator_offer';

  function getCookie(name) {
    var prefix = name + '=';
    var cookies = document.cookie ? document.cookie.split(';') : [];

    for (var i = 0; i < cookies.length; i += 1) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(prefix) === 0) return decodeURIComponent(cookie.slice(prefix.length));
    }

    return '';
  }

  function removeStoredOffer() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch (error) {}

    document.cookie = cookieName + '=; Max-Age=0; Path=/; SameSite=Lax; Secure';
  }

  function storeOffer() {
    var expiresAt = Date.now() + storageDays * 24 * 60 * 60 * 1000;
    var offer = {
      attributionId: attributionId,
      discountCode: discountCode,
      expiresAt: expiresAt,
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(offer));
    } catch (error) {}

    document.cookie =
      cookieName +
      '=' +
      encodeURIComponent(attributionId + '|' + discountCode + '|' + expiresAt) +
      '; Max-Age=' +
      storageDays * 24 * 60 * 60 +
      '; Path=/; SameSite=Lax; Secure';
  }

  function captureOffer() {
    var params = new URLSearchParams(window.location.search);
    var incomingAttributionId = params.get('dt_id') || '';

    if (incomingAttributionId !== attributionId) return;

    storeOffer();
  }

  function readStoredOffer() {
    var offer = null;

    try {
      offer = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    } catch (error) {}

    if (!offer) {
      var cookieValue = getCookie(cookieName).split('|');
      if (cookieValue.length === 3) {
        offer = {
          attributionId: cookieValue[0],
          discountCode: cookieValue[1],
          expiresAt: Number(cookieValue[2]),
        };
      }
    }

    return offer;
  }

  function isActive() {
    var offer = readStoredOffer();
    var active =
      offer &&
      offer.attributionId === attributionId &&
      offer.discountCode.toUpperCase() === discountCode.toUpperCase() &&
      Number(offer.expiresAt) > Date.now();

    if (!active && offer) removeStoredOffer();
    return Boolean(active);
  }

  function propertiesForForm(form) {
    if (!form || form.dataset.creatorWarrantyEligible !== 'true' || !isActive()) return undefined;

    var properties = {};
    properties[propertyName] = propertyValue;
    properties._creator_attribution_id = attributionId;
    properties._creator_offer_code = discountCode;
    return properties;
  }

  function getWarrantyValue(properties) {
    if (!properties || properties[propertyName] !== propertyValue) return '';
    return properties[propertyName];
  }

  function renderBenefits() {
    var active = isActive();
    document.querySelectorAll('[data-creator-warranty-benefit]').forEach(function (element) {
      element.hidden = !active;
    });
  }

  captureOffer();

  window.VesperCreatorOffer = {
    getWarrantyValue: getWarrantyValue,
    isActive: isActive,
    propertiesForForm: propertiesForForm,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBenefits);
  } else {
    renderBenefits();
  }
})();
