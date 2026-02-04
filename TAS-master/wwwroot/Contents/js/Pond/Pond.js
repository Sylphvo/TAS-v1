// ========================================
// POND.JS - Pond Management (Refactored)
// ========================================

let gridApiPond;
let gridColumnApi;
let rowData = [];

// ========================================
// INITIALIZE PAGE
// ========================================
function initPondPage() {
    // Setup AG Grid
    setupGrid();

    // Setup event handlers
    setupEventHandlers();

    // Load initial data
    loadPonds();

    // Load agents for dropdown
    //loadAgents();
}

// ========================================
// SETUP AG GRID
// ========================================
function setupGrid() {
    const gridOptions = {
        // Column Definitions
        columnDefs: [
            {
                headerName: '',
                field: 'selected',
                checkboxSelection: true,
                headerCheckboxSelection: true,
                minWidth: 50,
                width: 50,
                pinned: 'left',
                lockPosition: true,
                suppressMenu: true,
                filter: false
            },
            {
                headerName: 'Số thứ tự',
                field: 'rowNo',
                pinned: 'left',
                minWidth: 50,
                width: 110,
            },
            {
                headerName: 'Mã hồ',
                field: 'pondCode',
                editable: true,
                minWidth: 150,
                cellRenderer: params => {
                    return `<strong style="color: #2c3e50;">${params.value || ''}</strong>`;
                }
            },
            {
                headerName: 'Tên hồ',
                field: 'pondName',
                editable: true,
                width: 200
            },
            {
                headerName: 'Dung tích (kg)',
                field: 'capacityKg',
                editable: true,
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
                headerName: 'Trạng thái',
                field: 'status',
                width: 150,
                cellRenderer: params => {
                    return renderStatusBadge(params.value);
                }
            },
            {
                headerName: 'Thao tác',
                field: 'pondId',
                width: 150,
                pinned: 'right',
                cellRenderer: CellRenderAction,
                filter: false,
                sortable: false
            }
        ],

        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true,
            floatingFilter: true,
            cellStyle: { 'display': 'flex', 'align-items': 'center' }
        },

        rowSelection: 'multiple',
        animateRows: true,
        rowHeight: 45,

        onSelectionChanged: onSelectionChanged,
        onGridReady: function (params) {
            gridApiPond = params.api;
            gridColumnApi = params.columnApi;
            params.api.sizeColumnsToFit();
        }
    };

    // Chú ý: Đổi ID grid tương ứng trong HTML của bạn
    gridApiPond = agGrid.createGrid(document.querySelector("#pondGrid"), gridOptions);
}

// ========================================
// RENDER STATUS BADGE
// ========================================
function renderStatusBadge(status) {
    const statusMap = {
        1: { text: 'Sẵn sàng', class: 'badge-success' },
        2: { text: 'Đang sản xuất', class: 'badge-warning' },
        3: { text: 'Bảo trì', class: 'badge-danger' }
    };

    const statusInfo = statusMap[status] || { text: 'Không xác định', class: 'badge-secondary' };
    return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// ========================================
// SETUP EVENT HANDLERS
// ========================================
function setupEventHandlers() {
    $('#btnRefresh').on('click', loadPonds);
    $('#btnAdd').on('click', showAddRow); // Đổi sang add dòng trực tiếp
    $('#btnExport').on('click', exportAllToExcel);
    $('#btnExportSelected').on('click', exportSelectedToExcel);

    $('#quickFilter').on('input', function () {
        gridApiPond.setGridOption('quickFilterText', $(this).val());
    });
}

// ========================================
// LOAD PONDS
// ========================================
function loadPonds(pageIndex, pageSize) {
    showLoading();
    // 1. Nếu không truyền pageIndex, mặc định là trang 1 (khi bấm nút Tìm kiếm)
    if (pageIndex) {
        arrConstant.currentPage = pageIndex;
    } else {
        arrConstant.currentPage = 1;
    }
    if (pageSize) {
        arrConstant.pageSize = pageSize;
    }
    // 2. Lấy giá trị từ các ô Filter trên màn hình
    var filterData = {
        PageIndex: arrConstant.currentPage,
        PageSize: arrConstant.PageSize,
        Keyword: $('#txtSearchKeyword').val(), // Lấy từ ô tìm kiếm
        Status: $('#ddlStatus').val(),         // Lấy từ dropdown trạng thái
        FromDate: $('#dtFromDate').val(),      // Lấy ngày bắt đầu
        ToDate: $('#dtToDate').val()           // Lấy ngày kết thúc
    };

    $.ajax({
        url: '/Pond/GetAllPonds',
        type: 'GET',
        data: filterData, // Gửi object filter lên controller
        success: function (response) {
            if (response.success) {
                // response.data lúc này là object PagedResult { items: [...], totalRecords: 100 }
                var pagedResult = response.data;
                rowData = pagedResult.items;

                gridApiPond.setGridOption('rowData', rowData);

                updateStatusBar(rowData.length);
                // 5. [Quan trọng] Xử lý phân trang UI (Nếu bạn dùng phân trang tùy chỉnh)
                // Quan trọng: Truyền hàm callback để khi bấm nút nó gọi lại loadOrders
                renderServerPagination(
                    'divPagingContainer',     // ID thẻ div chứa thanh phân trang
                    pagedResult.totalRecords, // Tổng số bản ghi (Server trả về)
                    arrConstant.currentPage,            // Trang hiện tại
                    arrConstant.pageSize,               // Size hiện tại
                    function (newPage, newSize) {
                        // Callback: Khi người dùng bấm Next/Prev/Change Size -> Gọi lại hàm load này
                        loadPonds(newPage, newSize);
                    }
                );
                updateLastUpdateTime();
            } else {
                NotificationToast("error", response.message || 'Không thể tải dữ liệu');
            }
        },
        error: function (xhr) {
            NotificationToast("error", 'Lỗi kết nối: ' + xhr.statusText);
        },
        complete: hideLoading
    });
}

// ========================================
// ACTION RENDERER (Giống Order.js)
// ========================================
function CellRenderAction(params) {
    let strSave = `<a href="#" class="avtar-xs btn-link-secondary" onclick="savePondInline(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;
    let strCancel = `<a href="#" class="avtar-xs btn-link-secondary" onclick="cancelRow(${params.node.rowIndex})" title="Hủy"><i class="ti ti-x f-20"></i></a>`;
    let strDelete = `<a href="#" class="avtar-xs btn-link-secondary" onclick="deletePond(${params.value})" title="Xóa"><i class="ti ti-trash f-20"></i></a>`;
    let strEdit = `<a href="#" class="avtar-xs btn-link-secondary" onclick="editPond(${params.value})" title="Sửa"><i class="ti ti-edit f-20"></i></a>`;

    if (params.data.pondId === 0 || !params.data.pondId) {
        return `${strSave} ${strCancel}`;
    }
    return `${strEdit} ${strDelete}`;
}

// ========================================
// SHOW ADD ROW (Thêm trực tiếp vào Grid)
// ========================================
function showAddRow() {
    const newRow = {
        pondId: 0,
        pondCode: "",
        pondName: "",
        capacityKg: 0,
        dailyCapacityKg: 0,
        currentNetKg: 0,
        status: 1
    };

    gridApiPond.applyTransaction({ add: [newRow], addIndex: 0 });
    // Scroll tới dòng mới
    gridApiPond.ensureIndexVisible(0);
}

function cancelRow(rowIndex) {
    loadPonds(); // Load lại để xóa dòng ảo
}

// ========================================
// SAVE POND (Inline)
// ========================================
function savePondInline(rowIndex) {
    const rowNode = gridApiPond.getDisplayedRowAtIndex(rowIndex);
    const data = rowNode.data;

    if (!data.pondCode || !data.pondName) {
        NotificationToast("error", "Vui lòng nhập Mã và Tên hồ");
        return;
    }

    showLoading();
    $.ajax({
        url: data.pondId === 0 ? '/Pond/CreatePond' : '/Pond/UpdatePond',
        type: data.pondId === 0 ? 'POST' : 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            if (response.success) {
                NotificationToast("success", response.message);
                loadPonds();
            } else {
                NotificationToast("error", response.message);
            }
        },
        complete: hideLoading
    });
}

// ========================================
// DELETE POND
// ========================================
function deletePond(pondId) {
    if (!confirm('Bạn có chắc chắn muốn xóa hồ này?')) return;

    showLoading();
    $.ajax({
        url: `/Pond/DeletePond/${pondId}`,
        type: 'DELETE',
        success: function (response) {
            if (response.success) {
                NotificationToast("success", response.message);
                loadPonds();
            } else {
                NotificationToast("error", response.message);
            }
        },
        complete: hideLoading
    });
}

// ========================================
// UTILS
// ========================================
function onSelectionChanged() {
    const count = gridApiPond.getSelectedRows().length;
    $('#selectedRecords').text(count > 0 ? `Đã chọn: ${count}` : "").toggle(count > 0);
    $('#btnExportSelected').prop('disabled', count === 0);
}

function updateStatusBar(total) {
    $('#totalRecords').text(`Tổng: ${total} hồ`);
}

function updateLastUpdateTime() {
    $('#lastUpdate').text(`Cập nhật lần cuối: ${new Date().toLocaleTimeString('vi-VN')}`);
}

function showLoading() { console.log('Loading...'); }
function hideLoading() { console.log('Complete'); }

// ========================================
// EXPORT TO EXCEL
// ========================================
function exportAllToExcel() {
    showLoading();

    $.ajax({
        url: '/Order/ExportToExcel',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify([]),
        xhrFields: {
            responseType: 'blob'
        },
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            NotificationToast("success", 'Xuất Excel thành công');
        },
        error: function (xhr, status, error) {
            console.error('Export error:', error);
            NotificationToast("error", 'Lỗi khi xuất Excel');
        },
        complete: function () {
            hideLoading();
        }
    });
}

function exportSelectedToExcel() {
    const selectedRows = gridApiOrder.getSelectedRows();
    if (selectedRows.length === 0) {
        NotificationToast("error", 'Vui lòng chọn ít nhất 1 đơn hàng');
        return;
    }

    const orderIds = selectedRows.map(row => row.orderId);

    showLoading();

    $.ajax({
        url: '/Order/ExportToExcel',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(orderIds),
        xhrFields: {
            responseType: 'blob'
        },
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Orders_Selected_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            NotificationToast("success", 'Xuất Excel thành công');
        },
        error: function (xhr, status, error) {
            console.error('Export error:', error);
            NotificationToast("error", 'Lỗi khi xuất Excel');
        },
        complete: function () {
            hideLoading();
        }
    });
}
