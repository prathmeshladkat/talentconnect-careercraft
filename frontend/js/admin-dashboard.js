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

  const scrollBtns = document.getElementById("usersScrollBtns");
  if (scrollBtns) {
    if (section === "users") scrollBtns.classList.remove("hidden");
    else scrollBtns.classList.add("hidden");
  }

  localStorage.setItem("activeDashboardSection", section);
}

// convert "siteStats" → "SiteStats"
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Show overview first when page loads
document.addEventListener("DOMContentLoaded", () => {
  const savedSection = localStorage.getItem("activeDashboardSection");
  if (!savedSection) {
    showSection("overview");
  }
});

// Courses management JS
// ======== COURSES MANAGEMENT (UPDATED) ========
(() => {
  const COURSES_API = "https://api.careerkrafter.in/api/courses";

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
      const res = await fetch(id ? `${COURSES_API}/${id}` : COURSES_API, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save course");
      await loadCourses();
      showToast(id ? "Course Updated!" : "Course Added!", "success");
      closeCourseModal();
    } catch (err) {
      showToast(err.message || "Course Not Added!", "error");
    }
  });

  // delete flow
  document.getElementById("cancelDeleteBtn").onclick = closeDeleteModal;
  document.getElementById("confirmDeleteBtn").onclick = async () => {
    try {
      const res = await fetch(`${COURSES_API}/${deletingCourseId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      await loadCourses();
      closeDeleteModal();
      showToast("Course Deleted!", "success");
    } catch (err) {
      showToast(err.message || "Course Deletion Failed!", "error");
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
      const res = await fetch(COURSES_API, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load courses");
      courses = await res.json();
      if (!Array.isArray(courses)) courses = [];
    } catch (err) {
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

    // Removed to keep only "Course Management" as per Task 3
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
       <td class="p-4 text-center">
         ${c.icon && c.icon.startsWith('http') 
           ? `<img src="${c.icon}" alt="Course Icon" style="width:45px; height:45px; object-fit:contain; border-radius:6px; display:inline-block;" onerror="this.outerHTML='<span class=\\'text-2xl\\'>📁</span>'">`
           : `<span class="text-2xl">${c.icon || "📁"}</span>`}
       </td>

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
    if (!res.ok) throw new Error("Failed to load partners");
    const data = await res.json();
    partnersData = data;
    console.log("API response: ", data);
  } catch (err) {
    console.error(err);
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
  if (!p) {
    showToast("Partner not found", "error");
    return;
  }
  document.getElementById("partnerModalTitle").textContent = "Edit Partner";
  document.getElementById("partnerNameInput").value = p.name || "";
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

  try {
    const res = await fetch(url, {
      method: editingPartnerId ? "PUT" : "POST",
      body: form,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to save partner");

    closePartnerModal();
    showToast(editingPartnerId ? "Partner Updated!" : "Partner Added!", "success");
    loadPartners();
  } catch (err) {
    showToast(err.message || "Failed to save partner", "error");
  }
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
  try {
    const res = await fetch(`${PARTNERS_API}/${deletePartnerId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete partner");

    closeDeletePartnerModal();
    showToast("Partner Deleted!", "success");
    loadPartners();
  } catch (err) {
    showToast(err.message || "Failed to delete partner", "error");
  }
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
    if (!res.ok) throw new Error("Failed to load success stories");
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
    showToast("Failed to load success stories", "error");
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
  try {
    const res = await fetch(`${SUCCESS_API}/${id}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load story details");
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
  } catch (err) {
    showToast(err.message || "Failed to load story details", "error");
  }
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

  try {
    const res = await fetch(activeStoryId ? `${SUCCESS_API}/${activeStoryId}` : SUCCESS_API, {
      method: activeStoryId ? "PUT" : "POST",
      body: fd,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to save story");

    storyModal.classList.add("hidden");
    showToast(activeStoryId ? "Story Updated!" : "Story Added!", "success");
    loadSuccessStories();
  } catch (err) {
    showToast(err.message || "Failed to save story", "error");
  }
};

/* DELETE */
async function deleteStory(id) {
  if (!confirm("Delete this story?")) return;
  try {
    const res = await fetch(`${SUCCESS_API}/${id}`, {
      credentials: "include",
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete story");
    showToast("Story Deleted!", "success");
    loadSuccessStories();
  } catch (err) {
    showToast(err.message || "Failed to delete story", "error");
  }
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
    if (!res.ok) throw new Error("Failed to load users");

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
        <td class="py-4 px-2 text-gray-300 sticky left-0 bg-gray-800 z-10 min-w-[200px] border-r border-gray-700/50">${u.full_name}</td>
        <td class="py-4 px-2 text-gray-300 sticky left-[200px] bg-gray-800 z-10 min-w-[250px] border-r border-gray-700/50">${u.email}</td>
        <td class="py-4 px-2 text-gray-300 capitalize">${u.role}</td>
        <td class="py-4 px-2 text-gray-300">${u.phone}</td>
        <td class="py-4 px-2 text-gray-300">
          <div>${u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</div>
          <div class="text-xs text-gray-400">${u.created_at ? new Date(u.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
        </td>
        <td class="py-4 px-2">
          <button onclick="viewResume('${u.id}')"
            class="text-blue-400 hover:text-blue-300 flex items-center gap-2 underline">
            <i class="fas fa-eye"></i> View Resume
          </button>
        </td>
        <td class="py-4 px-2">
          <button onclick="openScheduleModal('${u.id}', '${u.full_name}', '${u.email}')"
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition flex items-center gap-2">
            📅 Schedule
          </button>
        </td>
        <td class="py-4 px-2">
          <button onclick="openHistoryModal('${u.id}', '${u.full_name}')"
            class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm transition flex items-center gap-2 border border-gray-600">
            <i class="fas fa-history"></i> History
          </button>
        </td>
      `;
      usersTableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading users:", err);
    showToast("Failed to load users", "error");
  }
}

/* ---------------- INTERVIEW & RESUME LOGIC ---------------- */

/* RESUME PREVIEW */
async function viewResume(userId) {
  try {
    const res = await fetch(`${USERS_API}/${userId}/cv/preview`, { method: 'HEAD' });
    if (!res.ok) throw new Error("File not found or cannot be previewed");

    const cvUrl = `${USERS_API}/${userId}/cv/preview`;
    const downloadUrl = `${USERS_API}/${userId}/cv`;
    
    const contentType = res.headers.get('content-type') || '';
    
    const downloadBtn = document.getElementById('downloadResumeBtn');
    if (downloadBtn) {
      downloadBtn.href = downloadUrl;
    }

    if (contentType.includes('msword') || contentType.includes('wordprocessingml') || contentType.includes('octet-stream')) {
      document.getElementById('resumeIframe').src = '';
      document.getElementById('resumeIframe').classList.add('hidden');
      document.getElementById('resumeErrorState').classList.remove('hidden');
    } else {
      document.getElementById('resumeIframe').src = cvUrl;
      document.getElementById('resumeIframe').classList.remove('hidden');
      document.getElementById('resumeErrorState').classList.add('hidden');
    }

    document.getElementById('resumePreviewModal').classList.remove('hidden');
  } catch (err) {
    showToast(err.message || "Failed to load CV", "error");
  }
}

function closeResumeModal() {
  document.getElementById('resumePreviewModal').classList.add('hidden');
  document.getElementById('resumeIframe').src = '';
}

/* SCHEDULE INTERVIEW MODAL */
function openScheduleModal(userId, name, email) {
  document.getElementById('schedUserId').value = userId;
  document.getElementById('schedName').value = name;
  document.getElementById('schedEmail').value = email;
  
  const dateInput = document.getElementById('schedDate');
  dateInput.value = '';
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${year}-${month}-${day}`;
  
  const hourEl = document.getElementById('schedHour');
  const minEl = document.getElementById('schedMinute');
  const ampmEl = document.getElementById('schedAmPm');
  if (hourEl) hourEl.value = '09';
  if (minEl) minEl.value = '00';
  if (ampmEl) ampmEl.value = 'AM';

  document.getElementById('schedLink').value = '';
  document.getElementById('schedDesc').value = '';
  
  document.querySelectorAll('#scheduleInterviewForm p.text-red-400').forEach(p => p.classList.add('hidden'));
  
  document.getElementById('scheduleInterviewModal').classList.remove('hidden');
}

function closeScheduleModal() {
  document.getElementById('scheduleInterviewModal').classList.add('hidden');
}

document.getElementById('scheduleInterviewForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  let valid = true;
  const userId = document.getElementById('schedUserId').value;
  const full_name = document.getElementById('schedName').value;
  const email = document.getElementById('schedEmail').value;
  const date = document.getElementById('schedDate').value;
  
  const hourStr = document.getElementById('schedHour').value;
  const minStr = document.getElementById('schedMinute').value;
  const ampmStr = document.getElementById('schedAmPm').value;
  
  let time = "";
  if (hourStr && minStr && ampmStr) {
    let hNum = parseInt(hourStr, 10);
    if (ampmStr === "PM" && hNum < 12) hNum += 12;
    if (ampmStr === "AM" && hNum === 12) hNum = 0;
    time = `${String(hNum).padStart(2, "0")}:${minStr}`;
  }

  const link = document.getElementById('schedLink').value;
  const desc = document.getElementById('schedDesc').value;

  let dateError = document.getElementById('errDate');
  let timeError = document.getElementById('errTime');
  dateError.innerText = "Date is required";
  timeError.innerText = "Time is required";

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (!date) { 
    dateError.classList.remove('hidden'); 
    valid = false; 
  } else if (date < todayStr) {
    dateError.innerText = "Interview date cannot be in the past.";
    dateError.classList.remove('hidden');
    valid = false;
  } else { 
    dateError.classList.add('hidden'); 
  }

  if (!time) { 
    timeError.classList.remove('hidden'); 
    valid = false; 
  } else if (date === todayStr) {
    const [hours, minutes] = time.split(':');
    const selectedTime = new Date();
    selectedTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    if (selectedTime < new Date()) {
      timeError.innerText = "Interview time must be in the future.";
      timeError.classList.remove('hidden');
      valid = false;
    } else {
      timeError.classList.add('hidden');
    }
  } else { 
    timeError.classList.add('hidden'); 
  }
  if (!link || !/^https:\/\/meet\.google\.com\/[a-z0-9\-]+(\?.*)?$/.test(link)) { document.getElementById('errLink').classList.remove('hidden'); valid = false; } else { document.getElementById('errLink').classList.add('hidden'); }
  if (!desc.trim()) { document.getElementById('errDesc').classList.remove('hidden'); valid = false; } else { document.getElementById('errDesc').classList.add('hidden'); }

  if (!valid) return;

  const btn = document.getElementById('schedSubmitBtn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Invitation...';

  try {
    const INTERVIEWS_API = `${API_BASE}/api/interviews`;
    const res = await fetch(`${INTERVIEWS_API}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId, email, full_name, interviewDate: date, interviewTime: time, meetingLink: link, description: desc
      })
    });
    
    const contentType = res.headers.get("content-type");
    let data = null;
    let textResponse = "";

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      textResponse = await res.text();
      console.warn("Non-JSON response received:", textResponse);
    }

    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`, data || textResponse);
      if (res.status === 409) {
        showToast("An interview has already been scheduled for this candidate.", "error");
      } else if (res.status === 404) {
        showToast("Scheduling endpoint not found. Check server deployment.", "error");
      } else {
        throw new Error(data?.error || `Failed to schedule interview (${res.status})`);
      }
    } else {
      showToast("Interview invitation sent successfully.", "success");
      closeScheduleModal();
    }
  } catch (error) {
    console.error("❌ Schedule Interview Error:", error);
    showToast(error.message || "Failed to schedule interview.", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
});

/* INTERVIEW HISTORY MODAL */
async function openHistoryModal(userId, name) {
  document.getElementById('historyCandidateName').textContent = name;
  const tbody = document.getElementById('historyTableBody');
  const noHistory = document.getElementById('noHistoryMessage');
  
  tbody.innerHTML = '';
  noHistory.classList.add('hidden');
  document.getElementById('interviewHistoryModal').classList.remove('hidden');

  try {
    const INTERVIEWS_API = `${API_BASE}/api/interviews`;
    const res = await fetch(`${INTERVIEWS_API}/${userId}`);
    
    const contentType = res.headers.get("content-type");
    let responseData = null;
    let textResponse = "";

    if (contentType && contentType.includes("application/json")) {
      responseData = await res.json();
    } else {
      textResponse = await res.text();
      console.warn("Non-JSON response received:", textResponse);
    }

    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`, responseData || textResponse);
      if (res.status === 404) {
         throw new Error("History endpoint not found. Check server deployment.");
      }
      throw new Error(responseData?.error || `Failed to fetch history (${res.status})`);
    }

    const historyArray = responseData?.history || [];

    if (historyArray.length === 0) {
      noHistory.classList.remove('hidden');
      noHistory.innerHTML = '<i class="fas fa-inbox text-4xl mb-3 opacity-50"></i><p>No interview history available.</p>';
    } else {
      historyArray.forEach(h => {
        const row = document.createElement('tr');
        const formattedDate = new Date(h.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        let statusBadge = '';
        if (h.status === 'Scheduled') statusBadge = '<span class="px-2.5 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium border border-blue-600/30">Scheduled</span>';
        else if (h.status === 'Completed') statusBadge = '<span class="px-2.5 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium border border-green-600/30">Completed</span>';
        else if (h.status === 'Cancelled') statusBadge = '<span class="px-2.5 py-1 bg-red-600/20 text-red-400 rounded-full text-xs font-medium border border-red-600/30">Cancelled</span>';
        else if (h.status === 'Rescheduled') statusBadge = '<span class="px-2.5 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs font-medium border border-yellow-600/30">Rescheduled</span>';
        else statusBadge = `<span class="px-2.5 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs font-medium">${h.status}</span>`;

        row.innerHTML = `
          <td class="py-3 px-2 whitespace-nowrap">
            <div class="font-medium text-gray-200">${formattedDate}</div>
            <div class="text-gray-400 text-xs">${h.interviewTime}</div>
          </td>
          <td class="py-3 px-2">${statusBadge}</td>
          <td class="py-3 px-2">
            <a href="${h.meetingLink}" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1.5 w-max">
              <i class="fas fa-external-link-alt text-xs"></i> Meet Link
            </a>
          </td>
          <td class="py-3 px-2 text-gray-300 min-w-[200px]">${h.description}</td>
        `;
        tbody.appendChild(row);
      });
    }
  } catch (err) {
    console.error("❌ Failed to load history:", err);
    noHistory.classList.remove('hidden');
    noHistory.innerHTML = `<i class="fas fa-exclamation-triangle text-4xl mb-3 text-red-400/50"></i><p class="text-red-400">${err.message || 'Failed to load interview history.'}</p>`;
  }
}

function closeHistoryModal() {
  document.getElementById('interviewHistoryModal').classList.add('hidden');
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
    if (!res.ok) throw new Error("Failed to load meetings");

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
    showToast("Failed to fetch meetings", "error");
  }
}

/* UPDATE STATUS */
async function updateMeetingStatus(id, status) {
  try {
    const res = await fetch(`${MEETINGS_API}/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    loadMeetings();
    showToast("Meeting status updated!", "success");
  } catch (err) {
    console.error("❌ Failed to update meeting status", err);
    showToast(err.message || "Failed to update meeting status", "error");
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
    showToast("Failed to fetch overview stats", "error");
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
  localStorage.removeItem("adminAuth");
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
      throw new Error(data.error || "Failed to save stats");
    }
  } catch (err) {
    console.error("Save error:", err);
    showToast(err.message || "Something went wrong", "error");
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
    showToast("Failed to load site stats", "error");
  }
}

window.scrollUsersTable = function(amount) {
  const wrapper = document.getElementById("bottomScrollWrapper");
  if (wrapper) {
    wrapper.scrollBy({ left: amount, behavior: 'smooth' });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const authData = localStorage.getItem("adminAuth");
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        showAdminDashboard();
        const savedSection = localStorage.getItem("activeDashboardSection");
        if (savedSection) {
          showSection(savedSection);
        }
      } else {
        localStorage.removeItem("adminAuth");
      }
    } catch (e) {
      localStorage.removeItem("adminAuth");
    }
  }

  const hourSelect = document.getElementById("schedHour");
  if (hourSelect) {
    for (let i = 1; i <= 12; i++) {
      const val = String(i).padStart(2, "0");
      const option = document.createElement("option");
      option.value = val;
      option.textContent = val;
      hourSelect.appendChild(option);
    }
    hourSelect.value = "09";
  }
  
  const minSelect = document.getElementById("schedMinute");
  if (minSelect) {
    for (let i = 0; i <= 59; i++) {
      const val = String(i).padStart(2, "0");
      const option = document.createElement("option");
      option.value = val;
      option.textContent = val;
      minSelect.appendChild(option);
    }
    minSelect.value = "00";
  }
});