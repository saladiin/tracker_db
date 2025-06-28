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

function renderShip() {
  const selectedClass = document.getElementById("shipSelect").value;
  const ship = data.ships.find(s => s["Ship Class"] === selectedClass);
  const weaponList = data.ship_weapons.filter(w => w.Ship === selectedClass);
  const traits = [];

  for (let i = 0; i <= 5; i++) {
    const traitName = ship[`Ship traits${i ? "." + i : ""}`];
    if (traitName) {
      const trait = data.ship_traits.find(t => t["Ship Trait Name"] === traitName);
      if (trait) traits.push(`${trait["Ship Trait Name"]}: ${trait["ship trait effect"]}`);
    }
  }

  document.getElementById("statsSection").innerHTML = `
    <h2>Stats</h2>
    <ul>
      <li>Speed: ${ship.Speed}</li>
      <li>Hull: ${ship.Hull}</li>
      <li>Damage: ${ship.Damage} / ${ship["Damage threshold"]}</li>
      <li>Crew: ${ship.Crew} / ${ship["Crew threshold"]}</li>
      <li>Turns: ${ship.Turns} / ${ship["Turn Angle"]}</li>
      <li>Craft: ${ship["Craft (qty)"] || ""} ${ship["Craft (qty).1"] || ""}</li>
    </ul>
  `;

  document.getElementById("traitsSection").innerHTML = `
    <h2>Traits</h2>
    <ul>${traits.map(t => `<li>${t}</li>`).join("")}</ul>
  `;

  document.getElementById("weaponsSection").innerHTML = `
