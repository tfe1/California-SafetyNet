const header = document.getElementById("header");

const navTitle = document.createElement("h1");
navTitle.textContent = "California SafetyNet";

const navContainer = document.createElement("nav");

const home = document.createElement("a");
home.textContent = "Home";
home.href = "index.html";
navContainer.appendChild(home);

const userRole = localStorage.getItem('user_role') || ''
const userToken = localStorage.getItem('refresh_token') || ''
const userID = localStorage.getItem('user_id') || ''
if (userRole) {
    if (userRole && userRole === 'director' && userToken) {
        const directorProfile = document.createElement("a"); // only show if user signed in and role === director
        directorProfile.textContent = "Director Profile";
        directorProfile.href = `directorProfile.html`;

        navContainer.appendChild(directorProfile);
    } else if (userRole && userRole === 'citizen') {
        const profile = document.createElement("a"); // only show if user signed in
        profile.textContent = "User Profile";
        profile.href = `UserProfile.html`;
        navContainer.appendChild(profile);
    }
    const logout = document.createElement("a"); // only show if user signed in
    logout.textContent = "Logout";
    logout.href = `UserLogin.html`;
    logout.addEventListener('click', () => {
        localStorage.removeItem('user_role')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_id')
        localStorage.removeItem('county')
    })
    navContainer.appendChild(logout);
} else {
    const register = document.createElement("a"); // only show if user not signed in
    register.textContent = "Register";
    register.href = "register.html";

    const login = document.createElement("a"); // only show if user not signed in
    login.textContent = "User Login";
    login.href = "UserLogin.html";

    const directorLogin = document.createElement("a"); // only show if user not signed in
    directorLogin.textContent = "County Department Login";
    directorLogin.href = "DirectorLogin.html";


    navContainer.appendChild(register);
    navContainer.appendChild(login);
    navContainer.appendChild(directorLogin);
}
header.appendChild(navTitle);
header.appendChild(navContainer)