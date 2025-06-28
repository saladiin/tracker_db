let data = null;

// 1. Load JSON and log result
fetch("https://saladiin.github.io/tracker_db/acta_tracker_data.json")
  .then(res => {
    console.log("Fetch status:", res.status, res.ok);
    return res.json();
  })
  .then(json => {
    console.log("Loaded JSON:", json);
    data = json;
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
    console.log("Adding ship:", ship["Ship Class"]);
    const opt = document.createElement('option');
    opt.value = ship["Ship Class"];
    opt.textContent = ship["Ship Class"];
    selector.appendChild(opt);
  });

  const actionSel = document.getElementById('actionSelect');
  if (!Array.isArray(data.special_actions)) {
    console.warn("No special_actions array:", data.special_actions);
  } else {
    data.special_actions.forEach(action => {
      console.log("Adding action:", action["Special Action name"]);
      const opt = document.createElement('option');
      opt.value = action["Special Action name"];
      opt.textContent = action["Special Action name"];
      actionSel.appendChild(opt);
    });
  }

  renderShip();
}

function renderShip() {
  const selectedName = document.getElementById('shipSelect').value;
  console.log("renderShip selected:", selectedName);
  const ship = data.ships.find(s => s["Ship Class"] === selectedName);
  if (!ship) {
    console.error("renderShip: ship not found", selectedName);
  }
}
let data = null;

// 1. Load JSON and log result
fetch("https://saladiin.github.io/tracker_db/acta_tracker_data.json")
  .then(res => {
    console.log("Fetch status:", res.status, res.ok);
    return res.json();
  })
  .then(json => {
    console.log("Loaded JSON:", json);
    data = json;
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
    console.log("Adding ship:", ship["Ship Class"]);
    const opt = document.createElement('option');
    opt.value = ship["Ship Class"];
    opt.textContent = ship["Ship Class"];
    selector.appendChild(opt);
  });

  const actionSel = document.getElementById('actionSelect');
  if (!Array.isArray(data.special_actions)) {
    console.warn("No special_actions array:", data.special_actions);
  } else {
    data.special_actions.forEach(action => {
      console.log("Adding action:", action["Special Action name"]);
      const opt = document.createElement('option');
      opt.value = action["Special Action name"];
      opt.textContent = action["Special Action name"];
      actionSel.appendChild(opt);
    });
  }

  renderShip();
}

function renderShip() {
  const selectedName = document.getElementById('shipSelect').value;
  console.log("renderShip selected:", selectedName);
  const ship = data.ships.find(s => s["Ship Class"] === selectedName);
  if (!ship) {
    console.error("renderShip: ship not found", selectedName);
  }
}
