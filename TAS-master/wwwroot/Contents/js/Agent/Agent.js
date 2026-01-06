// ========================================
// AGENT MANAGEMENT - AG GRID
// ========================================

var gridApiAgent;
var gridOptions;
var currentAgentId = null;
var selectedRows = [];
var map = null;
var drawnItems = null;

// ========================================
// INITIALIZE
// ========================================
$(document).ready(function () {
    initAgGrid();
    loadAgents();
    registerEvents();

});

// ========================================
// AG GRID SETUP
// ========================================
function initAgGrid() {
    const columnDefs = [
        {
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 50,
            pinned: 'left',
            lockPosition: true,
            suppressMenu: true,
            filter: false
        },
        {
            field: 'agentId',
            headerName: 'ID',
            width: 80,
            hide: true
        },
        {
            field: 'agentCode',
            headerName: 'Mã đại lý',
            width: 100,
            pinned: 'left',
            cellRenderer: function (params) {
                return `<strong>${params.value}</strong>`;
            }
        },
        {
            field: 'agentName',
            headerName: 'Tên đại lý',
            width: 200,
            cellRenderer: function (params) {
                return `${params.value}`;
            }
        },
        {
            field: 'agentPhone',
            headerName: 'Số điện thoại',
            width: 150,
            cellRenderer: function (params) {
                if (!params.value) return '-';
                return `${params.value}`;
            }
        },
        {
            field: 'agentAddress',
            headerName: 'Địa chỉ',
            width: 250,
            cellRenderer: function (params) {
                if (!params.value) return '-';
                return `${params.value}`;
            }
        },
        {
            field: 'isActive',
            headerName: 'Trạng thái',
            width: 140,
            cellRenderer: function (params) {
                if (params.value) {
                    return '<span class="status-badge status-active">Đang hoạt động</span>';
                } else {
                    return '<span class="status-badge status-inactive">Ngưng hoạt động</span>';
                }
            },
            filter: 'agSetColumnFilter',
            filterParams: {
                values: [true, false],
                valueFormatter: function (params) {
                    return params.value ? 'Đang hoạt động' : 'Ngưng hoạt động';
                }
            }
        },
        {
            field: 'registerDate',
            headerName: 'Ngày đăng ký',
            width: 150,
            valueFormatter: function (params) {
                if (!params.value) return '';
                return new Date(params.value).toLocaleDateString('vi-VN');
            },
            filter: 'agDateColumnFilter'
        },
        {
            field: 'registerPerson',
            headerName: 'Người đăng ký',
            width: 150
        },
        {
            field: 'updateDate',
            headerName: 'Ngày cập nhật',
            width: 150,
            valueFormatter: function (params) {
                if (!params.value) return '-';
                return new Date(params.value).toLocaleDateString('vi-VN');
            }
        },
        {
            headerName: 'Thao tác',
            width: 150,
            pinned: 'right',
            cellRenderer: function (params) {
                return `
                    <a href="#" class=" avtar-xs btn-link-secondary" onclick="viewAgent(${params.data.agentId})" title="Lưu"><i class="ti ti-eye f-20"></i> </a>
                    <a href="#" class=" avtar-xs btn-link-secondary" onclick="editAgent(${params.data.agentId})" title="Duyệt"><i class="ti ti-edit f-20"></i> </a>
                    <a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteAgent(${params.data.agentId})" title="Xóa"><i class="ti ti-trash f-20"></i> </a>
                `;
            },
            filter: false,
            sortable: false
        }
    ];

    gridOptions = {
        columnDefs: columnDefs,
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true,
            floatingFilter: true
        },
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
        pagination: true,
        paginationPageSize: 50,
        paginationPageSizeSelector: [25, 50, 100, 200],
        rowHeight: 45,
        headerHeight: 45,
        animateRows: true,
        enableCellTextSelection: true,
        onSelectionChanged: onSelectionChanged,
        onGridReady: function (params) {
            gridApiAgent = params.api;
            params.api.sizeColumnsToFit();
        }
    };

    const eGridDiv = document.querySelector('#agentGrid');
    gridApiAgent = agGrid.createGrid(eGridDiv, gridOptions);
}

// ========================================
// REGISTER EVENTS
// ========================================
function registerEvents() {
    // Search
    $('#btnSearch').on('click', loadAgents);

    // Reset
    $('#btnReset').on('click', function () {
        $('#txtSearchKeyword').val('');
        $('#txtAgentCode').val('');
        $('#txtAgentName').val('');
        $('#ddlIsActive').val('true');
        $('#txtFromDate').val('');
        $('#txtToDate').val('');
        loadAgents();
    });

    // Add
    $('#btnAdd').on('click', showAddModal);

    // Save
    $('#btnSave').on('click', saveAgent);

    // Bulk Delete
    $('#btnBulkDelete').on('click', bulkDeleteAgents);

    // Export
    $('#btnExport').on('click', exportToExcel);

    // Refresh
    $('#btnRefresh').on('click', loadAgents);

    // Confirm Delete
    $('#btnConfirmDelete').on('click', confirmDelete);

    // Polygon buttons
    $('#btnDrawPolygon').on('click', showMapModal);
    $('#btnClearPolygon').on('click', function () {
        $('#polygon').val('');
    });
    $('#btnSavePolygon').on('click', savePolygonFromMap);

    // Enter to search
    $('#txtSearchKeyword, #txtAgentCode, #txtAgentName').on('keypress', function (e) {
        if (e.which === 13) {
            loadAgents();
        }
    });
}

// ========================================
// LOAD AGENTS
// ========================================
function loadAgents() {
    const searchParams = {
        searchKeyword: $('#txtSearchKeyword').val(),
        agentCode: $('#txtAgentCode').val(),
        agentName: $('#txtAgentName').val(),
        isActive: $('#ddlIsActive').val() === '' ? null : $('#ddlIsActive').val() === 'true',
        fromDate: $('#txtFromDate').val(),
        toDate: $('#txtToDate').val(),
        pageNumber: 1,
        pageSize: 1000
    };

    $.ajax({
        url: '/Agent/GetAgents',
        type: 'GET',
        data: searchParams,
        success: function (response) {
            console.log('📥 Response:', response);

            if (response.success) {
                gridApiAgent.setGridOption('rowData', response.data);
                updateStatusBar(response.totalRecords);
                updateLastUpdateTime();
                console.log('✅ Loaded', response.totalRecords, 'agents');
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('❌ Error loading agents:', error);
            showError('Lỗi khi tải dữ liệu: ' + error);
        }
    });
}

// ========================================
// SHOW ADD MODAL
// ========================================
function showAddModal() {
    currentAgentId = null;
    $('#modalTitle').text('Thêm đại lý mới');
    $('#agentForm')[0].reset();
    $('#agentId').val('');
    $('#isActive').val('true');
    $('#agentModal').modal('show');
}

// ========================================
// EDIT AGENT
// ========================================
function editAgent(id) {
    console.log('✏️ Editing agent:', id);
    currentAgentId = id;

    $.ajax({
        url: '/Agent/GetAgentById',
        type: 'GET',
        data: { id: id },
        success: function (response) {
            if (response.success) {
                const agent = response.data;

                $('#modalTitle').text('Sửa thông tin đại lý');
                $('#agentId').val(agent.agentId);
                $('#agentCode').val(agent.agentCode);
                $('#agentName').val(agent.agentName);
                $('#agentPhone').val(agent.agentPhone);
                $('#agentAddress').val(agent.agentAddress);
                $('#isActive').val(agent.isActive.toString());
                $('#polygon').val(agent.polygon || '');

                $('#agentModal').modal('show');
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi tải thông tin đại lý: ' + error);
        }
    });
}

// ========================================
// VIEW AGENT
// ========================================
function viewAgent(id) {
    editAgent(id);
    // Make all fields readonly
    $('#agentForm input, #agentForm select, #agentForm textarea').prop('readonly', true);
    $('#agentForm select').prop('disabled', true);
    $('#btnSave').hide();

    $('#agentModal').on('hidden.bs.modal', function () {
        $('#agentForm input, #agentForm select, #agentForm textarea').prop('readonly', false);
        $('#agentForm select').prop('disabled', false);
        $('#btnSave').show();
    });
}

// ========================================
// SAVE AGENT
// ========================================
function saveAgent() {
    // Validation
    if (!$('#agentCode').val()) {
        showWarning('Vui lòng nhập mã đại lý');
        $('#agentCode').focus();
        return;
    }

    if (!$('#agentName').val()) {
        showWarning('Vui lòng nhập tên đại lý');
        $('#agentName').focus();
        return;
    }

    const agentData = {
        agentId: $('#agentId').val() ? parseInt($('#agentId').val()) : 0,
        agentCode: $('#agentCode').val(),
        agentName: $('#agentName').val(),
        agentPhone: $('#agentPhone').val(),
        agentAddress: $('#agentAddress').val(),
        isActive: $('#isActive').val() === 'true',
        polygon: $('#polygon').val()
    };

    const isEdit = currentAgentId !== null && currentAgentId > 0;
    const url = isEdit ? '/Agent/UpdateAgent' : '/Agent/CreateAgent';
    const method = isEdit ? 'PUT' : 'POST';

    console.log(isEdit ? '✏️ Updating agent...' : '➕ Creating agent...');

    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json',
        data: JSON.stringify(agentData),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                $('#agentModal').modal('hide');
                loadAgents();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi lưu đại lý: ' + error);
        }
    });
}

// ========================================
// DELETE AGENT
// ========================================
function deleteAgent(id) {
    currentAgentId = id;
    $('#deleteModal').modal('show');
}

function confirmDelete() {
    if (!currentAgentId) return;

    console.log('🗑️ Deleting agent:', currentAgentId);

    $.ajax({
        url: '/Agent/DeleteAgent',
        type: 'DELETE',
        data: { id: currentAgentId },
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                $('#deleteModal').modal('hide');
                loadAgents();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi xóa đại lý: ' + error);
        }
    });
}

// ========================================
// BULK DELETE
// ========================================
function bulkDeleteAgents() {
    if (selectedRows.length === 0) {
        showWarning('Vui lòng chọn ít nhất một đại lý để xóa');
        return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedRows.length} đại lý đã chọn?`)) {
        return;
    }

    const agentIds = selectedRows.map(row => row.agentId);

    console.log('🗑️ Bulk deleting agents:', agentIds);

    $.ajax({
        url: '/Agent/BulkDeleteAgents',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ agentIds: agentIds }),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                loadAgents();
                selectedRows = [];
                updateSelectedCount();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi xóa đại lý: ' + error);
        }
    });
}

// ========================================
// SELECTION CHANGED
// ========================================
function onSelectionChanged() {
    selectedRows = gridApiAgent.getSelectedRows();
    updateSelectedCount();
}

function updateSelectedCount() {
    $('#selectedCount').text(selectedRows.length);
    $('#btnBulkDelete').prop('disabled', selectedRows.length === 0);
}

// ========================================
// EXPORT TO EXCEL
// ========================================
function exportToExcel() {
    console.log('📊 Exporting to Excel...');

    const params = {
        fileName: `DanhSachDaiLy_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Đại lý'
    };

    gridApiAgent.exportDataAsExcel(params);
}

// ========================================
// MAP FUNCTIONS
// ========================================
function showMapModal() {
    $('#mapModal').modal('show');

    // Initialize map after modal is shown
    setTimeout(function () {
        if (!map) {
            initMap();
        }
    }, 300);
}

function initMap() {
    // Initialize Leaflet map
    map = L.map('map').setView([10.8231, 106.6297], 13); // Ho Chi Minh City

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize draw control
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems
        },
        draw: {
            polygon: true,
            polyline: false,
            rectangle: true,
            circle: false,
            marker: false,
            circlemarker: false
        }
    });
    map.addControl(drawControl);

    // Load existing polygon if any
    const existingPolygon = $('#polygon').val();
    if (existingPolygon) {
        try {
            // Parse WKT and draw on map
            const coords = parseWKT(existingPolygon);
            if (coords) {
                const polygon = L.polygon(coords);
                drawnItems.addLayer(polygon);
                map.fitBounds(polygon.getBounds());
            }
        } catch (e) {
            console.error('Error parsing polygon:', e);
        }
    }

    // Handle draw events
    map.on(L.Draw.Event.CREATED, function (e) {
        drawnItems.clearLayers();
        drawnItems.addLayer(e.layer);
    });
}

function savePolygonFromMap() {
    if (!drawnItems || drawnItems.getLayers().length === 0) {
        showWarning('Vui lòng vẽ vùng hoạt động trên bản đồ');
        return;
    }

    const layer = drawnItems.getLayers()[0];
    const coords = layer.getLatLngs()[0];

    // Convert to WKT format
    const wkt = coordsToWKT(coords);
    $('#polygon').val(wkt);

    showSuccess('Đã lưu vùng hoạt động');
    $('#mapModal').modal('hide');
}

function coordsToWKT(coords) {
    const points = coords.map(c => `${c.lng} ${c.lat}`).join(', ');
    return `POLYGON((${points}, ${coords[0].lng} ${coords[0].lat}))`;
}

function parseWKT(wkt) {
    // Simple WKT parser for POLYGON
    const match = wkt.match(/POLYGON\(\((.*?)\)\)/);
    if (!match) return null;

    const coordsStr = match[1];
    const coords = coordsStr.split(',').map(pair => {
        const [lng, lat] = pair.trim().split(' ');
        return [parseFloat(lat), parseFloat(lng)];
    });

    return coords;
}

// ========================================
// UI HELPERS
// ========================================
function updateStatusBar(total) {
    $('#totalRecords').html(`Tổng: <strong>${total}</strong> đại lý`);
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    $('#lastUpdate').text(`Cập nhật: ${timeStr}`);
}

function showSuccess(message) {
    if (typeof NotificationToast !== 'undefined') {
        NotificationToast('success', message);
    } else {
        alert(message);
    }
}

function showError(message) {
    if (typeof NotificationToast !== 'undefined') {
        NotificationToast('error', message);
    } else {
        alert('Lỗi: ' + message);
    }
}

function showWarning(message) {
    if (typeof NotificationToast !== 'undefined') {
        NotificationToast('warning', message);
    } else {
        alert(message);
    }
}
