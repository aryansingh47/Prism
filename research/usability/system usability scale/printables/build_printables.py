#!/usr/bin/env python3
"""Generate professional, print-ready companion PDFs. Requires reportlab.

Usage (from repo root): python3 printables/build_printables.py
These PDFs are static field handouts; Markdown docs are the editable source of truth.
"""
from pathlib import Path
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    Table, TableStyle, PageBreak, KeepTogether, HRFlowable,
)

ROOT = Path(__file__).resolve().parent
NAVY = colors.HexColor('#163456')
INK = colors.HexColor('#23354B')
BLUE = colors.HexColor('#2570AC')
ORANGE = colors.HexColor('#EE8C44')
MUTED = colors.HexColor('#65788C')
LINE = colors.HexColor('#D9E3EA')
PALE = colors.HexColor('#F2F6F8')

font_dir = Path('/usr/share/fonts/truetype/dejavu')
if font_dir.exists():
    pdfmetrics.registerFont(TTFont('PrismSans', str(font_dir/'DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('PrismSansBold', str(font_dir/'DejaVuSans-Bold.ttf')))
    pdfmetrics.registerFontFamily('PrismSans', normal='PrismSans', bold='PrismSansBold')
else:
    raise RuntimeError('DejaVu font not available for PDF generation')

S = {
    'title': ParagraphStyle('PTitle', fontName='PrismSansBold', fontSize=22, leading=29, textColor=NAVY, spaceAfter=8),
    'intro': ParagraphStyle('PIntro', fontName='PrismSans', fontSize=10, leading=16, textColor=INK, spaceAfter=10),
    'h1': ParagraphStyle('PH1', fontName='PrismSansBold', fontSize=12.2, leading=18, textColor=NAVY, spaceBefore=13, spaceAfter=7),
    'h2': ParagraphStyle('PH2', fontName='PrismSansBold', fontSize=10.4, leading=16, textColor=NAVY, spaceBefore=8, spaceAfter=5),
    'body': ParagraphStyle('PBody', fontName='PrismSans', fontSize=9, leading=15, textColor=INK, spaceAfter=7),
    'small': ParagraphStyle('PSmall', fontName='PrismSans', fontSize=7.8, leading=12, textColor=INK),
    'muted': ParagraphStyle('PMuted', fontName='PrismSans', fontSize=8, leading=13, textColor=MUTED, spaceAfter=8),
    'task': ParagraphStyle('PTask', fontName='PrismSans', fontSize=10, leading=17, textColor=INK, spaceAfter=8),
    'table': ParagraphStyle('PTable', fontName='PrismSans', fontSize=7.5, leading=11, textColor=INK),
    'tablebold': ParagraphStyle('PTableBold', fontName='PrismSansBold', fontSize=7.4, leading=11, textColor=NAVY),
}


def p(text, kind='body'):
    return Paragraph(text.replace('&', '&amp;'), S[kind]) if '&' in text and '&amp;' not in text else Paragraph(text, S[kind])


def header(canvas, doc):
    w, h = A4
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, h - 14*mm, w, 14*mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont('PrismSansBold', 9)
    canvas.drawString(18*mm, h - 9.2*mm, 'PRISM  /  TRAVEL & ADVISORY')
    canvas.setFillColor(ORANGE)
    canvas.rect(w - 36*mm, h - 14*mm, 18*mm, 14*mm, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(18*mm, 19*mm, w - 18*mm, 19*mm)
    canvas.setFillColor(MUTED)
    canvas.setFont('PrismSans', 7)
    canvas.drawString(18*mm, 14*mm, 'PRISM-UX-001  |  Internal research handout  |  21 Nov 2026')
    canvas.drawRightString(w-18*mm, 14*mm, f'Page {doc.page}')
    canvas.restoreState()


def document(filename, story):
    path = ROOT/filename
    doc = BaseDocTemplate(str(path), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm,
                          topMargin=23*mm, bottomMargin=26*mm,
                          title=filename.replace('_', ' '), author='PRISM Research Team')
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, leftPadding=0,
                  rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates(PageTemplate(id='basic', frames=[frame], onPage=header))
    doc.build(story)
    print(f'Created {path.name}')


def start(title, subtitle):
    return [Spacer(1, 7*mm), p(title, 'title'), p(subtitle, 'muted'),
            HRFlowable(width='100%', thickness=1.5, color=ORANGE, spaceAfter=13)]


def card(tag, title, body, finish):
    inner = [p(tag.upper()+'  /  '+title, 'h1'), p(body, 'task'), p('<b>Finish when:</b> '+finish, 'small'), Spacer(1, 5*mm)]
    return KeepTogether(inner)


def row_lines(n=2, gap=8*mm):
    return [Spacer(1, gap)] + [HRFlowable(width='100%', thickness=.6, color=LINE, spaceAfter=7*mm) for _ in range(n)]

# Participant task cards
story = start('Participant task cards', 'PRISM website study · Six tasks · Participant code: P_______ · Website: [CONFIRM LIVE URL]')
story += [p('We are assessing the website, not you. Please speak aloud about what you expect and what feels unclear. Navigate naturally. You can stop or skip a task at any time.'),
          p('<b>Important:</b> No real booking, payment, private contact information, passport details or submitted enquiry. When you find a place where you would submit information, stop and tell the facilitator.'), Spacer(1, 3*mm)]
TASKS = [
 ('T01', 'Discover the offering', 'You have heard about TRIP by PRISM but do not know much about it. Explore the website, then tell us which kinds of travel services the company provides. Identify at least two distinct services.', 'You can explain what PRISM does, or you cannot find enough information.'),
 ('T02', 'Look for a leisure holiday', 'You are considering a short personal holiday. Find a relevant holiday or package option, or show how you would request a tailored holiday. Tell us what information you would check before going further.', 'You find a useful option or a clear next step, or would give up.'),
 ('T03', 'Flight and hotel enquiry', 'You would like PRISM to arrange a domestic flight and hotel. Find how you would ask for assistance and explain what details the site appears to need. Do not submit anything.', 'You reach a suitable enquiry step or cannot find one.'),
 ('T04', 'Corporate travel', 'You are coordinating travel for eight colleagues who need transport and accommodation for a work event. Find corporate or group travel support and the appropriate next enquiry step.', 'You identify an appropriate service and next step, or cannot find one.'),
 ('T05', 'Contact a person', 'You have an itinerary question and want to speak with a real person before committing. Find a suitable contact channel and explain why you would use it. Do not send a real message.', 'You can describe a contact route or cannot find one.'),
 ('T06', 'Combined travel request', 'You need help with flights, accommodation and airport-to-hotel transfers for one trip. Show or explain how you would ask PRISM to organise this and what you expect to happen next.', 'You identify a plausible next step or cannot find one.'),
]
for i, item in enumerate(TASKS):
    story.append(card(*item))
    if i == 2:
        story.append(PageBreak())
story += [Spacer(1, 4*mm), p('After all six tasks', 'h1'),
          p('Please complete the separate ten-question usability questionnaire <b>independently</b>. Your honest first impression is the most useful response.'),
          p('You can also tell us about anything that worked especially well or felt difficult.'),
          p('Participant notes (optional):', 'h2')] + row_lines(3, 6*mm)
document('PRISM_Participant_Task_Cards.pdf', story)

# Consent and information sheet
story = start('Participant information & consent', 'PRISM-UX-001 · Complete organisation-approved fields before printing')
story += [p('<b>Study owner:</b> [RESEARCH TEAM]   ·   <b>Contact:</b> [APPROVED RESEARCH EMAIL]'),
          p('<b>Why are we doing this?</b>', 'h1'),
          p('We want to find out how clearly the TRIP by PRISM website explains its travel services and how easy it is to find travel and contact information. We are evaluating the site, not your ability.'),
          p('<b>What will happen?</b>', 'h1'),
          p('You will try up to six travel-planning scenarios, describe your thoughts while browsing, and then complete a ten-question usability survey. A researcher may write down what you do and say and measure time taken. Expect approximately 40–50 minutes. No real enquiry, booking, payment or identity documents are needed.'),
          p('<b>Voluntary participation</b>', 'h1'),
          p('You can skip any task, ask to pause or stop without giving a reason. You may request withdrawal of code-linked responses by contacting the research team before [APPROVED WITHDRAWAL DEADLINE], using your participant code. Irreversibly de-identified or aggregated responses may no longer be individually removable.'),
          p('<b>Information handling</b>', 'h1'),
          p('The study normally uses written notes only. Audio, video and screen recording are OFF unless you separately opt in to a specifically approved activity. The questionnaire uses a participant code, not your name. Forms and raw observations are stored privately with restricted research-team access. No identifying raw responses will be posted to GitHub. Records are deleted after [APPROVED RETENTION PERIOD], subject to approved exceptions.'),
          p('<b>Research contact and privacy information</b>', 'h1'),
          p('Email: [APPROVED RESEARCH EMAIL]<br/>Privacy notice: [APPROVED PRIVACY NOTICE URL]'),
          PageBreak(), Spacer(1, 8*mm), p('Consent confirmation', 'title'),
          p('Read and confirm the checklist below only if you voluntarily agree to take part. If you decline, do not begin the session.'),
          p('Participant code: P_____________        Date: ____________________'),
          p('[  ] I am 18 or older.<br/>[  ] I have read the information above and know I can ask questions or stop.<br/>[  ] I voluntarily agree to the usability study and de-identified use of my notes and survey answers.<br/>[  ] I understand the withdrawal procedure and that real personal/payment details are not required.'),
          Spacer(1, 5*mm), p('Optional, separate permissions (unchecked means NO):', 'h2'),
          p('[  ] Audio recording     [  ] Screen/video recording     [  ] De-identified quote in public report'),
          p('Participant confirmation: ____________________    Researcher: ____________________'),
          Spacer(1, 6*mm), p('Important for the organising team', 'h2'),
          p('Review and approve the privacy/retention statements, remove placeholders, and only enable optional recording after separate informed consent. The separate Google consent form is the recommended digital confirmation method.', 'muted')]
document('PRISM_Participant_Information_Consent.pdf', story)

# Paper SUS backup
questions = [
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
]
story = start('System Usability Scale (SUS)', 'Paper backup · Complete after all six core tasks · Participant code: P________')
story += [p('For all ten statements, <b>“system” means the PRISM public website you just used</b>. Mark exactly one number for each statement. Please answer independently using your overall experience.'),
          p('<b>1</b> Strongly disagree   ·   <b>2</b> Disagree   ·   <b>3</b> Neither agree nor disagree   ·   <b>4</b> Agree   ·   <b>5</b> Strongly agree', 'small'), Spacer(1, 4*mm)]
table_data = [[p('Item', 'tablebold'), p('Statement', 'tablebold')] + [p(str(i), 'tablebold') for i in range(1,6)]]
for idx, statement in enumerate(questions, 1):
    table_data.append([p(str(idx), 'tablebold'), p(statement, 'table')] + [p('[  ]', 'small') for _ in range(5)])
t = Table(table_data, colWidths=[12*mm, 119*mm] + [8.5*mm]*5, repeatRows=1, hAlign='LEFT')
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),PALE),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ('LINEBELOW',(0,0),(-1,0),1,BLUE),('LINEBELOW',(0,1),(-1,-1),.4,LINE),
    ('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),3),
    ('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
story += [t, Spacer(1, 6*mm), p('<b>Researcher note:</b> Do not calculate or show scores while the participant is answering. This is the standard ten-item questionnaire; task-specific questions are separate.', 'muted')]
document('PRISM_SUS_Questionnaire_Paper_Backup.pdf', story)

# Observer scorecard
story = start('Observer scorecard', 'Researcher only · T01–T06 · Do not hand this sheet to participants')
story += [p('Participant code: P________   Date: ______________    Build/commit: ________________________'),
          p('Device/browser: _________________________    Facilitator: ___________    Observer: ___________'),
          p('Session start: ___________   Consent verified: [  ] YES   Recording: [  ] OFF / [  ] separately authorised'),
          p('Record each attempt with elapsed time. H0=no help, H1=generic encouragement after blockage, H2=directional help. Successful outcomes may be aided or unaided.', 'muted')]
headers = ['Task', 'Status*', 'Time (s)', 'Hint', 'Errors', 'Observed path / issue ID']
rows = [[p(c, 'tablebold') for c in headers]] + [[p(f'T{i:02d}', 'tablebold'), '', '', '', '', ''] for i in range(1,7)]
t = Table(rows, colWidths=[16*mm, 36*mm, 23*mm, 17*mm, 19*mm, 63*mm], rowHeights=[14*mm]+[15*mm]*6)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),PALE),('GRID',(0,0),(-1,-1),.5,LINE),
                       ('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),5)]))
story += [t, Spacer(1, 4*mm), p('*Status codes: success_unassisted / success_assisted / partial / failed / not_evaluable.', 'small'),
          p('Major moments and exact participant quotations', 'h1')]
for i in range(1,4):
    story += [p(f'Observation / quote {i}:', 'small')] + row_lines(1, 8*mm)
story += [PageBreak(), Spacer(1, 10*mm), p('Additional notes and debrief', 'title'),
          p('Participant code: P________     Session interruption or technology problem: ____________________'),
          p('Click paths, confusion, assistance, and technical incidents', 'h1')]
story += row_lines(6, 10*mm)
story += [p('Open-ended debrief observations', 'h1')]
story += row_lines(4, 10*mm)
story += [p('Post-session researcher check', 'h1'),
          p('[  ] Consent confirmed  [  ] All six task rows recorded  [  ] SUS survey submitted'),
          p('[  ] Quotes de-identified  [  ] Actual site build logged  [  ] No personal data recorded'),
          p('[  ] Any high-risk privacy/security incidents escalated privately'),
          p('Observer sign-off: ______________________________________   Time: _______________')]
document('PRISM_Observer_Scorecard.pdf', story)
