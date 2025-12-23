/* ---------- CONFIG ---------- */
//const API_BASE = "https://talentconnect-careercraft.onrender.com";
const API_BASE = " https://api.careerkrafter.in";
//const API_BASE = "http://localhost:5000";

/*-------------program highlights------------ */
const SITE_STATS_API = `${API_BASE}/api/site_stats`;

async function loadProgramHighlights() {
  const fallback = {
    program_duration: "3 Months",
    course_tracks: "8+",
    placement_rate: "100%",
    industry_mentors: "50+",
  };

  try {
    const res = await fetch(SITE_STATS_API, { cache: "no-store" });
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();

    document.getElementById("stat_program_duration").innerText = (
      data.program_duration || fallback.program_duration
    ).trim();

    document.getElementById("stat_course_tracks").innerText =
      data.course_tracks || fallback.course_tracks;

    document.getElementById("stat_placement_rate").innerText =
      data.placement_rate || fallback.placement_rate;

    document.getElementById("stat_industry_mentors").innerText =
      data.industry_mentors || fallback.industry_mentors;

    // ---- If you want to set a specific color for any stat from JS, do it here:
    // Example: set course_tracks to green if value contains '+' (you will control colors)
    // const courseEl = document.getElementById('stat_course_tracks');
    // courseEl.style.background = 'linear-gradient(90deg,#00d084,#00a1ff)';
    // courseEl.style.webkitBackgroundClip = 'text';
    // courseEl.style.webkitTextFillColor = 'transparent';
  } catch (err) {
    console.warn("⚠ Using fallback for program highlights", err);
    document.getElementById("stat_program_duration").innerText =
      fallback.program_duration;
    document.getElementById("stat_course_tracks").innerText =
      fallback.course_tracks;
    document.getElementById("stat_placement_rate").innerText =
      fallback.placement_rate;
    document.getElementById("stat_industry_mentors").innerText =
      fallback.industry_mentors;
  }
}

document.addEventListener("DOMContentLoaded", loadProgramHighlights);

/*--------------------courses section ----------------------- */
const COURSES_API = `${API_BASE}/api/courses`;

async function loadCoursesLanding() {
  const grid = document.getElementById("coursesGrid");
  grid.innerHTML = "<p style='color:white'>Loading...</p>";

  try {
    const res = await fetch(COURSES_API);
    const courses = await res.json();

    grid.innerHTML = "";

    courses.forEach((c) => {
      // 🔥 limit description to 10 words
      let shortDesc = c.description.split(" ");
      if (shortDesc.length > 10) {
        shortDesc = shortDesc.slice(0, 10).join(" ") + " ...";
      } else {
        shortDesc = c.description;
      }

      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <span class="icon">${c.icon}</span>
        <h3>${c.title}</h3>
        <p>${shortDesc}</p>
        <div class="course-meta">
          <span>${c.duration}</span>
          <span>${c.level}</span>
        </div>
      `;
      grid.appendChild(card);
    });

    // CTA card stays unchanged
    const last = document.createElement("div");
    last.className = "special-card";
    last.id = "careerGuidanceCard";
    last.innerHTML = `
      <img src="https://img.icons8.com/color/96/goal.png">
      <h3>Not sure which track to choose?</h3>
      <p>Take our career assessment to find the perfect learning path based on your skills & goals.</p>
      <button class="special-btn" onclick="showExpertConsultationModal()">Talk with Expert</button>
    `;
    grid.appendChild(last);
  } catch (err) {
    grid.innerHTML = `<p style="color:#ff7777;">Failed to load courses</p>`;
  }
}

/* ---- Modal dummy ---- */
window.openTrackModal = () => {
  document.getElementById("trackModal").classList.remove("hidden");
};
document.getElementById("closeTrackModal").onclick = () => {
  document.getElementById("trackModal").classList.add("hidden");
};

document.addEventListener("DOMContentLoaded", loadCoursesLanding);

/*---------------career craft journey --------------- */
async function loadCareerStats() {
  try {
    const res = await fetch(`${API_BASE}/api/site_stats`);
    const data = await res.json();

    document.getElementById("successRate").innerText = data.success_rate || "—";

    document.getElementById("placementTime").innerText =
      data.avg_job_placement_time || "—";

    document.getElementById("avgSalary").innerText =
      data.average_starting_salary || "—";
  } catch (err) {
    console.error("Career stats fetch failed:", err);

    // fallback values
    document.getElementById("successRate").innerText = "95%";
    document.getElementById("placementTime").innerText = "4 week";
    document.getElementById("avgSalary").innerText = "7.5L";
  }
}

// call when page loads
loadCareerStats();

// ----------------------------
// 🔥 Scroll-trigger number animation
// ----------------------------
function animateStat(element, final, formatter) {
  let current = 0;
  const increment = final / 80;

  function update() {
    current += increment;
    if (current < final) {
      element.innerText = formatter(current);
      requestAnimationFrame(update);
    } else {
      element.innerText = formatter(final);
    }
  }
  update();
}

let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !statsAnimated) {
    statsAnimated = true;

    const successRate = document.getElementById("successRate");
    const placementTime = document.getElementById("placementTime");
    const avgSalary = document.getElementById("avgSalary");

    // extract numeric values from current API text
    const sr = parseFloat(successRate.innerText);
    const pt = parseFloat(placementTime.innerText);
    const sal = parseFloat(avgSalary.innerText);

    animateStat(successRate, sr, (v) => Math.floor(v) + "%");
    animateStat(placementTime, pt, (v) => Math.floor(v) + " week");
    animateStat(avgSalary, sal, (v) => v.toFixed(1) + "L");
  }
});

// observe section
statsObserver.observe(document.querySelector(".journey-stats"));

/*-------------------internship section ------------------- */
function animateCounter(element, endValue, duration = 1200) {
  let start = 0;
  const end = parseInt(endValue.replace(/\D/g, "")); // remove non-numeric chars like K, %
  const increment = end / (duration / 20);

  const counter = setInterval(() => {
    start += increment;
    if (start >= end) {
      start = end;
      clearInterval(counter);
    }
    element.innerText =
      endValue.includes("k") || endValue.includes("K")
        ? Math.floor(start) + "k"
        : endValue.includes("L")
        ? Math.floor(start) + "L"
        : endValue.includes("%")
        ? Math.floor(start) + "%"
        : Math.floor(start);
  }, 20);
}

async function loadStipendDetails() {
  try {
    const res = await fetch(`${API_BASE}/api/site_stats`);
    const data = await res.json();

    const minEl = document.getElementById("minStipend");
    const maxEl = document.getElementById("maxStipend");

    animateCounter(minEl, data.min_stipend || "8k");
    animateCounter(maxEl, data.max_stipend || "35K");
  } catch (err) {
    console.error("Failed to load stipend:", err);

    animateCounter(document.getElementById("minStipend"), "8k");
    animateCounter(document.getElementById("maxStipend"), "35K");
  }
}

// call on page load
loadStipendDetails();

// 🔥 Trigger only when section is visible
// ------------------------------
let internshipAnimated = false;

const internshipObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !internshipAnimated) {
    internshipAnimated = true;
    loadStipendDetails();
    internshipObserver.disconnect();
  }
});

/*-----------------placment section--------------- */
function animateCounter(element, finalValue) {
  element.setAttribute("data-visible", "true");

  let numeric = finalValue.replace(/\D/g, "");
  let unit = finalValue.replace(/[0-9.]/g, ""); // %, L, +, k

  let start = Math.floor(Math.random() * (numeric / 3));
  let end = parseFloat(numeric);
  let duration = 1200;
  let increment = (end - start) / (duration / 20);

  let counter = setInterval(() => {
    start += increment;
    if (start >= end) {
      clearInterval(counter);
      element.innerText = finalValue;
    } else {
      if (unit === "L") element.innerText = Math.floor(start) + "L";
      else if (unit.toLowerCase() === "k")
        element.innerText = Math.floor(start) + "k";
      else if (unit === "%") element.innerText = Math.floor(start) + "%";
      else if (unit === "+") element.innerText = Math.floor(start) + "+";
      else element.innerText = Math.floor(start);
    }
  }, 20);
}

async function fetchPlacementStats() {
  try {
    const res = await fetch(`${API_BASE}/api/site_stats`);
    return await res.json();
  } catch (err) {
    console.error("Stats fetch failed:", err);
    return {
      alumni_network: "1200+",
      success_rate: "95%",
      avg_package: "7.5L",
      highest_package: "45L",
      hands_on_projects: "30+",
    };
  }
}

// Scroll observer trigger
let placementAnimationPlayed = false;

const observer = new IntersectionObserver(
  async (entries) => {
    const section = entries[0];
    if (section.isIntersecting && !placementAnimationPlayed) {
      placementAnimationPlayed = true;

      const stats = await fetchPlacementStats();

      animateCounter(
        document.getElementById("studentsPlaced"),
        stats.alumni_network
      );
      animateCounter(
        document.getElementById("successRateStat"),
        stats.success_rate
      );
      animateCounter(
        document.getElementById("avgPackageStat"),
        stats.avg_package
      );
      animateCounter(
        document.getElementById("highestPackageStat"),
        stats.highest_package
      );
      animateCounter(
        document.getElementById("projectsStat"),
        stats.hands_on_projects
      );
    }
  },
  { threshold: 0.3 }
);

// Observe the section
observer.observe(document.querySelector(".placement-support-section"));

/*------hiring partners------- */
async function loadPartners() {
  try {
    const res = await fetch(`${API_BASE}/api/partners`);
    const partners = await res.json();

    const carousel = document.getElementById("partnersCarousel");

    // Create carousel content
    partners.forEach((p) => {
      const div = document.createElement("div");
      div.classList.add("partner-item");
      div.innerHTML = `
        <img src="${p.logo_url}" alt="${p.name}">
        <p>${p.name}</p>
      `;
      carousel.appendChild(div);
    });

    // Duplicate list once for smooth infinite loop
    partners.forEach((p) => {
      const div = document.createElement("div");
      div.classList.add("partner-item");
      div.innerHTML = `
        <img src="${p.logo_url}" alt="${p.name}">
        <p>${p.name}</p>
      `;
      carousel.appendChild(div);
    });
  } catch (error) {
    console.error("Failed to load partners:", error);
  }
}

// Scroll-trigger animation
let partnersAnimated = false;

const observerPartners = new IntersectionObserver(
  (entries) => {
    const section = entries[0];

    if (section.isIntersecting && !partnersAnimated) {
      partnersAnimated = true;

      loadPartners().then(() => {
        const carousel = document.getElementById("partnersCarousel");

        // fade-in animation
        carousel.classList.add("visible");

        // start infinite sliding after fade
        setTimeout(() => {
          carousel.classList.add("animate");
        }, 350);
      });
    }
  },
  { threshold: 0.25 }
);

observerPartners.observe(document.querySelector(".partners-section"));

/*-------------------success stories section ----------- */
let stories = [];
let currentStory = 0;

async function loadSuccessStories() {
  try {
    const res = await fetch(`${API_BASE}/api/success_stories`);
    stories = await res.json();
    updateStory();
  } catch (err) {
    console.error("Failed to load success stories:", err);
  }
}

function updateStory() {
  const s = stories[currentStory];

  document.getElementById("storyQuote").textContent = s.quote;
  document.getElementById("storyName").textContent = s.name;
  document.getElementById("storyRole").textContent = s.role;
  document.getElementById("storyCompany").textContent = s.company;
  document.getElementById("storyImg").src = s.image;

  // rating dynamic
  document.getElementById("storyRating").innerHTML =
    "★".repeat(s.rating) + "☆".repeat(5 - s.rating);
}

document.getElementById("nextStory").addEventListener("click", () => {
  currentStory = (currentStory + 1) % stories.length;
  updateStory();
});

document.getElementById("prevStory").addEventListener("click", () => {
  currentStory = (currentStory - 1 + stories.length) % stories.length;
  updateStory();
});

// Scroll-trigger fade-in
let successTriggered = false;
const successObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !successTriggered) {
      successTriggered = true;
      loadSuccessStories();
      document.getElementById("successCard").classList.add("visible");
    }
  },
  { threshold: 0.35 }
);

successObserver.observe(document.querySelector(".success-section"));

/*-------------------acheivment section---------- */
function animateCount(element, finalValue) {
  let start = 0;
  const totalTime = 1300;
  const end = parseFloat(finalValue); // works for 4.9, 500+, etc.
  const increment = end / (totalTime / 20);

  const timer = setInterval(() => {
    start += increment;
    if (start >= end) {
      start = end;
      clearInterval(timer);
    }
    element.textContent = finalValue.includes("+")
      ? Math.floor(start) + "+"
      : finalValue.includes("/")
      ? start.toFixed(1) + "/5"
      : Math.floor(start);
  }, 20);
}

async function loadAchievements() {
  const res = await fetch(`${API_BASE}/api/site_stats`);
  const data = await res.json();

  const alumni = document.getElementById("alumniCounter");
  const partners = document.getElementById("partnersCounter");
  const rating = document.getElementById("ratingCounter");

  animateCount(alumni, data.alumni_network || "500+");
  animateCount(partners, data.partner_companies || "400+");
  animateCount(rating, data.average_rating || "4.9/5");
}

/* Scroll trigger */
const achievementObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document
          .querySelectorAll(".achievement-card")
          .forEach((card) => card.classList.add("visible"));
        loadAchievements();
        achievementObserver.disconnect();
      }
    });
  },
  { threshold: 0.4 }
);

achievementObserver.observe(document.getElementById("achievementSection"));

/*-----------------FAQS section -------------- */
async function loadFaqs() {
  const res = await fetch(`${API_BASE}/api/faqs`);
  const faqs = await res.json();

  const faqContainer = document.getElementById("faqContainer");
  faqContainer.innerHTML = "";

  faqs.forEach((faq) => {
    const faqItem = document.createElement("div");
    faqItem.classList.add("faq-item");

    faqItem.innerHTML = `
      <div class="faq-header">
        <span>${faq.question}</span>
        <span class="faq-toggle">+</span>
      </div>
      <div class="faq-answer">${faq.answer.replace(/\n/g, "<br>")}</div>

    `;

    faqContainer.appendChild(faqItem);

    faqItem.querySelector(".faq-header").addEventListener("click", () => {
      const isOpen = faqItem.classList.contains("active");

      // close all others
      document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active");
        item.querySelector(".faq-toggle").textContent = "+";
      });

      // open clicked
      if (!isOpen) {
        faqItem.classList.add("active");
        faqItem.querySelector(".faq-toggle").textContent = "–";
      }
    });
  });
}

loadFaqs();

/*-----------registration modal------------- */
/* ---------- MODAL MANAGEMENT (Reusable for multiple modals) ---------- */

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Prevent scroll
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
  document.body.style.overflow = "auto";
}

/* Convenience wrappers for registration modal */
function showRegistrationModal() {
  openModal("registrationModal");
}
function hideRegistrationModal() {
  closeModal("registrationModal");
}

/* ---------- REGISTRATION FORM SUBMISSION ---------- */

async function handleRegistration(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  try {
    const res = await fetch(`${API_BASE}/api/registrations`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Something went wrong");
      return;
    }

    alert("🎉 Registration successful!");
    form.reset();
    hideRegistrationModal();
  } catch (err) {
    alert("❌ Failed to register. Please try again.");
    console.error("Registration error:", err);
  }
}

/*----------expert modal----------- */
function showExpertConsultationModal() {
  document.getElementById("expertConsultationModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeExpertConsultationModal() {
  document.getElementById("expertConsultationModal").classList.add("hidden");
  document.body.style.overflow = "auto";
}

async function handleExpertConsultation(event) {
  event.preventDefault();

  const form = document.getElementById("expertConsultationForm");
  const messageBox = document.getElementById("consultationMessage");

  // Get form field values
  const full_name = form.fullName.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const meeting_date = form.meetingDate.value;
  const meeting_time = form.timeSlot.value;

  try {
    const res = await fetch(`${API_BASE}/api/consultations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name,
        email,
        phone,
        meeting_date,
        meeting_time,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      messageBox.classList.remove("hidden");
      messageBox.classList.add("text-red-400");
      messageBox.innerText = data.error || "Something went wrong";
      return;
    }

    // SUCCESS message
    messageBox.classList.remove("hidden");
    messageBox.classList.remove("text-red-400");
    messageBox.classList.add("text-green-400");
    messageBox.innerText =
      "🎉 Meeting scheduled successfully! Confirmation email sent.";

    form.reset();

    // Auto-close after delay
    setTimeout(() => {
      closeExpertConsultationModal();
      messageBox.classList.add("hidden");
    }, 2000);
  } catch (error) {
    messageBox.classList.remove("hidden");
    messageBox.classList.add("text-red-400");
    messageBox.innerText = "Network error — please try again.";
    console.error("Consultation error:", error);
  }
}

function scrollToCourses() {
  const section = document.getElementById("coursesSectionLanding");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

function scrollToCareerGuidance() {
  const el = document.getElementById("careerGuidanceCard");

  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  } else {
    // wait until courses load
    const observer = new MutationObserver(() => {
      const target = document.getElementById("careerGuidanceCard");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        observer.disconnect();
      }
    });

    observer.observe(document.getElementById("coursesGrid"), {
      childList: true,
      subtree: true
    });
  }
}
