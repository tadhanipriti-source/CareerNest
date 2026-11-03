
const jobForm = document.getElementById("jobForm");
const myJobsContainer = document.getElementById("myJobs");

let editingJobId = null;

function toggleJobForm() {
    jobForm.classList.toggle("show");
}

// Edit Job - Fill Form
function editJob(job) {
    editingJobId = job._id;

    document.getElementById("jobTitle").value = job.title || "";
    document.getElementById("companyName").value = job.company || "";
    document.getElementById("jobLocation").value = job.location || "";
    document.getElementById("jobType").value = job.jobType || "Full Time";
    document.getElementById("jobSalary").value = job.salary || "";
    document.getElementById("jobExperience").value = job.experience || "";
    document.getElementById("jobSkills").value =
        (job.skills || []).join(", ");

    document.getElementById("jobDescription").value =
        job.description || "";

    document.getElementById("jobRequirements").value =
        (job.requirements || []).join(", ");

    document.querySelector("#jobForm h2").textContent = "Edit Job Details";
    jobForm.classList.add("show");

    document.getElementById("jobMessage").textContent = "";

    jobForm.scrollIntoView({ behavior: "smooth" });
}

// Publish / Update Job
if (jobForm) {
    jobForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("careerNestToken");
        const message = document.getElementById("jobMessage");

        const jobData = {
            title: document.getElementById("jobTitle").value.trim(),
            company: document.getElementById("companyName").value.trim(),
            location: document.getElementById("jobLocation").value.trim(),
            jobType: document.getElementById("jobType").value,
            salary: document.getElementById("jobSalary").value.trim(),
            experience: document.getElementById("jobExperience").value.trim(),
            skills: document.getElementById("jobSkills").value
                .split(",").map(s => s.trim()).filter(Boolean),
            description: document.getElementById("jobDescription").value.trim(),
            requirements: document.getElementById("jobRequirements").value
                .split(",").map(s => s.trim()).filter(Boolean)
        };

        try {
            const response = await fetch(
                editingJobId
                    ? `${API_URL}/jobs/${editingJobId}`
                    : `${API_URL}/jobs`,
                {
                    method: editingJobId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(jobData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to save job");
            }

            message.textContent = editingJobId
                ? "Job updated successfully! 🎉"
                : "Job published successfully! 🎉";

            message.style.color = "green";

            editingJobId = null;
            jobForm.reset();

            document.querySelector("#jobForm h2").textContent =
                "Create Job Opportunity";

            setTimeout(() => {
                jobForm.classList.remove("show");
                message.textContent = "";
            }, 1200);

            loadMyJobs();

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "red";
        }
    });
}

// Load Employer Jobs
async function loadMyJobs() {
    const token = localStorage.getItem("careerNestToken");

    if (!token || !myJobsContainer) return;

    try {
        const response = await fetch(`${API_URL}/jobs/my-jobs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load jobs");
        }

        const jobs = data.jobs || [];

        document.getElementById("totalJobs").textContent = jobs.length;

        document.getElementById("activeJobs").textContent =
            jobs.filter(job => job.isActive).length;

        myJobsContainer.innerHTML = "";

        if (jobs.length === 0) {
            myJobsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No Jobs Posted Yet</h3>
                    <p>Your job postings will appear here.</p>
                </div>
            `;
            return;
        }

        jobs.forEach(job => {
            const card = document.createElement("div");
            card.className = "job-card";

            const title = document.createElement("h3");
            title.textContent = job.title;

            const company = document.createElement("p");
            company.textContent = "🏢 " + job.company;

            const location = document.createElement("p");
            location.textContent = "📍 " + job.location;

            const details = document.createElement("p");
            details.textContent =
                `${job.jobType} | ${job.salary} | ${job.experience}`;

            const description = document.createElement("p");
            description.textContent = job.description;

            const buttonGroup = document.createElement("div");
            buttonGroup.className = "job-actions";

            const editButton = document.createElement("button");
            editButton.className = "edit-job-btn";
            editButton.textContent = "✏️ Edit Job";
            editButton.addEventListener("click", () => editJob(job));

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-job-btn";
            deleteButton.textContent = "🗑 Delete Job";
            deleteButton.addEventListener("click", () => deleteJob(job._id));

            buttonGroup.append(editButton, deleteButton);

            card.append(
                title,
                company,
                location,
                details,
                description,
                buttonGroup
            );

            myJobsContainer.appendChild(card);
        });

    } catch (error) {
        console.log("Load Jobs Error:", error);
        myJobsContainer.textContent = error.message;
    }
}

// Delete Job
async function deleteJob(jobId) {
    if (!confirm("Are you sure you want to delete this job?")) return;

    const token = localStorage.getItem("careerNestToken");

    try {
        const response = await fetch(`${API_URL}/jobs/${jobId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to delete job");
        }

        alert("Job deleted successfully!");
        loadMyJobs();

    } catch (error) {
        alert(error.message);
    }
}

loadMyJobs();
