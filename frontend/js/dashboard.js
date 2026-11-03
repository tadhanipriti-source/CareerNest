
const token = localStorage.getItem("careerNestToken");
const userData = localStorage.getItem("careerNestUser");

// Logout
function logout() {
    localStorage.removeItem("careerNestToken");
    localStorage.removeItem("careerNestUser");
    window.location.href = "login.html";
}

// Load Dashboard
async function loadDashboard() {
    if (!token || !userData) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            logout();
            return;
        }

        const currentUser = data.user;

        const nameElement = document.getElementById("userName");

        if (nameElement) {
            nameElement.textContent = currentUser.name;
        }

        const currentPage = window.location.pathname;

        if (
            currentPage.includes("candidate-dashboard") &&
            currentUser.role !== "jobseeker"
        ) {
            window.location.href = "employer-dashboard.html";
            return;
        }

        if (
            currentPage.includes("employer-dashboard") &&
            currentUser.role !== "employer"
        ) {
            window.location.href = "candidate-dashboard.html";
            return;
        }

        if (
            currentPage.includes("candidate-dashboard") &&
            currentUser.role === "jobseeker"
        ) {
            await loadCandidateDashboard();
        }

        if (
            currentPage.includes("employer-dashboard") &&
            currentUser.role === "employer"
        ) {
            await loadEmployerDashboard();
        }

    } catch (error) {
        console.error("Dashboard Error:", error);
        alert("Unable to load dashboard. Please login again.");
        logout();
    }
}


// ==============================
// CANDIDATE DASHBOARD
// ==============================

async function loadCandidateDashboard() {
    await Promise.all([
        loadAvailableJobs(),
        loadMyApplications()
    ]);
}


// Load Available Jobs Count
async function loadAvailableJobs() {
    const availableCount = document.getElementById("availableJobs");

    try {
        const response = await fetch(`${API_URL}/jobs`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load jobs");
        }

        const jobs = Array.isArray(data) ? data : data.jobs || [];

        if (availableCount) {
            availableCount.textContent = jobs.length;
        }

    } catch (error) {
        console.error("Available Jobs Error:", error);

        if (availableCount) {
            availableCount.textContent = "0";
        }
    }
}


// Load My Applications
async function loadMyApplications() {
    const container = document.getElementById("myApplications");
    const appliedCount = document.getElementById("appliedJobs");
    const shortlistedCount = document.getElementById("shortlistedJobs");

    if (!container) return;

    try {
        const response = await fetch(
            `${API_URL}/applications/my-applications`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load applications");
        }

        const applications = data.applications || [];

        if (appliedCount) {
            appliedCount.textContent = applications.length;
        }

        if (shortlistedCount) {
            shortlistedCount.textContent = applications.filter(
                application => application.status === "Shortlisted"
            ).length;
        }

        if (applications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span>📄</span>
                    <h3>No Applications Yet</h3>
                    <p>Your applied jobs will appear here.</p>
                    <br>
                    <a href="jobs.html" class="primary-btn"
                       style="display:inline-block;width:auto;text-decoration:none">
                       Browse Jobs
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = applications.map(application => {
            const job = application.job;

            if (!job) {
                return `
                    <div class="job-card">
                        <p>Job details are no longer available.</p>
                        <p>Status: ${escapeHTML(application.status)}</p>
                    </div>
                `;
            }

            return `
                <div class="job-card">
                    <h3>${escapeHTML(job.title)}</h3>
                    <p>🏢 ${escapeHTML(job.company)}</p>
                    <p>📍 ${escapeHTML(job.location)}</p>
                    <p><strong>Job Type:</strong> ${escapeHTML(job.jobType)}</p>
                    <p><strong>Salary:</strong> ${escapeHTML(job.salary)}</p>
                    <p>
                        <strong>Application Status:</strong>
                        <span class="application-status">
                            ${escapeHTML(application.status)}
                        </span>
                    </p>
                    <p>
                        <strong>Applied On:</strong>
                        ${new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Applications Error:", error);

        container.innerHTML = `
            <div class="empty-state">
                <h3>Unable to Load Applications</h3>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;
    }
}


// ==============================
// EMPLOYER DASHBOARD
// ==============================

async function loadEmployerDashboard() {
    await Promise.all([
        loadEmployerJobs(),
        loadEmployerApplicants()
    ]);
}


// Load Employer's Jobs
async function loadEmployerJobs() {
    const container = document.getElementById("myJobs");
    const totalJobsElement = document.getElementById("totalJobs");
    const activeJobsElement = document.getElementById("activeJobs");

    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/jobs/my-jobs`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load jobs");
        }

        const jobs = Array.isArray(data) ? data : data.jobs || [];

        if (totalJobsElement) {
            totalJobsElement.textContent = jobs.length;
        }

        if (activeJobsElement) {
            activeJobsElement.textContent = jobs.filter(
                job => job.isActive !== false
            ).length;
        }

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Jobs Posted Yet</h3>
                    <p>Post your first job opportunity!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3>${escapeHTML(job.title)}</h3>
                <p>🏢 ${escapeHTML(job.company)}</p>
                <p>📍 ${escapeHTML(job.location)}</p>
                <p><strong>Job Type:</strong> ${escapeHTML(job.jobType)}</p>
                <p><strong>Salary:</strong> ${escapeHTML(job.salary)}</p>
                <p>
                    <strong>Status:</strong>
                    ${job.isActive === false ? "Inactive" : "Active"}
                </p>
            </div>
        `).join("");

    } catch (error) {
        console.error("Employer Jobs Error:", error);
        container.innerHTML = `
            <div class="empty-state">
                <h3>Unable to Load Jobs</h3>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;
    }
}


// Load Applicants for All Employer Jobs
async function loadEmployerApplicants() {
    const container = document.getElementById("jobApplicants");
    const totalApplicantsElement = document.getElementById("totalApplicants");

    if (!container) return;

    container.innerHTML = `
        <div class="empty-applicants">
            <p>Loading applicants...</p>
        </div>
    `;

    try {
        const jobsResponse = await fetch(`${API_URL}/jobs/my-jobs`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const jobsData = await jobsResponse.json();

        if (!jobsResponse.ok) {
            throw new Error(jobsData.message || "Unable to load jobs");
        }

        const jobs = Array.isArray(jobsData)
            ? jobsData
            : jobsData.jobs || [];

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="empty-applicants">
                    <h3>No Job Listings</h3>
                    <p>Post a job to receive applications.</p>
                </div>
            `;

            if (totalApplicantsElement) {
                totalApplicantsElement.textContent = "0";
            }
            return;
        }

        const results = await Promise.all(
            jobs.map(async job => {
                try {
                    const response = await fetch(
                        `${API_URL}/applications/${job._id}/applications`,
                        {
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || "Unable to load applicants");
                    }

                    return {
                        job,
                        applications: data.applications || []
                    };

                } catch (error) {
                    console.error(`Applicants Error for ${job.title}:`, error);

                    return {
                        job,
                        applications: [],
                        error: error.message
                    };
                }
            })
        );

        const totalApplicants = results.reduce(
            (total, result) => total + result.applications.length,
            0
        );

        if (totalApplicantsElement) {
            totalApplicantsElement.textContent = totalApplicants;
        }

        if (totalApplicants === 0) {
            container.innerHTML = `
                <div class="empty-applicants">
                    <h3>No Applicants Yet</h3>
                    <p>When candidates apply for your jobs, they will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(result => {
            const job = result.job;

            if (result.error) {
                return `
                    <h3 class="applicants-job-heading">
                        ${escapeHTML(job.title)}
                    </h3>
                    <div class="empty-applicants">
                        ${escapeHTML(result.error)}
                    </div>
                `;
            }

            if (result.applications.length === 0) {
                return `
                    <h3 class="applicants-job-heading">
                        ${escapeHTML(job.title)}
                    </h3>
                    <div class="empty-applicants">
                        No applicants for this job yet.
                    </div>
                `;
            }

            return `
                <h3 class="applicants-job-heading">
                    💼 ${escapeHTML(job.title)}
                    (${result.applications.length} Applicants)
                </h3>

                ${result.applications.map(application => {
                    const applicant = application.applicant;

                    if (!applicant) {
                        return `
                            <div class="applicant-card">
                                <p>Applicant details are unavailable.</p>
                            </div>
                        `;
                    }

                    const skills = Array.isArray(applicant.skills)
                        ? applicant.skills.join(", ")
                        : applicant.skills || "Not added";

                    return `
                        <div class="applicant-card">
                            <h3>👤 ${escapeHTML(applicant.name)}</h3>

                            <p>
                                <strong>Email:</strong>
                                ${escapeHTML(applicant.email)}
                            </p>

                            <p>
                                <strong>Phone:</strong>
                                ${escapeHTML(applicant.phone || "Not provided")}
                            </p>

                            <p>
                                <strong>Skills:</strong>
                                ${escapeHTML(skills)}
                            </p>

                            <p>
                                <strong>Applied Job:</strong>
                                ${escapeHTML(job.title)}
                            </p>

                            <p>
                                <strong>Cover Letter:</strong>
                                ${escapeHTML(application.coverLetter || "Not provided")}
                            </p>

                            <p>
                                <strong>Applied On:</strong>
                                ${new Date(application.appliedAt).toLocaleDateString()}
                            </p>

                            <p>
                                <strong>Status:</strong>
                                <span class="applicant-status">
                                    ${escapeHTML(application.status)}
                                </span>
                            </p>

                            ${applicant.resume ? `
                                <p>
                                    <strong>Resume:</strong>
                                    <a href="${escapeHTML(getResumeURL(applicant.resume))}"
                                       target="_blank" rel="noopener">
                                       View Resume
                                    </a>
                                </p>
                            ` : `
                                <p><strong>Resume:</strong> Not uploaded</p>
                            `}

                            <div class="applicant-actions">
                                <button class="review-btn"
                                    onclick="updateApplicationStatus('${application._id}', 'Reviewed')">
                                    Reviewed
                                </button>

                                <button class="shortlist-btn"
                                    onclick="updateApplicationStatus('${application._id}', 'Shortlisted')">
                                    Shortlist
                                </button>

                                <button class="reject-btn"
                                    onclick="updateApplicationStatus('${application._id}', 'Rejected')">
                                    Reject
                                </button>

                                <button class="select-btn"
                                    onclick="updateApplicationStatus('${application._id}', 'Selected')">
                                    Select
                                </button>
                            </div>
                        </div>
                    `;
                }).join("")}
            `;
        }).join("");

    } catch (error) {
        console.error("Employer Applicants Error:", error);

        container.innerHTML = `
            <div class="empty-applicants">
                <h3>Unable to Load Applicants</h3>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;

        if (totalApplicantsElement) {
            totalApplicantsElement.textContent = "0";
        }
    }
}


// Update Applicant Status
async function updateApplicationStatus(applicationId, status) {
    const confirmed = confirm(
        `Are you sure you want to change this application status to ${status}?`
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `${API_URL}/applications/${applicationId}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Status update failed");
        }

        alert(data.message || "Application status updated!");

        await loadEmployerApplicants();

    } catch (error) {
        console.error("Status Update Error:", error);
        alert(error.message);
    }
}


// Resume URL Helper
function getResumeURL(resume) {
    if (/^https?:\/\//i.test(resume)) {
        return resume;
    }

    return `http://localhost:5000/${resume.replace(/^\/+/, "")}`;
}


// Escape HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


// Start Dashboard
loadDashboard();
