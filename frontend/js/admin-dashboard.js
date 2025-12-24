// Section navigation

//const API_BASE = "https://talentconnect-careercraft.onrender.com";
const API_BASE = "https://api.careerkrafter.in";
//const API_BASE = "http://localhost:5000";

function showSection(section) {
  const sections = [
    "overview",
    "siteStats",
    "courses",
    "partners",
    "success",
    "users",
    "meetings",
  ];

  // Hide all sections
  sections.forEach((s) => {
    const el = document.getElementById(s + "Section");
    if (el) el.classList.add("hidden");
  });

  // Show selected section
  const active = document.getElementById(section + "Section");
  if (active) active.classList.remove("hidden");

  // Remove active style from sidebar items
  document.querySelectorAll("nav a").forEach((a) => {
    a.classList.remove(
      "bg-blue-600/20",
      "border",
      "border-blue-600/40",
      "text-blue-400",
      "font-medium"
    );
    a.classList.add("text-gray-300");
  });

  // Highlight active sidebar button
  const btn = document.getElementById("btn" + capitalize(section));
  if (btn) {
    btn.classList.add(
      "bg-blue-600/20",
      "border",
      "border-blue-600/40",
      "text-blue-400",
      "font-medium"
    );
  }

  if (section === "success") loadSuccessStories();
  if (section === "users") loadUsers();
  if (section === "meetings") loadMeetings();
  if (section === "siteStats") loadSiteStats();
}

// convert "siteStats" → "SiteStats"
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Show overview first when page loads
document.addEventListener("DOMContentLoaded", () => {
  showSection("overview");
});

// Courses management JS
// ======== COURSES MANAGEMENT (UPDATED) ========
(() => {
  const API_BASE = " https://api.careerkrafter.in/api/courses";

  const tableBody = document.getElementById("coursesTableBody");
  const courseModal = document.getElementById("courseModal");
  const deleteModal = document.getElementById("deleteConfirmModal");
  const sectionIconHolder = document.querySelector("#coursesSection h2"); // to place emoji

  const courseForm = document.getElementById("courseForm");
  const saveCourseBtn = document.getElementById("saveCourseBtn");

  const fld = {
    id: document.getElementById("course_id"),
    icon: document.getElementById("course_icon"),
    title: document.getElementById("course_title"),
    description: document.getElementById("course_description"),
    full_description: document.getElementById("course_full_description"),
    duration: document.getElementById("course_duration"),
    level: document.getElementById("course_level"),
    features: document.getElementById("course_features"),
  };

  let courses = [];
  let deletingCourseId = null;

  // open add modal
  document
    .getElementById("openAddCourseBtn")
    .addEventListener("click", () => openCourseModal());

  // save course (create & update)
  saveCourseBtn.addEventListener("click", async () => {
    const payload = {
      icon: fld.icon.value.trim(),
      title: fld.title.value.trim(),
      description: fld.description.value.trim(),
      full_description: fld.full_description.value.trim(),
      duration: fld.duration.value.trim(),
      level: fld.level.value.trim(),
      features: fld.features.value.trim(),
    };
    const id = fld.id.value;

    try {
      const res = await fetch(id ? `${API_BASE}/${id}` : API_BASE, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      await loadCourses();
      showToast("Course Added!", "success");
      closeCourseModal();
    } catch {
      alert("Save failed — check backend.");
      showToast("Course Not Added!", "error");
    }
  });

  // delete flow
  document.getElementById("cancelDeleteBtn").onclick = closeDeleteModal;
  document.getElementById("confirmDeleteBtn").onclick = async () => {
    try {
      const res = await fetch(`${API_BASE}/${deletingCourseId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      await loadCourses();
      closeDeleteModal();
      showToast("Course Deleted!", "success");
    } catch {
      alert("Delete failed.");
      showToast("Course Deletion Failed!", "error");
    }
  };

  // open modal helper
  function openCourseModal(course = null) {
    fld.id.value = course?.id || "";
    fld.icon.value = course?.icon || "";
    fld.title.value = course?.title || "";
    fld.description.value = course?.description || "";
    fld.full_description.value = course?.full_description || "";
    fld.duration.value = course?.duration || "";
    fld.level.value = course?.level || "";
    fld.features.value = course?.features || "";

    document.getElementById("courseModalTitle").textContent = course
      ? "Edit Course"
      : "Add Course";

    courseModal.classList.remove("hidden");
    courseModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
  window.openCourseModal = (id) =>
    openCourseModal(courses.find((c) => c.id == id));
  window.closeCourseModal = () => {
    courseModal.classList.add("hidden");
    courseModal.style.display = "none";
    document.body.style.overflow = "";
  };

  function openDeleteModal(id) {
    deletingCourseId = id;
    deleteModal.classList.remove("hidden");
    deleteModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
  function closeDeleteModal() {
    deleteModal.classList.add("hidden");
    deleteModal.style.display = "none";
    document.body.style.overflow = "";
  }
  window.openDeleteModal = openDeleteModal;

  // fetch + fallback + icon injection
  async function loadCourses() {
    try {
      const res = await fetch(API_BASE, {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      courses = await res.json();
      if (!Array.isArray(courses)) courses = [];
    } catch {
      // fallback when backend empty or offline
      courses = [
        {
          id: 1,
          icon: "⚛️",
          title: "MERN Full Stack Developments",
          description: "Learn mern stack",
          duration: "3 months",
          level: "Intermediate",
        },
        {
          id: 2,
          icon: "🤖",
          title: "Artificial Intelligence",
          description: "Learn AI basics",
          duration: "3 months",
          level: "Intermediate",
        },
      ];
    }

    renderCourses(courses);

    // Add emoji to Course Management title
    if (courses.length && courses[0].icon) {
      if (!sectionIconHolder.innerHTML.includes(courses[0].icon)) {
        sectionIconHolder.innerHTML = `<span class="mr-2">${courses[0].icon}</span>Course Management`;
      }
    }
  }

  function renderCourses(data) {
    tableBody.innerHTML = "";
    if (!data.length) {
      tableBody.innerHTML = `<tr class="transition duration-200 hover:bg-gray-700/40 hover:scale-[1.01] cursor-pointer">
<td colspan="6" class="p-6 text-center text-gray-400">
        No courses available — fallback loaded
      </td></tr>`;
      return;
    }

    data.forEach((c) => {
      const row = document.createElement("tr");
      row.className = "courses-row";
      row.innerHTML = `
       <td class="p-4 text-2xl text-center">${c.icon}</td>

        <td class="p-4">${c.title}</td>
        <td class="p-4">${c.description}</td>
        <td class="p-4">${c.duration}</td>
        <td class="p-4">${c.level}</td>
        <td class="p-4 flex gap-3">
          <button onclick="openCourseModal(${c.id})" class="action-btn bg-gray-700 hover:bg-gray-600">Edit</button>
          <button onclick="openDeleteModal(${c.id})" class="action-btn bg-red-600 hover:bg-red-500">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // *** Load courses automatically even before user clicks "Courses" ***
  document.addEventListener("DOMContentLoaded", loadCourses);
})();

/* ---------------- Hiring Partners Section ---------------- */

const PARTNERS_API = `${API_BASE}/api/partners`;
let partnersData = [];
let editingPartnerId = null;

// Load partners on page load
async function loadPartners() {
  try {
    const res = await fetch(PARTNERS_API, { credentials: "include" });

    const data = await res.json();
    partnersData = data;
    console.log("API response: ", data);
  } catch {
    partnersData = [];
  }
  renderPartnersUI();
}

// Render UI
function renderPartnersUI() {
  const list = document.getElementById("partnersList");
  list.innerHTML = "";

  if (!partnersData.length) {
    list.innerHTML = `
      <p class="text-center text-gray-400 text-lg py-10">
        No hiring partners added yet.
      </p>`;
    return;
  }

  partnersData.forEach((p) => {
    const row = document.createElement("div");
    row.className =
      "flex justify-between items-center p-6 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition shadow border border-gray-700";

    row.innerHTML = `
      <div class="flex items-center gap-6">
        <img src="${p.logo_url}" class="w-20 h-20 object-contain rounded-md bg-black/40" />
        <h3 class="text-xl font-semibold text-white">${p.name} -</h3>
      </div>
      <div class="flex gap-3">
        <button class="px-6 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded-lg transition"
          onclick="openPartnerModal(${p.id})">Edit</button>
        <button class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          onclick="openDeletePartnerModal(${p.id})">Delete</button>
      </div>
    `;
    list.appendChild(row);
  });
}

// Open Modal
document.getElementById("addPartnerBtn").onclick = () => {
  editingPartnerId = null;
  document.getElementById("partnerModalTitle").textContent = "Add Partner";
  document.getElementById("partnerNameInput").value = "";
  document.getElementById("partnerLogoInput").value = "";
  document.getElementById("partnerModal").classList.remove("hidden");
};

function openPartnerModal(id) {
  editingPartnerId = id;
  const p = partnersData.find((x) => x.id == id);
  document.getElementById("partnerModalTitle").textContent = "Edit Partner";
  document.getElementById("partnerNameInput").value = p.name;
  document.getElementById("partnerLogoInput").value = "";
  document.getElementById("partnerModal").classList.remove("hidden");
}

function closePartnerModal() {
  document.getElementById("partnerModal").classList.add("hidden");
}

// Save Partner (POST / PUT)
document.getElementById("savePartnerBtn").onclick = async () => {
  const form = new FormData();
  form.append("name", document.getElementById("partnerNameInput").value);
  if (document.getElementById("partnerLogoInput").files[0]) {
    form.append("logo", document.getElementById("partnerLogoInput").files[0]);
  }

  const url = editingPartnerId
    ? `${PARTNERS_API}/${editingPartnerId}`
    : PARTNERS_API;

  await fetch(url, {
    method: editingPartnerId ? "PUT" : "POST",
    body: form,
    credentials: "include",
  });

  closePartnerModal();
  showToast("Partner Added!", "success");
  loadPartners();
};

// Delete Modal
let deletePartnerId = null;

function openDeletePartnerModal(id) {
  deletePartnerId = id;
  document.getElementById("deletePartnerModal").classList.remove("hidden");
}
function closeDeletePartnerModal() {
  document.getElementById("deletePartnerModal").classList.add("hidden");
}

document.getElementById("confirmDeletePartnerBtn").onclick = async () => {
  await fetch(`${PARTNERS_API}/${deletePartnerId}`, {
    method: "DELETE",
    credentials: "include",
  });

  closeDeletePartnerModal();
  showToast("Partner Deleted !", "success");
  loadPartners();
};

// Load initially
loadPartners();

//success stories
/* ---------------- SUCCESS STORIES ---------------- */
const SUCCESS_API = `${API_BASE}/api/success_stories`;

let activeStoryId = null;
let selectedRating = 5;

const storiesContainer = document.getElementById("storiesContainer");
const storyModal = document.getElementById("storyModal");
const storyForm = document.getElementById("storyForm");
const storyModalTitle = document.getElementById("storyModalTitle");
const ratingStars = document.getElementById("ratingStars");

/* Star Selection */
ratingStars.addEventListener("click", (e) => {
  if (e.target.innerText !== "★") return;
  selectedRating = [...ratingStars.children].indexOf(e.target) + 1;
  updateStarUI(selectedRating);
});
function updateStarUI(n) {
  [...ratingStars.children].forEach(
    (star, i) => (star.style.color = i < n ? "#facc15" : "#4b5563")
  );
}

/* Load Stories */
async function loadSuccessStories() {
  try {
    const res = await fetch(SUCCESS_API, { credentials: "include" });

    const stories = await res.json();

    if (!stories.length) {
      storiesContainer.innerHTML = `<p class="text-gray-400 text-center py-6">No stories added yet.</p>`;
      return;
    }

    storiesContainer.innerHTML = "";
    stories.forEach((s) => {
      const row = document.createElement("div");
      row.className =
        "flex justify-between items-center bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:bg-gray-700/40 transition";

      row.innerHTML = `
        <div class="flex gap-4 items-center">
          <img src="${s.image}" class="w-16 h-16 rounded-lg object-cover border border-gray-600" />
          <div class="text-gray-300 font-medium">
            ${s.name} – ${s.role} at ${s.company} (⭐ ${s.rating})
            <p class="text-gray-400 text-sm italic mt-1 max-w-[600px]">"${s.quote}"</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button onclick="openEditStory(${s.id})"
            class="px-5 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg">Edit</button>
          <button onclick="deleteStory(${s.id})"
            class="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-lg">Delete</button>
        </div>`;
      storiesContainer.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load success stories", err);
  }
}

/* Open Add */
document.getElementById("openAddStoryModal").onclick = () => {
  activeStoryId = null;
  storyForm.reset();
  selectedRating = 5;
  updateStarUI(5);
  storyModalTitle.innerText = "Add New Story";
  storyModal.classList.remove("hidden");
};

/* Close */
document.getElementById("closeStoryModal").onclick = () =>
  storyModal.classList.add("hidden");

/* Open Edit */
async function openEditStory(id) {
  const res = await fetch(`${SUCCESS_API}/${id}`, { credentials: "include" });
  const s = await res.json();

  activeStoryId = id;
  storyQuote.value = s.quote;
  storyName.value = s.name;
  storyRole.value = s.role;
  storyCompany.value = s.company;
  selectedRating = s.rating;
  updateStarUI(s.rating);

  storyModalTitle.innerText = "Edit Story";
  storyModal.classList.remove("hidden");
}

/* CREATE / UPDATE */
storyForm.onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData();
  fd.append("quote", storyQuote.value);
  fd.append("name", storyName.value);
  fd.append("role", storyRole.value);
  fd.append("company", storyCompany.value);
  fd.append("rating", selectedRating);
  if (storyImage.files[0]) fd.append("image", storyImage.files[0]);

  await fetch(activeStoryId ? `${SUCCESS_API}/${activeStoryId}` : SUCCESS_API, {
    method: activeStoryId ? "PUT" : "POST",
    body: fd,
    credentials: "include",
  });

  storyModal.classList.add("hidden");
  showToast("Story Added!", "success");
  loadSuccessStories();
};

/* DELETE */
async function deleteStory(id) {
  if (!confirm("Delete this story?")) return;
  await fetch(`${SUCCESS_API}/${id}`, {
    credentials: "include",
    method: "DELETE",
  });
  showToast("Story Deleted!", "success");
  loadSuccessStories();
}

/* 🔥 Load stories automatically when success section appears */
function triggerSuccessLoad() {
  loadSuccessStories();
}

/* ---------- REGISTERED USERS ---------- */
const USERS_API = `${API_BASE}/api/registrations`;
const usersTableBody = document.getElementById("usersTableBody");
const totalUsersBadge = document.getElementById("totalUsersBadge");

/* FETCH USERS */
async function loadUsers() {
  try {
    const res = await fetch(USERS_API, {
      credentials: "include",
    });

    const users = await res.json();

    totalUsersBadge.innerText = users.length;
    usersTableBody.innerHTML = "";

    if (!users.length) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-gray-400 py-5">No users registered yet.</td>
        </tr>`;
      return;
    }

    users.forEach((u) => {
      const row = document.createElement("tr");
      row.className =
        "border-b border-gray-700 hover:bg-gray-700/40 transition cursor-pointer";

      row.innerHTML = `
        <td class="py-4 px-2 text-gray-300">${u.full_name}</td>
        <td class="py-4 px-2 text-gray-300">${u.email}</td>
        <td class="py-4 px-2 text-gray-300 capitalize">${u.role}</td>
        <td class="py-4 px-2 text-gray-300">${u.phone}</td>
        <td class="py-4 px-2">
          <button onclick="downloadCV(${u.id})"
            class="text-blue-400 hover:text-blue-300 flex items-center gap-2 underline">
            <i class="fas fa-file-download"></i> Download CV
          </button>
        </td>
      `;
      usersTableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

/* DOWNLOAD CV */
async function downloadCV(id) {
  try {
    window.location.href = `${USERS_API}/${id}/cv`;
  } catch (err) {
    alert("Failed to download CV");
  }
}

/* ---------------- EXPERT MEETINGS ---------------- */
const MEETINGS_API = `${API_BASE}/api/consultations`;
const meetingsTable = document.getElementById("meetingsTable");
const totalMeetings = document.getElementById("totalMeetings");

/* FORMAT DATE */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* LOAD MEETINGS */
async function loadMeetings() {
  try {
    const res = await fetch(MEETINGS_API, {
      credentials: "include",
    });

    const data = await res.json();

    totalMeetings.textContent = data.length;
    meetingsTable.innerHTML = "";

    if (!data.length) {
      meetingsTable.innerHTML = `<tr><td colspan="7" class="text-center text-gray-400 py-6">No bookings found.</td></tr>`;
      return;
    }

    data.forEach((m) => {
      const row = document.createElement("tr");
      row.className =
        "border-b border-gray-700 hover:bg-gray-800/50 transition text-sm";

      row.innerHTML = `
        <td class="px-4 py-4">${m.full_name}</td>
        <td class="px-4 py-4">${m.email}</td>
        <td class="px-4 py-4">${m.phone}</td>
        <td class="px-4 py-4">${formatDate(m.meeting_date)}</td>
        <td class="px-4 py-4">${m.meeting_time}</td>

        <td class="px-4 py-4">
          <span class="px-3 py-1 rounded-full text-xs ${
            m.status === "pending"
              ? "bg-yellow-700/30 text-yellow-400"
              : m.status === "confirmed"
              ? "bg-blue-700/30 text-blue-400"
              : m.status === "completed"
              ? "bg-green-700/30 text-green-400"
              : "bg-red-700/30 text-red-400"
          }">${m.status.charAt(0).toUpperCase() + m.status.slice(1)}</span>
        </td>

        <td class="px-4 py-4">
          <select
            onchange="updateMeetingStatus(${m.id}, this.value)"
            class="rounded-md bg-gray-800 text-gray-300 px-3 py-1 border border-gray-600 focus:outline-none"
          >
            <option value="pending" ${
              m.status === "pending" ? "selected" : ""
            }>Pending</option>
            <option value="confirmed" ${
              m.status === "confirmed" ? "selected" : ""
            }>Confirmed</option>
            <option value="completed" ${
              m.status === "completed" ? "selected" : ""
            }>Completed</option>
            <option value="cancelled" ${
              m.status === "cancelled" ? "selected" : ""
            }>Cancelled</option>
          </select>
        </td>
      `;

      meetingsTable.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Failed to fetch meetings", err);
  }
}

/* UPDATE STATUS */
async function updateMeetingStatus(id, status) {
  try {
    await fetch(`${MEETINGS_API}/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    loadMeetings();
  } catch (err) {
    console.error("❌ Failed to update meeting status", err);
  }
}

function setActive(el) {
  document
    .querySelectorAll(".sidebar-item")
    .forEach((item) => item.classList.remove("active"));
  el.classList.add("active");
}

const OVERVIEW_STATS_API = `${API_BASE}/api/overview/stats`;

async function loadOverviewStats() {
  try {
    const res = await fetch(OVERVIEW_STATS_API, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch overview stats");

    const data = await res.json();

    document.getElementById("totalCoursesCount").textContent =
      data.totalCourses;
    document.getElementById("totalPartnersCount").textContent =
      data.totalPartners;
    document.getElementById("totalSuccessCount").textContent =
      data.totalSuccessStories;
    document.getElementById("totalUsersCount").textContent = data.totalUsers;
  } catch (err) {
    console.error("Overview Stats Error:", err);
  }
}

function updateLastUpdatedTime() {
  const now = new Date();

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "2-digit",
  };

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const dateString = now.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });

  document.getElementById(
    "lastUpdatedTime"
  ).textContent = `${timeString} on ${dateString}`;
}

function logout() {
  window.location.href = "index.html";
}

async function handleAdminLogin(event) {
  event.preventDefault();

  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value.trim();

  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.innerText = "Verifying...";

  //chahnges made 3-12-25
  try {
    const res = await fetch(`${API_BASE}/api/admins/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Invalid credentials", "error");
      return;
    }

    showToast("Login successful!", "success");

    // 🔥 Important: Show dashboard after login
    setTimeout(() => {
      showAdminDashboard(); // <-- your function that hides login & shows dashboard
      loadOverviewStats(); // <-- call stats API immediately
      updateLastUpdatedTime(); // <-- update timestamp immediately
    }, 500);
  } catch (err) {
    showToast("Network error ― please try again", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Access Dashboard";
  }
}

function showToast(message, type = "info") {
  let toast = document.createElement("div");
  toast.innerText = message;

  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 18px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "15px";
  toast.style.zIndex = "9999";
  toast.style.boxShadow = "0 0 15px rgba(0,0,0,0.35)";
  toast.style.transition = "0.4s";

  if (type === "success") toast.style.background = "#16a34a"; // green
  else if (type === "error") toast.style.background = "#dc2626"; // red
  else toast.style.background = "#3b82f6"; // blue

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

function showAdminDashboard() {
  document.getElementById("adminLoginSection").classList.add("hidden");
  document.getElementById("adminDashboardSection").classList.remove("hidden");

  // show stats immediately after dashboard is visible
  loadOverviewStats();
  updateLastUpdatedTime();
}

const SITE_STATS_API = `${API_BASE}/api/site_stats`;
async function saveStats() {
  const apiURL = "http://localhost:5000/api/site_stats";

  // Collect all inputs inside siteStatsSection
  const inputs = document.querySelectorAll("#siteStatsSection input");

  const payload = {};
  inputs.forEach((input) => {
    if (input.id && input.value.trim() !== "") {
      payload[input.id] = input.value.trim();
    }
  });

  console.log("sending payload:", payload);

  try {
    const res = await fetch(SITE_STATS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await res.json();
    console.log("Response:", data);

    if (res.ok) {
      showToast("Stats Saved!", "success");
    } else {
      showToast("Something went wrong. Try again!", "error");
    }
  } catch (err) {
    console.error("Save error:", err);
    alert("Something went wrong");
  }
}

/*-------------------site stats get call----------- */
async function openSection(sectionId) {
  // Hide all sections
  document
    .querySelectorAll("section")
    .forEach((sec) => sec.classList.add("hidden"));

  // Show selected section
  document.getElementById(sectionId).classList.remove("hidden");

  // Highlight sidebar
  document
    .querySelectorAll(".sidebar-item")
    .forEach((i) => i.classList.remove("active"));
  document
    .querySelector(`#nav-${sectionId.replace("Section", "").toLowerCase()}`)
    .classList.add("active");

  // If Site Stats tab opened → get fresh data
  if (sectionId === "siteStatsSection") {
    loadSiteStats();
  }
}

async function loadSiteStats() {
  try {
    const res = await fetch(SITE_STATS_API, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch site stats");

    const data = await res.json();

    // Loop and fill all inputs whose id matches API keys
    Object.keys(data).forEach((key) => {
      const input = document.getElementById(key);
      if (input) input.value = data[key];
    });

    console.log("Site stats loaded");
  } catch (err) {
    console.error("Site stats GET error:", err);
  }
}
