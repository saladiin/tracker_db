
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

  const actionSel = document.getElementById("actionSelect");
  data.ship_actions.forEach(act => {
    const opt = document.createElement("option");
    opt.value = act["Action Name"];
    opt.textContent = act["Action Name"];
    actionSel.appendChild(opt);
  });

  renderShip();
}

function createStatAdjuster(statName, baseValue) {
  const wrapper = document.createElement("div");
  wrapper.className = "adjustable";

  const label = document.createElement("span");
  label.textContent = baseValue;
  label.id = `${statName}Value`;

  const inc = document.createElement("button");
  inc.textContent = "+";
  inc.className = "stat-button";
  inc.onclick = () => adjustStat(statName, 1);

  const dec = document.createElement("button");
  dec.textContent = "–";
  dec.className = "stat-button";
  dec.onclick = () => adjustStat(statName, -1);

  wrapper.appendChild(dec);
  wrapper.appendChild(label);
  wrapper.appendChild(inc);

  return wrapper;
}

const statState = {};

function adjustStat(stat, delta) {
  statState[stat] = (statState[stat] || 0) + delta;
  const display = document.getElementById(`${stat}Value`);
  if (display) display.textContent = statState[stat];
}

function renderShip() {
  const selectedClass = document.getElementById('shipSelect').value;
  const ship = data.ships.find(s => s["Ship Class"] === selectedClass);

  statState["Speed"] = ship.Speed;
  statState["Hull"] = ship.Hull;

  const statsSection = document.getElementById("statsSection");
  statsSection.innerHTML = `
    <h2>${ship["Ship Class"]}</h2>
    <p><strong>Speed:</strong></p>
  `;
  statsSection.appendChild(createStatAdjuster("Speed", ship.Speed));
  statsSection.innerHTML += `<p><strong>Hull:</strong></p>`;
  statsSection.appendChild(createStatAdjuster("Hull", ship.Hull));
  statsSection.innerHTML += `
    <p><strong>Turns:</strong> ${ship.Turns} × ${ship["Turn Angle"]}</p>
    <p><strong>Damage:</strong> ${ship.Damage}/${ship["Damage threshold"]}</p>
    <p><strong>Crew:</strong> ${ship.Crew}/${ship["Crew threshold"]}</p>
    <p><strong>Craft:</strong> ${[ship["Craft (qty)"], ship["Craft (qty).1"]].filter(Boolean).join(", ")}</p>
  `;

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
      arcTable.classList.add("arc-table");
      arcTable.innerHTML = `
        <tr><th>Weapon</th><th>AD</th><th>Range</th><th>Traits</th></tr>
        ${weapons.map(w => `
          <tr>
            <td>${w["Weapon name"]}</td>
            <td>${w.AD}</td>
            <td>${w.Range}</td>
            <td>${w["Weapon Traits"]}</td>
          </tr>`).join("")}
      `;
      arcSection.appendChild(arcTable);
    }
  });

  const traitNames = [
    ship["Ship traits"], ship["Ship traits.1"], ship["Ship traits.2"],
    ship["Ship traits.3"], ship["Ship traits.4"], ship["Ship traits.5"]
  ].filter(Boolean);
  const traitsSection = document.getElementById("traitsSection");
  traitsSection.innerHTML = `<h3>Traits</h3><ul>${
    traitNames.map(t => {
      const found = data.ship_traits.find(st => st["Ship Trait Name"] === t);
      return `<li><strong>${t}</strong>: ${found ? found["ship trait effect"] : "No description"}</li>`;
    }).join("")
  }</ul>`;

  const weaponsSection = document.getElementById("weaponsSection");
  const allWeapons = data.ship_weapons.filter(w => w.Ship === selectedClass);
  weaponsSection.innerHTML = `<h3>All Weapons</h3><ul>${
    allWeapons.map(w => `<li><strong>${w["Weapon name"]}</strong> (${w.Arc}) – AD: ${w.AD}, Range: ${w.Range}, Traits: ${w["Weapon Traits"]}</li>`).join("")
  }</ul>`;
}
