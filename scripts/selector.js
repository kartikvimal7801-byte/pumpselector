document.addEventListener('DOMContentLoaded', () => {
  console.log('JS Loaded'); // Debug: Confirms script runs

  // 🛠️ Element References (robust selectors with fallbacks and null checks)
  const simpleMode = document.getElementById('simpleMode');
  const advancedMode = document.getElementById('advancedMode');
  const simpleBtn = document.getElementById('simpleBtn');
  const advancedBtn = document.getElementById('advancedBtn');
  const form = document.getElementById('pumpForm');
  const resultBox = document.getElementById('resultBox');
 
  

  const purposeSelect = document.getElementById('purpose') || document.querySelector('select[name="purpose"]');
  const locationSelect = document.querySelector('select[name="location"]');
  const sourceSelect = document.getElementById('sourceSelect') || document.querySelector('select[name="source"]');
  const waterLevelSelect = document.getElementById('waterLevelSelect') || document.querySelector('select[name="waterLevel"]');
  const waterLevelLabel = waterLevelSelect ? waterLevelSelect.previousElementSibling : document.querySelector('label[for="waterLevelSelect"]');
  const deliverySelect = document.getElementById('deliverySelect') || document.querySelector('select[name="delivery"]');
  const deliveryLabel = deliverySelect ? deliverySelect.previousElementSibling : document.querySelector('label[for="deliverySelect"]') || null;
  const heightDropdownBox = document.getElementById('heightDropdownBox');

  // 🎚️ Toggle Pump Stages visibility based on purpose + location
  function togglePumpStages() {
    const borewellOptions = ['3borwp', '4borwp', '5borwp', '6borwp', '7borwp', '8borwp'];
    const isBorewell = borewellOptions.includes(purposeSelect?.value);
    const isMultiStage = locationSelect?.value === 'MStage';
    const stageBox = document.getElementById('stageBox');

    if (stageBox) {
      stageBox.style.display = (isBorewell && isMultiStage) ? 'block' : 'none';
    }
  }


  
  
  // Robust usage targeting (for hiding) - Add id="usageSelect" to HTML for best results
  const usageSelect = document.getElementById('usageSelect') || document.querySelector('select[name="usage"]');
  const usageLabel = document.querySelector('label[for="usageSelect"]') || (usageSelect ? usageSelect.previousElementSibling : null);
  
  const phaseSelect = document.querySelector('select[name="phase"]');
  const qualitySelect = document.querySelector('select[name="quality"]');

  // Debug log (remove after testing)
  console.log('Purpose Select Found:', purposeSelect);
  console.log('Source Select Found:', sourceSelect);
  console.log('Water Level Select Found:', waterLevelSelect);
  console.log('Usage Select Found:', usageSelect);

  // 📊 Placeholder Pump Database (expand with real data)
  const pumpDatabase = [
    { model: 'Havells Premium 1HP', hp: 1, headMax: 100, flowMax: 500, voltage: 220, type: 'single-phase', quality: 'premium', price: 5000 },
    { model: 'Havells Standard 1.5HP', hp: 1.5, headMax: 150, flowMax: 1000, voltage: 220, type: 'single-phase', quality: 'standard', price: 7000 },
    { model: 'Havells Economical 2HP', hp: 2, headMax: 200, flowMax: 2000, voltage: 415, type: 'three-phase', quality: 'economical', price: 8000 },
    { model: 'Havells Agri 3HP', hp: 3, headMax: 300, flowMax: 3000, voltage: 415, type: 'three-phase', quality: 'premium', price: 12000 },
  ];

  // 🔄 Mode Toggle Function
  window.setMode = function(mode) {
    const isSimple = mode === 'simple';
    if (simpleMode) simpleMode.style.display = isSimple ? 'block' : 'none';
    if (advancedMode) advancedMode.style.display = isSimple ? 'none' : 'block';
    if (simpleBtn) simpleBtn.classList.toggle('active-green', isSimple);
    if (advancedBtn) advancedBtn.classList.toggle('active-green', !isSimple);
    if (form) form.reset();
    if (resultBox) resultBox.style.display = 'none';
    // Re-apply filters after reset
    if (purposeSelect) purposeSelect.dispatchEvent(new Event('change'));
  };

  // 💧 Water Level Toggle Based on Source (adapted for select ranges)
  function toggleWaterLevel() {
    if (!sourceSelect || !waterLevelSelect || !waterLevelLabel) return;
    const selected = sourceSelect.value.toLowerCase();
    const depthSources = ['open well', 'borewell', 'underground tank', 'pond', 'river'];
    const showWaterLevel = depthSources.includes(selected);

    waterLevelSelect.disabled = !showWaterLevel;
    waterLevelSelect.style.display = showWaterLevel ? 'block' : 'none';
    if (waterLevelLabel) waterLevelLabel.style.display = showWaterLevel ? 'block' : 'none';
    waterLevelSelect.style.backgroundColor = showWaterLevel ? '#fff' : '#eee';
    if (!showWaterLevel) waterLevelSelect.value = '';
    console.log('Water level toggled for source:', selected, 'Show:', showWaterLevel); // Debug
  }




  //water toggle system for advance mode

function togglePumpStages() {
  const purpose = purposeSelect?.value;
  const pumpType = document.querySelector('select[name="location"]')?.value;
  const stageBox = document.getElementById('stageBox');

  const borewellOptions = ['3borwp', '4borwp', '5borwp', '6borwp', '7borwp', '8borwp'];
  const isBorewell = borewellOptions.includes(purpose);
  const isMultiStage = pumpType === 'MStage';

  if (stageBox) {
    stageBox.style.display = (isBorewell && isMultiStage) ? 'block' : 'none';
  }
}


  // 📦 Custom Height Toggle Based on Delivery (only for non-pressure)
  function toggleCustomHeight() {
    if (!deliverySelect || !heightDropdownBox) return;
    // Only show if not in faucet mode (pressure)
    const isFaucetMode = deliverySelect.querySelector('option[value="1"]') !== null; // Check if options are faucets
    heightDropdownBox.style.display = (!isFaucetMode && deliverySelect.value === 'custom') ? 'block' : 'none';
    if (heightDropdownBox.style.display === 'none') {
      const customHeightSelect = document.querySelector('select[name="customHeight"]');
      if (customHeightSelect) customHeightSelect.value = '';
    }
  }

  // 🚦 Purpose → Location & Source Filtering (hides last 5 sewage for agriculture)
  function filterLocationByPurpose() {
    if (!purposeSelect || !locationSelect) return;
    const selected = purposeSelect.value.toLowerCase();
    const locationLabel = locationSelect.previousElementSibling;

    const hideLocation = selected === 'construction';
    if (locationSelect && locationLabel) {
      locationSelect.style.display = hideLocation ? 'none' : 'block';
      locationLabel.style.display = hideLocation ? 'none' : 'block';
    }

    // Filter location options (house/mall/building hide farming etc.; agriculture hides sewage/roof/pressure)
    Array.from(locationSelect.options).forEach(option => {
      option.hidden = false;
      option.style.display = '';
      if (selected === 'house' || selected === 'mall' || selected === 'building') {
        const hideIfIndoor = ['farming', 'fountain', 'sprinkler'];
        if (hideIfIndoor.includes(option.value)) {
          option.hidden = true;
          option.style.display = 'none';
        }
      } else if (selected === 'agriculture') {
        const hideIfAgriculture = ['sewage', 'roof', 'pressure'];
        if (hideIfAgriculture.includes(option.value)) {
          option.hidden = true;
          option.style.display = 'none';
        }

        if (option.value === 'fountain') {
          option.hidden = true;
          option.style.display = 'none';
        }
      }
    });

    const currentOption = locationSelect.querySelector(`option[value="${locationSelect.value}"]`);
    if ((!currentOption || currentOption.hidden) && !hideLocation) {
      const firstVisible = Array.from(locationSelect.options).find(opt => !opt.hidden && opt.value !== '');
      if (firstVisible) locationSelect.value = firstVisible.value;
    }

    // Filter source options (hide last 5 sewage for agriculture)
    if (sourceSelect) {
  const hideForAgriculture = ['hospital', 'hotel', 'industry', 'home', 'mall', 'municipal', 'roof-tank'];
  Array.from(sourceSelect.options).forEach(option => {
    const value = option.value.toLowerCase();
    option.hidden = false;
    option.style.display = '';
    if (selected === 'agriculture' && hideForAgriculture.includes(value)) {
      option.hidden = true;
      option.style.display = 'none';
    }
  });


      // Auto-select first visible source if current is hidden
      const currentSource = sourceSelect.querySelector(`option[value="${sourceSelect.value}"]`);
      if (!currentSource || currentSource.hidden || currentSource.style.display === 'none') {
        const firstVisible = Array.from(sourceSelect.options).find(opt => !opt.hidden && opt.style.display !== 'none' && opt.value !== '');
        if (firstVisible) sourceSelect.value = firstVisible.value;
      }

      console.log('Purpose changed - Source filtered for agriculture:', selected === 'agriculture');
      if (hiddenOptions.length > 0) console.log('Hidden source options:', hiddenOptions); // Debug
    }

    // Cascade to location change
    if (locationSelect.value) locationSelect.dispatchEvent(new Event('change'));
  }

  // 🚦 Location → Source, Delivery Conversion to Faucet, Usage/Water Level Hiding
  function filterByLocation() {
    if (!locationSelect || !sourceSelect || !deliverySelect || !deliveryLabel) return;
    const selected = locationSelect.value.toLowerCase();
    const sewageSources = ['hospital', 'hotel', 'industry', 'home', 'mall'];

    // Filter source options (reset and re-apply, respecting purpose)
    Array.from(sourceSelect.options).forEach(option => {
      const value = option.value.toLowerCase();
      option.hidden = false;
      option.style.display = '';
      if (selected === 'sewage') {
        if (sewageSources.includes(value)) {
          option.style.display = '';
        } else {
          option.hidden = true;
          option.style.display = 'none';
        }
      } else if (selected === 'roof') {
        if (sewageSources.includes(value)) {
          option.hidden = true;
          option.style.display = 'none';
        } else {
          option.style.display = '';
        }
      } else if (selected === 'pressure') {
        if (value === 'roof-tank') {
          option.style.display = '';
        } else {
          option.hidden = true;
          option.style.display = 'none';
        }
      } else {
        // For other locations, keep purpose filter (e.g., agriculture hides sewage)
        option.style.display = '';
      }
    });

    // Auto-select roof-tank for pressure
    if (selected === 'pressure') {
      sourceSelect.value = 'roof-tank';
    }

    // Auto-select first visible source if current hidden
    const currentSource = sourceSelect.querySelector(`option[value="${sourceSelect.value}"]`);
    if (!currentSource || currentSource.hidden || currentSource.style.display === 'none') {
      const firstVisible = Array.from(sourceSelect.options).find(opt => !opt.hidden && opt.style.display !== 'none' && opt.value !== '');
      if (firstVisible) sourceSelect.value = firstVisible.value;
    }

    console.log('Location changed - Source re-filtered for:', selected); // Debug

    // Pressure-specific changes
    if (selected === 'pressure') {
      console.log('Pressure selected - Converting delivery to faucets, hiding usage and water level'); // Debug
      // Convert delivery to faucet category
      deliveryLabel.textContent = 'In how many faucets need pressure water (कितने नलों में प्रेशर वाले पानी की आवश्यकता है)';
      deliverySelect.innerHTML = `
        <option value="">Select faucet count</option>
        <option value="1">Single faucet (एक नल)</option>
        <option value="2">Two faucets (दो नल)</option>
        <option value="4">Four faucets (चार नल)</option>
        <option value="6">Six faucets (छह नल)</option>
        <option value="8">Eight faucets (आठ नल)</option>
      `;
      deliverySelect.value = '';
      deliverySelect.name = 'faucetCount';

      // Hide usage
      if (usageSelect) usageSelect.style.display = 'none';
      if (usageLabel) usageLabel.style.display = 'none';

      // Hide water level category (from roof tank, no depth needed)
      if (waterLevelSelect) waterLevelSelect.style.display = 'none';
      if (waterLevelLabel) waterLevelLabel.style.display = 'none';

      // Hide custom height
      if (heightDropdownBox) heightDropdownBox.style.display = 'none';
    } else {
      console.log('Non-pressure selected - Restoring delivery, showing usage and water level'); // Debug
      // Restore delivery
      deliveryLabel.textContent = 'Where do you want the water to reach (पानी कहाँ तक पहुंचाना है)';
      deliverySelect.innerHTML = `
        <option value="ground">Ground level (जमीन स्तर)</option>
        <option value="floor1">1st floor (~10 ft) (पहली मंजिल)</option>
        <option value="floor2">2nd floor (~20 ft) (दूसरी मंजिल)</option>
        <option value="floor3">3rd floor (~30 ft) (तीसरी मंजिल)</option>
        <option value="floor4">4th floor (~40 ft) (चौथी मंजिल)</option>
        <option value="custom">Above 4th floor (चौथी मंजिल से ऊपर)</option>
      `;
      deliverySelect.value = '';
      deliverySelect.name = 'delivery';

      // Show usage
      if (usageSelect) usageSelect.style.display = 'block';
      if (usageLabel) usageLabel.style.display = 'block';

      // Show water level category
      if (waterLevelSelect) waterLevelSelect.style.display = 'block';
      if (waterLevelLabel) waterLevelLabel.style.display = 'block';

      // Re-enable custom height toggle
      toggleCustomHeight();
    }

    toggleWaterLevel(); // Toggle based on source
  }

  // 🔍 Get Recommendation (updated for waterLevel ranges)
  function getRecommendation(formData) {
    if (!resultBox) return;
    const isSimple = simpleMode && simpleMode.style.display !== 'none';
    let head = 0, flow = 0, hp = 0, voltage = parseInt(formData.phase || 220), quality = formData.quality || 'standard';

    if (!isSimple) {
      // Advanced mode: Direct inputs
      head = parseFloat(formData.head || 0);
      flow = parseFloat(formData.flow || 0);
      hp = parseFloat(formData.hp || 0);
    } else {
      // Simple mode calcs
      // Depth from water level ranges (average)
      let depth = 0;
      if (formData.waterLevel) {
        const rangeMap = {
          '0-5': 2.5, '5-20': 12.5, '20-28': 24, '28-50': 39, '50-100': 75,
          '100-200': 150, '200-350': 275, '350-500': 425, '500-700': 600
        };
        depth = rangeMap[formData.waterLevel] || 0;
      }
      head += depth;

      // Check if in faucet mode (pressure)
      const isFaucetMode = formData.faucetCount || (formData.delivery && ['1','2','4','6','8'].includes(formData.delivery));
      if (isFaucetMode) {
        head += 15; // Default pressure head (override depth to 0 for roof-tank)
        depth = 0; // No suction for pressure
        const faucetMap = { 1: 20, 2: 40, 4: 80, 6: 120, 8: 160 };
        flow = faucetMap[formData.faucetCount || formData.delivery] || 40;
      } else {
        // Normal delivery head
        const heightMap = { ground: 0, floor1: 10, floor2: 20, floor3: 30, floor4: 40 };
        head += heightMap[formData.delivery] || (parseInt(formData.customHeight) || 50);
        const usageMap = {
          '500L-30min': 278, '1000L-30min': 556, '1500L-30min': 833, '2000L-60min': 333, '3000L-60min': 500,
          '1bigha-60min': 1000, '3bigha-60min': 3000, '6bigha-60min': 6000
        };
        flow = usageMap[formData.usage] || 500;
      }
      // Rough HP calc: HP ≈ (head_ft * flow_gpm) / 3960 (simplified; LPM to GPM conversion)
      const flowGpm = (flow / 3.785) / 60; // LPM to GPM (liters per minute to gallons per minute)
      hp = Math.ceil((head * flowGpm) / 3960 * 1.5); // Factor for efficiency/losses
      hp = Math.max(0.5, hp); // Min 0.5HP
    }

    // Match to database
    const matches = pumpDatabase.filter(pump => 
      pump.headMax >= head && pump.flowMax >= flow && 
      (pump.voltage === voltage || pump.voltage >= voltage) &&
      pump.quality === quality &&
      pump.hp >= hp - 0.5 // Close match
    ).slice(0, 3); // Top 3

    // Display results
    let html = `<h2>Recommended Pumps</h2><p><strong>Calculated Needs:</strong> Head: ${head} ft, Flow: ${flow} LPM, HP: ~${hp}, Voltage: ${voltage}V, Quality: ${quality}</p>`;
    if (matches.length > 0) {
      html += '<ul>';
      matches.forEach(pump => {
        html += `<li>${pump.model} (${pump.hp}HP, Head up to ${pump.headMax}ft, Flow up to ${pump.flowMax}LPM) - ₹${pump.price}</li>`;
      });
      html += '</ul>';
    } else {
      html += '<p>No exact match—consider custom or contact support.</p>';
    }
    html += `<p><em>Based on your inputs: ${JSON.stringify(Object.fromEntries(formData), null, 2)}</em></p>`;
    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
    console.log('Recommendation generated:', { head, flow, hp, matches: matches.length }); // Debug
  }

  // 📝 Event Listeners
  if (simpleBtn) simpleBtn.onclick = () => setMode('simple');
  if (advancedBtn) advancedBtn.onclick = () => setMode('advanced');

  if (sourceSelect) sourceSelect.addEventListener('change', toggleWaterLevel);
  if (deliverySelect) deliverySelect.addEventListener('change', toggleCustomHeight);

  if (purposeSelect) purposeSelect.addEventListener('change', filterLocationByPurpose);
  if (locationSelect) locationSelect.addEventListener('change', filterByLocation);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      // Basic validation (skips hidden fields like water level for pressure)
      if (!data.purpose || !data.location) {
        alert('Please select purpose and location.');
        return;
      }
      getRecommendation(data);
    });

    const resetBtn = form.querySelector('button[type="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        setTimeout(() => {
          // Restore delivery to original (non-faucet)
          if (deliveryLabel) deliveryLabel.textContent = 'Where do you want the water to reach (पानी कहाँ तक पहुंचाना है)';
          if (deliverySelect) {
            deliverySelect.innerHTML = `
              <option value="">Select delivery point</option>
              <option value="ground">Ground level (जमीन स्तर)</option>
              <option value="floor1">1st floor (~10 ft) (पहली मंजिल)</option>
              <option value="floor2">2nd floor (~20 ft) (दूसरी मंजिल)</option>
              <option value="floor3">3rd floor (~30 ft) (तीसरी मंजिल)</option>
              <option value="floor4">4th floor (~40 ft) (चौथी मंजिल)</option>
              <option value="custom">Above 4th floor (चौथी मंजिल से ऊपर)</option>
            `;
            deliverySelect.value = '';
            deliverySelect.name = 'delivery'; // Restore name
          }
          // Show usage
          if (usageSelect) usageSelect.style.display = 'block';
          if (usageLabel) usageLabel.style.display = 'block';
          // Show water level
          if (waterLevelSelect) waterLevelSelect.style.display = 'block';
          if (waterLevelLabel) waterLevelLabel.style.display = 'block';
          waterLevelSelect.value = '';
          // Hide height dropdown
          if (heightDropdownBox) heightDropdownBox.style.display = 'none';
          // Hide result
          if (resultBox) resultBox.style.display = 'none';
          // Reset selects to defaults and re-filter
          if (purposeSelect) purposeSelect.value = '';
          if (locationSelect) locationSelect.value = '';
          if (sourceSelect) sourceSelect.value = '';
          filterLocationByPurpose();
          filterByLocation();
          toggleWaterLevel();
          toggleCustomHeight();
          console.log('Form reset - All fields restored'); // Debug
        }, 10); // Small delay for form.reset() to complete
      });
    }
  }

  // 🚀 Initial Setup
  if (simpleMode) setMode('simple');
  if (purposeSelect) purposeSelect.dispatchEvent(new Event('change'));
  if (locationSelect) locationSelect.dispatchEvent(new Event('change'));
  if (sourceSelect) sourceSelect.dispatchEvent(new Event('change'));
  if (deliverySelect) deliverySelect.dispatchEvent(new Event('change'));
  console.log('Initial setup complete'); // Debug
});


  if (purposeSelect) purposeSelect.addEventListener('change', togglePumpStages);
  if (locationSelect) locationSelect.addEventListener('change', togglePumpStages);