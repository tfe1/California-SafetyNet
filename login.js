// This function will be called when the Logout button is clicked.
function logoutFunction() {
    // Clear user session items from local storage
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');

    // Redirect to the User Login page
    window.location.href = 'UserLogin.html';
}

const signInButton = document.getElementById("login-button")
signInButton.addEventListener("click", async (e) => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log(email,password);
    const res = await fetch('/api/user', {
        method: 'POST', // Specify the HTTP method to use.
        headers: { 'Content-Type': 'application/json' }, // Set the content type of the request to JSON.
        body: JSON.stringify({ email,password }) // Convert the alert message to a JSON string and set as the request body.
    })
    const data = await res.json();
    if (res.status === 401 && data.code === "auth/invalid-credential") {
        // send error
        const errorMessageEle = document.getElementById("error-message")
        errorMessageEle.innerText = "invalid username or password"
        return
    }
    console.log(data)
    localStorage.setItem('refresh_token', data.user.stsTokenManager.refreshToken)
    localStorage.setItem('user_id', data.user.uid)
    localStorage.setItem('county', data.county)

    switch (data.role){
        case "P1":
            localStorage.setItem('user_role', "director");
            break;
        case "P2":
            localStorage.setItem('user_role', "citizen");
            break;
        default:
            //Do nothing.
    }
    //Insert user role from sign in response
    window.location.href = '/';
})