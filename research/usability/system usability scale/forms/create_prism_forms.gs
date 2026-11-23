/**
 * PRISM Travel and Advisory Limited | PRISM-UX-001
 * Forms + private response sheets creator.
 *
 * INSTRUCTIONS: review forms/SETUP.md before executing.
 * Run createPrismStudyForms() once from an approved Google account.
 * Run exportStandardizedSUS() to export SUS answers into the private Sheet B.
 *
 * No participant answers, email addresses, or test records are hard-coded.
 * Do not publish the response Sheets or real study URLs in GitHub.
 */

const SETTINGS = Object.freeze({
  STUDY_ID: 'PRISM-UX-001',
  RESEARCH_EMAIL: '[REPLACE_WITH_APPROVED_RESEARCH_EMAIL]',
  PRIVACY_NOTICE_URL: '[REPLACE_WITH_APPROVED_PRIVACY_NOTICE_URL]',
  WITHDRAWAL_DEADLINE: '[REPLACE_WITH_APPROVED_DEADLINE]',
  RETENTION_PERIOD: '[REPLACE_WITH_APPROVED_RETENTION_PERIOD]',
  TEAM_NAME: 'PRISM Travel and Advisory Limited - Research Team'
});

const SUS_ITEMS = Object.freeze([
  'I think that I would like to use this system frequently.',
  'I found the system unnecessarily complex.',
  'I thought the system was easy to use.',
  'I think that I would need the support of a technical person to be able to use this system.',
  'I found the various functions in this system were well integrated.',
  'I thought there was too much inconsistency in this system.',
  'I would imagine that most people would learn to use this system very quickly.',
  'I found the system very cumbersome to use.',
  'I felt very confident using the system.',
  'I needed to learn a lot of things before I could get going with this system.'
]);

const TASKS = Object.freeze([
  {id:'T01', title:'Discover what PRISM offers', text:'Explore the site and explain which travel services PRISM provides. Identify at least two distinct services.'},
  {id:'T02', title:'Find a leisure holiday option', text:'Find a relevant holiday/package option or a clear way to request a tailored leisure trip.'},
  {id:'T03', title:'Find the flight-and-hotel enquiry route', text:'Find how you would ask PRISM to arrange a flight and hotel, stopping before submission.'},
  {id:'T04', title:'Find corporate travel support', text:'Find travel assistance and an enquiry route for eight colleagues travelling to a work event.'},
  {id:'T05', title:'Find a human contact route', text:'Find a suitable way to talk to PRISM about a trip. Do not send a real message.'},
  {id:'T06', title:'Plan a multi-service request', text:'Identify how to ask for a trip combining flights, accommodation and airport-to-hotel transport.'}
]);

/** Creates a form once, sets safe respondent settings, and attaches a private Sheet. */
function createPrismStudyForms() {
  validateSettings_();
  const properties = PropertiesService.getScriptProperties();
  if (properties.getProperty('PRISM_CONSENT_FORM_ID') || properties.getProperty('PRISM_SUS_FORM_ID')) {
    throw new Error('This script project already has study IDs. Open the existing forms, or use a NEW project for a new study round. Do not duplicate by rerunning.');
  }

  const consent = FormApp.create('PRISM | Participation and Consent | ' + SETTINGS.STUDY_ID, false);
  properties.setProperty('PRISM_CONSENT_FORM_ID', consent.getId());
  configureForm_(consent);
  consent.setDescription(
    'PRISM website usability study. Read the participant information sheet first. ' +
    'We will observe normal website use for approximately 40–50 minutes. ' +
    'Participation is voluntary; no booking, payment or real personal travel details. ' +
    'Do not submit this form if you do not consent.\n\n' +
    'Contact: ' + SETTINGS.RESEARCH_EMAIL + '\n' +
    'Withdrawal by: ' + SETTINGS.WITHDRAWAL_DEADLINE + '\n' +
    'Raw data retention: ' + SETTINGS.RETENTION_PERIOD + '\n' +
    'Privacy information: ' + SETTINGS.PRIVACY_NOTICE_URL
  );
  consent.setConfirmationMessage('Thank you. Please tell the facilitator you submitted the consent form; no testing begins unless you have actively consented.');
  addText_(consent, 'C01 | Participant code (given to you by the researcher)', true);
  addSingleConfirmation_(consent, 'C02 | I confirm I am at least 18 years old.', 'Yes, I confirm');
  addSingleConfirmation_(consent, 'C03 | I have read the study information and understand participation is voluntary and that I can withdraw under the stated procedure.', 'Yes, I understand');
  addSingleConfirmation_(consent, 'C04 | I voluntarily consent to participate and to the use of de-identified notes and survey responses for this usability research.', 'Yes, I consent');
  addSingleConfirmation_(consent, 'C05 | I understand I must not enter passport, payment, identification or private travel details during the session.', 'Yes, I understand');
  // OPTIONAL: public quotation permission is separate from core study participation.
  const quotePermission = consent.addMultipleChoiceItem()
    .setTitle('C06 | Optional: I separately agree to short de-identified quotations appearing in a public report.')
    .setRequired(false);
  quotePermission.setChoices([quotePermission.createChoice('Yes, I agree to de-identified public quotations')]);

  const consentSheet = SpreadsheetApp.create('PRIVATE | PRISM UX Consent Responses | ' + SETTINGS.STUDY_ID);
  consent.setDestination(FormApp.DestinationType.SPREADSHEET, consentSheet.getId());
  properties.setProperty('PRISM_CONSENT_SHEET_ID', consentSheet.getId());

  const survey = FormApp.create('PRISM | Website Usability and SUS | ' + SETTINGS.STUDY_ID, false);
  properties.setProperty('PRISM_SUS_FORM_ID', survey.getId());
  configureForm_(survey);
  survey.setDescription(
    'Complete this form independently AFTER the six core website tasks.\n' +
    'For the ten SUS statements, “system” means the public PRISM website you just used. ' +
    'Answer according to your own experience. Do not include real personal travel details.\n' +
    'Research contact: ' + SETTINGS.RESEARCH_EMAIL
  );
  survey.setConfirmationMessage('Thank you. Your responses will inform PRISM website improvements. Your participant code can be used for withdrawal within the explained deadline.');
  addText_(survey, 'P01 | Participant code (given to you by the researcher)', true);

  survey.addSectionHeaderItem()
    .setTitle('System Usability Scale (SUS)')
    .setHelpText('Complete all 10 statements in order. 1 = Strongly disagree; 2 = Disagree; 3 = Neither agree nor disagree; 4 = Agree; 5 = Strongly agree. “System” means the PRISM public website.');

  SUS_ITEMS.forEach(function (statement, index) {
    const itemId = 'SUS' + ('0' + (index + 1)).slice(-2);
    survey.addScaleItem()
      .setTitle(itemId + ' | ' + statement)
      .setBounds(1, 5)
      .setLabels('Strongly disagree', 'Strongly agree')
      .setRequired(true);
  });

  survey.addPageBreakItem()
    .setTitle('Your experience of each task')
    .setHelpText('These supplementary ratings are separate from the standard SUS score. Respond based on the tasks you attempted.');

  TASKS.forEach(function (task) {
    survey.addSectionHeaderItem()
      .setTitle(task.id + ' | ' + task.title)
      .setHelpText(task.text);
    survey.addScaleItem()
      .setTitle(task.id + ' | How easy or difficult did you find this task?')
      .setBounds(1, 5)
      .setLabels('Very difficult', 'Very easy')
      .setRequired(false); // A task may be skipped or marked not-evaluable; do not force a rating.
    survey.addParagraphTextItem()
      .setTitle(task.id + ' | What, if anything, was confusing?')
      .setRequired(false);
  });

  survey.addPageBreakItem().setTitle('Overall impressions');
  addScale_(survey, 'F01 | How clear was it what PRISM can help you with?', true, 'Not clear at all', 'Extremely clear');
  addScale_(survey, 'F02 | How confident are you that you know the next step to enquire with PRISM?', true, 'Not at all confident', 'Extremely confident');
  addScale_(survey, 'F03 | How trustworthy did the website feel for an initial travel enquiry?', false, 'Not trustworthy', 'Very trustworthy');
  addParagraph_(survey, 'F04 | What worked particularly well?', false);
  addParagraph_(survey, 'F05 | What was the most frustrating or confusing part?', false);
  addParagraph_(survey, 'F06 | If you could change one thing, what would it be?', false);
  addParagraph_(survey, 'F07 | Was anything you expected missing?', false);

  const responseSheet = SpreadsheetApp.create('PRIVATE | PRISM UX SUS Responses | ' + SETTINGS.STUDY_ID);
  survey.setDestination(FormApp.DestinationType.SPREADSHEET, responseSheet.getId());
  properties.setProperty('PRISM_SUS_SHEET_ID', responseSheet.getId());

  // Publishing support was added to Forms service; older accounts may not support it.
  [consent, survey].forEach(function(form) {
    if (form.supportsAdvancedResponderPermissions()) form.setPublished(true);
  });

  Logger.log('CONSENT EDIT URL: ' + consent.getEditUrl());
  Logger.log('CONSENT RESPONDENT URL: ' + consent.getPublishedUrl());
  Logger.log('CONSENT PRIVATE RESPONSE SHEET: ' + consentSheet.getUrl());
  Logger.log('POST-SESSION EDIT URL: ' + survey.getEditUrl());
  Logger.log('POST-SESSION RESPONDENT URL: ' + survey.getPublishedUrl());
  Logger.log('POST-SESSION PRIVATE RESPONSE SHEET: ' + responseSheet.getUrl());
  Logger.log('Verify all settings and test submissions before fieldwork. Never publish private links or individual responses on GitHub.');
}

/**
 * Creates/refreshes a private SUS_Standardized tab in Sheet B, one row per response.
 * Does NOT erase raw Form responses. Export the tab manually as CSV to your private drive.
 */
function exportStandardizedSUS() {
  const properties = PropertiesService.getScriptProperties();
  const formId = properties.getProperty('PRISM_SUS_FORM_ID');
  const sheetId = properties.getProperty('PRISM_SUS_SHEET_ID');
  if (!formId || !sheetId) throw new Error('Run createPrismStudyForms() first.');

  const form = FormApp.openById(formId);
  const workbook = SpreadsheetApp.openById(sheetId);
  let out = workbook.getSheetByName('SUS_Standardized');
  if (!out) out = workbook.insertSheet('SUS_Standardized');
  out.clearContents();

  const header = ['participant_id', 'SUS01','SUS02','SUS03','SUS04','SUS05',
                  'SUS06','SUS07','SUS08','SUS09','SUS10'];
  const rows = [header];
  form.getResponses().forEach(function(formResponse) {
    const items = {};
    formResponse.getItemResponses().forEach(function(answer) {
      const key = answer.getItem().getTitle().split(' | ')[0].trim();
      items[key] = answer.getResponse();
    });
    const row = [String(items['P01'] || '').trim()];
    for (let i = 1; i <= 10; i++) {
      const key = 'SUS' + ('0' + i).slice(-2);
      // A missing response is left blank on purpose; Python scorer will reject it.
      row.push(items[key] === undefined ? '' : Number(items[key]));
    }
    rows.push(row);
  });
  out.getRange(1, 1, rows.length, header.length).setValues(rows);
  out.getRange(1, 1, 1, header.length).setFontWeight('bold');
  out.setFrozenRows(1);
  out.autoResizeColumns(1, header.length);
  Logger.log('Standardized responses: ' + (rows.length - 1));
  Logger.log('PRIVATE destination sheet: ' + workbook.getUrl());
  Logger.log('Download ONLY the SUS_Standardized tab as CSV, OUTSIDE the public Git repository.');
}

function validateSettings_() {
  ['RESEARCH_EMAIL','PRIVACY_NOTICE_URL','WITHDRAWAL_DEADLINE','RETENTION_PERIOD'].forEach(function(key) {
    const value = SETTINGS[key];
    if (!value || value.indexOf('[REPLACE') !== -1) {
      throw new Error('Set the approved SETTINGS.' + key + ' before creating real participant forms.');
    }
  });
}

function configureForm_(form) {
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false); // Avoid mandatory sign-in; duplicate codes checked during analysis.
  form.setIsQuiz(false);
  form.setPublishingSummary(false);
  form.setShowLinkToRespondAgain(false);
  form.setAllowResponseEdits(false);
  form.setShuffleQuestions(false);
  form.setProgressBar(true);
}

function addSingleConfirmation_(form, title, choiceText) {
  const question = form.addMultipleChoiceItem().setTitle(title).setRequired(true);
  question.setChoices([question.createChoice(choiceText)]);
}
function addText_(form, title, required) {
  form.addTextItem().setTitle(title).setRequired(required);
}
function addParagraph_(form, title, required) {
  form.addParagraphTextItem().setTitle(title).setRequired(required);
}
function addScale_(form, title, required, lowLabel, highLabel) {
  form.addScaleItem().setTitle(title).setBounds(1, 5)
      .setLabels(lowLabel, highLabel).setRequired(required);
}
