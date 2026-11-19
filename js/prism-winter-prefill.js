/* Prefill the existing native Prism enquiry form with the winter journey/tier chosen. */
(() => {
  'use strict';
  const options = {
    'w-auli':['Auli Snow Escape','Auli, Uttarakhand','4 nights / 5 days'],
    'w-nainital':['Nainital Lake Retreat','Nainital, Uttarakhand','3 nights / 4 days'],
    'w-leh':['Leh Winter Discovery','Leh, Ladakh','4 nights / 5 days'],
    'w-gangtok':['Gangtok Himalayan Break','Gangtok, Sikkim','3 nights / 4 days'],
    'w-tawang':['Tawang Monastery & Mountain Circuit','Tawang, Arunachal Pradesh','5 nights / 6 days'],
    'w-kaziranga':['Kaziranga Rhino Safari','Kaziranga, Assam','3 nights / 4 days'],
    'w-rann':['Rann Utsav White Desert Experience','Rann of Kutch, Gujarat','2 nights / 3 days'],
    'w-jaipur':['Jaipur Royal Heritage Break','Jaipur, Rajasthan','3 nights / 4 days'],
    'w-jaisalmer':['Jaisalmer Fort & Desert Camp','Jaisalmer, Rajasthan','3 nights / 4 days'],
    'w-munnar':['Munnar Tea Country Escape','Munnar, Kerala','3 nights / 4 days'],
    'w-coorg':['Coorg Coffee Estate Retreat','Coorg, Karnataka','3 nights / 4 days'],
    'w-ooty':['Ooty & Coonoor Hill Holiday','Ooty, Tamil Nadu','3 nights / 4 days'],
  };
  const params=new URLSearchParams(location.search);
  const selected=options[params.get('package')];
  const form=document.getElementById('prism-travel-form');
  if(!selected || !form)return;
  const tiers={economy:'Economy',comfort:'4-Star / Comfort',luxury:'5-Star / Luxury'};
  const tier=Object.prototype.hasOwnProperty.call(tiers,params.get('tier'))?tiers[params.get('tier')]:'Please recommend a suitable tier';
  const destination=form.elements.namedItem('destination');
  const interest=form.elements.namedItem('interest');
  const message=form.elements.namedItem('message');
  if(destination && !destination.value.trim())destination.value=selected[1];
  if(interest && [...interest.options].some(opt=>opt.value==='Personal holiday'))interest.value='Personal holiday';
  if(message && !message.value.trim())message.value=`I'd like a date-specific quote for PRISM Winter Package: ${selected[0]} (${selected[2]}). Preferred level: ${tier}. Please verify hotel availability, winter road access, inclusions, permits and the final total before quoting. `;
  const note=document.createElement('div');note.className='pkg-enquiry-context';note.setAttribute('role','status');
  const title=document.createElement('strong');title.textContent='Selected winter journey: '+selected[0];
  const p=document.createElement('p');p.textContent='Your chosen trip is included in the enquiry below. Dates, budget and accommodation preference remain editable; published ranges are not confirmed quotations.';
  const link=document.createElement('a');link.href='packages.html';link.textContent='Browse the collection ↗';
  note.append(title,p,link);form.before(note);
})();
