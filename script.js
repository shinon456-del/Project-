
    // Speak aloud helper
    function speak(text) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
      } catch (e) { /* no-op */ }
    }

    // Poster carousel
    const posters = [
      { src: "style.png", alt: "Flyer – 5-Day Challenge" },
      { src: "poster.png", alt: "Emergency Response Course Poster" }
    ];
    function showPoster(index) {
      const img = document.getElementById("carousel-image");
      if (!img) return;
      img.src = posters[index].src;
      img.alt = posters[index].alt;
    }

    // Section nav handling (fade-in between sections)
    const navLinks = document.querySelectorAll("nav a");
    const sections = document.querySelectorAll("main section");
    const modalMap = {
      audio: "audioModal",
      video: "videoModal",
      quiz: "quizModal",
      polls: "pollsModal"
    };

    function activateSection(id) {
      sections.forEach(sec => sec.classList.remove("active"));
      navLinks.forEach(l => l.classList.remove("active"));
      const target = document.getElementById(id);
      if (target) target.classList.add("active");
      const link = document.querySelector(`nav a[href="#${id}"]`);
      if (link) link.classList.add("active");
      document.querySelector("main").scrollIntoView({ behavior: "smooth" });
    }

    navLinks.forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        if (modalMap[targetId]) {
          openModal(modalMap[targetId]);
          navLinks.forEach(l => l.classList.remove("active"));
          link.classList.add("active");
        } else {
          activateSection(targetId);
        }
      });
    });

    // Challenge CTA behavior (activates section)
    document.getElementById("challengeCta").addEventListener("click", e => {
      e.preventDefault();
      activateSection("challenge");
    });

    // Show the first section by default
    activateSection("print");

    // Modal controls
    function openModal(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
      modal.addEventListener("click", function overlayClose(evt) {
        if (evt.target === modal) {
          closeModal(id);
          modal.removeEventListener("click", overlayClose);
        }
      });
      function escClose(evt) {
        if (evt.key === "Escape") {
          closeModal(id);
          document.removeEventListener("keydown", escClose);
        }
      }
      document.addEventListener("keydown", escClose);
    }
    function closeModal(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }

    // Utility: loader + result (available if needed)
    function showLoader(targetId) {
      const target = document.getElementById(targetId);
      if (!target) return;
      target.innerHTML = `
        Processing <span class="loader"></span>
        <div class="progress-container">
          <div class="progress-bar" id="${targetId}-bar"></div>
        </div>`;
      setTimeout(() => {
        const bar = document.getElementById(`${targetId}-bar`);
        if (bar) bar.style.width = "100%";
      }, 50);
    }
    function showResult(targetId, message, isSuccess=true) {
      const resultDiv = document.getElementById(targetId);
      if (!resultDiv) return;
      resultDiv.className = 'fade-in show';
      const icon = isSuccess ? '✔' : '✖';
      resultDiv.textContent = `${message} ${icon}`;
      speak(message);
    }

    // Polls logic: unified multi-poll setup
    function setupPoll(formId, resultId, chartId) {
      const form = document.getElementById(formId);
      if (!form) return;

      const radios = [...form.querySelectorAll("input[type=radio]")];
      const options = radios.map(r => r.value);

      const counts = {};
      options.forEach(o => counts[o] = 0);
      let total = 0;

      function updateChart() {
        if (!total) return;
        options.forEach(opt => {
          const bar = document.querySelector(`#${chartId} .bar[data-value="${opt}"]`);
          if (bar) bar.style.width = (counts[opt] / total * 100) + "%";
        });
      }

      form.addEventListener("submit", e => {
        e.preventDefault();
        const groupName = radios[0]?.name;
        const formData = new FormData(form);
        const choice = formData.get(groupName);
        if (!choice) {
          const resultDiv = document.getElementById(resultId);
          if (resultDiv) resultDiv.textContent = "Please select an option.";
          return;
        }
        counts[choice]++;
        total++;
        const resultDiv = document.getElementById(resultId);
        if (resultDiv) resultDiv.textContent = `You voted: ${choice}`;
        updateChart();
      });
    }

    // Initialize all polls
    setupPoll("poll-kit", "poll-kit-result", "poll-kit-chart");
    setupPoll("poll-item", "poll-item-result", "poll-item-chart");
    setupPoll("poll-confidence", "poll-confidence-result", "poll-confidence-chart");
    setupPoll("poll-location", "poll-location-result", "poll-location-chart");
    setupPoll("poll-drill", "poll-drill-result", "poll-drill-chart");
    setupPoll("poll-platform", "poll-platform-result", "poll-platform-chart");

    // -----------------------
    // Fixed + Enhanced Quiz
    // -----------------------
    let quizCorrect = 0;
    let quizIncorrect = 0;
    let quizAttempts = 0;

    function updateQuizChart() {
      const totalQuestions = 7;
      if (quizAttempts === 0) {
        document.getElementById("bar-correct").style.width = "0%";
        document.getElementById("bar-incorrect").style.width = "0%";
        return;
      }
      const correctPercent = (quizCorrect / (quizAttempts * totalQuestions)) * 100;
      const incorrectPercent = 100 - correctPercent;
      document.getElementById("bar-correct").style.width = correctPercent + "%";
      document.getElementById("bar-incorrect").style.width = incorrectPercent + "%";
    }

    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
      quizForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const fd = new FormData(e.target);

        const answers = {
          q1: 'drop',
          q2: 'exit',
          q3: 'water',
          q4: 'exit',
          q5: 'monthly',
          q6: 'indoors',
          q7: 'proof'
        };

        let score = 0;
        Object.keys(answers).forEach(q => {
          const userAnswer = fd.get(q);
          const fb = document.getElementById(`fb-${q}`);
          if (userAnswer === answers[q]) {
            score++;
            if (fb) fb.textContent = "✅ Correct!";
          } else {
            if (fb) fb.textContent = "❌ Try again.";
          }
        });

        quizAttempts++;
        quizCorrect += score;
        quizIncorrect += (Object.keys(answers).length - score);

        const result = `Score: ${score}/7 — ${score === 7 ? "Perfect! Share your score with #ReadyTogetherCDO." : "Keep practicing, you’re getting better!"}`;
        document.getElementById('quiz-result').textContent = result;
        speak(result);
        updateQuizChart();
      });
    }

    // Reset button
    const resetBtn = document.getElementById("resetQuiz");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        quizCorrect = 0;
        quizIncorrect = 0;
        quizAttempts = 0;
        document.getElementById("quiz-result").textContent = "";
        document.querySelectorAll(".feedback").forEach(fb => fb.textContent = "");
        if (quizForm) quizForm.reset();
        updateQuizChart();
      });
    }

    // Download score
    const downloadBtn = document.getElementById("downloadScore");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const scoreText = `#ReadyTogetherCDO Quiz\nAttempts: ${quizAttempts}\nCorrect answers (total): ${quizCorrect}\nIncorrect answers (total): ${quizIncorrect}\n`;
        const blob = new Blob([scoreText], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "quiz_score.txt";
        link.click();
      });
    }
  
