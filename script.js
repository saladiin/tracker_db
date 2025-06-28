let data = null;

fetch("acta_tracker_data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    initializeUI();
  })
  .catch(err => console.error("Fetch/parsing error:", err));

function initializeUI() {
  const selector = document.getElementById("shipSelect");
  data.ships.forEach(ship => {
    const opt = document.createElement("option");
    opt.value = ship["Ship Class"];
    opt.textContent = ship["Ship Class"];
    selector.appendChild(opt);
  });
  renderShip();
}

function createStatRow(label, statKey, ship) {
  const row = document.createElement("div");
  row.className = "stat-row";

  const span = document.createElement("span");
  span.textContent = `${label}:`;

  const value = document.createElement("span");
  value.textContent = ship[statKey];
  value.id = `val-${statKey}`;

  const btnDec = document.createElement("button");
  btnDec.textContent = "–";
  btnDec.onclick = () => adjustStat(statKey, -1);

  const btnInc = document.createElement("button");
  btnInc.textContent = "+";
  btnInc.onclick = () => adjustStat(statKey, 1);

  row.append(span, btnDec, value, btnInc);
  return row;
}

function adjustStat(key, delta) {
  const valueSpan = document.getElementById(`val-${key}`);
  if (!valueSpan) return;
  let val = parseInt(valueSpan.textContent);
  if (isNaN(val)) return;
  val += delta;
  valueSpan.textContent = val;
}

function renderShip() {
  const selectedClass = document.getElementById("shipSelect").value;
  const ship = data.ships.find(s => s["Ship Class"] === selectedClass);

  // STATS
  const statsSection = document.getElementById("statsSection");
  statsSection.innerHTML = `<h2>${ship["Ship Class"]}</h2>`;

  statsSection.appendChild(createStatRow("Speed", "Speed", ship));
  statsSection.appendChild(createStatRow("Hull", "Hull", ship));
  statsSection.appendChild(createStatRow("Damage", "Damage", ship));
  statsSection.appendChild(createStatRow("Crew", "Crew", ship));

  // Static info
  statsSection.innerHTML += `
    <p><strong>Turns:</strong> ${ship.Turns} × ${ship["Turn Angle"]}</p>
    <p><strong>Damage Threshold:</strong> ${ship["Damage threshold"]}</p>
    <p><strong>Crew Threshold:</strong> ${ship["Crew threshold"]}</p>
    <p><strong>Craft:</strong> ${[ship["Craft (qty)"], ship["Craft (qty).1"]].filter(Boolean).join(", ")}</p>
  `;

  // ARC WEAPONS
  const arcSection = document.getElementById("arcLayoutSection");
  arcSection.innerHTML = "";
  const arcs = ["Boresight", "Forward", "Port", "Starboard", "Aft", "Boresight Aft"];

  arcs.forEach(arc => {
    const weapons = data.ship_weapons.filter(w =>
      w.Ship === selectedClass && w.Arc.toLowerCase() === arc.toLowerCase()
    );
    if (weapons.length > 0) {
      const arcTitle = document.createElement("h3");
      arcTitle.textContent = arc;
      arcSection.appendChild(arcTitle);

      const arcTable = document.createElement("table");
      arcTable.className = "arc-table";
      arcTable.innerHTML = `
        <tr><th>Weapon</th><th>AD</th><th>Range</th><th>Traits</th></tr>
        ${weapons.map(w => `
          <tr>
            <td>${w["Weapon name"]}</td>
            <td>${w.AD}</td>
            <td>${w.Range}</td>
            <td>${w["Weapon Traits"]}</td>
          </tr>
        `).join("")}
      `;
      arcSection.appendChild(arcTable);
    }
  });

  // TRAITS
  const traitSection = document.getElementById("traitsSection");
  const traits = [
    ship["Ship traits"], ship["Ship traits.1"], ship["Ship traits.2"],
    ship["Ship traits.3"], ship["Ship traits.4"], ship["Ship traits.5"]
  ].filter(Boolean);
  traitSection.innerHTML = `<h3>Traits</h3><ul>${
    traits.map(t => {
      const detail = data.ship_traits.find(st => st["Ship Trait Name"] === t);
      return `<li><strong>${t}</strong>: ${detail ? detail["ship trait effect"] : "No description"}</li>`;
    }).join("")
  }</ul>`;

  // ALL WEAPONS
  const weaponSection = document.getElementById("weaponsSection");
  const allWeapons = data.ship_weapons.filter(w => w.Ship === selectedClass);
  weaponSection.innerHTML = `<h3>All Weapons</h3><ul>${
    allWeapons.map(w => `<li><strong>${w["Weapon name"]}</strong> (${w.Arc}) – AD: ${w.AD}, Range: ${w.Range}, Traits: ${w["Weapon Traits"]}</li>`).join("")
  }</ul>`;
}
