/* Prism Travels — package enquiry prefill. No new backend or database columns needed. */
(() => {
  'use strict';
  const packages = {
    'rajasthan': { name: 'Rajasthan — Royal Cities', destination: 'Jaipur → Jodhpur → Udaipur', duration: '5 nights / 6 days', rate: '₹36,900' },
    'goa': { name: 'Goa — Beach Escape', destination: 'North Goa · South Goa', duration: '4 nights / 5 days', rate: '₹24,900' },
    'kashmir': { name: 'Kashmir — Valley & Peaks', destination: 'Srinagar → Gulmarg → Pahalgam', duration: '5 nights / 6 days', rate: '₹34,900' },
    'himachal': { name: 'Himachal — Hill Retreat', destination: 'Chandigarh → Shimla → Manali → Chandigarh', duration: '4 nights / 5 days', rate: '₹29,900' },
    'kerala': { name: 'Kerala — Backwaters & Tea', destination: 'Kochi → Munnar → Alleppey → Kochi', duration: '4 nights / 5 days', rate: '₹34,900' },
  };
  const params = new URLSearchParams(window.location.search);
  const id = params.get('package');
  if (!id || !Object.prototype.hasOwnProperty.call(packages, id)) return;
  const form = document.getElementById('prism-travel-form');
  if (!form) return;
  const trip = packages[id];
  const interest = form.elements.namedItem('interest');
  if (interest && [...interest.options].some(option => option.value === 'Personal holiday')) {
    interest.value = 'Personal holiday';
  }
  const destination = form.elements.namedItem('destination');
  if (destination && !destination.value.trim()) destination.value = trip.destination;
  const message = form.elements.namedItem('message');
  if (message && !message.value.trim()) {
    message.value = `I'd like to enquire about the ${trip.name} (${trip.duration}) travel package. The published indicative rate is ${trip.rate} per person for two adults on twin sharing. Please share an updated quotation and confirm hotel, vehicle, inclusions and availability for my dates.`;
  }
  const box = document.createElement('div');
  box.className = 'pkg-enquiry-context';
  box.setAttribute('role', 'status');
  const title = document.createElement('strong');
  title.textContent = `Selected journey: ${trip.name}`;
  const note = document.createElement('p');
  note.textContent = 'We have filled in your selected package. You can edit any details before sending. The indicative rate is not a confirmed quotation.';
  const change = document.createElement('a');
  change.href = 'packages.html';
  change.textContent = 'Browse other packages ↗';
  box.append(title, note, change);
  form.before(box);
})();
