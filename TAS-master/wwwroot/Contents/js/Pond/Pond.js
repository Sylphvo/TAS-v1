// ========================================
// POND.JS - Pond Management
// ========================================

let gridApi;
let gridColumnApi;

// ========================================
// INITIALIZE PAGE
// ========================================
function initPondPage() {
    console.log('Initializing Pond page...');
    
    // Setup AG Grid
    setupGrid();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Load initial data
    loadPonds();
    
    // Load agents for dropdown
    loadAgents();
}

// ========================================
// SETUP AG GRID
// ========================================
function setupGrid() {
    const gridDiv = document.querySelector('#pondGrid');
    
    const gridOptions = {
        // Column Definitions
        columnDefs: [
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
                headerName: 'Số thứ tự',
                field: 'rowNo',
                minWidth: 50,
                width: 110,
                cellRenderer: params => {
                    return `<strong style="color: #2c3e50;">${params.value}</strong>`;
                }
            },
            {
                headerName: 'Mã hồ',
                field: 'pondCode',
                width: 150,
                pinned: 'left',
                cellRenderer: params => {
                    return `<strong style="color: #2c3e50;">${params.value}</strong>`;
                }
            },
            {
                headerName: 'Đại lý',
                field: 'agentName',
                width: 180
            },
            {
                headerName: 'Tên hồ',
                field: 'pondName',
                width: 200
            },
            {
                headerName: 'Dung tích (kg)',
                field: 'capacityKg',
                width: 140,
                type: 'numericColumn',
                valueFormatter: params => {
                    if (params.value == null) return '0.00';
                    return Number(params.value).toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
            },
            {
                headerName: 'Công suất/ngày (kg)',
                field: 'dailyCapacityKg',
                width: 170,
                type: 'numericColumn',
                valueFormatter: params => {
                    if (params.value == null) return '0.00';
                    return Number(params.value).toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
            },
            {
                headerName: 'Khối lượng hiện tại (kg)',
                field: 'currentNetKg',
                width: 190,
                type: 'numericColumn',
                valueFormatter: params => {
                    if (params.value == null) return '0.00';
                    return Number(params.value).toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                },
                cellStyle: { fontWeight: 'bold', color: '#27ae60' }
            },
            {
                headerName: 'Tỷ lệ sử dụng (%)',
                field: 'utilizationPercent',
                width: 160,
                type: 'numericColumn',
                cellRenderer: params => {
                    const percent = params.value || 0;
                    const color = percent >= 90 ? '#e74c3c' : percent >= 70 ? '#f39c12' : '#27ae60';
                    return `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; background: #e0e0e0; border-radius: 10px; height: 8px; overflow: hidden;">
                                <div style="width: ${percent}%; background: ${color}; height: 100%;"></div>
                            </div>
                            <span style="font-weight: bold; color: ${color};">${percent.toFixed(1)}%</span>
                        </div>
                    `;
                },
                filter: false
            },
            {
                headerName: 'Trạng thái',
                field: 'status',
                width: 150,
                cellRenderer: params => {
                    return renderStatusBadge(params.value);
                }
            },
            {
                headerName: 'Người tạo',
                field: 'registerPerson',
                width: 120
            },
            {
                headerName: 'Ngày tạo',
                field: 'registerDate',
                width: 150,
                valueFormatter: params => {
                    if (!params.value) return '';
                    const date = new Date(params.value);
                    return date.toLocaleString('vi-VN');
                }
            },
            {
                headerName: 'Thao tác',
                field: 'pondId',
                width: 150,
                pinned: 'right',
                cellRenderer: params => {
                    return `
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" onclick="editPond(${params.value})" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-status" onclick="updateStatus(${params.value}, ${params.data.status})" title="Cập nhật trạng thái">
                                <i class="fas fa-tasks"></i>
                            </button>
                            <button class="btn-action btn-delete" onclick="deletePond(${params.value})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                },
                filter: false,
                sortable: false
            }
        ],
        
        // Grid Options
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true,
            floatingFilter: true
        },
        
        rowSelection: 'multiple',
        animateRows: true,
        pagination: true,
        paginationPageSize: 20,
        paginationPageSizeSelector: [10, 20, 50, 100],
        
        // Events
        onSelectionChanged: onSelectionChanged,
        onGridReady: function(params) {
            gridApi = params.api;
            gridColumnApi = params.columnApi;
            params.api.sizeColumnsToFit();
        }
    };
    
    new agGrid.Grid(gridDiv, gridOptions);
}

// ========================================
// RENDER STATUS BADGE
// ========================================
function renderStatusBadge(status) {
    const statusMap = {
        1: { text: 'Sẵn sàng', class: 'status-ready' },
        2: { text: 'Đang sản xuất', class: 'status-producing' },
        3: { text: 'Bảo trì', class: 'status-maintenance' }
    };
    
    const statusInfo = statusMap[status] || { text: 'Không xác định', class: 'status-unknown' };
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// ========================================
// SETUP EVENT HANDLERS
// ========================================
function setupEventHandlers() {
    // Button clicks
    $('#btnRefresh').on('click', loadPonds);
    $('#btnAdd').on('click', showAddModal);
    $('#btnExport').on('click', exportAllToExcel);
    $('#btnExportSelected').on('click', exportSelectedToExcel);
    $('#btnSave').on('click', savePond);
    
    // Quick filter
    $('#quickFilter').on('input', function() {
        gridApi.setGridOption('quickFilterText', $(this).val());
    });
    
    // Form validation
    $('#pondForm').on('submit', function(e) {
        e.preventDefault();
        savePond();
    });
}

// ========================================
// LOAD PONDS
// ========================================
function loadPonds() {
    showLoading();
    
    $.ajax({
        url: '/Pond/GetAllPonds',
        type: 'GET',
        success: function(response) {
            if (response.success) {
                gridApi.setGridOption('rowData', response.data);
                updateStatusBar(response.data.length);
                updateLastUpdateTime();
            } else {
                showError(response.message || 'Không thể tải dữ liệu');
            }
        },
        error: function(xhr, status, error) {
            console.error('Load error:', error);
            showError('Lỗi khi tải dữ liệu: ' + error);
        },
        complete: function() {
            hideLoading();
        }
    });
}

// ========================================
// LOAD AGENTS
// ========================================
function loadAgents() {
    $.ajax({
        url: '/Pond/GetAgents',
        type: 'GET',
        success: function(response) {
            if (response.success) {
                const $select = $('#agentCode');
                $select.empty().append('<option value="">-- Chọn đại lý --</option>');
                
                response.data.forEach(agent => {
                    $select.append(`<option value="${agent.agentCode}">${agent.agentName} (${agent.agentCode})</option>`);
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('Load agents error:', error);
        }
    });
}

// ========================================
// SHOW ADD MODAL
// ========================================
function showAddModal() {
    $('#modalTitle').text('Thêm hồ mới');
    $('#pondId').val('');
    $('#pondForm')[0].reset();
    $('#modalPond').fadeIn(300);
}

// ========================================
// EDIT POND
// ========================================
function editPond(pondId) {
    showLoading();
    
    $.ajax({
        url: `/Pond/GetPondById/${pondId}`,
        type: 'GET',
        success: function(response) {
            if (response.success) {
                const pond = response.data;
                
                $('#modalTitle').text('Sửa hồ');
                $('#pondId').val(pond.pondId);
                $('#agentCode').val(pond.agentCode);
                $('#pondName').val(pond.pondName || '');
                $('#capacityKg').val(pond.capacityKg || '');
                $('#dailyCapacityKg').val(pond.dailyCapacityKg || '');
                $('#currentNetKg').val(pond.currentNetKg || '');
                
                $('#modalPond').fadeIn(300);
            } else {
                showError(response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Load pond error:', error);
            showError('Lỗi khi tải thông tin hồ');
        },
        complete: function() {
            hideLoading();
        }
    });
}

// ========================================
// SAVE POND
// ========================================
function savePond() {
    // Validation
    if (!$('#agentCode').val()) {
        showError('Vui lòng chọn đại lý');
        $('#agentCode').focus();
        return;
    }
    
    if (!$('#pondName').val()) {
        showError('Vui lòng nhập tên hồ');
        $('#pondName').focus();
        return;
    }
    
    const pondId = $('#pondId').val();
    const isEdit = pondId !== '';
    
    const data = {
        pondId: isEdit ? parseInt(pondId) : 0,
        agentCode: $('#agentCode').val(),
        pondName: $('#pondName').val(),
        capacityKg: $('#capacityKg').val() ? parseFloat($('#capacityKg').val()) : null,
        dailyCapacityKg: $('#dailyCapacityKg').val() ? parseFloat($('#dailyCapacityKg').val()) : null,
        currentNetKg: $('#currentNetKg').val() ? parseFloat($('#currentNetKg').val()) : null
    };
    
    const url = isEdit ? '/Pond/UpdatePond' : '/Pond/CreatePond';
    const method = isEdit ? 'PUT' : 'POST';
    
    showLoading();
    
    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json',
        data: JSON.stringify(data),
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function(response) {
            if (response.success) {
                showSuccess(response.message);
                closeModal();
                loadPonds();
            } else {
                showError(response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Save error:', error);
            showError('Lỗi khi lưu: ' + error);
        },
        complete: function() {
            hideLoading();
        }
    });
}

// ========================================
// DELETE POND
// ========================================
function deletePond(pondId) {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ này?\n\nLưu ý: Không thể xóa nếu hồ có PondIntake, OrderPond hoặc Pallet liên quan.')) {
        return;
    }
    
    showLoading();
    
    $.ajax({
        url: `/Pond/DeletePond/${pondId}`,
        type: 'DELETE',
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function(response) {
            if (response.success) {
                showSuccess(response.message);
                loadPonds();
            } else {
                showError(response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Delete error:', error);
            showError('Lỗi khi xóa: ' + error);
        },
        complete: function() {
            hideLoading();
        }
    });
}

// ========================================
// UPDATE STATUS
// ========================================
function updateStatus(pondId, currentStatus) {
    const statusOptions = [
        { value: 1, text: 'Sẵn sàng' },
        { value: 2, text: 'Đang sản xuất' },
        { value: 3, text: 'Bảo trì' }
    ];
    
    let message = 'Chọn trạng thái mới:\n\n';
    statusOptions.forEach(opt => {
        message += `${opt.value} - ${opt.text}${opt.value === currentStatus ? ' (Hiện tại)' : ''}\n`;
    });
    
    const newStatus = prompt(message + '\nNhập số từ 1-3:');
    
    if (newStatus !== null) {
        const statusNum = parseInt(newStatus);
        if (statusNum >= 1 && statusNum <= 3) {
            showLoading();
            
            $.ajax({
                url: '/Pond/UpdateStatus',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ pondId: pondId, status: statusNum }),
                headers: {
                    'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
                },
                success: function(response) {
                    if (response.success) {
                        showSuccess(response.message);
                        loadPonds();
                    } else {
                        showError(response.message);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Update status error:', error);
                    showError('Lỗi khi cập nhật trạng thái');
                },
                complete: function() {
                    hideLoading();
                }
            });
        } else {
            showError('Trạng thái không hợp lệ. Vui lòng nhập số từ 1-3.');
        }
    }
}

// ========================================
// EXPORT TO EXCEL
// ========================================
function exportAllToExcel() {
    showLoading();
    
    $.ajax({
        url: '/Pond/ExportToExcel',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify([]),
        xhrFields: {
            responseType: 'blob'
        },
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function(blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Ponds_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showSuccess('Xuất Excel thành công');
        },
        error: function(xhr, status, error) {
            console.error('Export error:', error);
            showError('Lỗi khi xuất Excel');
        },
        complete: function() {
            hideLoading();
        }
    });
}

function exportSelectedToExcel() {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
        showError('Vui lòng chọn ít nhất 1 hồ');
        return;
    }
    
    const pondIds = selectedRows.map(row => row.pondId);
    
    showLoading();
    
    $.ajax({
        url: '/Pond/ExportToExcel',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(pondIds),
        xhrFields: {
            responseType: 'blob'
        },
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function(blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Ponds_Selected_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showSuccess('Xuất Excel thành công');
        },
        error: function(xhr, status, error) {
            console.error('Export error:', error);
            showError('Lỗi khi xuất Excel');
        },
        complete: function() {
            hideLoading();
        }
    });
}

// ========================================
// SELECTION CHANGED
// ========================================
function onSelectionChanged() {
    const selectedRows = gridApi.getSelectedRows();
    const count = selectedRows.length;
    
    if (count > 0) {
        $('#selectedRecords').text(`Đã chọn: ${count}`).show();
        $('#btnExportSelected').prop('disabled', false);
    } else {
        $('#selectedRecords').hide();
        $('#btnExportSelected').prop('disabled', true);
    }
}

// ========================================
// CLOSE MODAL
// ========================================
function closeModal() {
    $('#modalPond').fadeOut(300);
    $('#pondForm')[0].reset();
}

// ========================================
// UPDATE STATUS BAR
// ========================================
function updateStatusBar(total) {
    $('#totalRecords').text(`Tổng: ${total} hồ`);
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    $('#lastUpdate').text(`Cập nhật lần cuối: ${timeStr}`);
}

// ========================================
// NOTIFICATIONS
// ========================================
function showSuccess(message) {
    alert(message);
}

function showError(message) {
    alert('Lỗi: ' + message);
}

function showLoading() {
    console.log('Loading...');
}

function hideLoading() {
    console.log('Loading complete');
}
