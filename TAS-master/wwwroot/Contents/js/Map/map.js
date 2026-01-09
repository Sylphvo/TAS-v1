// Function to check if all scripts are loaded
function checkScriptsLoaded() {
    scriptsLoaded++;
    if (scriptsLoaded === 2) {
        // All scripts loaded, initialize app
        initializeApp();
    }
}

// Initialize Map
function initMap() {
    // Create map
    map = L.map('map').setView([21.0285, 105.8542], 6);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Create feature group for drawn items
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Add draw control
    const drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
            polygon: true,
            polyline: true,
            rectangle: true,
            circle: true,
            marker: true,
            circlemarker: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });
    map.addControl(drawControl);

    // Event listeners
    map.on(L.Draw.Event.CREATED, function (e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);

        const geoJsonFeature = layer.toGeoJSON();
        geoJsonFeature.properties = {
            name: `Feature ${geojson.features.length + 1}`,
            description: ''
        };

        updateGeoJSONFromMap();
    });

    map.on(L.Draw.Event.EDITED, function (e) {
        updateGeoJSONFromMap();
    });

    map.on(L.Draw.Event.DELETED, function (e) {
        updateGeoJSONFromMap();
    });

    // Hide loading
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('mapStatus').textContent = 'Ready';
}

// Update GeoJSON from map
function updateGeoJSONFromMap() {
    if (isUpdatingFromEditor) return;

    isUpdatingFromMap = true;

    const features = [];
    drawnItems.eachLayer(function (layer) {
        features.push(layer.toGeoJSON());
    });

    geojson = {
        type: "FeatureCollection",
        features: features
    };

    updateEditor();
    isUpdatingFromMap = false;
}

// Update editor
function updateEditor() {
    const editor = document.getElementById('jsonEditor');
    editor.value = JSON.stringify(geojson, null, 2);
    updateFeatureCount();
}

// Update map from GeoJSON
function updateMapFromGeoJSON(geoJsonData) {
    if (isUpdatingFromMap) return;

    isUpdatingFromEditor = true;

    drawnItems.clearLayers();

    L.geoJSON(geoJsonData, {
        onEachFeature: function (feature, layer) {
            drawnItems.addLayer(layer);

            if (feature.properties) {
                const popup = `<strong>${feature.properties.name || 'Unnamed'}</strong><br/>${feature.properties.description || ''}`;
                layer.bindPopup(popup);
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng);
        }
    });

    // Fit bounds if features exist
    if (geoJsonData.features && geoJsonData.features.length > 0) {
        const bounds = drawnItems.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    isUpdatingFromEditor = false;
}

// Update feature count
function updateFeatureCount() {
    const count = geojson.features.length;
    document.getElementById('featureCount').textContent =
        `${count} feature${count !== 1 ? 's' : ''}`;
}

// Handle editor change
function handleEditorChange() {
    const editor = document.getElementById('jsonEditor');
    const text = editor.value;

    try {
        const parsed = JSON.parse(text);
        if (parsed.type === 'FeatureCollection') {
            geojson = parsed;
            updateMapFromGeoJSON(parsed);
            updateFeatureCount();
            document.getElementById('statusMessage').textContent = 'GeoJSON updated';
        }
    } catch (err) {
        document.getElementById('statusMessage').textContent = 'Invalid JSON';
    }
}

// Export GeoJSON
function exportGeoJSON() {
    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.geojson';
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById('statusMessage').textContent = 'GeoJSON exported';
}

// Import GeoJSON
function importGeoJSON(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const imported = JSON.parse(event.target.result);
            geojson = imported;
            updateEditor();
            updateMapFromGeoJSON(imported);
            document.getElementById('statusMessage').textContent = 'GeoJSON imported';
        } catch (err) {
            alert('Invalid GeoJSON file');
            document.getElementById('statusMessage').textContent = 'Import failed';
        }
    };
    reader.readAsText(file);
}

// Clear all features
function clearAll() {
    if (confirm('Clear all features?')) {
        geojson = {
            type: "FeatureCollection",
            features: []
        };
        updateEditor();
        drawnItems.clearLayers();
        document.getElementById('statusMessage').textContent = 'All features cleared';
    }
}

// Initialize application
function initializeApp() {
    // Initialize map
    initMap();

    // Initial editor state
    updateEditor();

    // Editor change
    let editorTimeout;
    document.getElementById('jsonEditor').addEventListener('input', function () {
        clearTimeout(editorTimeout);
        editorTimeout = setTimeout(handleEditorChange, 500);
    });

    // Import
    document.getElementById('importFile').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            importGeoJSON(file);
        }
        // Reset input
        this.value = '';
    });

    // Export
    document.getElementById('exportBtn').addEventListener('click', exportGeoJSON);

    // Clear
    document.getElementById('clearBtn').addEventListener('click', clearAll);
}