const KEY_LEN = 32;
const IV_LEN = 16;
const ITERATIONS = 10000;

async function deriveKeyAndInitializationVector(password, salt, keyLen = KEY_LEN, ivLen = IV_LEN, iterations = ITERATIONS) {
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256"
    },
    keyMaterial,
    (keyLen + ivLen) * 8
  );

  const derived = new Uint8Array(derivedBits);

  return {
    key: derived.slice(0, keyLen),
    iv: derived.slice(keyLen, keyLen + ivLen)
  };
}

async function decrypt(encBase64, password) {
    const encBytes = Uint8Array.from(atob(encBase64), c => c.charCodeAt(0));

    const header = encBytes.slice(0, 8);
    const salt = encBytes.slice(8, 16);
    const data = encBytes.slice(16);

    const headerStr = new TextDecoder().decode(header);
    if (headerStr !== "Salted__") {
        throw new Error("Inproper cryptogram format.");
    }

    const { key, iv } = await deriveKeyAndInitializationVector(password, salt);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        "AES-CBC",
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv: iv },
        cryptoKey,
        data
    );

    return new TextDecoder().decode(decrypted);
}

async function loadAndDecryptFile(filePath) {
    const password = sessionStorage.getItem("pass");
    if (!password) {
        alert("Nie udało się odszyfrować danych. Nieprawidłowe hasło.");
        window.location.href = "index.html";
        return;
    }

    try {
        const content = await fetch(filePath);
        const encBase64Json = await content.text();
        const decryptedText = await decrypt(encBase64Json, password);
        return JSON.parse(decryptedText);
    } catch (ex) {
        console.error("Cannot decrypt cryptogram: ", ex);
        alert("Nie udało się odszyfrować danych. Nieprawidłowe hasło.");
        window.location.href = "index.html";
        return;
    }
}

function formatPrice(value) {
    const number = Number(value);
    const [intPart, decPart] = number.toFixed(2).split(".");
    const intWithSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${intWithSpaces}.${decPart} zł`;
}

function createMonthTile(monthData) {
    const monthsContainer = document.querySelector(".months");

    const monthDiv = document.createElement("div");
    monthDiv.classList.add("month");

    // Header
    const header = document.createElement("div");
    header.classList.add("month-header");
    header.innerHTML = `
        ${monthData.month}
        <button class="arrow" aria-label="Rozwiń">&#9654;</button>
    `;
    monthDiv.appendChild(header);

    // Content
    const content = document.createElement("div");
    content.classList.add("month-content");

    // Events
    monthData.events.forEach(event => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event");

        const title = document.createElement("div");
        title.classList.add("event-title");
        title.textContent = event.name;
        eventDiv.appendChild(title);

        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Produkt</th>
                    <th>Liczba sztuk</th>
                    <th>Kwota</th>
                </tr>
            </thead>
        `;

        const tbody = document.createElement("tbody");

        event.items.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="left">${item.product}</td>
                <td>${item.numberOfItems}</td>
                <td>${formatPrice(item.price)}</td>
            `;
            tbody.appendChild(tr);
        });

        // Total event sum
        const sum = document.createElement("tr");
        sum.classList.add("sum-row");
        sum.innerHTML = `
            <td colspan="2">Suma wydatków</td>
            <td>${formatPrice(event.totalPrice)}</td>
        `;

        tbody.appendChild(sum);
        table.appendChild(tbody);
        eventDiv.appendChild(table);

        content.appendChild(eventDiv);
    });

    // Month total
    const totalDiv = document.createElement("div");
    totalDiv.classList.add("month-total");
    totalDiv.innerHTML = `
        Razem: <span class="amount">${formatPrice(monthData.totalPrice)}</span>
    `;
    content.appendChild(totalDiv);

    monthDiv.appendChild(content);
    monthsContainer.appendChild(monthDiv);
}

function createSummaryTile(label, value) {
    const tile = document.createElement("div");

    const text = document.createTextNode(label + " ");
    const span = document.createElement("span");
    span.textContent = value;

    tile.appendChild(text);
    tile.appendChild(span);

    return tile;
}

function fillSummary(initialBudget, availableBudget) {
    const summary = document.querySelector(".summary");
    summary.appendChild(createSummaryTile("Początkowy budżet", formatPrice(initialBudget)));
    summary.appendChild(createSummaryTile("Dostępny budżet", formatPrice(availableBudget)));
}

async function loadAllData() {
    const rootData = await loadAndDecryptFile("./static/data/root_data.enc");

    let expenses = 0.0;
    const files = rootData.files;
    for (const file of files) {
        const data = await loadAndDecryptFile(`./static/data/${file}`);

        expenses += data.totalPrice

        createMonthTile(data);
    }
    fillSummary(rootData.initialBudget, rootData.initialBudget - expenses);

    if (typeof initMonthToggle === "function") {
        initMonthToggle();
    }

    requestAnimationFrame(() => {
        document.querySelector('.summary').style.opacity = '1';
        document.querySelector('.months').style.opacity = '1';
    });
}

window.addEventListener("DOMContentLoaded", async () => loadAllData());
