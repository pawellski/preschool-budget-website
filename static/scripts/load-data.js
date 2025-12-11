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
        <span class="arrow">&#9654;</span>
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
    const rootResponse = await fetch('./static/data/root_data.json');
    const rootData = await rootResponse.json();

    const files = rootData.files
    let expenses = 0.0;
    for (const file of files) {
        const response = await fetch(`./static/data/${file}`);
        const data = await response.json();

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

// invoke
loadAllData();
