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
  const pumpTypeGrid = document.getElementById('pumpTypeGrid');
  const pumpTypeHidden = document.getElementById('pumpTypeDiagnosticSelect');

  const diagnosticMap = {
    "Pump does not deliver water (पंप पानी नहीं देता)": [1,3,6,16,22,23,47],
    "Insufficient capacity delivered (अपर्याप्त क्षमता प्रदान)": [2,3,4,5,6,7,8,9,10,13,16,19,21,22,28,29,30],
    "Insufficient pressure delivered (अपर्याप्त दबाव प्रदान)": [5,13,15,16,19,21,28,29,30],
    "Pump loses prime after starting (पंप शुरू करने के बाद प्राइम खो देता है)": [2,3,5,6,7,8,10,11,12],
    "Pump requires excessive power (पंप को अत्यधिक बिजली की आवश्यकता)": [14,15,16,17,18,19,22,23,25,26,28,32,33,36],
    "Leaks excessively (अत्यधिक रिसाव)": [12,23,25,31,32,33,34,35,37,38,39],
    "Seal has short life (सील की आयु कम)": [11,12,23,25,27,31,32,33,34,35,36,37,38,39],
    "Pump vibrates or is noisy (पंप कंपन या शोर करता है)": [2,3,4,9,10,20,22,23,24,25,26,27,29,34,35,40,41,42,43,44,45,46],
    "Bearings have short life (बेयरिंग की आयु कम)": [23,25,26,27,34,35,40,41,42,43,44,45,46],
    "Pump overheats and seizes (पंप अधिक गर्म होकर जाम हो जाता है)": [1,4,20,21,23,26,27,34,35,40]
  };

  const causeDescriptions = {
    1: "Pump not primed (पंप में पानी नहीं भरा है)", 2: "Suction pipe not filled with liquid (सक्शन पाइप में तरल नहीं है)", 3: "Suction lift too high (पानी की गहराई ज़मीन से 18 फीट से ज़्यादा है)",
    4: "Low suction pressure margin (कम सक्शन दबाव मार्जिन)", 5: "Air/gas in liquid (तरल में हवा/गैस)", 6: "Air pocket in suction line (सक्शन लाइन में लीकेज है)",
    7: "Air leaks in suction line (सक्शन लाइन में हवा का रिसाव)", 8: "Air leaks through stuffing box (स्टफिंग बॉक्स के माध्यम से हवा का रिसाव)", 9: "Foot valve clogged or too small (फुट वाल्व बंद या बहुत छोटा)",
    10: "Suction pipe not submerged enough (सक्शन पाइप पर्याप्त डूबा नहीं है)", 11: "Water seal pipe plugged (वॉटर सील पाइप बंद)", 12: "Seal cage misaligned (सील केज गलत संरेखित)",
    13: "Pump speed too low (पंप की गति बहुत कम है)", 14: "Pump speed too high (पंप की गति बहुत अधिक है)", 15: "Wrong rotation direction (गलत घूर्णन दिशा)",
    16: "System head too high (पानी फेंकने की ऊँचाई नेम प्लेट की ऊँचाई से अधिक है)", 17: "System head too low (सिस्टम हेड बहुत कम है)", 18: "Liquid density mismatch (तरल घनत्व का मेल नहीं)",
    19: "Liquid viscosity mismatch (तरल चिपचिपाहट का मेल नहीं)", 20: "Very low capacity operation (बहुत कम क्षमता संचालन)", 21: "Unsuitable parallel pump operation (अनुपयुक्त समानांतर पंप संचालन)",
    22: "Foreign matter in impeller (इम्पेलर में विदेशी पदार्थ)", 23: "Pump misalignment (पंप गलत संरेखण)", 24: "Weak foundation (कमजोर नींव)",
    25: "Bent shaft (मुड़ी हुई शाफ्ट)", 26: "Rubbing parts (रगड़ने वाले भाग)", 27: "Worn bearings (घिसे हुए बेयरिंग)", 28: "Worn wearing rings (घिसे हुए वियरिंग रिंग्स)",
    29: "Damaged impeller (क्षतिग्रस्त इम्पेलर)", 30: "Leaky casing gasket (लीकी केसिंग गैस्केट)", 31: "Worn shaft sleeves (घिसे हुए शाफ्ट स्लीव्स)",
    32: "Improper packing (अनुचित पैकिंग)", 33: "Wrong packing type (गलत पैकिंग प्रकार)", 34: "Off-center shaft (केंद्र से हटी हुई शाफ्ट)",
    35: "Rotor imbalance (रोटर असंतुलन)", 36: "Overtight gland (अत्यधिक कसा हुआ ग्लैंड)", 37: "No cooling liquid (कोई शीतलन तरल नहीं)",
    38: "Stuffing box clearance too large (स्टफिंग बॉक्स क्लीयरेंस बहुत बड़ा)", 39: "Dirty sealing liquid (गंदा सीलिंग तरल)", 40: "Excessive thrust (अत्यधिक थ्रस्ट)",
    41: "Overgreased or overheated bearings (अत्यधिक ग्रीस या गर्म बेयरिंग)", 42: "Lack of lubrication (स्नेहन की कमी)",
    43: "Improper bearing installation (अनुचित बेयरिंग स्थापना)", 44: "Dirty bearings (गंदे बेयरिंग)", 45: "Rusty bearings (जंग लगे बेयरिंग)",
    46: "Condensation in bearing housing (बेयरिंग हाउसिंग में संघनन)", 47: "Pump speed too low (पंप की गति बहुत कम है)"
  };

  // Cause animations mapping - removed all symbols
  const causeAnimations = {
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: "",
    11: "", 12: "", 13: "", 14: "", 15: "", 16: "", 17: "", 18: "", 19: "", 20: "",
    21: "", 22: "", 23: "", 24: "", 25: "", 26: "", 27: "", 28: "", 29: "", 30: "",
    31: "", 32: "", 33: "", 34: "", 35: "", 36: "", 37: "", 38: "", 39: "", 40: "",
    41: "", 42: "", 43: "", 44: "", 45: "", 46: "", 47: ""
  };

  const videoLinks = {
    mmb: "https://youtu.be/YzIg_zQh3_g?si=740pPZlXMcHnGbEf",
    pp: "https://youtu.be/YGmssQ09yF4?si=T1D7cZ1CGikS2FeN",
    bws: null,
    ow: null,
    type5: null,
    type6: null
  };

  // Pump type image selection
  if (pumpTypeGrid) {
    pumpTypeGrid.addEventListener('click', (e) => {
      const pumpItem = e.target.closest('.pump-type-item');
      if (!pumpItem) return;
      
      // Remove selection from all items
      document.querySelectorAll('.pump-type-item').forEach(item => {
        item.classList.remove('selected');
      });
      
      // Add selection to clicked item
      pumpItem.classList.add('selected');
      
      // Update hidden input value
      if (pumpTypeHidden) {
        pumpTypeHidden.value = pumpItem.dataset.value;
      }
    });
  }

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

    const list = causes.map(num => {
      return `
        <div class="cause-item">
          <div class="cause-text">${causeDescriptions[num]}</div>
        </div>
      `;
    }).join("");
    
    solutionBox.innerHTML = `
      <h3>🔧 Possible Causes:</h3>
      <div style="margin-top: 15px;">${list}</div>
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

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedProblem = problemSelect.value;
    const selectedPumpType = pumpTypeHidden?.value || '';

    if (!selectedProblem) {
      resultBox.innerHTML = `⚠️ Please select a problem.`;
      return;
    }

    let message = `✅ Submitted. Problem: <strong>${selectedProblem}</strong>`;
    if (selectedPumpType) {
      const selectedItem = document.querySelector(`[data-value="${selectedPumpType}"]`);
      const pumpName = selectedItem ? selectedItem.querySelector('.pump-name').textContent : selectedPumpType;
      message += `<br>Pump type: <strong>${pumpName}</strong>`;
    }
    resultBox.innerHTML = message;
  });
});
