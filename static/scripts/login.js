const VALID_HASH = "a03f7ee191cdaf4831547a9a22d8adfd2659c99bc358959b4710b2428958006e";

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
