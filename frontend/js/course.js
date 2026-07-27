// API Configuration
const API_BASE = "https://api.careerkrafter.in";
const COURSES_API = `${API_BASE}/api/courses`;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Get Course ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const courseContent = document.getElementById('courseContent');

    if (!courseId) {
        showError();
        return;
    }

    try {
        // 2. Fetch Course Data
        const res = await fetch(`${COURSES_API}/${courseId}`);
        if (!res.ok) {
            throw new Error('Course not found');
        }
        
        const course = await res.json();
        
        // 3. Populate DOM Elements
        document.title = `${course.title} | TalentConnect Careerkraft`;
        
        document.getElementById('courseTitle').textContent = course.title;
        document.getElementById('courseShortDesc').textContent = course.description;
        document.getElementById('courseDuration').textContent = course.duration || 'Flexible';
        document.getElementById('courseLevel').textContent = course.level || 'All Levels';
        
        // Handle Full Description
        const fullDescEl = document.getElementById('courseFullDesc');
        if (course.full_description) {
            fullDescEl.textContent = course.full_description;
        } else {
            fullDescEl.textContent = course.description; // Fallback
        }

        // Handle Icon / Image Display
        const iconContainer = document.getElementById('courseIconContainer');
        if (course.icon && course.icon.startsWith('http')) {
            iconContainer.innerHTML = `<img src="${course.icon}" alt="Course Icon" class="w-full h-full object-contain rounded-xl" onerror="this.outerHTML='<span>📁</span>'">`;
        } else {
            iconContainer.innerHTML = `<span>${course.icon || '📁'}</span>`;
        }

        // Handle Features (comma-separated tags)
        const featuresList = document.getElementById('courseFeaturesList');
        featuresList.innerHTML = ''; // Clear template
        
        if (course.features) {
            // Split by comma and filter out empty strings
            const featureArray = course.features.split(',').map(f => f.trim()).filter(f => f);
            
            if (featureArray.length > 0) {
                featureArray.forEach(feature => {
                    const li = document.createElement('li');
                    li.className = "flex items-start text-gray-300";
                    li.innerHTML = `
                        <div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 mt-0.5">
                            <i class="fa-solid fa-check text-xs"></i>
                        </div>
                        <span class="leading-relaxed">${feature}</span>
                    `;
                    featuresList.appendChild(li);
                });
            } else {
                featuresList.innerHTML = '<li class="text-gray-500 italic">No specific features listed</li>';
            }
        } else {
            featuresList.innerHTML = '<li class="text-gray-500 italic">No specific features listed</li>';
        }

        // 4. Show Content
        loadingState.classList.add('hidden');
        courseContent.classList.remove('hidden');

    } catch (error) {
        console.error("Error fetching course details:", error);
        showError();
    }
    
    function showError() {
        loadingState.classList.add('hidden');
        courseContent.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
});
