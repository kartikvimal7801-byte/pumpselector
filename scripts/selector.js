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
  const allPurposeSelects = Array.from(document.querySelectorAll('select[name="purpose"], #purpose'));
  const locationSelect = document.querySelector('select[name="location"]');
  const sourceSelect = document.getElementById('sourceSelect') || document.querySelector('select[name="source"]');
  const constructionSourceSelect = document.getElementById('constructionSourceSelect');
  const constructionSourceLabel = document.getElementById('constructionSourceLabel');
  const waterLevelSelect = document.getElementById('waterLevelSelect') || document.querySelector('select[name="waterLevel"]');
  const waterLevelLabel = waterLevelSelect ? waterLevelSelect.previousElementSibling : document.querySelector('label[for="waterLevelSelect"]');
  const deliverySelect = document.getElementById('deliverySelect') || document.querySelector('select[name="delivery"]');
  const deliveryLabel = deliverySelect ? deliverySelect.previousElementSibling : document.querySelector('label[for="deliverySelect"]') || null;
  const heightDropdownBox = document.getElementById('heightDropdownBox');

  // 🎚️ Toggle Pump Stages visibility based on purpose + location
  function togglePumpStages() {
    const borewellOptions = ['3borwp', '4borwp', '5borwp', '6borwp', '7borwp', '8borwp'];
    const isBorewell = borewellOptions.includes(getCurrentPurposeValue());
    const isMultiStage = locationSelect?.value === 'MStage';
    const stageBox = document.getElementById('stageBox');

    if (stageBox) {
      stageBox.style.display = (isBorewell && isMultiStage) ? 'block' : 'none';
    }
  }
  // Helper: get current visible purpose value (handles duplicate selects in Simple/Advanced)
  function getCurrentPurposeValue() {
    const visiblePurpose = allPurposeSelects.find(sel => sel && sel.offsetParent !== null);
    const value = (visiblePurpose || purposeSelect)?.value || '';
    return value.toLowerCase();
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

  // 📊 Real Pump Database from JSON
  let pumpDatabase = [];

  // Load pump data from JSON file
  async function loadPumpData() {
    try {
      const response = await fetch('scripts/pump-data.json');
      const data = await response.json();
      
      // Skip the header row and process actual pump data
      pumpDatabase = data.slice(1).map(pump => ({
        model: pump.Column21 || 'Unknown Model',
        productCode: pump.Column20 || 'N/A',
        series: pump.Column15 || 'Unknown Series',
        hp: parseFloat(pump.Column24?.replace('HP', '') || '0'),
        powerKw: pump.Column23 || 'N/A',
        voltage: pump.Column28 || 'N/A',
        headRange: pump.Column25 || 'N/A',
        flowRange: pump.Column27 || 'N/A',
        headMax: parseFloat(pump.Column14 || '0') * 3.28084, // Convert meters to feet
        flowMax: parseFloat(pump.Column19 || '0'), // L/h
        application: pump.Column3 || 'General',
        category: pump.Column12 || 'General',
        phase: pump.Column2 || 'Unknown',
        oilFilled: pump.Column10 || 'Unknown',
        buildingFloor: pump.Column13 || 'N/A'
      })).filter(pump => pump.model !== 'Unknown Model' && pump.hp > 0);
      
      console.log('Loaded pump data:', pumpDatabase.length, 'pumps');
    } catch (error) {
      console.error('Error loading pump data:', error);
      // Fallback to basic data
      pumpDatabase = [
        { model: 'S2', hp: 0.5, headMax: 111, flowMax: 2700, voltage: '220V', application: 'General' },
        { model: 'S1', hp: 0.37, headMax: 85, flowMax: 2000, voltage: '220V', application: 'General' },
        { model: 'S1.5 W', hp: 0.75, headMax: 130, flowMax: 3000, voltage: '220V', application: 'General' }
      ];
    }
  }

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

  // Helper: get currently active source select (construction vs default)
  function getActiveSourceSelect() {
    if (constructionSourceSelect && constructionSourceSelect.style.display !== 'none') {
      return constructionSourceSelect;
    }
    return sourceSelect;
  }

  // 💧 Water Level Toggle Based on Source (adapted for select ranges)
  function toggleWaterLevel() {
    const activeSource = getActiveSourceSelect();
    if (!activeSource || !waterLevelSelect || !waterLevelLabel) return;
    const selected = (activeSource.value || '').toLowerCase();
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


  // 🔒 Limit source options for Agriculture: show only first 4 options + Pond
  function limitSourcesForAgriculture() {
    if (!sourceSelect) return;
    // Reset visibility first
    Array.from(sourceSelect.options).forEach(option => {
      option.hidden = false;
      option.style.display = '';
    });
    // Collect first 4 non-empty options as allowed
    const nonEmptyOptions = Array.from(sourceSelect.options).filter(o => o.value !== '');
    const firstFour = nonEmptyOptions.slice(0, 4);
    const allowedValues = new Set(firstFour.map(o => o.value.toLowerCase()));
    allowedValues.add('pond');

    Array.from(sourceSelect.options).forEach(option => {
      if (option.value === '') return; // keep placeholder visible
      const isAllowed = allowedValues.has(option.value.toLowerCase());
      option.hidden = !isAllowed;
      option.style.display = isAllowed ? '' : 'none';
    });

    // Auto-select first visible allowed option
    const current = sourceSelect.querySelector(`option[value="${sourceSelect.value}"]`);
    if (!current || current.hidden || current.style.display === 'none') {
      const firstVisible = Array.from(sourceSelect.options).find(opt => !opt.hidden && opt.style.display !== 'none' && opt.value !== '');
      if (firstVisible) sourceSelect.value = firstVisible.value;
    }
  }

  // 🔒 Limit source options for Construction: show only first 6 + 'roof-tank'
  function limitSourcesForConstruction() {
    if (!sourceSelect) return;
    // Reset visibility first
    Array.from(sourceSelect.options).forEach(option => {
      option.hidden = false;
      option.style.display = '';
    });

    const options = Array.from(sourceSelect.options);
    if (options.length === 0) return;

    // Determine allowed set: first 6 non-empty + 'roof-tank'
    const nonEmptyOptions = options.filter(o => o.value !== '');
    const firstSix = nonEmptyOptions.slice(0, 6);
    const allowedValues = new Set(firstSix.map(o => o.value.toLowerCase()));
    allowedValues.add('roof-tank');

    Array.from(sourceSelect.options).forEach(option => {
      if (option.value === '') return; // keep placeholder visible
      const isAllowed = allowedValues.has(option.value.toLowerCase());
      option.hidden = !isAllowed;
      option.style.display = isAllowed ? '' : 'none';
    });

    // Auto-select first visible allowed option
    const current = sourceSelect.querySelector(`option[value="${sourceSelect.value}"]`);
    if (!current || current.hidden || current.style.display === 'none') {
      const firstVisible = Array.from(sourceSelect.options).find(opt => !opt.hidden && opt.style.display !== 'none' && opt.value !== '');
      if (firstVisible) sourceSelect.value = firstVisible.value;
    }
  }

  // 🚫 Always hide "For hospital sewage" option from source list
  function hideHospitalSourceOption() {
    if (!sourceSelect) return;
    const hospitalOpt = sourceSelect.querySelector('option[value="hospital"]');
    if (hospitalOpt) {
      hospitalOpt.hidden = true;
      hospitalOpt.style.display = 'none';
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
    const selected = getCurrentPurposeValue();
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

    // Filter source options for purpose and toggle construction-specific source UI
    if (sourceSelect) {
      if (selected === 'agriculture') {
        // Use default source select; hide construction one
        if (constructionSourceLabel) constructionSourceLabel.style.display = 'none';
        if (constructionSourceSelect) {
          constructionSourceSelect.style.display = 'none';
          constructionSourceSelect.name = 'constructionSource';
        }
        if (sourceSelect.previousElementSibling) sourceSelect.previousElementSibling.style.display = 'block';
        sourceSelect.style.display = 'block';
        if (sourceSelect.name !== 'source') sourceSelect.name = 'source';
        limitSourcesForAgriculture();
      } else if (selected === 'construction') {
        // Hide default source and show construction-specific select with first 6 + roof-tank
        if (sourceSelect.previousElementSibling) sourceSelect.previousElementSibling.style.display = 'none';
        sourceSelect.style.display = 'none';
        if (constructionSourceLabel) constructionSourceLabel.style.display = 'block';
        if (constructionSourceSelect) {
          constructionSourceSelect.style.display = 'block';
          // build options
          const options = Array.from(sourceSelect.options).filter(o => o.value !== '');
          const firstSix = options.slice(0, 6);
          const roof = options.find(o => o.value.toLowerCase() === 'roof-tank');
          const allowed = [...firstSix];
          if (roof && !firstSix.includes(roof)) allowed.push(roof);
          constructionSourceSelect.innerHTML = '';
          allowed.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.textContent;
            constructionSourceSelect.appendChild(o);
          });
          constructionSourceSelect.name = 'source';
          if (sourceSelect.name === 'source') sourceSelect.name = 'sourceHidden';
          // select first option by default
          if (constructionSourceSelect.options.length > 0) {
            constructionSourceSelect.selectedIndex = 0;
          }
        }
      } else {
        // Reset to default source select; hide construction one
        if (constructionSourceLabel) constructionSourceLabel.style.display = 'none';
        if (constructionSourceSelect) {
          constructionSourceSelect.style.display = 'none';
          constructionSourceSelect.name = 'constructionSource';
        }
        if (sourceSelect.previousElementSibling) sourceSelect.previousElementSibling.style.display = 'block';
        sourceSelect.style.display = 'block';
        if (sourceSelect.name !== 'source') sourceSelect.name = 'source';

        // Reset visibility for non-agriculture purposes
        Array.from(sourceSelect.options).forEach(option => {
          option.hidden = false;
          option.style.display = '';
        });
      }

      // Ensure hospital option stays hidden globally (on default select only)
      hideHospitalSourceOption();

      // Auto-select first visible source if current is hidden (for default select)
      const currentSource = sourceSelect.querySelector(`option[value="${sourceSelect.value}"]`);
      if (!currentSource || currentSource.hidden || currentSource.style.display === 'none') {
        const firstVisible = Array.from(sourceSelect.options).find(opt => !opt.hidden && opt.style.display !== 'none' && opt.value !== '');
        if (firstVisible) sourceSelect.value = firstVisible.value;
      }

      // Update water level based on active source
      toggleWaterLevel();
    }

    // Cascade to location change
    if (locationSelect.value) locationSelect.dispatchEvent(new Event('change'));
  }

  // 🚦 Location → Source, Delivery Conversion to Faucet, Usage/Water Level Hiding
  function filterByLocation() {
    if (!locationSelect || !sourceSelect || !deliverySelect || !deliveryLabel) return;
    const selected = locationSelect.value.toLowerCase();
    const sewageSources = ['hospital', 'hotel', 'industry', 'home', 'mall'];

    // Filter source options (reset and re-apply, respecting purpose and location)
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
        // For other locations, reset initially; we'll apply purpose-specific limits below
        option.style.display = '';
      }
    });

    // Auto-select roof-tank for pressure
    if (selected === 'pressure') {
      const activeSource = getActiveSourceSelect();
      if (activeSource) activeSource.value = 'roof-tank';
    }

    // Re-apply Agriculture/Construction-specific source limit if applicable and not in restricted locations
    const currentPurpose = getCurrentPurposeValue();
    if (!['sewage', 'roof', 'pressure'].includes(selected)) {
      if (currentPurpose === 'agriculture') {
        limitSourcesForAgriculture();
      } else if (currentPurpose === 'construction') {
        limitSourcesForConstruction();
      }
    }

    // Ensure hospital option stays hidden globally
    hideHospitalSourceOption();

    // Auto-select first visible source if current hidden (for default select only)
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

  // 🔍 Get Recommendation (using real pump data)
  async function getRecommendation(formData) {
    if (!resultBox) return;
    
    // Show loading animation
    resultBox.innerHTML = `
      <div style="background: linear-gradient(135deg, #e6f7ff, #b3e5fc); padding: 20px; border-radius: 12px; margin-top: 20px;">
        <div style="text-align: center;">
          <div style="font-size: 2em; margin-bottom: 15px;">🔍</div>
          <h2 style="color: #003366; margin-bottom: 10px;">Searching for the Best Pumps...</h2>
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
              <div style="width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #003366; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px;"></div>
              <span style="color: #003366; font-weight: bold;">Analyzing ${pumpDatabase.length || '100+'} pump models...</span>
            </div>
            <p style="color: #666; margin: 0;">Please wait while we find the perfect match for your requirements.</p>
          </div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    resultBox.style.display = 'block';
    
    // Add 3-second delay for loading effect
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Load pump data if not already loaded
    if (pumpDatabase.length === 0) {
      await loadPumpData();
    }
    
    const isSimple = simpleMode && simpleMode.style.display !== 'none';
    let head = 0, flow = 0, hp = 0, voltage = parseInt(formData.phase || 220);

    if (!isSimple) {
      // Advanced mode: Direct inputs
      head = parseFloat(formData.head || 0);
      flow = parseFloat(formData.flow || 0);
      hp = parseFloat(formData.hp || 0);
    } else {
      // Simple mode calculations
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
        head += 15; // Default pressure head
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
      
      // Convert flow from LPM to L/h for comparison
      flow = flow * 60; // Convert LPM to L/h
      
      // Rough HP calculation
      const flowGpm = (flow / 3.785) / 60; // L/h to GPM
      hp = Math.ceil((head * flowGpm) / 3960 * 1.5);
      hp = Math.max(0.5, hp);
    }

    // Find matching pumps from real data - More flexible matching
    const matches = pumpDatabase
      .map(pump => {
        // Calculate compatibility scores for each criterion
        const headScore = pump.headMax >= head ? 100 : Math.max(0, (pump.headMax / head) * 100);
        const flowScore = pump.flowMax >= flow ? 100 : Math.max(0, (pump.flowMax / flow) * 100);
        const hpScore = pump.hp >= hp ? 100 : Math.max(0, (pump.hp / hp) * 100);
        const voltageMatch = pump.voltage.toString().includes(voltage.toString()) ? 100 : 0;
        
        // Calculate overall compatibility (weighted average)
        const overallCompatibility = (headScore * 0.3 + flowScore * 0.3 + hpScore * 0.2 + voltageMatch * 0.2);
        
        return {
          ...pump,
          compatibility: Math.round(overallCompatibility),
          headScore: Math.round(headScore),
          flowScore: Math.round(flowScore),
          hpScore: Math.round(hpScore),
          voltageScore: voltageMatch
        };
      })
      .filter(pump => pump.compatibility >= 20) // Show pumps with at least 20% compatibility
      .sort((a, b) => b.compatibility - a.compatibility) // Sort by compatibility (highest first)
      .slice(0, 8); // Top 8 matches

    // Display results
    let html = `
      <div style="background: linear-gradient(135deg, #e6f7ff, #b3e5fc); padding: 20px; border-radius: 12px; margin-top: 20px;">
        <h2 style="color: #003366; margin-bottom: 15px;">🔍 Pump Recommendations</h2>
        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="color: #004080; margin-bottom: 10px;">Your Requirements:</h3>
          <p><strong>Head:</strong> ${Math.round(head)} ft | <strong>Flow:</strong> ${Math.round(flow/60)} LPM | <strong>HP:</strong> ~${hp} | <strong>Voltage:</strong> ${voltage}V</p>
        </div>
    `;

    if (matches.length > 0) {
      html += '<div style="background: white; padding: 15px; border-radius: 8px;">';
      html += '<h3 style="color: #004080; margin-bottom: 15px;">🎯 Best Matches:</h3>';
      
      matches.forEach((pump, index) => {
        // Determine compatibility color and badge
        let compatibilityColor, compatibilityBadge;
        if (pump.compatibility >= 80) {
          compatibilityColor = '#2e7d32';
          compatibilityBadge = '🟢 Excellent Match';
        } else if (pump.compatibility >= 60) {
          compatibilityColor = '#f57c00';
          compatibilityBadge = '🟡 Good Match';
        } else if (pump.compatibility >= 40) {
          compatibilityColor = '#f9a825';
          compatibilityBadge = '🟠 Fair Match';
        } else {
          compatibilityColor = '#d32f2f';
          compatibilityBadge = '🔴 Basic Match';
        }

        html += `
          <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 10px; background: ${index === 0 ? '#f0f8ff' : '#fff'};">
            <h4 style="color: #003366; margin-bottom: 8px;">${index + 1}. ${pump.model} ${index === 0 ? '⭐ (Best Match)' : ''}</h4>
            <p><strong>Product Code:</strong> ${pump.productCode}</p>
            <p><strong>Series:</strong> ${pump.series} | <strong>HP:</strong> ${pump.hp} | <strong>Power:</strong> ${pump.powerKw}</p>
            <p><strong>Head:</strong> ${Math.round(pump.headMax)} ft | <strong>Flow:</strong> ${Math.round(pump.flowMax/60)} LPM</p>
            <p><strong>Voltage:</strong> ${pump.voltage} | <strong>Application:</strong> ${pump.application}</p>
            
            <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: ${compatibilityColor}; font-weight: bold; font-size: 1.1em;">${compatibilityBadge}</span>
                <span style="color: ${compatibilityColor}; font-weight: bold;">${pump.compatibility}%</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 0.9em;">
                <span>Head: ${pump.headScore}%</span>
                <span>Flow: ${pump.flowScore}%</span>
                <span>HP: ${pump.hpScore}%</span>
                <span>Voltage: ${pump.voltageScore}%</span>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
    } else {
      html += `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px;">
          <h3 style="color: #856404;">⚠️ No Exact Matches Found</h3>
          <p style="color: #856404;">We couldn't find pumps that exactly match your requirements. Consider:</p>
          <ul style="color: #856404;">
            <li>Adjusting your flow or head requirements</li>
            <li>Contacting our technical support for custom solutions</li>
            <li>Using a pump with higher specifications</li>
          </ul>
        </div>
      `;
    }

    html += `
      <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-top: 15px; font-size: 0.9em; color: #666;">
        <p><em>💡 Recommendations based on your inputs and Havells pump specifications.</em></p>
      </div>
    </div>
    `;

    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
    console.log('Recommendation generated:', { head, flow, hp, matches: matches.length });
  }

  // 📝 Event Listeners
  if (simpleBtn) simpleBtn.onclick = () => setMode('simple');
  if (advancedBtn) advancedBtn.onclick = () => setMode('advanced');

  if (sourceSelect) sourceSelect.addEventListener('change', toggleWaterLevel);
  if (deliverySelect) deliverySelect.addEventListener('change', toggleCustomHeight);

  if (purposeSelect) purposeSelect.addEventListener('change', filterLocationByPurpose);
  if (locationSelect) locationSelect.addEventListener('change', filterByLocation);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      // Basic validation (skips hidden fields like water level for pressure)
      if (!data.purpose || !data.location) {
        alert('Please select purpose and location.');
        return;
      }
      await getRecommendation(data);
    });

    const resetBtn = form.querySelector('button[type="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        // Allow form.reset() to run first, then blank out all selects/fields
        setTimeout(() => {
          // Clear recommendations
          if (resultBox) {
            resultBox.innerHTML = '';
            resultBox.style.display = 'none';
          }

          // Restore delivery to original (non-faucet)
          if (deliveryLabel) deliveryLabel.textContent = 'Where do you want the water to reach (पानी कहाँ तक पहुंचाना है)';
          if (deliverySelect) {
            deliverySelect.innerHTML = `
              <option value="ground">Ground level (जमीन स्तर)</option>
              <option value="floor1">1st floor (~10 ft) (पहली मंजिल)</option>
              <option value="floor2">2nd floor (~20 ft) (दूसरी मंजिल)</option>
              <option value="floor3">3rd floor (~30 ft) (तीसरी मंजिल)</option>
              <option value="floor4">4th floor (~40 ft) (चौथी मंजिल)</option>
              <option value="custom">Above 4th floor (चौथी मंजिल से ऊपर)</option>
            `;
            deliverySelect.name = 'delivery';
          }

          // Show usage and water level sections
          if (usageSelect) usageSelect.style.display = 'block';
          if (usageLabel) usageLabel.style.display = 'block';
          if (waterLevelSelect) waterLevelSelect.style.display = 'block';
          if (waterLevelLabel) waterLevelLabel.style.display = 'block';
          if (heightDropdownBox) heightDropdownBox.style.display = 'none';

          // Blank out all selects in the form (no selection)
          const allSelects = form.querySelectorAll('select');
          allSelects.forEach(sel => {
            try {
              sel.selectedIndex = -1; // no selection
            } catch (_) {
              sel.value = '';
            }
          });

          console.log('Form reset - all selections cleared without reload');
        }, 10);
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
