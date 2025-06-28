let data = null;

fetch("https://raw.githubusercontent.com/saladiin/tracker_db/refs/heads/main/acta_tracker_data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    initializeUI();
  });

function initializeUI() {
  const selector = document.getElementById('shipSelect');
  data.ships.forEach(ship => {
    const opt = document.createElement('option');
    opt.value = ship["Ship Class"];
    opt.textContent = ship["Ship Class"];
    selector.appendChild(opt);
  });

  const actionSel = document.getElementById('actionSelect');
  data.special_actions.forEach(action => {
    if (!action["Special Action name"]) return;
    const opt = document.createElement('option');
    opt.value = action["Special Action name"];
    opt.textContent = action["Special Action name"];
    actionSel.appendChild(opt);
  });

  renderShip();
}

function renderShip() {
  const selectedName = document.getElementById('shipSelect').value;
  const ship = data.ships.find(s => s["Ship Class"] === selectedName);

  const statsSection = document.getElementById('statsSection');
  const damage = ship.Damage || 0;
  const speed = ship.Speed || "N/A";
  const crew = ship.Crew || "N/A";

  statsSection.innerHTML = `
    <h2>${selectedName}</h2>
    <p>
      Damage:
      <button onclick="adjustValue('damage', -1)">-</button>
      <span id="damageValue">${damage}</span> / ${damage}
      <button onclick="adjustValue('damage', 1)">+</button>
      | Crew: ${crew}
    </p>
    <p>Speed: ${speed} | Hull: ${ship.Hull}</p>
    <p>Craft: ${ship["Craft (qty)"] || "None"}</p>
  `;

  const traitsSection = document.getElementById('traitsSection');
  const traitFields = ["Ship traits", "Ship traits.1", "Ship traits.2", "Ship traits.3", "Ship traits.4", "Ship traits.5"];
  const traits = traitFields.map(f => ship[f]).filter(Boolean);
  traitsSection.innerHTML = '<h3>Traits</h3>' + (traits.length > 0
    ? traits.map(t => {
        const tooltip = data.ship_traits?.[t] || "No description available.";
        return `<div class="trait" title="${tooltip}">${t}</div>`;
      }).join('')
    : '<p>No traits listed.</p>');

  const weaponsSection = document.getElementById('weaponsSection');
  const allWeapons = data.weapons || [];
  const shipWeapons = allWeapons.filter(w => w.Ship === selectedName);

  if (shipWeapons.length === 0) {
    weaponsSection.innerHTML = '<h3>Weapons</h3><p>No weapons found for this ship.</p>';
    return;
  }

  const grouped = {};
  for (const w of shipWeapons) {
    if (!grouped[w.Arc]) grouped[w.Arc] = [];
    grouped[w.Arc].push(w);
  }

  weaponsSection.innerHTML = '<h3>Weapons</h3>';
  ["Boresight", "Forward", "Port", "Starboard", "Aft", "Boresight Aft"].forEach(arc => {
    if (!grouped[arc]) return;
    weaponsSection.innerHTML += `<div class="arc-title">${arc}:</div>`;
    grouped[arc].forEach(w => {
      const traitList = (w["Weapon Traits"] || "").split(",").map(t => t.trim()).filter(Boolean);
      const tooltip = traitList.map(t => {
        const desc = data.weapon_traits?.[t] || "No description available.";
        return `<span title="${desc}">${t}</span>`;
      }).join(", ");
      weaponsSection.innerHTML += `
        <div class="weapon-block">
          <strong>${w["Weapon name"]}</strong> (Range ${w.Range}, AD ${w.AD})<br/>
          Traits: ${tooltip}
        </div>
      `;
    });
  });
}

function adjustValue(stat, delta) {
  const span = document.getElementById(`${stat}Value`);
  let val = parseInt(span.textContent);
  const max = parseInt(span.parentElement.textContent.split("/")[1]) || val;
  val = Math.max(0, Math.min(val + delta, max));
  span.textContent = val;
}

function executeAction() {
  const selected = document.getElementById('actionSelect').value;
  const action = data.special_actions.find(a => a["Special Action name"] === selected);
  if (action) {
    alert(`${action["Special Action name"]}:\n${action["Special Action effect"] || "No description available."}`);
  }
}
