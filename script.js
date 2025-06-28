let data = null;

fetch("https://saladiin.github.io/tracker_db/acta_tracker_data.json")
  .then(res => {
    console.log("Fetch status:", res.status, res.ok);
    return res.json();
  })
  .then(json => {
    console.log("Loaded JSON:", json);
    // Ensure all expected properties exist
    data = {
      ships: json.ships || [],
      ship_weapons: json.ship_weapons || [],
      ship_traits: json.ship_traits || [],
      weapon_traits: json.weapon_traits || [],
      special_actions: json.special_actions || []
    };
    initializeUI();
  })
  .catch(err => {
    console.error("Fetch/parsing error:", err);
  });

function initializeUI() {
  if (!data || !data.ships) {
    console.error("initializeUI: data or data.ships missing", data);
    return;
  }

  const selector = document.getElementById('shipSelect');
  data.ships.forEach(ship => {
    const opt = document.createElement('option');
    opt.value = ship["Ship Class"];
    opt.textContent = ship["Ship Class"];
    selector.appendChild(opt);
  });

  const actionSel = document.getElementById('actionSelect');
  if (Array.isArray(data.special_actions)) {
    data.special_actions.forEach(action => {
      const opt = document.createElement('option');
      opt.value = action["Special Action name"];
      opt.textContent = action["Special Action name"];
      actionSel.appendChild(opt);
    });
  } else {
    console.warn("No special_actions array:", data.special_actions);
  }

  renderShip();
}

function renderShip() {
  const selectedName = document.getElementById('shipSelect').value;
  const ship = data.ships.find(s => s["Ship Class"] === selectedName);
  if (!ship) {
    console.error("renderShip: ship not found:", selectedName);
    return;
  }

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
    <p>Turns: ${ship.Turns} / ${ship["Turn Angle"]}</p>
    <p>Craft: ${ship["Craft (qty)"]}</p>
  `;

  const traitsSection = document.getElementById('traitsSection');
  const traitFields = ["Ship traits", "Ship traits.1", "Ship traits.2", "Ship traits.3", "Ship traits.4", "Ship traits.5"];
  const traits = traitFields.map(f => ship[f]).filter(Boolean);
  traitsSection.innerHTML = '<h3>Traits</h3>' + traits.map(t => {
    const detail = data.ship_traits.find(tr => tr["Ship Trait Name"] === t);
    return `<div class="trait" title="${detail ? detail["ship trait effect"] : ""}">${t}</div>`;
  }).join('');

  const arcs = {
    "Boresight": [],
    "Forward": [],
    "Port": [],
    "Starboard": [],
    "Aft": [],
    "Boresight Aft": []
  };

  const weapons = data.ship_weapons.filter(w => w.Ship === selectedName);
  weapons.forEach(w => {
    if (arcs[w.Arc]) {
      arcs[w.Arc].push(w);
    }
  });

  const arcGrid = `
    <div class="arc-grid">
      <div class="arc-row">
        <div></div>
        <div class="arc-box" title="${tooltipFor(arcs['Boresight'])}">
          ${adRange(arcs['Boresight'])}
        </div>
        <div></div>
      </div>
      <div class="arc-row">
        <div class="arc-box" title="${tooltipFor(arcs['Port'])}">
          ${adRange(arcs['Port'])}
        </div>
        <div class="arc-box" title="${tooltipFor(arcs['Forward'])}">
          ${adRange(arcs['Forward'])}
        </div>
        <div class="arc-box" title="${tooltipFor(arcs['Starboard'])}">
          ${adRange(arcs['Starboard'])}
        </div>
      </div>
      <div class="arc-row">
        <div></div>
        <div class="arc-box" title="${tooltipFor(arcs['Aft'])}">
          ${adRange(arcs['Aft'])}
        </div>
        <div></div>
      </div>
      <div class="arc-row">
        <div></div>
        <div class="arc-box" title="${tooltipFor(arcs['Boresight Aft'])}">
          ${adRange(arcs['Boresight Aft'])}
        </div>
        <div></div>
      </div>
    </div>
  `;
  document.getElementById('arcLayoutSection').innerHTML = arcGrid;

  function adRange(weapons) {
    if (!weapons || weapons.length === 0) return '';
    return weapons.map(w => `${w['Weapon name']}: ${w.AD}/${w.Range}\"`).join('<br>');
  }

  function tooltipFor(weapons) {
    if (!weapons || weapons.length === 0) return '';
    return weapons.map(w => {
      const traits = (w["Weapon Traits"] || "").split(',').map(t => t.trim()).filter(Boolean);
      const traitDescriptions = traits.map(t => {
        const match = data.weapon_traits.find(wt => wt["Weapon Trait Name"] === t);
        return match ? `${t}: ${match.Effect}` : t;
      }).join('; ');
      return `${w["Weapon name"]} — ${traitDescriptions}`;
    }).join(' | ');
  }
}

function adjustValue(stat, delta) {
  const span = document.getElementById(`${stat}Value`);
  let val = parseInt(span.textContent, 10);

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
