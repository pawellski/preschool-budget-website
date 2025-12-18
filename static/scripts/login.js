const VALID_HASH = "aed6efb7a96a59f43ad456cbeace8e03f962468104a4e37c94725c261647c99f";

async function sha256(str) {
  const enc = new TextEncoder().encode(str);
  const buffer = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}

document.getElementById("login-btn").addEventListener("click", async () => {
  const password = document.getElementById("password-input").value;
  const hash = await sha256(password);

  if (hash === VALID_HASH) {
      sessionStorage.setItem("pass", password); 
      window.location.href = "app.html";
  } else {
      document.getElementById("login-error").style.display = "block";
  }
});
