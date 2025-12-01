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
                <td>${item.price}</td>
            `;
            tbody.appendChild(tr);
        });

        // Total event sum
        const sum = document.createElement("tr");
        sum.classList.add("sum-row");
        sum.innerHTML = `
            <td colspan="2">Suma wydatków</td>
            <td>${event.totalPrice}</td>
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
        Razem: <span class="amount">${monthData.totalPrice}</span>
    `;
    content.appendChild(totalDiv);

    monthDiv.appendChild(content);
    monthsContainer.appendChild(monthDiv);
}

async function loadAllData() {
  const rootResponse = await fetch('./static/data/root_data.json');
  const rootData = await rootResponse.json();
  
  const files = rootData.files;
  for (const file of files) {
    const response = await fetch(`./static/data/${file}`);
    const data = await response.json();
    createMonthTile(data);
  }

  if (typeof initMonthToggle === "function") {
    initMonthToggle();
  }
}

// invoke
loadAllData();
