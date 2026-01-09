// ========================================
// MAP VIEWER - INTERACTIVE MAP WITH GEOJSON
// ========================================

var map;
var drawnItems;
var drawControl;
var baseMaps = {};
var currentLayers = [];

// ========================================
// INITIALIZE
// ========================================
$(document).ready(function() {
    console.log('🗺️ Initializing Map Viewer...');
    
    initMap();
    initDrawControls();
    registerEvents();
    
    console.log('✅ Map Viewer initialized!');
});

// ========================================
// INITIALIZE MAP
// ========================================
function initMap() {
    // Create map centered on Vietnam
    map = L.map('mapViewer').setView([10.762622, 106.660172], 6);
    
    // Base map layers
    var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });
    
    var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 19
    });
    
    var topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap',
        maxZoom: 17
    });
    
    // Add default layer
    osmLayer.addTo(map);
    
    // Base maps for layer control
    baseMaps = {
        "OpenStreetMap": osmLayer,
        "Satellite": satelliteLayer,
        "Topographic": topoLayer
    };
    
    // Feature group for drawn items
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    // Add layer control
    L.control.layers(baseMaps, {
        "Drawn Items": drawnItems
    }).addTo(map);
    
    // Add scale control
    L.control.scale({
        imperial: false,
        metric: true
    }).addTo(map);
    
    // Update coordinates on mouse move
    map.on('mousemove', function(e) {
        $('#currentLat').text(e.latlng.lat.toFixed(6));
        $('#currentLng').text(e.latlng.lng.toFixed(6));
    });
    
    // Update zoom level
    map.on('zoomend', function() {
        $('#currentZoom').text(map.getZoom());
    });
    
    // Initial zoom display
    $('#currentZoom').text(map.getZoom());
    
    console.log('✅ Map initialized');
}

// ========================================
// INITIALIZE DRAW CONTROLS
// ========================================
function initDrawControls() {
    // Draw control options
    drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true,
                metric: true,
                shapeOptions: {
                    color: '#3388ff',
                    weight: 3,
                    fillOpacity: 0.2
                }
            },
            rectangle: {
                shapeOptions: {
                    color: '#3388ff',
                    weight: 3,
                    fillOpacity: 0.2
                }
            },
            circle: {
                shapeOptions: {
                    color: '#3388ff',
                    weight: 3,
                    fillOpacity: 0.2
                },
                metric: true
            },
            marker: true,
            polyline: {
                shapeOptions: {
                    color: '#3388ff',
                    weight: 3
                },
                metric: true
            },
            circlemarker: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });
    
    map.addControl(drawControl);
    
    // Event: Layer created
    map.on(L.Draw.Event.CREATED, function(e) {
        var layer = e.layer;
        var type = e.layerType;
        
        // Add popup with info
        var popupContent = createPopupContent(layer, type);
        layer.bindPopup(popupContent);
        
        // Add to drawn items
        drawnItems.addLayer(layer);
        
        // Add to layers list
        addLayerToList(layer, type);
        
        // Update statistics
        updateStatistics();
        
        console.log('✅ Layer created:', type);
    });
    
    // Event: Layer edited
    map.on(L.Draw.Event.EDITED, function(e) {
        var layers = e.layers;
        layers.eachLayer(function(layer) {
            // Update popup
            var type = getLayerType(layer);
            var popupContent = createPopupContent(layer, type);
            layer.setPopupContent(popupContent);
        });
        
        // Update statistics
        updateStatistics();
        
        console.log('✅ Layers edited');
    });
    
    // Event: Layer deleted
    map.on(L.Draw.Event.DELETED, function(e) {
        var layers = e.layers;
        layers.eachLayer(function(layer) {
            // Remove from layers list
            removeLayerFromList(layer);
        });
        
        // Update statistics
        updateStatistics();
        
        console.log('✅ Layers deleted');
    });
    
    console.log('✅ Draw controls initialized');
}

// ========================================
// CREATE POPUP CONTENT
// ========================================
function createPopupContent(layer, type) {
    var content = '<div>';
    content += '<strong>Type:</strong> ' + type + '<br>';
    
    if (type === 'polygon' || type === 'rectangle') {
        var area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        var areaHa = (area / 10000).toFixed(2);
        content += '<strong>Area:</strong> ' + areaHa + ' ha<br>';
    }
    
    if (type === 'circle') {
        var radius = layer.getRadius();
        var area = Math.PI * radius * radius;
        var areaHa = (area / 10000).toFixed(2);
        content += '<strong>Radius:</strong> ' + radius.toFixed(2) + ' m<br>';
        content += '<strong>Area:</strong> ' + areaHa + ' ha<br>';
    }
    
    if (type === 'polyline') {
        var distance = 0;
        var latlngs = layer.getLatLngs();
        for (var i = 0; i < latlngs.length - 1; i++) {
            distance += latlngs[i].distanceTo(latlngs[i + 1]);
        }
        content += '<strong>Distance:</strong> ' + (distance / 1000).toFixed(2) + ' km<br>';
    }
    
    if (type === 'marker') {
        var latlng = layer.getLatLng();
        content += '<strong>Coordinates:</strong><br>';
        content += 'Lat: ' + latlng.lat.toFixed(6) + '<br>';
        content += 'Lng: ' + latlng.lng.toFixed(6) + '<br>';
    }
    
    content += '<hr style="margin: 5px 0;">';
    content += '<button class="btn btn-sm btn-danger" onclick="deleteLayer(\'' + L.stamp(layer) + '\')">Delete</button>';
    content += '</div>';
    
    return content;
}

// ========================================
// ADD LAYER TO LIST
// ========================================
function addLayerToList(layer, type) {
    var layerId = L.stamp(layer);
    currentLayers.push({ id: layerId, layer: layer, type: type });
    
    updateLayersList();
}

// ========================================
// REMOVE LAYER FROM LIST
// ========================================
function removeLayerFromList(layer) {
    var layerId = L.stamp(layer);
    currentLayers = currentLayers.filter(l => l.id !== layerId);
    
    updateLayersList();
}

// ========================================
// UPDATE LAYERS LIST
// ========================================
function updateLayersList() {
    var $list = $('#layersList');
    $list.empty();
    
    if (currentLayers.length === 0) {
        $list.append('<div class="list-group-item text-center text-muted">No layers yet. Draw something on the map!</div>');
        $('#layerCount').text('0');
        return;
    }
    
    currentLayers.forEach(function(item, index) {
        var icon = getLayerIcon(item.type);
        var color = getLayerColor(item.type);
        
        var html = `
            <div class="list-group-item" data-layer-id="${item.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <i class="fas ${icon}" style="color: ${color};"></i>
                        <strong>${item.type}</strong> #${index + 1}
                    </div>
                    <div>
                        <button class="btn btn-sm btn-primary" onclick="zoomToLayer('${item.id}')">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteLayer('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        $list.append(html);
    });
    
    $('#layerCount').text(currentLayers.length);
}

// ========================================
// GET LAYER TYPE
// ========================================
function getLayerType(layer) {
    if (layer instanceof L.Marker) return 'marker';
    if (layer instanceof L.Circle) return 'circle';
    if (layer instanceof L.Rectangle) return 'rectangle';
    if (layer instanceof L.Polygon) return 'polygon';
    if (layer instanceof L.Polyline) return 'polyline';
    return 'unknown';
}

// ========================================
// GET LAYER ICON
// ========================================
function getLayerIcon(type) {
    switch(type) {
        case 'polygon': return 'fa-draw-polygon';
        case 'rectangle': return 'fa-square';
        case 'circle': return 'fa-circle';
        case 'marker': return 'fa-map-marker-alt';
        case 'polyline': return 'fa-route';
        default: return 'fa-question';
    }
}

// ========================================
// GET LAYER COLOR
// ========================================
function getLayerColor(type) {
    switch(type) {
        case 'polygon': return '#3388ff';
        case 'rectangle': return '#38a169';
        case 'circle': return '#e53e3e';
        case 'marker': return '#d69e2e';
        case 'polyline': return '#805ad5';
        default: return '#718096';
    }
}

// Continued in Part 2...
// ========================================
// MAP VIEWER.JS - PART 2
// ========================================

// ========================================
// UPDATE STATISTICS
// ========================================
function updateStatistics() {
    var polygonCount = 0;
    var markerCount = 0;
    var totalArea = 0;
    
    currentLayers.forEach(function(item) {
        if (item.type === 'polygon' || item.type === 'rectangle') {
            polygonCount++;
            var area = L.GeometryUtil.geodesicArea(item.layer.getLatLngs()[0]);
            totalArea += area;
        }
        if (item.type === 'marker') {
            markerCount++;
        }
    });
    
    $('#statPolygons').text(polygonCount);
    $('#statMarkers').text(markerCount);
    $('#statTotalArea').text((totalArea / 10000).toFixed(2) + ' ha');
}

// ========================================
// ZOOM TO LAYER
// ========================================
function zoomToLayer(layerId) {
    var item = currentLayers.find(l => l.id == layerId);
    if (!item) return;
    
    if (item.layer.getBounds) {
        map.fitBounds(item.layer.getBounds());
    } else if (item.layer.getLatLng) {
        map.setView(item.layer.getLatLng(), 15);
    }
    
    // Highlight layer
    $('.list-group-item').removeClass('layer-item-active');
    $('.list-group-item[data-layer-id="' + layerId + '"]').addClass('layer-item-active');
    
    // Open popup
    item.layer.openPopup();
}

// ========================================
// DELETE LAYER
// ========================================
function deleteLayer(layerId) {
    var item = currentLayers.find(l => l.id == layerId);
    if (!item) return;
    
    if (confirm('Delete this layer?')) {
        drawnItems.removeLayer(item.layer);
        removeLayerFromList(item.layer);
        updateStatistics();
    }
}

// ========================================
// REGISTER EVENTS
// ========================================
function registerEvents() {
    // Import GeoJSON
    $('#btnImportGeoJSON').on('click', showImportModal);
    $('#btnImportConfirm').on('click', importGeoJSON);
    $('#fileGeoJSON').on('change', handleFileSelect);
    
    // Export GeoJSON
    $('#btnExportGeoJSON').on('click', exportGeoJSON);
    
    // Save/Load Database
    $('#btnSaveToDatabase').on('click', showSaveModal);
    $('#btnLoadFromDatabase').on('click', showLoadModal);
    $('#btnSaveConfirm').on('click', saveToDatabase);
    
    // Clear All
    $('#btnClearAll').on('click', clearAll);
    
    // Fullscreen
    $('#btnFullscreen').on('click', toggleFullscreen);
    
    // Search Location
    $('#btnSearch').on('click', searchLocation);
    $('#txtSearchLocation').on('keypress', function(e) {
        if (e.which === 13) searchLocation();
    });
}

// ========================================
// IMPORT GEOJSON
// ========================================
function showImportModal() {
    $('#txtGeoJSON').val('');
    $('#fileGeoJSON').val('');
    $('#importModal').modal('show');
}

function handleFileSelect(e) {
    var file = e.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        $('#txtGeoJSON').val(e.target.result);
    };
    reader.readAsText(file);
}

function importGeoJSON() {
    var geojsonText = $('#txtGeoJSON').val();
    if (!geojsonText) {
        alert('Please provide GeoJSON data');
        return;
    }
    
    try {
        var geojson = JSON.parse(geojsonText);
        
        // Add to map
        L.geoJSON(geojson, {
            onEachFeature: function(feature, layer) {
                drawnItems.addLayer(layer);
                
                var type = getLayerType(layer);
                addLayerToList(layer, type);
                
                var popupContent = createPopupContent(layer, type);
                layer.bindPopup(popupContent);
            }
        });
        
        // Zoom to bounds
        if (drawnItems.getLayers().length > 0) {
            map.fitBounds(drawnItems.getBounds());
        }
        
        updateStatistics();
        
        $('#importModal').modal('hide');
        showSuccess('GeoJSON imported successfully!');
        
    } catch (error) {
        alert('Invalid GeoJSON: ' + error.message);
    }
}

// ========================================
// EXPORT GEOJSON
// ========================================
function exportGeoJSON() {
    if (currentLayers.length === 0) {
        alert('No layers to export');
        return;
    }
    
    var geojson = {
        type: "FeatureCollection",
        features: []
    };
    
    currentLayers.forEach(function(item) {
        var feature = item.layer.toGeoJSON();
        feature.properties = feature.properties || {};
        feature.properties.type = item.type;
        geojson.features.push(feature);
    });
    
    // Download as file
    var dataStr = JSON.stringify(geojson, null, 2);
    var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    var exportFileDefaultName = 'map-' + new Date().toISOString().split('T')[0] + '.geojson';
    
    var linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSuccess('GeoJSON exported successfully!');
}

// ========================================
// SAVE TO DATABASE
// ========================================
function showSaveModal() {
    if (currentLayers.length === 0) {
        alert('No layers to save');
        return;
    }
    
    $('#txtSaveName').val('');
    $('#txtSaveDescription').val('');
    $('#ddlSaveCategory').val('farm');
    $('#saveModal').modal('show');
}

function saveToDatabase() {
    var name = $('#txtSaveName').val();
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    var geojson = {
        type: "FeatureCollection",
        features: []
    };
    
    currentLayers.forEach(function(item) {
        var feature = item.layer.toGeoJSON();
        feature.properties = feature.properties || {};
        feature.properties.type = item.type;
        geojson.features.push(feature);
    });
    
    var data = {
        name: name,
        description: $('#txtSaveDescription').val(),
        category: $('#ddlSaveCategory').val(),
        geojson: JSON.stringify(geojson),
        layerCount: currentLayers.length
    };
    
    $.ajax({
        url: '/MapViewer/SaveMap',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            if (response.success) {
                showSuccess('Map saved successfully!');
                $('#saveModal').modal('hide');
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function(xhr, status, error) {
            alert('Error saving map: ' + error);
        }
    });
}

// ========================================
// LOAD FROM DATABASE
// ========================================
function showLoadModal() {
    $('#loadModal').modal('show');
    loadSavedMaps();
}

function loadSavedMaps() {
    $('#savedPolygonsList').html('<tr><td colspan="5" class="text-center">Loading...</td></tr>');
    
    $.ajax({
        url: '/MapViewer/GetSavedMaps',
        type: 'GET',
        success: function(response) {
            if (response.success) {
                var html = '';
                
                if (response.data.length === 0) {
                    html = '<tr><td colspan="5" class="text-center">No saved maps</td></tr>';
                } else {
                    response.data.forEach(function(item) {
                        html += `
                            <tr>
                                <td>${item.name}</td>
                                <td><span class="badge badge-primary">${item.category}</span></td>
                                <td>${item.area || '-'}</td>
                                <td>${new Date(item.createdAt).toLocaleString('vi-VN')}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick="loadMap(${item.id})">
                                        <i class="fas fa-download"></i> Load
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteMap(${item.id})">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                }
                
                $('#savedPolygonsList').html(html);
            } else {
                $('#savedPolygonsList').html('<tr><td colspan="5" class="text-center text-danger">Error loading maps</td></tr>');
            }
        },
        error: function() {
            $('#savedPolygonsList').html('<tr><td colspan="5" class="text-center text-danger">Error loading maps</td></tr>');
        }
    });
}

function loadMap(id) {
    $.ajax({
        url: '/MapViewer/GetMapById',
        type: 'GET',
        data: { id: id },
        success: function(response) {
            if (response.success) {
                // Clear existing layers
                clearAll(false);
                
                // Import GeoJSON
                var geojson = JSON.parse(response.data.geojson);
                
                L.geoJSON(geojson, {
                    onEachFeature: function(feature, layer) {
                        drawnItems.addLayer(layer);
                        
                        var type = feature.properties.type || getLayerType(layer);
                        addLayerToList(layer, type);
                        
                        var popupContent = createPopupContent(layer, type);
                        layer.bindPopup(popupContent);
                    }
                });
                
                // Zoom to bounds
                if (drawnItems.getLayers().length > 0) {
                    map.fitBounds(drawnItems.getBounds());
                }
                
                updateStatistics();
                
                $('#loadModal').modal('hide');
                showSuccess('Map loaded successfully!');
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function() {
            alert('Error loading map');
        }
    });
}

function deleteMap(id) {
    if (!confirm('Delete this saved map?')) return;
    
    $.ajax({
        url: '/MapViewer/DeleteMap',
        type: 'DELETE',
        data: { id: id },
        success: function(response) {
            if (response.success) {
                showSuccess('Map deleted successfully!');
                loadSavedMaps();
            } else {
                alert('Error: ' + response.message);
            }
        },
        error: function() {
            alert('Error deleting map');
        }
    });
}

// ========================================
// CLEAR ALL
// ========================================
function clearAll(confirm = true) {
    if (confirm && !window.confirm('Clear all layers?')) return;
    
    drawnItems.clearLayers();
    currentLayers = [];
    updateLayersList();
    updateStatistics();
    
    if (confirm) {
        showSuccess('All layers cleared');
    }
}

// ========================================
// FULLSCREEN
// ========================================
function toggleFullscreen() {
    var elem = document.documentElement;
    
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            alert('Error attempting to enable fullscreen: ' + err.message);
        });
        $('#btnFullscreen').html('<i class="fas fa-compress"></i> Exit Fullscreen');
    } else {
        document.exitFullscreen();
        $('#btnFullscreen').html('<i class="fas fa-expand"></i> Fullscreen');
    }
}

// ========================================
// SEARCH LOCATION
// ========================================
function searchLocation() {
    var query = $('#txtSearchLocation').val();
    if (!query) return;
    
    // Check if coordinates
    var coordMatch = query.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
        var lat = parseFloat(coordMatch[1]);
        var lng = parseFloat(coordMatch[2]);
        map.setView([lat, lng], 15);
        
        // Add marker
        L.marker([lat, lng]).addTo(map)
            .bindPopup('Searched Location<br>' + lat + ', ' + lng)
            .openPopup();
        
        return;
    }
    
    // Use Nominatim for geocoding
    $.ajax({
        url: 'https://nominatim.openstreetmap.org/search',
        data: {
            q: query,
            format: 'json',
            limit: 1
        },
        success: function(data) {
            if (data.length > 0) {
                var result = data[0];
                var lat = parseFloat(result.lat);
                var lng = parseFloat(result.lon);
                
                map.setView([lat, lng], 13);
                
                L.marker([lat, lng]).addTo(map)
                    .bindPopup(result.display_name)
                    .openPopup();
                
                showSuccess('Location found!');
            } else {
                alert('Location not found');
            }
        },
        error: function() {
            alert('Error searching location');
        }
    });
}

// ========================================
// UI HELPERS
// ========================================
function showSuccess(message) {
    if (typeof NotificationToast !== 'undefined') {
        NotificationToast('success', message);
    } else {
        console.log('✅', message);
    }
}

function showError(message) {
    if (typeof NotificationToast !== 'undefined') {
        NotificationToast('error', message);
    } else {
        console.log('❌', message);
    }
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================
$(document).on('keydown', function(e) {
    // Ctrl/Cmd + S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        showSaveModal();
    }
    
    // Ctrl/Cmd + O: Open
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        showLoadModal();
    }
    
    // Ctrl/Cmd + E: Export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportGeoJSON();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        $('.modal').modal('hide');
    }
});
