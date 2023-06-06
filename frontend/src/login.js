import { loadDocuments } from "./notes";

const form = document.createElement("form");
form.addEventListener("submit", handleLogin);

const usernameInput = document.createElement("input");
usernameInput.type = "text";
usernameInput.name = "username";
usernameInput.placeholder = "Username";
form.appendChild(usernameInput);

const passwordInput = document.createElement("input");
passwordInput.type = "password";
passwordInput.name = "password";
passwordInput.placeholder = "Password";
form.appendChild(passwordInput);

const loginButton = document.createElement("button");
loginButton.type = "submit";
loginButton.textContent = "Log in";
form.appendChild(loginButton);

const registerButton = document.createElement("button");
registerButton.type = "button";
registerButton.textContent = "Register";
registerButton.addEventListener("click", handleRegistration);
form.appendChild(registerButton);

document.querySelector("div#app").appendChild(form);

export function handleLogin(event) {
  event.preventDefault();

  const userName = event.target.username.value;
  const userPassword = event.target.password.value;

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userName, userPassword }),
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        sessionStorage.setItem("userId", data.userId);
        loadDocuments(); 
      }
    })
    .catch((error) => console.error(error));
}

export function handleRegistration() {
  const userName = prompt("Enter a username:");
  const userPassword = prompt("Enter a password:");
  const userEmail = prompt("Enter an email");

  fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userName, userPassword, userEmail }),
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error");
      }
    })
    .then((data) => {
      if (data.success) {
        console.log("User registered successfully");
      } else {
        console.log("Registration failed");
      }
    })
    .catch((error) => console.error(error));
}