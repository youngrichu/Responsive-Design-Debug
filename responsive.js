console.log('Responsive view loaded');

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
        populateDeviceSelect();
    })
    .catch(error => console.error('Error loading devices:', error));

const urlParams = new URLSearchParams(window.location.search);
const tabId = parseInt(urlParams.get('tabId'));
const url = urlParams.get('url');
let width = parseInt(urlParams.get('width'));
let height = parseInt(urlParams.get('height'));
let device = urlParams.get('device');
let isLandscape = urlParams.get('landscape') === 'true';

const deviceSelect = document.getElementById('deviceSelect');
const refreshButton = document.getElementById('refreshButton');
const deviceInfo = document.getElementById('deviceInfo');
const frameContainer = document.getElementById('frameContainer');
const deviceFrame = document.getElementById('deviceFrame');
const landscapeToggle = document.getElementById('landscapeToggle');
const mediaQueryInfo = document.getElementById('mediaQueryInfo');

function populateDeviceSelect() {
    deviceSelect.innerHTML = '';
    const categories = {};
    devices.forEach(device => {
        if (!categories[device.category]) {
            categories[device.category] = document.createElement('optgroup');
            categories[device.category].label = device.category;
            deviceSelect.appendChild(categories[device.category]);
        }
        const option = document.createElement('option');
        option.value = device.name;
        option.textContent = `${device.name} (${device.width}x${device.height})`;
        categories[device.category].appendChild(option);
    });
    deviceSelect.value = device;
}

function updateView() {
    const displayWidth = isLandscape ? height : width;
    const displayHeight = isLandscape ? width : height;

    deviceInfo.textContent = `Device: ${device} (${displayWidth}x${displayHeight}) ${isLandscape ? 'Landscape' : 'Portrait'}`;
    
    frameContainer.style.width = `${displayWidth}px`;
    frameContainer.style.height = `${displayHeight}px`;
    
    const scaleFactor = calculateScaleFactor(displayWidth, displayHeight);
    frameContainer.style.transform = `scale(${scaleFactor})`;
    frameContainer.style.transformOrigin = 'top left';

    deviceFrame.style.width = '100%';
    deviceFrame.style.height = '100%';
    deviceFrame.src = url;

    updateMediaQueryInfo(displayWidth, displayHeight);
}

function calculateScaleFactor(width, height) {
    const maxWidth = window.innerWidth * 0.6; // 60% of window width
    const maxHeight = window.innerHeight * 0.8; // 80% of window height
    return Math.min(maxWidth / width, maxHeight / height, 1);
}

function updateMediaQueryInfo(width, height) {
    const generalMediaQueries = [
        '@media only screen and (max-width: 480px) { /* Mobile devices */ }',
        '@media only screen and (min-width: 481px) and (max-width: 768px) { /* iPads, Tablets */ }',
        '@media only screen and (min-width: 769px) and (max-width: 1024px) { /* Small screens, laptops */ }',
        '@media only screen and (min-width: 1025px) and (max-width: 1200px) { /* Desktops, large screens */ }',
        '@media only screen and (min-width: 1201px) { /* Extra large screens, TV */ }',
        '@media only screen and (orientation: landscape) { /* Landscape mode */ }',
        '@media only screen and (orientation: portrait) { /* Portrait mode */ }',
        '@media only screen and (min-device-pixel-ratio: 2) { /* Retina screens */ }',
        '@media print { /* Print styles */ }'
    ];

    const specificMediaQueries = [
        `@media only screen and (width: ${width}px) and (height: ${height}px) { /* This specific device */ }`,
        `@media only screen and (max-width: ${width}px) { /* Devices smaller than or equal to this width */ }`,
        `@media only screen and (min-width: ${width}px) { /* Devices larger than or equal to this width */ }`,
        `@media only screen and (max-height: ${height}px) { /* Devices shorter than or equal to this height */ }`,
        `@media only screen and (min-height: ${height}px) { /* Devices taller than or equal to this height */ }`
    ];

    mediaQueryInfo.innerHTML = '<h3>General Media Queries:</h3>' + 
        generalMediaQueries.map(query => `<pre>${query}</pre>`).join('') +
        '<h3>Device-Specific Media Queries:</h3>' +
        specificMediaQueries.map(query => `<pre>${query}</pre>`).join('');
}

deviceSelect.addEventListener('change', function() {
    const selectedDevice = devices.find(d => d.name === this.value);
    if (selectedDevice) {
        device = selectedDevice.name;
        width = selectedDevice.width;
        height = selectedDevice.height;
        updateView();
    }
});

refreshButton.addEventListener('click', function() {
    deviceFrame.src = deviceFrame.src;
});

landscapeToggle.addEventListener('change', function() {
    isLandscape = this.checked;
    updateView();
});

landscapeToggle.checked = isLandscape;

updateView();

window.addEventListener('resize', updateView);

console.log('Frame set up complete');
