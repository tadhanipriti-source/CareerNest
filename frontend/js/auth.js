function togglePassword(id, button) {
    const input = document.getElementById(id);

    if (input.type === "password") {
        input.type = "text";
        button.textContent = "Hide";
    } else {
        input.type = "password";
        button.textContent = "Show";
    }
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const role = document.getElementById("role").value;

        const message = document.getElementById("message");
        const button = document.getElementById("registerBtn");

        message.className = "message";
        message.textContent = "";

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match!";
            message.classList.add("error");
            return;
        }

        if (password.length < 6) {
            message.textContent = "Password must be at least 6 characters!";
            message.classList.add("error");
            return;
        }

        button.disabled = true;
        button.textContent = "Creating Account...";

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            message.textContent = "Registration successful! Redirecting to login...";
            message.classList.add("success");

            registerForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } catch (error) {
            message.textContent = error.message;
            message.classList.add("error");
        } finally {
            button.disabled = false;
            button.textContent = "Create Account";
        }
    });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");
        const button = document.getElementById("loginBtn");

        message.className = "message";
        message.textContent = "";

        button.disabled = true;
        button.textContent = "Logging in...";

        try {

            const response = await fetch(`${API_URL}/auth/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            localStorage.setItem("careerNestToken", data.token);

            localStorage.setItem(
                "careerNestUser",
                JSON.stringify(data.user)
            );

            message.textContent = "Login successful!";
            message.classList.add("success");

            if (data.user.role === "employer") {

                window.location.href = "employer-dashboard.html";

            } else {

                window.location.href = "candidate-dashboard.html";

            }

        } catch (error) {

            message.textContent = error.message;
            message.classList.add("error");

        } finally {

            button.disabled = false;
            button.textContent = "Login";

        }

    });

}
