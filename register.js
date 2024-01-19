const registerButton = document.getElementById("register-button")
registerButton.addEventListener("click", async (e) => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const county = document.getElementById("county").value;

    const res = await fetch('/api/submit-registration', {
        method: 'POST', // Specify the HTTP method to use.
        headers: { 'Content-Type': 'application/json' }, // Set the content type of the request to JSON.
        body: JSON.stringify({ email,password,role,county }) // Convert the alert message to a JSON string and set as the request body.
    })
    const data = await res.json();
    if (res.status === 401) {
        const errorMessageEle = document.getElementById("error-message")
        if (data.code === "auth/email-already-in-use") {
            errorMessageEle.innerText = "Email already in use"
            return
        } else if (data.code === "auth/weak-password") {
            errorMessageEle.innerText = "Weak password"
            return
        }
        // handle duplicate email

    }
    if (res.status === 200) {
        // successful created user
        window.location.href = '/UserLogin.html';
    }
})