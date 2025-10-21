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
    "Pump does not deliver water (पंप पानी नहीं देता)": [1,3,6,16,22,47,48,9,10,49],
    "Low discharge (पंप का डिस्चार्ज कम है)": [6,16,22,47,48,9,49],
    "Insufficient pressure delivered (पानी का प्रेशर कम है)": [29,49,50],
    "Pump loses prime after starting (पंप चालू होने के बाद पानी नहीं उठाता)": [2,3,5,10,9,48,1],
    "Pump drawing more current (पंप ज़्यादा करंट खींच रहा है)": [50,22,47],
    "Leaks excessively (अत्यधिक लीकेज )": [12,23,25,31,32,33,34,35,37,38,39,48],
    "Seal has short life (सील की आयु कम)": [11,12,23,25,27,31,32,33,34,35,36,37,38,39,48],
    "Pump vibrates or is noisy (पंप कंपन या शोर करता है)": [2,3,4,9,10,20,22,23,24,25,26,27,29,34,35,40,41,42,43,44,45,46],
    "Bearings have short life (बेयरिंग की आयु कम)": [23,25,26,27,34,35,40,41,42,43,44,45,46],
    "Pump overheats (पंप अधिक गर्म हो जाता है)": [22,16]
  };

  const causeDescriptions = {
    1: "Pump not primed (पंप में पानी नहीं भरा है)", 2: "Suction pipe not filled with water (सक्शन पाइप में पानी नहीं है)", 3: "Suction lift too high (पानी की गहराई ज़मीन से 18 फीट से ज़्यादा है)",
    4: "Low suction pressure margin (कम सक्शन दबाव मार्जिन)", 5: "Leakage in suction line (सक्शन लाइन में लीकेज है)", 6: "Air pocket in suction line (सक्शन लाइन में लीकेज है)",
    7: "Air leaks in suction line (सक्शन लाइन में हवा का लीकेज )", 8: "Air leaks through stuffing box (स्टफिंग बॉक्स के माध्यम से हवा का लीकेज )", 9: "Pump NRV blocked (पंप की एनआरवी ब्लॉक है)",
    10: "Suction pipe not submerged in water (सक्शन पाइप पानी में डूबा नहीं है)", 11: "Water seal pipe plugged (वॉटर सील पाइप बंद)", 12: "Seal cage misaligned (सील केज गलत संरेखित)",
    13: "Pump speed too low (पंप की गति बहुत कम है)", 14: "Pump speed too high (पंप की गति बहुत अधिक है)", 15: "Wrong rotation direction (गलत घूर्णन दिशा)",
    16: "System head too high (पानी फेंकने की ऊँचाई नेम प्लेट की ऊँचाई से अधिक है)", 17: "System head too low (सिस्टम हेड बहुत कम है)", 18: "Liquid density mismatch (तरल घनत्व का मेल नहीं)",
    19: "Liquid viscosity mismatch (तरल चिपचिपाहट का मेल नहीं)", 20: "Very low capacity operation (बहुत कम क्षमता संचालन)", 21: "Unsuitable parallel pump operation (अनुपयुक्त समानांतर पंप संचालन)",
    22: "Pump jam due to dirt or fan not rotating (धूल या फ़ैन घूम रहा नहीं है के कारण पंप जाम है)", 23: "Pump misalignment (पंप गलत संरेखण)", 24: "Weak foundation (कमजोर नींव)",
    25: "Bent shaft (मुड़ी हुई शाफ्ट)", 26: "Rubbing parts (रगड़ने वाले भाग)", 27: "Worn bearings (घिसे हुए बेयरिंग)", 28: "Worn wearing rings (घिसे हुए वियरिंग रिंग्स)",
    29: "Damaged impeller (खराब इम्पेलर)", 30: "Leaky casing gasket (लीकी केसिंग गैस्केट)", 31: "Worn shaft sleeves (घिसे हुए शाफ्ट स्लीव्स)",
    32: "Improper packing (अनुचित पैकिंग)", 33: "Wrong packing type (गलत पैकिंग प्रकार)", 34: "Off-center shaft (केंद्र से हटी हुई शाफ्ट)",
    35: "Rotor imbalance (रोटर असंतुलन)", 36: "Overtight gland (अत्यधिक कसा हुआ ग्लैंड)", 37: "No cooling liquid (कोई शीतलन तरल नहीं)",
    38: "Stuffing box clearance too large (स्टफिंग बॉक्स क्लीयरेंस बहुत बड़ा)", 39: "Dirty sealing liquid (गंदा सीलिंग तरल)", 40: "Excessive thrust (अत्यधिक थ्रस्ट)",
    41: "Overgreased or overheated bearings (अत्यधिक ग्रीस या गर्म बेयरिंग)", 42: "Lack of lubrication (स्नेहन की कमी)",
    43: "Improper bearing installation (अनुचित बेयरिंग स्थापना)", 44: "Dirty bearings (गंदे बेयरिंग)", 45: "Rusty bearings (जंग लगे बेयरिंग)",
      46: "Condensation in bearing housing (बेयरिंग हाउसिंग में संघनन)", 47: "Pump RPM too low due to weak capacitor or low voltage (लो वोल्टेज या वीक कैपेसिटर के कारण पंप का आरपीएम कम है)",
      48: "Leakage from Mechanical seal (मैकेनिकल सील से लीकेज है)", 49: "Delivery pipe size more than 1 inch (डिलीवरी पाइप का साइज़ 1 इंच से अधिक है)", 50: 'Dirty water (गंदा पानी)'
  };

  const causeSolutions = {
    1: "Fill pump with water before starting (पंप शुरू करने से पहले पानी भरें)",
    2: "Fill suction pipe completely (सक्शन पाइप को पूरी तरह भरें)",
    3: "Reduce suction lift to under 18 feet (पानी की गहराई 18 फीट से कम करें)",
    4: "Check and increase suction pressure (सक्शन दबाव जांचें और बढ़ाएं)",
    5: "Correct the leakage in suction line (सक्शन लाइन में लीकेज को ठीक करें)",
    6: "Fix air leaks in suction line (सक्शन लाइन में लीकेज ठीक करें)",
    7: "Seal all air leaks in suction line (सक्शन लाइन में सभी हवा के लीकेज  को सील करें)",
    8: "Replace or adjust stuffing box (स्टफिंग बॉक्स बदलें या समायोजित करें)",
    9: "Clean or Replace pump NRV (पंप एनआरवी को साफ करें या बदलें)",
    10: "Submerge suction pipe in water (सक्शन पाइप पानी में डूबा होना चाहिए)",
    11: "Clean water seal pipe (वॉटर सील पाइप साफ करें)",
    12: "Realign seal cage (सील केज को सही संरेखित करें)",
    13: "Increase pump speed (पंप की गति बढ़ाएं)",
    14: "Reduce pump speed (पंप की गति कम करें)",
    15: "Correct rotation direction (घूर्णन दिशा सही करें)",
    16: "Reduce system head or use higher capacity pump (सिस्टम हेड कम करें या अधिक क्षमता वाला पंप उपयोग करें)",
    17: "Increase system head (सिस्टम हेड बढ़ाएं)",
    18: "Use correct liquid density (सही तरल घनत्व उपयोग करें)",
    19: "Use correct liquid viscosity (सही तरल चिपचिपाहट उपयोग करें)",
    20: "Increase pump capacity (पंप की क्षमता बढ़ाएं)",
    21: "Adjust parallel pump operation (समानांतर पंप संचालन समायोजित करें)",
    22: "Remove obstruction from pump or free the pump (पंप इम्पेलर को साफ करें/पंप को फ्री करें)",
    23: "Realign pump components (पंप के घटकों को सही संरेखित करें)",
    24: "Strengthen foundation (नींव मजबूत करें)",
    25: "Replace bent shaft (मुड़ी हुई शाफ्ट बदलें)",
    26: "Fix rubbing parts (रगड़ने वाले भाग ठीक करें)",
    27: "Replace worn bearings (घिसे हुए बेयरिंग बदलें)",
    28: "Replace worn wearing rings (घिसे हुए वियरिंग रिंग्स बदलें)",
    29: "Replace damaged impeller (खराब इम्पेलर बदलें)",
    30: "Replace leaky casing gasket (लीकी केसिंग गैस्केट बदलें)",
    31: "Replace worn shaft sleeves (घिसे हुए शाफ्ट स्लीव्स बदलें)",
    32: "Adjust packing properly (पैकिंग को सही तरीके से समायोजित करें)",
    33: "Use correct packing type (सही पैकिंग प्रकार उपयोग करें)",
    34: "Center the shaft (शाफ्ट को केंद्रित करें)",
    35: "Balance the rotor (रोटर को संतुलित करें)",
    36: "Loosen gland (ग्लैंड को ढीला करें)",
    37: "Add cooling liquid (शीतलन तरल जोड़ें)",
    38: "Adjust stuffing box clearance (स्टफिंग बॉक्स क्लीयरेंस समायोजित करें)",
    39: "Clean sealing liquid (सीलिंग तरल साफ करें)",
    40: "Reduce thrust load (थ्रस्ट लोड कम करें)",
    41: "Clean and regrease bearings (बेयरिंग साफ करें और फिर से ग्रीस लगाएं)",
    42: "Add proper lubrication (उचित स्नेहन जोड़ें)",
    43: "Reinstall bearings correctly (बेयरिंग को सही तरीके से स्थापित करें)",
    44: "Clean bearings (बेयरिंग साफ करें)",
    45: "Replace rusty bearings (जंग लगे बेयरिंग बदलें)",
      46: "Remove condensation from bearing housing (बेयरिंग हाउसिंग से संघनन हटाएं)",
      47: "Increase pump's RPM by changning the capacitor or increase the voltage(कैपेसिटर चेंज करके या वोल्टेज बढ़ाकर पंप का आरपीएम बढ़ाएँ)",
      48: "Replace mechanical seal (मैकेनिकल सील बदलें)",
      49: "Use 1 inch or smaller delivery pipe (1 इंच या छोटा डिलीवरी पाइप उपयोग करें)",
      50: "Run the pump in clean water (साफ पानी में पंप चलाएं)"
  };

  // Cause animations mapping - removed all symbols
  const causeAnimations = {
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: "",
    11: "", 12: "", 13: "", 14: "", 15: "", 16: "", 17: "", 18: "", 19: "", 20: "",
    21: "", 22: "", 23: "", 24: "", 25: "", 26: "", 27: "", 28: "", 29: "", 30: "",
    31: "", 32: "", 33: "", 34: "", 35: "", 36: "", 37: "", 38: "", 39: "", 40: "",
    41: "", 42: "", 43: "", 44: "", 45: "", 46: "", 47: "", 48: "", 49: "", 50: ""
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
        <div class="cause-item" data-cause-id="${num}" style="cursor: pointer; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9; transition: background-color 0.3s; text-align: left;">
          <div class="cause-text" style="text-align: left;">${causeDescriptions[num]}</div>
        </div>
      `;
    }).join("");
    
    solutionBox.innerHTML = `
      <h3>🔧 Click Below Possible Causes  (संभावित कारणों के लिए नीचे क्लिक करें):</h3>
      <div style="margin-top: 15px;">${list}</div>
    `;

    // Add click handlers to cause items
    solutionBox.querySelectorAll('.cause-item').forEach(item => {
      item.addEventListener('click', () => {
        const causeId = parseInt(item.dataset.causeId);
        showSolutionPopup(causeId);
      });

      // Add hover effects
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#e3f2fd';
      });
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = '#f9f9f9';
      });
    });
  });

  // Function to show solution popup
  function showSolutionPopup(causeId) {
    const cause = causeDescriptions[causeId];
    const solution = causeSolutions[causeId];
    
    if (!cause || !solution) return;

    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    // Create popup content
    const popup = document.createElement('div');
    popup.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 10px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    popup.innerHTML = `
      <div style="text-align: right; margin-bottom: 15px;">
        <button id="closePopup" style="background: #ff4444; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 16px;">✕ Close</button>
      </div>
      <h2 style="color: #003366; margin-bottom: 20px;">🔧 Solution (समाधान)</h2>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h3 style="color: #004080; margin-bottom: 10px;">Problem (समस्या):</h3>
        <p style="margin: 0; font-size: 16px;">${cause}</p>
      </div>
      <div style="background: #e8f5e8; padding: 15px; border-radius: 8px;">
        <h3 style="color: #2e7d32; margin-bottom: 10px;">Solution (समाधान):</h3>
        <p style="margin: 0; font-size: 16px; font-weight: bold;">${solution}</p>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Close popup handlers
    const closeBtn = popup.querySelector('#closePopup');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

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
