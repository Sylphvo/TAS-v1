// ========================================
// FARM MANAGEMENT - AG GRID
// ========================================

var gridApiFarm;
var gridOptions;
var currentFarmId = null;
var selectedRows = [];
var map = null;
var drawnItems = null;

// ========================================
// INITIALIZE
// ========================================
$(document).ready(function () {
    console.log('🌾 Initializing Farm Management...');

    loadAgentsDropdown();
    initAgGrid();
    loadFarms();
    registerEvents();

    console.log('✅ Farm Management initialized!');
});

// ========================================
// LOAD AGENTS DROPDOWN
// ========================================
function loadAgentsDropdown() {
    $.ajax({
        url: '/Agent/GetAgentsForDropdown',
        type: 'GET',
        data: { activeOnly: true },
        success: function (response) {
            if (response.success) {
                // For search filter
                var htmlFilter = '<option value="">Tất cả</option>';
                response.data.forEach(function (agent) {
                    htmlFilter += `<option value="${agent.agentCode}">${agent.agentCode} - ${agent.agentName}</option>`;
                });
                $('#ddlAgentCode').html(htmlFilter);

                // For modal form
                var htmlForm = '<option value="">-- Chọn đại lý --</option>';
                response.data.forEach(function (agent) {
                    htmlForm += `<option value="${agent.agentCode}">${agent.agentCode} - ${agent.agentName}</option>`;
                });
                $('#agentCode').html(htmlForm);

                console.log('✅ Loaded', response.data.length, 'agents for dropdown');
            }
        },
        error: function (xhr, status, error) {
            console.error('❌ Error loading agents:', error);
        }
    });
}

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
            field: 'farmId',
            headerName: 'ID',
            width: 80,
            hide: true
        },
        {
            field: 'farmCode',
            headerName: 'Mã nhà vườn',
            width: 150,
            pinned: 'left',
            cellRenderer: function (params) {
                return `<strong>${params.value}</strong>`;
            }
        },
        {
            field: 'farmerName',
            headerName: 'Tên chủ vườn',
            width: 200,
            cellRenderer: function (params) {
                return `${params.value}`;
            }
        },
        {
            field: 'agentCode',
            headerName: 'Mã ĐL',
            width: 100
        },
        {
            field: 'agentName',
            headerName: 'Tên đại lý',
            width: 180,
            cellRenderer: function (params) {
                if (!params.value) return '-';
                return `${params.value}`;
            }
        },
        {
            field: 'farmPhone',
            headerName: 'Số điện thoại',
            width: 130,
            cellRenderer: function (params) {
                if (!params.value) return '-';
                return `${params.value}`;
            }
        },
        {
            field: 'farmAddress',
            headerName: 'Địa chỉ',
            width: 250,
            cellRenderer: function (params) {
                if (!params.value) return '-';
                return `${params.value}`;
            }
        },
        {
            field: 'certificates',
            headerName: 'Chứng chỉ',
            width: 120,
            cellRenderer: function (params) {
                if (!params.value) return '-';
                return `<span class="badge badge-info">${params.value}</span>`;
            }
        },
        {
            field: 'totalAreaHa',
            headerName: 'Tổng DT (ha)',
            width: 120,
            cellStyle: { 'text-align': 'right', 'padding-right': '10px' },
            valueFormatter: function (params) {
                if (!params.value) return '-';
                return Number(params.value).toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        },
        {
            field: 'rubberAreaHa',
            headerName: 'DT mủ (ha)',
            width: 120,
            cellStyle: { 'text-align': 'right', 'padding-right': '10px' },
            valueFormatter: function (params) {
                if (!params.value) return '-';
                return Number(params.value).toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        },
        {
            field: 'totalExploit',
            headerName: 'Sản lượng (kg)',
            width: 140,
            cellStyle: { 'text-align': 'right', 'padding-right': '10px' },
            valueFormatter: function (params) {
                if (!params.value) return '-';
                return Number(params.value).toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        },
        {
            field: 'isActive',
            headerName: 'Trạng thái',
            width: 120,
            cellRenderer: function (params) {
                if (params.value) {
                    return '<span class="status-badge status-active">Đã duyệt</span>';
                } else {
                    return '<span class="status-badge status-inactive">Chưa duyệt</span>';
                }
            },
            filter: 'agSetColumnFilter',
            filterParams: {
                values: [true, false],
                valueFormatter: function (params) {
                    return params.value ? 'Đã duyệt' : 'Chưa duyệt';
                }
            }
        },
        {
            field: 'registerDate',
            headerName: 'Ngày đăng ký',
            width: 130,
            valueFormatter: function (params) {
                if (!params.value) return '';
                return new Date(params.value).toLocaleDateString('vi-VN');
            },
            filter: 'agDateColumnFilter'
        },
        {
            field: 'registerPerson',
            headerName: 'Người đăng ký',
            width: 130
        },
        {
            headerName: 'Thao tác',
            width: 200,
            pinned: 'right',
            cellRenderer: function (params) {
                var approveBtn = params.data.isActive
                    ? `<button class="btn btn-sm btn-warning action-btn" onclick="unapproveFarm(${params.data.farmId})" title="Hủy duyệt">
                        <i class="fas fa-times"></i>
                    </button>`
                    : `<button class="btn btn-sm btn-success action-btn" onclick="approveFarm(${params.data.farmId})" title="Duyệt">
                        <i class="fas fa-check"></i>
                    </button>`;

                return `
                    <button class="btn btn-sm btn-primary action-btn" onclick="editFarm(${params.data.farmId})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info action-btn" onclick="viewFarm(${params.data.farmId})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${approveBtn}
                    <button class="btn btn-sm btn-danger action-btn" onclick="deleteFarm(${params.data.farmId})">
                        <i class="fas fa-trash"></i>
                    </button>
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
            gridApiFarm = params.api;
            params.api.sizeColumnsToFit();
            console.log('✅ AG Grid ready!');
        }
    };

    const eGridDiv = document.querySelector('#farmGrid');
    gridApiFarm = agGrid.createGrid(eGridDiv, gridOptions);
}

// ========================================
// REGISTER EVENTS
// ========================================
function registerEvents() {
    // Search
    $('#btnSearch').on('click', loadFarms);

    // Reset
    $('#btnReset').on('click', function () {
        $('#txtSearchKeyword').val('');
        $('#txtFarmCode').val('');
        $('#txtFarmerName').val('');
        $('#ddlAgentCode').val('');
        $('#ddlIsActive').val('true');
        $('#txtFromDate').val('');
        $('#txtToDate').val('');
        loadFarms();
    });

    // Add
    $('#btnAdd').on('click', showAddModal);

    // Save
    $('#btnSave').on('click', saveFarm);

    // Approve/Unapprove
    $('#btnApprove').on('click', bulkApproveFarms);
    $('#btnUnapprove').on('click', bulkUnapproveFarms);

    // Bulk Delete
    $('#btnBulkDelete').on('click', bulkDeleteFarms);

    // Export
    $('#btnExport').on('click', exportToExcel);

    // Refresh
    $('#btnRefresh').on('click', loadFarms);

    // Confirm Delete
    $('#btnConfirmDelete').on('click', confirmDelete);

    // Polygon buttons
    $('#btnDrawPolygon').on('click', showMapModal);
    $('#btnClearPolygon').on('click', function () {
        $('#polygon').val('');
    });
    $('#btnSavePolygon').on('click', savePolygonFromMap);

    // Enter to search
    $('#txtSearchKeyword, #txtFarmCode, #txtFarmerName').on('keypress', function (e) {
        if (e.which === 13) {
            loadFarms();
        }
    });

    // Show statistics
    $('.btn-info').on('dblclick', showStatistics);
}

// ========================================
// LOAD FARMS
// ========================================
function loadFarms() {
    console.log('📥 Loading farms...');

    const searchParams = {
        searchKeyword: $('#txtSearchKeyword').val(),
        farmCode: $('#txtFarmCode').val(),
        farmerName: $('#txtFarmerName').val(),
        agentCode: $('#ddlAgentCode').val(),
        isActive: $('#ddlIsActive').val() === '' ? null : $('#ddlIsActive').val() === 'true',
        fromDate: $('#txtFromDate').val(),
        toDate: $('#txtToDate').val(),
        pageNumber: 1,
        pageSize: 1000
    };

    $.ajax({
        url: '/Farm/GetFarms',
        type: 'GET',
        data: searchParams,
        success: function (response) {
            console.log('📥 Response:', response);

            if (response.success) {
                gridApiFarm.setGridOption('rowData', response.data);
                updateStatusBar(response.totalRecords);
                updateLastUpdateTime();
                console.log('✅ Loaded', response.totalRecords, 'farms');
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('❌ Error loading farms:', error);
            showError('Lỗi khi tải dữ liệu: ' + error);
        }
    });
}

// ========================================
// SHOW ADD MODAL
// ========================================
function showAddModal() {
    currentFarmId = null;
    $('#modalTitle').text('Thêm nhà vườn mới');
    $('#farmForm')[0].reset();
    $('#farmId').val('');
    $('#isActive').val('false'); // Default: chưa duyệt
    $('#farmModal').modal('show');
}

// ========================================
// EDIT FARM
// ========================================
function editFarm(id) {
    console.log('✏️ Editing farm:', id);
    currentFarmId = id;

    $.ajax({
        url: '/Farm/GetFarmById',
        type: 'GET',
        data: { id: id },
        success: function (response) {
            if (response.success) {
                const farm = response.data;

                $('#modalTitle').text('Sửa thông tin nhà vườn');
                $('#farmId').val(farm.farmId);
                $('#farmCode').val(farm.farmCode);
                $('#agentCode').val(farm.agentCode);
                $('#farmerName').val(farm.farmerName);
                $('#farmPhone').val(farm.farmPhone);
                $('#farmAddress').val(farm.farmAddress);
                $('#certificates').val(farm.certificates);
                $('#totalAreaHa').val(farm.totalAreaHa);
                $('#rubberAreaHa').val(farm.rubberAreaHa);
                $('#totalExploit').val(farm.totalExploit);
                $('#isActive').val(farm.isActive.toString());
                $('#polygon').val(farm.polygon || '');

                $('#farmModal').modal('show');
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi tải thông tin nhà vườn: ' + error);
        }
    });
}

// ========================================
// VIEW FARM
// ========================================
function viewFarm(id) {
    editFarm(id);
    // Make all fields readonly
    $('#farmForm input, #farmForm select, #farmForm textarea').prop('readonly', true);
    $('#farmForm select').prop('disabled', true);
    $('#btnSave').hide();

    $('#farmModal').on('hidden.bs.modal', function () {
        $('#farmForm input, #farmForm select, #farmForm textarea').prop('readonly', false);
        $('#farmForm select').prop('disabled', false);
        $('#btnSave').show();
    });
}

// ========================================
// SAVE FARM
// ========================================
function saveFarm() {
    // Validation
    if (!$('#farmCode').val()) {
        showWarning('Vui lòng nhập mã nhà vườn');
        $('#farmCode').focus();
        return;
    }

    if (!$('#farmerName').val()) {
        showWarning('Vui lòng nhập tên chủ vườn');
        $('#farmerName').focus();
        return;
    }

    if (!$('#agentCode').val()) {
        showWarning('Vui lòng chọn đại lý');
        $('#agentCode').focus();
        return;
    }

    const farmData = {
        farmId: $('#farmId').val() ? parseInt($('#farmId').val()) : 0,
        farmCode: $('#farmCode').val(),
        agentCode: $('#agentCode').val(),
        farmerName: $('#farmerName').val(),
        farmPhone: $('#farmPhone').val(),
        farmAddress: $('#farmAddress').val(),
        isActive: $('#isActive').val() === 'true',
        certificates: $('#certificates').val(),
        totalAreaHa: parseFloat($('#totalAreaHa').val()) || null,
        rubberAreaHa: parseFloat($('#rubberAreaHa').val()) || null,
        totalExploit: parseFloat($('#totalExploit').val()) || null,
        polygon: $('#polygon').val()
    };

    const isEdit = currentFarmId !== null && currentFarmId > 0;
    const url = isEdit ? '/Farm/UpdateFarm' : '/Farm/CreateFarm';
    const method = isEdit ? 'PUT' : 'POST';

    console.log(isEdit ? '✏️ Updating farm...' : '➕ Creating farm...');

    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json',
        data: JSON.stringify(farmData),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                $('#farmModal').modal('hide');
                loadFarms();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi lưu nhà vườn: ' + error);
        }
    });
}
// ========================================
// FARM.JS - PART 2
// ========================================

// ========================================
// DELETE FARM
// ========================================
function deleteFarm(id) {
    currentFarmId = id;
    $('#deleteModal').modal('show');
}

function confirmDelete() {
    if (!currentFarmId) return;

    console.log('🗑️ Deleting farm:', currentFarmId);

    $.ajax({
        url: '/Farm/DeleteFarm',
        type: 'DELETE',
        data: { id: currentFarmId },
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                $('#deleteModal').modal('hide');
                loadFarms();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi xóa nhà vườn: ' + error);
        }
    });
}

// ========================================
// APPROVE FARM
// ========================================
function approveFarm(farmId) {
    console.log('✅ Approving farm:', farmId);

    $.ajax({
        url: '/Farm/ApproveFarm',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ farmId: farmId, isActive: true }),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                loadFarms();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi duyệt nhà vườn: ' + error);
        }
    });
}

// ========================================
// UNAPPROVE FARM
// ========================================
function unapproveFarm(farmId) {
    console.log('❌ Unapproving farm:', farmId);

    if (!confirm('Bạn có chắc chắn muốn hủy duyệt nhà vườn này?')) {
        return;
    }

    $.ajax({
        url: '/Farm/ApproveFarm',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ farmId: farmId, isActive: false }),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                loadFarms();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi hủy duyệt nhà vườn: ' + error);
        }
    });
}

// ========================================
// BULK APPROVE FARMS
// ========================================
function bulkApproveFarms() {
    if (selectedRows.length === 0) {
        showWarning('Vui lòng chọn ít nhất một nhà vườn để duyệt');
        return;
    }

    // Filter only unapproved farms
    var unapprovedFarms = selectedRows.filter(row => !row.isActive);

    if (unapprovedFarms.length === 0) {
        showWarning('Tất cả các nhà vườn đã chọn đã được duyệt');
        return;
    }

    if (!confirm(`Duyệt ${unapprovedFarms.length} nhà vườn đã chọn?`)) {
        return;
    }

    console.log('✅ Bulk approving', unapprovedFarms.length, 'farms');

    let completed = 0;
    let errors = 0;

    unapprovedFarms.forEach(function (farm) {
        $.ajax({
            url: '/Farm/ApproveFarm',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ farmId: farm.farmId, isActive: true }),
            success: function (response) {
                completed++;
                if (completed + errors === unapprovedFarms.length) {
                    showSuccess(`Đã duyệt ${completed} nhà vườn` + (errors > 0 ? ` (${errors} lỗi)` : ''));
                    loadFarms();
                    selectedRows = [];
                    updateSelectedCount();
                }
            },
            error: function () {
                errors++;
                if (completed + errors === unapprovedFarms.length) {
                    showError(`Duyệt thất bại ${errors}/${unapprovedFarms.length} nhà vườn`);
                    loadFarms();
                }
            }
        });
    });
}

// ========================================
// BULK UNAPPROVE FARMS
// ========================================
function bulkUnapproveFarms() {
    if (selectedRows.length === 0) {
        showWarning('Vui lòng chọn ít nhất một nhà vườn để hủy duyệt');
        return;
    }

    // Filter only approved farms
    var approvedFarms = selectedRows.filter(row => row.isActive);

    if (approvedFarms.length === 0) {
        showWarning('Tất cả các nhà vườn đã chọn chưa được duyệt');
        return;
    }

    if (!confirm(`Hủy duyệt ${approvedFarms.length} nhà vườn đã chọn?`)) {
        return;
    }

    console.log('❌ Bulk unapproving', approvedFarms.length, 'farms');

    let completed = 0;
    let errors = 0;

    approvedFarms.forEach(function (farm) {
        $.ajax({
            url: '/Farm/ApproveFarm',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ farmId: farm.farmId, isActive: false }),
            success: function (response) {
                completed++;
                if (completed + errors === approvedFarms.length) {
                    showSuccess(`Đã hủy duyệt ${completed} nhà vườn` + (errors > 0 ? ` (${errors} lỗi)` : ''));
                    loadFarms();
                    selectedRows = [];
                    updateSelectedCount();
                }
            },
            error: function () {
                errors++;
                if (completed + errors === approvedFarms.length) {
                    showError(`Hủy duyệt thất bại ${errors}/${approvedFarms.length} nhà vườn`);
                    loadFarms();
                }
            }
        });
    });
}

// ========================================
// BULK DELETE
// ========================================
function bulkDeleteFarms() {
    if (selectedRows.length === 0) {
        showWarning('Vui lòng chọn ít nhất một nhà vườn để xóa');
        return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedRows.length} nhà vườn đã chọn?`)) {
        return;
    }

    const farmIds = selectedRows.map(row => row.farmId);

    console.log('🗑️ Bulk deleting farms:', farmIds);

    $.ajax({
        url: '/Farm/BulkDeleteFarms',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ farmIds: farmIds }),
        success: function (response) {
            if (response.success) {
                showSuccess(response.message);
                loadFarms();
                selectedRows = [];
                updateSelectedCount();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi xóa nhà vườn: ' + error);
        }
    });
}

// ========================================
// SELECTION CHANGED
// ========================================
function onSelectionChanged() {
    selectedRows = gridApiFarm.getSelectedRows();
    updateSelectedCount();
}

function updateSelectedCount() {
    var totalCount = selectedRows.length;
    var approvedCount = selectedRows.filter(row => !row.isActive).length; // Count unapproved for approve button
    var unapprovedCount = selectedRows.filter(row => row.isActive).length; // Count approved for unapprove button

    $('#selectedCount').text(totalCount);
    $('#approveCount').text(approvedCount);
    $('#unapproveCount').text(unapprovedCount);

    $('#btnBulkDelete').prop('disabled', totalCount === 0);
    $('#btnApprove').prop('disabled', approvedCount === 0);
    $('#btnUnapprove').prop('disabled', unapprovedCount === 0);
}

// ========================================
// SHOW STATISTICS
// ========================================
function showStatistics() {
    console.log('📊 Loading statistics...');

    $.ajax({
        url: '/Farm/GetFarmStatistics',
        type: 'GET',
        success: function (response) {
            if (response.success) {
                const stats = response.data;

                $('#statTotalFarms').text(stats.totalFarms);
                $('#statActiveFarms').text(stats.activeFarms);
                $('#statInactiveFarms').text(stats.inactiveFarms);
                $('#statNewFarms').text(stats.newFarmsThisMonth);

                $('#statTotalArea').text(Number(stats.totalAreaHa).toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));

                $('#statRubberArea').text(Number(stats.totalRubberAreaHa).toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));

                $('#statTotalExploit').text((Number(stats.totalExploitKg) / 1000).toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));

                $('#statsModal').modal('show');
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            showError('Lỗi khi tải thống kê: ' + error);
        }
    });
}

// ========================================
// EXPORT TO EXCEL
// ========================================
function exportToExcel() {
    console.log('📊 Exporting to Excel...');

    const params = {
        fileName: `DanhSachNhaVuon_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Nhà vườn'
    };

    gridApiFarm.exportDataAsExcel(params);
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
        showWarning('Vui lòng vẽ vùng vườn trên bản đồ');
        return;
    }

    const layer = drawnItems.getLayers()[0];
    const coords = layer.getLatLngs()[0];

    // Convert to WKT format
    const wkt = coordsToWKT(coords);
    $('#polygon').val(wkt);

    showSuccess('Đã lưu vùng vườn');
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
    $('#totalRecords').html(`Tổng: <strong>${total}</strong> nhà vườn`);
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
