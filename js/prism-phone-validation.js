/* Progressive enhancement: genuine phone validation is also enforced in api/enquiries.php. */
(() => {
  'use strict';
  const forms = document.querySelectorAll('#prism-travel-form, form[data-prism-enquiry]');
  forms.forEach(form => {
    const phone = form.querySelector('input[name="phone"]');
    if (!phone) return;
    phone.setAttribute('required', '');
    phone.setAttribute('type', 'tel');
    phone.setAttribute('inputmode', 'tel');
    phone.setAttribute('autocomplete', 'tel');
    phone.setAttribute('maxlength', '30');
    phone.setAttribute('placeholder', '+91 98765 43210');
    function validate() {
      const digits = phone.value.replace(/\D/g, '');
      const characters = /^\+?[0-9\s().-]+$/.test(phone.value.trim());
      phone.setCustomValidity(characters && digits.length >= 10 && digits.length <= 15 ? '' : 'Enter a valid phone number with 10–15 digits.');
    }
    phone.addEventListener('input', () => { if (phone.value) validate(); else phone.setCustomValidity(''); });
    form.addEventListener('submit', event => {
      validate();
      if (!phone.checkValidity()) {
        event.preventDefault(); event.stopImmediatePropagation();
        phone.reportValidity(); phone.focus();
      }
    }, true);
  });
})();
