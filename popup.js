document.addEventListener('DOMContentLoaded', function() {
    const selectSearch = document.querySelector('.select-search');
    const selectDropdown = document.querySelector('.select-dropdown');
    const checkButton = document.getElementById('checkButton');
    const replaceCurrentTab = document.getElementById('replaceCurrentTab');
    const landscapeMode = document.getElementById('landscapeMode');

    let selectedDevice = null;
    let deviceDimensions = null;
    let devices = [];

    // Load devices from JSON file
    fetch(chrome.runtime.getURL('devices.json'))
        .then(response => response.json())
        .then(data => {
            devices = data.categories.flatMap(category => 
                category.devices.map(device => ({
                    ...device,
                    category: category.name
                }))
            );
            populateDropdown(devices);
        })
        .catch(error => console.error('Error loading devices:', error));

    function searchDevices(query) {
        const results = devices.filter(device => 
            device.name.toLowerCase().includes(query.toLowerCase())
        );
        populateDropdown(results);
    }

    function populateDropdown(results) {
        selectDropdown.innerHTML = '';
        const categories = {};
        results.forEach(device => {
            if (!categories[device.category]) {
                categories[device.category] = document.createElement('div');
                categories[device.category].className = 'category';
                categories[device.category].innerHTML = `<strong>${device.category}</strong>`;
                selectDropdown.appendChild(categories[device.category]);
            }
            const option = createOptionElement(device);
            categories[device.category].appendChild(option);
        });
        selectDropdown.style.display = Object.keys(categories).length > 0 ? 'block' : 'none';
    }

    function createOptionElement(device) {
        const option = document.createElement('div');
        option.className = 'select-option';
        option.textContent = `${device.name} (${device.width}x${device.height})`;
        option.addEventListener('click', () => selectDevice(device));
        return option;
    }

    function selectDevice(device) {
        selectedDevice = device.name;
        selectSearch.value = `${device.name} (${device.width}x${device.height})`;
        selectDropdown.style.display = 'none';
        deviceDimensions = { width: device.width, height: device.height };
    }

    selectSearch.addEventListener('input', (e) => {
        if (e.target.value.length > 0) {
            searchDevices(e.target.value);
        } else {
            populateDropdown(devices); // Show all devices when input is empty
        }
        selectDropdown.style.display = 'block';
    });

    selectSearch.addEventListener('focus', () => {
        populateDropdown(devices);
        selectDropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!selectSearch.contains(e.target) && !selectDropdown.contains(e.target)) {
            selectDropdown.style.display = 'none';
        }
    });

    checkButton.addEventListener('click', function() {
        if (!selectedDevice || !deviceDimensions) {
            alert('Please select a valid device');
            return;
        }

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            const isLandscape = landscapeMode.checked;
            const responsiveUrl = chrome.runtime.getURL('responsive.html') +
                `?tabId=${currentTab.id}` +
                `&url=${encodeURIComponent(currentTab.url)}` +
                `&width=${isLandscape ? deviceDimensions.height : deviceDimensions.width}` +
                `&height=${isLandscape ? deviceDimensions.width : deviceDimensions.height}` +
                `&device=${encodeURIComponent(selectedDevice)}` +
                `&landscape=${isLandscape}`;

            chrome.tabs.create({url: responsiveUrl});
        });
    });
});
