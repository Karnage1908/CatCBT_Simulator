/*
  BLANK CAT MOCK PAPER SHELL

  Default display:
    VARC: Q1 VARC ... Q24 VARC
    LR:   Q1 LR   ... Q22 LR
    QA:   Q1 QA   ... Q22 QA

  No question text or answer key is included.

  Each placeholder is treated as an MCQ so that A/B/C/D can be selected.
  When a real paper is loaded later, questions.js can be replaced with
  actual MCQ/TITA questions without changing the simulator engine.
*/

const QUESTION_BANK = {
  VARC: Array.from({length: 24}, (_, i) => ({
    type: "placeholder",
    label: `Q${i + 1} VARC`
  })),

  DILR: Array.from({length: 22}, (_, i) => ({
    type: "placeholder",
    label: `Q${i + 1} LR`
  })),

  QA: Array.from({length: 22}, (_, i) => ({
    type: "placeholder",
    label: `Q${i + 1} QA`
  }))
};
