import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9Bb5XCQ4CSARFIn0Nmp_h56vJ0NDkpcU",
  authDomain: "login-89019.firebaseapp.com",
  projectId: "login-89019",
  storageBucket: "login-89019.firebasestorage.app",
  messagingSenderId: "342909176790",
  appId: "1:342909176790:web:583d43c716c8205f777277",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "admin@gmail.com";
const TEST_ID = "English";
const DURATION_MINUTES = 10;

const qArea = document.getElementById("questionArea");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const feedbackEl = document.getElementById("feedback");
const timerEl = document.getElementById("timer");
const logoutBtn = document.getElementById("logout");
const adminBtn = document.getElementById("adminPanelBtn");

let questions = window.ENGLISH_QUESTIONS;

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
shuffle(questions);
questions.forEach((q) => {
  const c = q.options[q.answerIndex];
  shuffle(q.options);
  q.answerIndex = q.options.indexOf(c);
});

let currentIndex = 0,
  answers = {},
  hasSubmitted = false,
  remainingSeconds = DURATION_MINUTES * 60,
  timerInterval = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please login first");
    location.href = "index1.html";
  }
  if (user.email === ADMIN_EMAIL) adminBtn.style.display = "inline-block";
});

logoutBtn.onclick = () =>
  signOut(auth).then(() => (location.href = "index1.html"));
adminBtn.onclick = () => (location.href = "admin_exam_panel.html");

function renderQuestion(i) {
  const q = questions[i];
  qArea.innerHTML = `<div class="question"><strong>Q${i + 1}.</strong> ${
    q.q
  }</div><div class="options">${q.options
    .map((o, j) => `<div class="option" data-idx="${j}">${o}</div>`)
    .join("")}</div>`;
  qArea.querySelectorAll(".option").forEach((o) => {
    o.onclick = () => {
      qArea
        .querySelectorAll(".option")
        .forEach((x) => x.classList.remove("selected"));
      o.classList.add("selected");
      answers[q.id] = parseInt(o.dataset.idx);
    };
  });
}

function startTimer() {
  updateTimerUI();
  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerUI();
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      autoSubmit("Time over");
    }
  }, 1000);
}

function updateTimerUI() {
  const m = String(Math.floor(remainingSeconds / 60)).padStart(2, "0"),
    s = String(remainingSeconds % 60).padStart(2, "0");
  timerEl.textContent = `⏱ Time: ${m}:${s}`;
}

nextBtn.onclick = () => {
  currentIndex = Math.min(questions.length - 1, currentIndex + 1);
  renderQuestion(currentIndex);
};
submitBtn.onclick = () => {
  if (confirm("Submit test now?")) autoSubmit("User submitted");
};

async function autoSubmit(reason) {
  if (hasSubmitted) return;
  hasSubmitted = true;
  let correct = 0;
  const detailed = questions.map((q) => {
    const sel = answers[q.id];
    const ok = sel === q.answerIndex;
    if (ok) correct++;
    return {
      question: q.q,
      selected: sel,
      options: q.options,
      correctIndex: q.answerIndex,
      correct: ok,
    };
  });
  const score = Math.round((correct / questions.length) * 100);
  const user = auth.currentUser;
  try {
    await addDoc(collection(db, "examResults"), {
      testId: TEST_ID,
      studentEmail: user?.email || "unknown",
      timestamp: serverTimestamp(),
      dateString: new Date().toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      reason,
      score,
      correctCount: correct,
      totalQuestions: questions.length,
      answers: detailed,
    });
  } catch (e) {
    console.error("Error saving result:", e);
  }
  showResult({ score, correct, answers: detailed });
}

function showResult(r) {
  feedbackEl.classList.remove("hidden");
  qArea.classList.add("hidden");
  document.getElementById("controls").classList.add("hidden");
  feedbackEl.innerHTML = `<h3>Result</h3><p><b>Score:</b> ${r.score}%</p><p>Correct: ${r.correct}/${questions.length}</p>`;
}

renderQuestion(currentIndex);
startTimer();
