const VALID_HASH = "aed6efb7a96a59f43ad456cbeace8e03f962468104a4e37c94725c261647c99f";

async function sha256(str) {
  const enc = new TextEncoder().encode(str);
  const buffer = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}

// Obsługa formularza
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // blokuje domyślny submit
    const password = document.getElementById("password-input").value;
    const hash = await sha256(password);

    if (hash === VALID_HASH) {
        sessionStorage.setItem("pass", password);
        // użycie form submit zamiast window.location.href działa w Messenger WebView
        window.location.href = "app.html";
    } else {
        document.getElementById("login-error").style.display = "flex";
    }
});

// Ukrywanie błędu przy wpisywaniu
document.getElementById("password-input").addEventListener("input", () => {
    document.getElementById("login-error").style.display = "none";
});
