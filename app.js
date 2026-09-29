(() => {
  "use strict";

  const SECTION_LENGTHS = { VARC: 24, DILR: 22, QA: 22 };
  const SECTION_TIME = 40 * 60;

  let currentSection = "VARC";
  let currentIndex = 0;
  let remaining = SECTION_TIME;
  let timerId = null;

  const state = {};
  for (const section of Object.keys(SECTION_LENGTHS)) {
    state[section] = QUESTION_BANK[section].map(() => ({
      visited: false,
      answer: null,
      saved: false,
      marked: false
    }));
  }

  const $ = id => document.getElementById(id);

  function currentQuestion() {
    return QUESTION_BANK[currentSection][currentIndex];
  }

  function currentState() {
    return state[currentSection][currentIndex];
  }

  function status(q) {
    if (q.marked && q.saved) return "answeredmarked";
    if (q.marked) return "marked";
    if (q.saved) return "answered";
    if (q.visited) return "notanswered";
    return "notvisited";
  }

  function renderQuestion() {
    const q = currentQuestion();
    const st = currentState();
    st.visited = true;

    $("sectionLabel").textContent =
      `${currentSection} · Question ${currentIndex + 1} of ${SECTION_LENGTHS[currentSection]}`;

    let html = `
      <div class="question-meta">
        Question ${currentIndex + 1} &nbsp; | &nbsp;
        ${q.type === "placeholder" ? "MCQ" : (q.type === "tita" ? "TITA / Non-MCQ" : "MCQ")}
        &nbsp; | &nbsp; Correct: +3 &nbsp; | &nbsp; Negative: ${q.type === "tita" ? "0" : "−1"}
      </div>
    `;

    if (q.type === "placeholder") {
      html += `
        <div class="placeholder-question">
          <div class="placeholder-label">${escapeHTML(q.label)}</div>
          <div class="placeholder-note">Blank question slot — select an option from A, B, C or D.</div>
        </div>

        <div class="placeholder-options">
          ${["A","B","C","D"].map((letter, i) => `
            <button
              type="button"
              class="answer-button ${st.answer === i ? "selected" : ""}"
              data-placeholder-answer="${i}">
              <span class="answer-letter">${letter}</span>
              <span class="answer-text">Option ${letter}</span>
            </button>
          `).join("")}
        </div>
      `;
    } else {
      if (currentSection === "VARC" && [0, 7, 15].includes(currentIndex)) {
        html += `
          <div class="passage">
            <strong>Reading context</strong><br>
            ${escapeHTML(q.passage || "")}
          </div>`;
      }

      html += `<div class="question-text"><strong>${escapeHTML(q.question)}</strong></div>`;

      if (q.type === "mcq") {
        q.options.forEach((option, i) => {
          html += `
            <label class="option">
              <input type="radio" name="answer" value="${i}" ${st.answer === i ? "checked" : ""}>
              <span>${String.fromCharCode(65 + i)}. ${escapeHTML(option)}</span>
            </label>`;
        });
      } else {
        html += `
          <input id="titaInput" class="tita"
            inputmode="decimal"
            autocomplete="off"
            placeholder="Enter numerical answer"
            value="${st.answer === null ? "" : escapeAttribute(st.answer)}">`;
      }
    }

    $("questionArea").innerHTML = html;

    document.querySelectorAll("[data-placeholder-answer]").forEach(button => {
      button.addEventListener("click", () => {
        st.answer = Number(button.dataset.placeholderAnswer);
        st.saved = false;
        st.marked = false;

        document.querySelectorAll("[data-placeholder-answer]").forEach(b => {
          b.classList.toggle("selected", b === button);
        });

        renderPalette();
      });
    });

    document.querySelectorAll('#questionArea input[type="radio"]').forEach(input => {
      input.addEventListener("change", e => {
        st.answer = Number(e.target.value);
      });
    });

    const tita = $("titaInput");
    if (tita) {
      tita.addEventListener("input", e => {
        st.answer = e.target.value;
      });
    }

    renderPalette();
  }

  function renderPalette() {
    const grid = $("paletteGrid");
    grid.innerHTML = "";

    state[currentSection].forEach((q, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `palette-btn ${status(q)} ${i === currentIndex ? "current" : ""}`;
      button.textContent = i + 1;
      button.title = status(q);
      button.addEventListener("click", () => {
        currentIndex = i;
        renderQuestion();
      });
      grid.appendChild(button);
    });

    const answered = state[currentSection].filter(q => q.saved).length;
    const marked = state[currentSection].filter(q => q.marked).length;
    const notAnswered = state[currentSection].filter(q => q.visited && !q.saved).length;
    const notVisited = state[currentSection].filter(q => !q.visited).length;

    $("sectionSummary").innerHTML = `
      <strong>Section summary</strong><br>
      Answered: ${answered}<br>
      Not Answered: ${notAnswered}<br>
      Marked: ${marked}<br>
      Not Visited: ${notVisited}
    `;
  }

  function saveAndNext() {
    const q = currentState();
    q.saved = true;
    q.marked = false;
    nextQuestion();
  }

  function markAndNext() {
    const q = currentState();
    q.marked = true;
    q.saved = true;
    nextQuestion();
  }

  function clearResponse() {
    const q = currentState();
    q.answer = null;
    q.saved = false;
    renderQuestion();
  }

  function nextQuestion() {
    if (currentIndex < SECTION_LENGTHS[currentSection] - 1) {
      currentIndex++;
      renderQuestion();
    } else {
      submitSection();
    }
  }

  function submitSection() {
    if (currentSection === "VARC") {
      switchSection("DILR");
    } else if (currentSection === "DILR") {
      switchSection("QA");
    } else {
      finishExam();
    }
  }

  function switchSection(section) {
    currentSection = section;
    currentIndex = 0;
    remaining = SECTION_TIME;

    document.querySelectorAll(".section-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.section === section);
    });

    renderQuestion();
  }

  function finishExam() {
    clearInterval(timerId);
    $("examView").classList.add("hidden");
    $("calculator").classList.add("hidden");
    $("results").classList.remove("hidden");

    let total = 0;
    let cards = "";
    let responseSections = "";

    for (const section of Object.keys(SECTION_LENGTHS)) {
      let correct = 0;
      let wrong = 0;
      let unattempted = 0;

      QUESTION_BANK[section].forEach((q, i) => {
        const answer = state[section][i].answer;

        if (answer === null || answer === "") {
          unattempted++;
        } else if (q.type !== "placeholder") {
          const correctAnswer = String(q.answer).trim().toLowerCase();
          const submitted = String(
            q.type === "mcq" ? q.options[Number(answer)] : answer
          ).trim().toLowerCase();

          if (submitted === correctAnswer) {
            correct++;
          } else if (q.type === "mcq") {
            wrong++;
          }
        }
      });

      const score = correct * 3 - wrong;
      total += score;

      cards += `
        <div class="score-card">
          <strong>${section}</strong>
          <div class="score">${score}</div>
          <small>${correct} correct · ${wrong} wrong · ${unattempted} unattempted</small>
        </div>`;

      /*
        Complete response audit.
        Placeholder questions use the labels from questions.js.
        Real MCQs/TITAs are also supported when a real question bank is loaded.
      */
      let rows = "";

      QUESTION_BANK[section].forEach((q, i) => {
        const st = state[section][i];

        let label;
        if (q.type === "placeholder") {
          label = q.label;
        } else {
          label = `Q${i + 1} ${section === "DILR" ? "LR" : section}`;
        }

        let response = "NotAttempted";

        if (st.answer !== null && st.answer !== "") {
          if (q.type === "placeholder") {
            response = String.fromCharCode(65 + Number(st.answer));
          } else if (q.type === "mcq") {
            response = String.fromCharCode(65 + Number(st.answer));
          } else {
            response = String(st.answer);
          }
        }

        const marked = st.marked ? " · Marked" : "";

        rows += `
          <div class="response-row">
            <span class="response-question">${escapeHTML(label)}</span>
            <span class="response-answer">${escapeHTML(response)}${marked}</span>
          </div>`;
      });

      responseSections += `
        <section class="response-section">
          <h3>${section === "DILR" ? "LR" : section}</h3>
          <div class="response-list">${rows}</div>
        </section>`;
    }

    $("results").innerHTML = `
      <h1>Mock Test Submitted</h1>

      <div class="notice">
        Complete response record for this mock. No answer key is loaded in
        blank-paper mode, so this page records your submitted responses rather
        than evaluating them.
      </div>

      <h2>Submitted Answers</h2>
      <div class="response-audit">
        ${responseSections}
      </div>

      <h2>Session Summary</h2>
      <div class="score-grid">${cards}</div>

      <div class="score-card" style="margin-top:12px">
        <strong>Total Raw Score</strong>
        <div class="score">${total}</div>
        <small>
          In blank-paper mode this score is not meaningful because there is no
          answer key.
        </small>
      </div>

      <button id="restartBtn" class="btn primary" style="margin-top:16px">
        Restart Mock
      </button>
    `;

    $("restartBtn").addEventListener("click", () => location.reload());
  }

  function updateTimer() {
    remaining--;

    if (remaining <= 0) {
      remaining = 0;
      updateTimerDisplay();
      submitSection();
      return;
    }

    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    $("timer").textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function toggleCalculator() {
    $("calculator").classList.toggle("hidden");
  }

  function setupCalculator() {
    document.querySelectorAll("[data-calc]").forEach(button => {
      button.addEventListener("click", () => {
        const value = button.dataset.calc;
        const display = $("calcDisplay");

        if (value === "C") {
          display.value = "";
        } else if (value === "=") {
          try {
            // Calculator is intentionally limited to button-generated arithmetic.
            if (!/^[0-9+\-*/.() ]+$/.test(display.value)) {
              throw new Error("Invalid expression");
            }
            display.value = String(Function(`"use strict"; return (${display.value})`)());
          } catch {
            display.value = "Error";
          }
        } else {
          display.value += value;
        }
      });
    });
  }

  function setupEvents() {
    $("saveBtn").addEventListener("click", saveAndNext);
    $("markBtn").addEventListener("click", markAndNext);
    $("clearBtn").addEventListener("click", clearResponse);

    $("previousBtn").addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
      }
    });

    $("submitBtn").addEventListener("click", () => {
      const confirmed = confirm(
        `Submit ${currentSection}? You will move to the next section and cannot return to this section.`
      );
      if (confirmed) submitSection();
    });

    $("calculatorBtn").addEventListener("click", toggleCalculator);

    $("paperBtn").addEventListener("click", () => {
      $("paperSection").textContent = currentSection;
      $("paper").classList.remove("hidden");
    });

    $("closePaper").addEventListener("click", () => {
      $("paper").classList.add("hidden");
    });

    document.querySelectorAll(".section-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        // CAT sections are locked. Clicking another section does nothing.
        if (tab.dataset.section !== currentSection) {
          alert("Section navigation is locked. Complete the current section first.");
        }
      });
    });
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHTML(value).replaceAll("\n", "");
  }

  setupEvents();
  setupCalculator();
  renderQuestion();
  updateTimerDisplay();
  timerId = setInterval(updateTimer, 1000);
})();
