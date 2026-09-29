# CAT Exam Simulator

A standalone CAT-style computer-based test simulator.

## Requirements

- Windows / macOS / Linux
- Any modern browser: Chrome, Edge, Firefox, Safari
- No Python installation required
- No Node.js required
- No internet connection required after the files are copied

## Run

1. Keep all three files in the same folder:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `questions.js`
2. Double-click `index.html`.
3. The simulator opens in your browser.

## Included

- VARC: 24 questions
- DILR: 22 questions
- QA: 22 questions
- 40-minute timer per section
- Locked section navigation
- MCQ questions with four options
- TITA / non-MCQ questions
- +3 correct
- -1 wrong MCQ
- 0 negative marking for TITA
- Save & Next
- Previous
- Clear Response
- Mark for Review & Next
- Question palette
- Answered / Not Answered / Not Visited / Marked / Answered+Marked states
- On-screen basic calculator
- Section submission
- Final score report

## Editing the question bank

Open `questions.js`.

MCQ example:

{
  type: "mcq",
  question: "Your question",
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: 0
}

`answer: 0` means A, `1` means B, `2` means C, `3` means D.

TITA example:

{
  type: "tita",
  question: "What is 15% of 200?",
  answer: "30"
}

## Important

This distribution intentionally contains NO questions or answer key.
It is a blank CAT CBT shell. The question area displays only identifiers such as Q1 VARC, Q1 LR, and Q1 QA.

The simulator is designed to reproduce the CBT mechanics, not to claim that its score converts directly to an official CAT percentile.

## Customisation

The easiest workflow is:

1. Keep `index.html`, `styles.css`, and `app.js` unchanged.
2. Replace the contents of `questions.js` with your own CAT-quality bank.
3. Keep the required section lengths:
   - VARC = 24
   - DILR = 22
   - QA = 22

If you want a larger question bank, `questions.js` can be extended and `app.js` can later be changed to randomly select a fixed number of questions from a larger pool.

## Folder structure

CAT_Exam_Simulator/
├── index.html
├── styles.css
├── app.js
├── questions.js
└── README.md


## Blank-paper mode

The default `questions.js` contains only placeholders.

The simulator therefore works as a CAT CBT/navigation shell:
- VARC: Q1 VARC through Q24 VARC
- LR: Q1 LR through Q22 LR
- QA: Q1 QA through Q22 QA

This is useful if you have a separate mock paper/PDF and want to reproduce the
timed CBT environment without loading its questions into the simulator.

When you are ready to load a real paper, replace `questions.js` with a populated
question bank. The application engine does not need to be changed.


## Placeholder MCQ mode

The blank simulator displays a question identifier instead of question text:
- `Q1 VARC`, `Q2 VARC`, etc.
- `Q1 LR`, `Q2 LR`, etc.
- `Q1 QA`, `Q2 QA`, etc.

Every placeholder has four selectable answer buttons:
- A
- B
- C
- D

Selecting an option updates the CAT-style question palette as an answerable
question. There is intentionally no answer key in this blank mode, so the
session is for reproducing the CBT experience with a separate mock paper.


## Final response audit

After all three sections are submitted, the final page shows every response
in section order, for example:

Q1 LR       A
Q2 LR       NotAttempted
Q3 LR       C

Q1 VARC     B
Q2 VARC     NotAttempted

Q1 QA       D

If a question was marked for review, the final record also indicates
`· Marked`.

The response audit works both for the blank placeholder mode and for a future
populated question bank.
"# CatCBT_Simulator" 
