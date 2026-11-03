
let allJobsData = [];

const jobsContainer = document.getElementById("allJobs");
const searchInput = document.getElementById("searchJobs");

// Load All Jobs
async function loadAllJobs() {
    try {
        const response = await fetch(`${API_URL}/jobs`);
        const data = await response.json();

        allJobsData = Array.isArray(data)
            ? data
            : data.jobs || [];

        displayJobs(allJobsData);

    } catch (error) {
        console.error("Error loading jobs:", error);
        jobsContainer.innerHTML = "<p>Unable to load jobs. Please try again.</p>";
    }
}

// Display Jobs
function displayJobs(jobs) {
    if (!jobs.length) {
        jobsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No Jobs Found</h3>
                <p>Try searching for another job.</p>
            </div>
        `;
        return;
    }

    jobsContainer.innerHTML = jobs.map(job => `
        <div class="job-card dashboard-section">

            <h2>${escapeHTML(job.title)}</h2>

            <h3>🏢 ${escapeHTML(job.company)}</h3>

            <p>📍 ${escapeHTML(job.location)}</p>

            <p>
                ${escapeHTML(job.jobType)}
                |
                ${escapeHTML(job.salary)}
                |
                ${escapeHTML(job.experience)}
            </p>

            <p>${escapeHTML(job.description)}</p>

            <p>
                <strong>Skills:</strong>
                ${(job.skills || []).map(skill => escapeHTML(skill)).join(", ")}
            </p>

            <div class="job-actions">
                <button
                    class="edit-job-btn"
                    onclick="viewJobDetails('${job._id}')">
                    View Details
                </button>

                <button
                    class="delete-job-btn"
                    onclick="applyForJob('${job._id}')">
                    Apply Now
                </button>
            </div>

        </div>
    `).join("");
}

// View Job Details
function viewJobDetails(jobId) {
    const job = allJobsData.find(item => item._id === jobId);

    if (!job) return;

    alert(
        "Job Details\n\n" +
        "Title: " + job.title + "\n" +
        "Company: " + job.company + "\n" +
        "Location: " + job.location + "\n" +
        "Type: " + job.jobType + "\n" +
        "Salary: " + job.salary + "\n" +
        "Experience: " + job.experience + "\n\n" +
        "Description:\n" + job.description
    );
}

// Search Jobs
if (searchInput) {
    searchInput.addEventListener("input", function () {
        const searchText = this.value.toLowerCase();

        const filteredJobs = allJobsData.filter(job =>
            (job.title || "").toLowerCase().includes(searchText) ||
            (job.company || "").toLowerCase().includes(searchText) ||
            (job.location || "").toLowerCase().includes(searchText)
        );

        displayJobs(filteredJobs);
    });
}

// Safe HTML Text
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Load Jobs
loadAllJobs();
