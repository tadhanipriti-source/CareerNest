
const APPLICATION_API = `${API_URL}/applications`;

// Apply for Job
async function applyForJob(jobId) {
    const token = localStorage.getItem("careerNestToken");
    const user = JSON.parse(
        localStorage.getItem("careerNestUser") || "null"
    );

    if (!token || !user) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    if (user.role !== "jobseeker") {
        alert("Only Job Seekers can apply for jobs!");
        return;
    }

    const coverLetter = prompt(
        "Write a short cover letter (optional):"
    );

    if (coverLetter === null) return;

    try {
        const response = await fetch(
            `${APPLICATION_API}/${jobId}/apply`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    coverLetter: coverLetter
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Application failed!");
            return;
        }

        alert("🎉 Job Applied Successfully!");

    } catch (error) {
        console.error(error);
        alert("Server connection failed!");
    }
}
