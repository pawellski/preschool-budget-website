const VALID_HASH = "17e19d2e23a17f289d8b663480ab8fc1bd1412dcb7cac484e57528d83629610f";

async function sha256(str) {
  const enc = new TextEncoder().encode(str);
  const buffer = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password-input").value;
    const hash = await sha256(password);

    if (hash === VALID_HASH) {
        sessionStorage.setItem("pass", password);
        window.location.href = "app.html";
    } else {
        document.getElementById("login-error").style.display = "flex";
    }
});

document.getElementById("password-input").addEventListener("input", () => {
    document.getElementById("login-error").style.display = "none";
});
