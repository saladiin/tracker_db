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
  selector.innerHTML = "";
  data.ships.forEach(ship => {
    const opt = document.createElement("option");
    opt.value = ship["Ship Class"];
    opt.textContent = ship["Ship Class"];
    selector.appendChild(opt);
  });

  const actionSelect = document.getElementById("actionSelect");
  actionSelect.innerHTML = "";
  (data.special_actions || []).forEach(action => {
    const opt = document.createElement("option");
    opt.value = action.name;
    opt.textContent = action.name;
    actionSelect.appendChild(opt);
  });

  renderShip();
}

function adjustValue(field, delta) {
  const selected = document.getElementById("shipSelect").value;
  const ship = data.ships.find(s => s["Ship Class"] === selected);
  if (!ship) return;
  ship[field] = Math.max(0, (parseInt(ship[field]) || 0) + delta);
  renderShip();
}

function renderShip() {
  const selected = document.getElementById("shipSelect").value;
  const ship = data.ships.find(s => s["Ship Class"] === selected);
  if (!ship) return;

  const stats = document.getElementById("statsSection");
  stats.innerHTML = `
    <h2>${ship["Ship Class"]}</h2>
    <div><strong>Speed:</strong> <span class="adjustable">
      <button onclick="adjustValue('Speed', -1)">-</button> ${ship.Speed}
      <button onclick="adjustValue('Speed', 1)">+</button></span>
    </div>
    <div><strong>Hull:</strong> <span class="adjustable">
      <button onclick="adjustValue('Hull', -1)">-</button> ${ship.Hull}
      <button onclick="adjustValue('Hull', 1)">+</button></span>
    </div>
    <div><strong>Damage:</strong> <span class="adjustable">
      <button onclick="adjustValue('Damage', -1)">-</button> ${ship.Damage}
      <button onclick="adjustValue('Damage', 1)">+</button></span> / ${ship["Damage threshold"]}
    </div>
    <div><strong>Crew:</strong> <span class="adjustable">
      <button onclick="adjustValue('Crew', -1)">-</button> ${ship.Crew}
      <button onclick="adjustValue('Crew', 1)">+</button></span> / ${ship["Crew threshold"]}
    </div>
    <div><strong>Turns:</strong> ${ship.Turns} × ${ship["Turn Angle"]}</div>
    <div><strong>Craft:</strong> ${[ship["Craft (qty)"], ship["Craft (qty).1"]].filter(Boolean).join(", ")}</div>
  `;

  const arcs = ["Boresight", "Forward", "Port", "Starboard", "Aft", "Boresight Aft"];
  const arcSection = document.getElementById("arcLayoutSection");
  arcSection.innerHTML = "";
  arcs.forEach(arc => {
    const weapons = data.ship_weapons?.filter(w => 
      w.Ship === selected && w.Arc.toLowerCase() === arc.toLowerCase()
    ) || [];
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

  const traits = [
    ship["Ship traits"], ship["Ship traits.1"], ship["Ship traits.2"],
    ship["Ship traits.3"], ship["Ship traits.4"], ship["Ship traits.5"]
  ].filter(Boolean);

  const traitsDiv = document.getElementById("traitsSection");
  traitsDiv.innerHTML = `<h3>Traits</h3><ul>${
    traits.map(t => {
      const found = data.ship_traits?.find(st => st["Ship Trait Name"] === t);
      return `<li><strong>${t}</strong>: ${found ? found["ship trait effect"] : "No description"}</li>`;
    }).join("")
  }</ul>`;

  const allWeapons = data.ship_weapons?.filter(w => w.Ship === selected) || [];
  const weaponsSection = document.getElementById("weaponsSection");
  weaponsSection.innerHTML = `<h3>All Weapons</h3><ul>${
    allWeapons.map(w => `<li><strong>${w["Weapon name"]}</strong> (${w.Arc}) – AD: ${w.AD}, Range: ${w.Range}, Traits: ${w["Weapon Traits"]}</li>`).join("")
  }</ul>`;
}

function executeAction() {
  const action = document.getElementById("actionSelect").value;
  alert(`Action "${action}" executed.`);
}
