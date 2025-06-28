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
  statsSection.innerHTML = `
    <h2>${selectedName}</h2>
    <p>
      Damage:
      <button onclick="adjustValue('damage', -1)">-</button>
      <span id="damageValue">${ship.Damage}</span> / ${ship.Damage}
      <button onclick="adjustValue('damage', 1)">+</button>
    </p>
    <p>
      Crew:
      <button onclick="adjustValue('crew', -1)">-</button>
      <span id="crewValue">${ship.Crew}</span> / ${ship.Crew}
      <button onclick="adjustValue('crew', 1)">+</button>
    </p>
    <p>Speed: ${ship.Speed} | Hull: ${ship.Hull}</p>
    <p>Craft: ${ship["Craft (qty)"]}</p>
  `;

  const traitsSection = document.getElementById('traitsSection');
  const traitFields = ["Ship traits", "Ship traits.1", "Ship traits.2", "Ship traits.3", "Ship traits.4", "Ship traits.5"];
  const traits = traitFields.map(f => ship[f]).filter(Boolean);
  traitsSection.innerHTML = '<h3>Traits</h3>' + traits.map(t => {
    const detail = data.ship_traits.find(tr => tr["Ship Trait Name"] === t);
    return `<div class="trait" title="${detail ? detail["ship trait effect"] : ""}">${t}</div>`;
  }).join('');

  const weapons = data.ship_weapons.filter(w => w.Ship === selectedName);
  const grouped = {};
  for (const w of weapons) {
    if (!grouped[w.Arc]) grouped[w.Arc] = [];
    grouped[w.Arc].push(w);
  }

  const weaponsSection = document.getElementById('weaponsSection');
  weaponsSection.innerHTML = '<h3>Weapons</h3>';
  ["Boresight", "Forward", "Port", "Starboard", "Aft", "Boresight Aft"].forEach(arc => {
    if (!grouped[arc]) return;
    weaponsSection.innerHTML += `<div class="arc-title">${arc}:</div>`;
    grouped[arc].forEach(w => {
      const traits = (w["Weapon Traits"] || "").split(",").map(t => t.trim()).filter(Boolean);
      const tooltip = traits.map(t => {
        const found = data.weapon_traits.find(wt => wt["Weapon Trait Name"] === t);
        return `<span title="${found ? found.Effect : ""}">${t}</span>`;
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

  const selectedName = document.getElementById('shipSelect').value;
  const ship = data.ships.find(s => s["Ship Class"] === selectedName);
  const max = stat === 'damage' ? ship.Damage : ship.Crew;

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
