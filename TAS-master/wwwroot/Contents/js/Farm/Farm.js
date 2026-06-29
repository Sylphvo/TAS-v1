//#region 1. GLOBAL VARIABLES & INITIALIZE PAGE
var gridApiFarm;
var gridOptions;
var currentFarmId = null;
var selectedRows = [];
var map = null;
var drawnItems = null;
let rowData = []; // Bổ sung biến rowData để đồng bộ với hàm AddNewRow

function initFarmPage() {
    gridApiFarm = agGrid.createGrid(document.querySelector("#farmGrid"), gridOptions);
    gridApiDynamic = gridApiFarm; // Đồng bộ biến toàn cục
    
    // Load các dropdown filter
    loadAgentsDropdown();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Load initial data
    loadFarms();
};
//#endregion

//#region 2. SETUP AG GRID & COLUMNS
var columnDefsFarm = [
    { headerName: 'Số thứ tự', field: 'rowNo', minWidth: 50, width: 90 },
    { 
        headerName: 'Mã nhà vườn', 
        field: 'farmCode', 
        minWidth: 150,
        editable: params => params.data.farmId === 0, 
        cellRenderer: params => `<strong>${params.value || ''}</strong>`,
        suppressFillHandle: false
    },
    { headerName: 'Tên nhà vườn', field: 'farmName', width: 200, editable: true, suppressFillHandle: false },
    { headerName: 'Người đại diện', field: 'ownerName', width: 180, editable: true, suppressFillHandle: false },
    { headerName: 'Mã đại lý', field: 'agentCode', width: 150, editable: true, suppressFillHandle: false },
    { headerName: 'Số điện thoại', field: 'phone', width: 150, editable: true, suppressFillHandle: false },
    { 
        headerName: 'Diện tích (Ha)', 
        field: 'area', 
        width: 150, 
        editable: true,
        type: 'numericColumn',
        valueFormatter: params => params.value ? Number(params.value).toLocaleString('vi-VN') : '0',
        suppressFillHandle: false
    },
    { headerName: 'Địa chỉ', field: 'address', width: 250, editable: true, suppressFillHandle: false },
    { headerName: 'Tọa độ GPS', field: 'coordinates', width: 200, editable: true, suppressFillHandle: false },
    {
        headerName: 'Trạng thái',
        field: 'status',
        width: 150,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: [0, 1, 2]
        },
        cellRenderer: params => renderStatusBadge(params.value),
        suppressFillHandle: false
    }
];

gridOptions = CreateGridOption(columnDefsFarm);

function onGridReady(params) {
    gridApiFarm = params.api;
    params.api.sizeColumnsToFit();
}
//#endregion

//#region 3. EVENT HANDLERS
function setupEventHandlers() {
    // Nút chức năng cơ bản
    $('#btnRefresh').on('click', loadFarms);
    $('#btnAdd').on('click', AddNewRow);
    $('#btnExport').on('click', exportAllToExcel);
    $('#btnExportSelected').on('click', exportSelectedToExcel);
    $('#btnSave').on('click', saveFarm);

    // Chức năng xóa nhiều dòng
    $('#btnDelete').on('click', function () {
        if (selectedRows.length === 0) return showWarning('Vui lòng chọn ít nhất 1 nông trường để xóa');
        if (confirm(`Bạn có chắc muốn xóa ${selectedRows.length} nông trường đã chọn?`)) {
            const ids = selectedRows.map(r => r.farmId);
            $.ajax({
                url: '/Farm/DeleteMultiple',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(ids),
                success: function (res) {
                    if (res.success) {
                        showSuccess(res.message);
                        loadFarms();
                    } else showError(res.message);
                }
            });
        }
    });

    // Dropdown Filters
    $('#ddlAgentCode').on('change', loadFarms);
    $('#ddlStatus').on('change', loadFarms);

    // Xử lý sự kiện Modal Tỉnh/Huyện/Xã
    $('#ddlProvince').on('change', function () {
        loadDistrict($(this).val());
        $('#ddlWard').html('<option value="">-- Chọn Phường/Xã --</option>');
    });
    $('#ddlDistrict').on('change', function () { loadWard($(this).val()); });

    // Tabs trong Modal
    $('.nav-tabs a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
        if ($(this).attr('href') === '#map-tab' && map !== null) {
            setTimeout(() => map.invalidateSize(), 100);
        }
    });
    
    // Quick filter
    $('#quickFilter').on('input', function () {
        gridApiFarm.setGridOption('quickFilterText', $(this).val());
    });
}

function onSelectionChanged() {
    selectedRows = gridApiFarm.getSelectedRows();
    const count = selectedRows.length;
    $('#selectedRecords').text(count > 0 ? `Đã chọn: ${count}` : "").toggle(count > 0);
    $('#btnExportSelected, #btnDelete').prop('disabled', count === 0);
}

function onFilterChanged() { updateStatusBar(); }
function onSortChanged() { updateStatusBar(); }

function onCellValueChanged(event) {
    let rowIndex = event.node.rowIndex;
    saveFarmInline(rowIndex); 
}
//#endregion

//#region 4. CRUD OPERATIONS (LOAD, ADD, SAVE, DELETE)
function loadFarms(pageIndex, pageSize) {
    let strUrl = '/Farm/GetAll';
    let functionCallback = function (newPage, newSize) {
        loadFarms(gridApiFarm, newPage, newSize);
    };
    LoadDataAgGrid(gridApiFarm, pageIndex, pageSize, strUrl, functionCallback);
}

function AddNewRow() {
    const newItem = {
        farmId: 0,
        farmCode: generateUniqueCodeCore(rowData, 'FM', 'farmCode'),
        farmName: "",
        ownerName: "",
        agentCode: "",
        phone: "",
        area: 0,
        address: "",
        coordinates: "",
        status: 1
    };
    AddNewRowAggrid(gridApiFarm, rowData, newItem, 'selected', rowData.length);
    RefeshSingleColumn(gridApiFarm, 'selected');
}

function saveFarmInline(rowIndex) {
    const rowNode = gridApiFarm.getDisplayedRowAtIndex(rowIndex);
    const data = rowNode.data;

    if (!data.farmCode || !data.farmName) {
        NotificationToast('warning', 'Vui lòng nhập đầy đủ Mã và Tên nông trường');
        return;
    }

    $.ajax({
        url: '/Farm/SaveInline',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (res) {
            if (res.success) {
                NotificationToast('success', 'Lưu thành công');
                loadFarms();
            } else {
                NotificationToast('error', res.message);
            }
        }
    });
}

function saveFarm() {
    // Hàm này cho form Modal chi tiết (nếu có sử dụng)
    const formData = new FormData($('#farmForm')[0]);
    var coordinates = [];
    if (drawnItems) {
        drawnItems.eachLayer(function (layer) {
            if (layer instanceof L.Polygon) {
                var latlngs = layer.getLatLngs()[0];
                coordinates = latlngs.map(ll => [ll.lat, ll.lng]);
            }
        });
    }
    formData.append('coordinatesJson', JSON.stringify(coordinates));

    $.ajax({
        url: '/Farm/Save',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (res) {
            if (res.success) {
                showSuccess(res.message);
                closeModal();
                loadFarms();
            } else {
                showError(res.message);
            }
        }
    });
}

function deleteFarm(farmId) {
    if (!confirm('Bạn có chắc muốn xóa nông trường này?')) return;
    $.ajax({
        url: `/Farm/Delete/${farmId}`,
        type: 'DELETE',
        success: function (res) {
            if (res.success) {
                showSuccess(res.message);
                loadFarms();
            } else {
                showError(res.message);
            }
        }
    });
}
//#endregion

//#region 5. MAP & DROPDOWNS (PROVINCE, DISTRICT, WARD)
function loadAgentsDropdown() {
    // Logic của bạn đang comment, mình giữ nguyên cấu trúc
    /*
    $.ajax({
        url: '/Agent/GetAgentsForDropdown',
        type: 'GET',
        data: { activeOnly: true },
        success: function (response) { ... }
    });
    */
}

function loadProvince() {
    $.get('/Farm/GetProvinces', function (res) {
        if (res.success) {
            let html = '<option value="">-- Chọn Tỉnh/Thành --</option>';
            res.data.forEach(p => html += `<option value="${p.code}">${p.name}</option>`);
            $('#ddlProvince').html(html);
        }
    });
}

function loadDistrict(provinceCode) {
    if (!provinceCode) {
        $('#ddlDistrict').html('<option value="">-- Chọn Quận/Huyện --</option>');
        return;
    }
    $.get('/Farm/GetDistricts', { provinceCode: provinceCode }, function (res) {
        if (res.success) {
            let html = '<option value="">-- Chọn Quận/Huyện --</option>';
            res.data.forEach(d => html += `<option value="${d.code}">${d.name}</option>`);
            $('#ddlDistrict').html(html);
        }
    });
}

function loadWard(districtCode) {
    if (!districtCode) {
        $('#ddlWard').html('<option value="">-- Chọn Phường/Xã --</option>');
        return;
    }
    $.get('/Farm/GetWards', { districtCode: districtCode }, function (res) {
        if (res.success) {
            let html = '<option value="">-- Chọn Phường/Xã --</option>';
            res.data.forEach(w => html += `<option value="${w.code}">${w.name}</option>`);
            $('#ddlWard').html(html);
        }
    });
}

function initMap() {
    if (map !== null) { map.remove(); }
    map = L.map('farmMap').setView([14.0583, 108.2772], 6); // Default Vietnam

    L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var drawControl = new L.Control.Draw({
        draw: {
            polygon: true,
            polyline: false,
            rectangle: true,
            circle: false,
            marker: true,
            circlemarker: false
        },
        edit: { featureGroup: drawnItems }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (event) {
        var layer = event.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);
        updateCoordinatesToMap(layer);
    });
    
    setupMapSearch();
}

function updateCoordinatesToMap(layer) {
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        var latlngs = layer.getLatLngs()[0];
        var coordString = latlngs.map(ll => `${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`).join('; ');
        $('#txtCoordinates').val(coordString);
        
        // Calculate approx area
        var area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        $('#txtArea').val((area / 10000).toFixed(2)); // convert sqm to hectares
    } else if (layer instanceof L.Marker) {
        var ll = layer.getLatLng();
        $('#txtCoordinates').val(`${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`);
    }
}

function setupMapSearch() {
    $('#btnSearchMap').click(function() {
        var query = $('#txtMapSearch').val();
        if (!query) return;
        
        $.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, function(data) {
            if (data && data.length > 0) {
                var lat = parseFloat(data[0].lat);
                var lon = parseFloat(data[0].lon);
                map.setView([lat, lon], 15);
            } else {
                showWarning("Không tìm thấy địa điểm");
            }
        });
    });
}

function closeModal() {
    $('#farmModal').modal('hide');
    $('#farmForm')[0].reset();
    currentFarmId = null;
    if (drawnItems) drawnItems.clearLayers();
    $('#txtCoordinates').val('');
}
//#endregion

//#region 6. EXCEL EXPORT
function exportAllToExcel() {
    window.location.href = '/Farm/ExportAll';
}

function exportSelectedToExcel() {
    if (selectedRows.length === 0) return showWarning('Vui lòng chọn dữ liệu để xuất');
    const ids = selectedRows.map(r => r.farmId);
    
    // Tạo form ẩn để submit post request download file
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/Farm/ExportSelected';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'ids';
    input.value = JSON.stringify(ids);
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}
//#endregion

//#region 7. UTILITIES & RENDERERS
function updateStatusBar() {
    if (!gridApiFarm) return;
    const total = gridApiFarm.getDisplayedRowCount();
    $('#totalRecords').text(`Tổng: ${total} nông trường`);
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    $('#lastUpdate').text(`Cập nhật: ${timeStr}`);
}

function showSuccess(message) {
    if (typeof NotificationToast !== 'undefined') NotificationToast('success', message);
    else alert(message);
}

function showError(message) {
    if (typeof NotificationToast !== 'undefined') NotificationToast('error', message);
    else alert('Lỗi: ' + message);
}

function showWarning(message) {
    if (typeof NotificationToast !== 'undefined') NotificationToast('warning', message);
    else alert(message);
}

function CellRenderAction(params) {
    let strSave = `<a href="#" class="avtar-xs btn-link-secondary" onclick="saveFarmInline(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;
    let strCancel = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="cancelRow(${gridApiFarm}, ${params.node.rowIndex}, '${params.data.farmCode}')" title="Bỏ"><i class="ti ti-x f-20"></i></a>`;
    let deleteBtn = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteFarm(${params.data.farmId})" title="${typeof arrMsg !== 'undefined' ? arrMsg.key_delete : 'Xóa'}"><i class="ti ti-trash f-20"></i></a>`;
    
    return params.data.farmId === 0 ? `${strSave}${strCancel}` : deleteBtn;
}

function renderStatusBadge(status) {
    const map = {
        1: { text: 'Hoạt động', class: 'badge-success' },
        0: { text: 'Ngừng hoạt động', class: 'badge-danger' },
        2: { text: 'Tạm ngưng', class: 'badge-warning' }
    };
    const info = map[status] || { text: 'Unknown', class: 'badge-secondary' };
    return `<span class="badge ${info.class}">${info.text}</span>`;
}
//#endregion
function onFillEnd(params) {
    return;
}