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

  const actionSelect = document.getElementById("actionSelect");
  actionSelect.innerHTML = "";
  data.special_actions?.forEach(action => {
    const opt = document.createElement("option");
    opt.value = action.name;
    opt.textContent = action.name;
    actionSelect.appendChild(opt);
  });

  renderShip();
}

function adjustValue(field, delta) {
  const selectedClass = document.getElementById('shipSelect').value;
  const ship = data.ships.find(s => s["Ship Class"] === selectedClass);
  ship[field] = Math.max(0, (parseInt(ship[field]) || 0) + delta);
  renderShip();
}

function renderShip() {
  const selectedClass = document.getElementById("shipSelect").value;
  const ship = data.ships.find(s => s["Ship Class"] === selectedClass);
  if (!ship) return;

  const statsSection = document.getElementById("statsSection");
  statsSection.innerHTML = `
    <h2>${ship["Ship Class"]}</h2>
    <div><strong>Speed:</strong> 
      <span class="adjustable">
        <button onclick="adjustValue('Speed', -1)">-</button>
        ${ship.Speed}
        <button onclick="adjustValue('Speed', 1)">+</button>
      </span>
    </div>
    <div><strong>Hull:</strong> 
      <span class="adjustable">
        <button onclick="adjustValue('Hull', -1)">-</button>
        ${ship.Hull}
        <button onclick="adjustValue('Hull', 1)">+</button>
      </span>
    </div>
    <div><strong>Turns:</strong> ${ship.Turns} × ${ship["Turn Angle"]}</div>
    <div><strong>Damage:</strong> ${ship.Damage}/${ship["Damage threshold"]}</div>
    <div><strong>Crew:</strong> ${ship.Crew}/${ship["Crew threshold"]}</div>
    <div><strong>Craft:</strong> ${[ship["Craft (qty)"], ship["Craft (qty).1"]].filter(Boolean).join(", ")}</div>
  `;

  const arcSection = document.getElementById("arcLayoutSection");
  arcSection.innerHTML = "";
  const arcs = ["Boresight", "Forward", "Port", "Starboard", "Aft", "Boresight Aft"];
  arcs.forEach(arc => {
    const weapons = data.ship_weapons.filter(w =>
      w.Ship === selectedClass && w.Arc.toLowerCase() === arc.toLowerCase()
    );
    if (weapons.length > 0) {
      arcSection.innerHTML += `
        <h3>${arc}</h3>
        <table class="arc-table">
          <tr><th>Weapon</th><th>AD</th><th>Range</th><th>Traits</th></tr>
          ${weapons.map(w => `
            <tr>
              <td>${w["Weapon name"]}</td>
              <td>${w.AD}</td>
              <td>${w.Range}</td>
              <td>${w["Weapon Traits"]}</td>
            </tr>`).join("")}
        </table>`;
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

function executeAction() {
  const action = document.getElementById("actionSelect").value;
  alert(`Action "${action}" executed (placeholder logic).`);
}
