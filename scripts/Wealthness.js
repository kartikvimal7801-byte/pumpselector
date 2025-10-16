document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wealthForm');
  const checkBtn = document.getElementById('checkBtn');
  const videoBtn = document.getElementById('videoBtn');
  const problemSection = document.getElementById('problemSection');
  const videoSection = document.getElementById('videoSection');
  const problemSelect = document.getElementById('problemSelect');
  const pumpTypeSelect = document.getElementById('pumpTypeSelect');
  const solutionBox = document.getElementById('solutionBox');
  const resultBox = document.getElementById('resultBox');
  const videoBox = document.getElementById('videoBox');

  const diagnosticMap = {
    "Pump does not deliver water": [1,2,3,4,6,11,14,16,17,22,23],
    "Insufficient capacity delivered": [2,3,4,5,6,7,8,9,10,13,16,19,21,22,28,29,30],
    "Insufficient pressure delivered": [5,13,15,16,19,21,28,29,30],
    "Pump loses prime after starting": [2,3,5,6,7,8,10,11,12],
    "Pump requires excessive power": [14,15,16,17,18,19,22,23,25,26,28,32,33,36],
    "Leaks excessively": [12,23,25,31,32,33,34,35,37,38,39],
    "Seal has short life": [11,12,23,25,27,31,32,33,34,35,36,37,38,39],
    "Pump vibrates or is noisy": [2,3,4,9,10,20,22,23,24,25,26,27,29,34,35,40,41,42,43,44,45,46],
    "Bearings have short life": [23,25,26,27,34,35,40,41,42,43,44,45,46],
    "Pump overheats and seizes": [1,4,20,21,23,26,27,34,35,40]
  };

  const causeDescriptions = {
    1: "Pump not primed", 2: "Suction pipe not filled with liquid", 3: "Suction lift too high",
    4: "Low suction pressure margin", 5: "Air/gas in liquid", 6: "Air pocket in suction line",
    7: "Air leaks in suction line", 8: "Air leaks through stuffing box", 9: "Foot valve clogged or too small",
    10: "Suction pipe not submerged enough", 11: "Water seal pipe plugged", 12: "Seal cage misaligned",
    13: "Pump speed too low", 14: "Pump speed too high", 15: "Wrong rotation direction",
    16: "System head too high", 17: "System head too low", 18: "Liquid density mismatch",
    19: "Liquid viscosity mismatch", 20: "Very low capacity operation", 21: "Unsuitable parallel pump operation",
    22: "Foreign matter in impeller", 23: "Pump misalignment", 24: "Weak foundation",
    25: "Bent shaft", 26: "Rubbing parts", 27: "Worn bearings", 28: "Worn wearing rings",
    29: "Damaged impeller", 30: "Leaky casing gasket", 31: "Worn shaft sleeves",
    32: "Improper packing", 33: "Wrong packing type", 34: "Off-center shaft",
    35: "Rotor imbalance", 36: "Overtight gland", 37: "No cooling liquid",
    38: "Stuffing box clearance too large", 39: "Dirty sealing liquid", 40: "Excessive thrust",
    41: "Overgreased or overheated bearings", 42: "Lack of lubrication",
    43: "Improper bearing installation", 44: "Dirty bearings", 45: "Rusty bearings",
    46: "Condensation in bearing housing"
  };

  const videoLinks = {
    mmb: "https://youtu.be/YzIg_zQh3_g?si=740pPZlXMcHnGbEf",
    pp: "https://youtu.be/YGmssQ09yF4?si=T1D7cZ1CGikS2FeN",
    bws: null,
    ow: null,
    type5: null,
    type6: null
  };

  // Toggle sections
  checkBtn.addEventListener('click', () => {
    checkBtn.classList.add('active');
    videoBtn.classList.remove('active');
    problemSection.style.display = 'block';
    videoSection.style.display = 'none';
    videoBox.innerHTML = "";
    pumpTypeSelect.value = "";
  });

  videoBtn.addEventListener('click', () => {
    videoBtn.classList.add('active');
    checkBtn.classList.remove('active');
    problemSection.style.display = 'none';
    videoSection.style.display = 'block';
    solutionBox.innerHTML = "";
    problemSelect.value = "";
  });

  // Show causes when problem is selected
  problemSelect.addEventListener('change', () => {
    const selected = problemSelect.value;
    const causes = diagnosticMap[selected];
    if (!causes) {
      solutionBox.innerHTML = "";
      return;
    }

    const list = causes.map(num => `<li>${causeDescriptions[num]}</li>`).join("");
    solutionBox.innerHTML = `
      <h3>🔧 Possible Causes:</h3>
      <ul style="list-style-type: disc; padding-left: 20px;">${list}</ul>
    `;
  });

  // Show video when pump type is selected
  pumpTypeSelect.addEventListener('change', () => {
    const selected = pumpTypeSelect.value;
    const link = videoLinks[selected];

    if (link) {
      videoBox.innerHTML = `
        <h3>🎥 Troubleshooting Video for ${selected.toUpperCase()}:</h3>
        <a href="${link}" target="_blank">Watch Now</a>
      `;
    } else {
      videoBox.innerHTML = `<p>📹 Video for this pump type is coming soon.</p>`;
    }
  });

  // Model number lookup on form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const modelInput = form.model.value.trim().toLowerCase();

    try {
      const response = await fetch('scripts/pump-data.json');
      const pumpData = (await response.json()).slice(1);

      const match = pumpData.find(pump =>
        pump["Column21"]?.toLowerCase() === modelInput ||
        pump["Column20"]?.toLowerCase() === modelInput
      );

      if (match) {
        resultBox.innerHTML = `
          ✅ <strong>Model Found:</strong> ${match["Column21"]}<br>
          <strong>Product Code:</strong> ${match["Column20"]}<br>
          <strong>Series:</strong> ${match["Column15"]}
        `;
      } else {
        resultBox.innerHTML = `⚠️ Model not found. Please check the number.`;
      }
    } catch (error) {
      resultBox.innerHTML = `❌ Error loading pump data. Please try again later.`;
      console.error("Pump data fetch error:", error);
    }
  });
});