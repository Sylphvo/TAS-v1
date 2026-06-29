//#region 1. GLOBAL VARIABLES & INITIALIZE PAGE
var gridApiOrder, gridApiDynamic;
let gridColumnApi;
let rowData = [];

function initPage() {
    gridApiOrder = agGrid.createGrid(document.querySelector("#orderGrid"), gridOptions);
    gridApiDynamic = gridApiOrder;
    // Setup event handlers
    setupEventHandlers();

    // Load initial data
    loadOrders();

    // Set default date to today
    $('#orderDate').val(new Date().toISOString().split('T')[0]);

    RegisterAllEvent(gridApiOrder);
}
//#endregion

//#region 2. SETUP AG GRID & COLUMNS
var columnDefs = [
    {
        headerName: 'Số thứ tự',
        field: 'rowNo',
        minWidth: 50,
        width: 110,
    },
    {
        headerName: 'Mã đơn hàng',
        field: 'orderCode',
        editable: true,
        minWidth: 210,
        filter: 'agTextColumnFilter',
        suppressFillHandle: false // Cho phép Fill Handle
    },
    {
        headerName: 'Tên đơn hàng',
        field: 'orderName',
        editable: true,
        width: 180,
        filter: 'agTextColumnFilter',
        suppressFillHandle: false // Cho phép Fill Handle
    },
    {
        headerName: 'Ngày tạo',
        field: 'orderDate',
        width: 180,
        editable: true,
        // 1. Định dạng hiển thị trên bảng lưới (DD/MM/YYYY)
        valueFormatter: params => {
            if (!params.data.orderDate) return '';
            return params.data.orderDate;
        },
        cellEditor: "agDateStringCellEditor",
        cellRenderer: params => {
            if (!params.data.orderDate) return '';
            return new Date(params.data.orderDate).MMddyyyyFormat();
        },
        suppressFillHandle: false // Cho phép Fill Handle
    },
    {
        headerName: 'Ghi chú',
        field: 'note',
        width: 120,
        editable: true,
        cellEditor: 'agLargeTextCellEditor', // Editor vùng văn bản lớn
        cellEditorPopup: true,               // Hiển thị dạng popup để dễ nhìn hơn
        cellEditorParams: {
            maxLength: 200,                    // Giới hạn ký tự
            rows: 10,                          // Số dòng hiển thị trong textarea
            cols: 50
        },
        cellStyle: { 'white-space': 'normal', 'line-height': '1.5em' },
        autoHeight: true, // Tự động dãn dòng theo độ dài văn bản
        suppressFillHandle: false, // Cho phép Fill Handle
        cellRenderer: params => {
            return `<div class="textNote">${params.value}</div>`;
        },
    },
    {
        headerName: 'Tổng Net (kg)',
        field: 'totalNetKg',
        editable: true,
        width: 130,
        type: 'numericColumn',
        valueFormatter: params => {
            if (params.value == null) return '0.00';
            return Number(params.value).toLocaleString('vi-VN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        suppressFillHandle: false // Cho phép Fill Handle
    },
    {
        headerName: 'Trạng thái',
        field: 'status',
        width: 130,
        cellRenderer: params => {
            return renderStatusBadge(params.value);
        },
        suppressFillHandle: false // Cho phép Fill Handle
    },
];

var gridOptions = CreateGridOption(columnDefs);

// Tạo dữ liệu mẫu
const data = Array.from(Array(20).keys()).map((val, index) => ({
    date: new Date(2023, 5, index + 1),
}));

function onGridReady(params) {
    gridApiOrder = params.api;
    gridColumnApi = params.columnApi;

    // Auto size columns
    gridApiOrder.sizeColumnsToFit();
}
//#endregion

//#region 3. EVENT HANDLERS
function setupEventHandlers() {
    // Button clicks
    $('#btnRefresh').on('click', loadOrders);
    $('#btnAdd').on('click', AddNewRow);// Add thêm mới
    $('#btnExport').on('click', exportAllToExcel);
    $('#btnExportSelected').on('click', exportSelectedToExcel);
    $('#btnSave').on('click', saveOrder);

    // Quick filter
    $('#quickFilter').on('input', function () {
        gridApiOrder.setGridOption('quickFilterText', $(this).val());
    });

    // Form validation
    $('#orderForm').on('submit', function (e) {
        e.preventDefault();
        saveOrder();
    });
}

function onSelectionChanged() {
    const selectedRows = gridApiOrder.getSelectedRows();
    const count = selectedRows.length;

    if (count >= 2) {
        $('#btnDeleteSelected').prop('disabled', false); // Mở khóa nút
    } else {
        $('#btnDeleteSelected').prop('disabled', true);  // Khóa nút
    }
}

function onCellValueChanged(event) {
    let rowIndex = event.node.rowIndex;
    let colDef = event.colDef.field;
    saveOrder(rowIndex);
}
//#endregion

//#region 4. CRUD OPERATIONS (LOAD, ADD, EDIT, SAVE, DELETE)
function loadOrders(pageIndex, pageSize) {
    UI.showLoading();
    if (pageIndex) {
        arrConstant.currentPage = pageIndex;
    } else {
        arrConstant.currentPage = 1;
    }
    if (pageSize) {
        arrConstant.pageSize = pageSize;
    }

    var filterData = {
        PageIndex: arrConstant.currentPage,
        PageSize: arrConstant.pageSize,
        Keyword: $('#txtSearchKeyword').val(),
        Status: $('#ddlStatus').val(),
        FromDate: $('#dtFromDate').val(),
        ToDate: $('#dtToDate').val()
    };
    UI.hideLoading();

    $.ajax({
        url: '/Order/GetAllOrders',
        type: 'GET',
        data: filterData,
        success: function (response) {
            if (response.success) {
                var pagedResult = response.data;
                rowData = pagedResult.items;

                gridApiOrder.setGridOption('rowData', pagedResult.items);
                updateStatusBar(pagedResult.totalRecords);

                renderServerPagination(
                    'divPagingContainer',
                    pagedResult.totalRecords,
                    arrConstant.currentPage,
                    arrConstant.pageSize,
                    function (newPage, newSize) {
                        loadOrders(newPage, newSize);
                    }
                );

                updateLastUpdateTime();
            } else {
                NotificationToast("error", response.message || 'Không thể tải dữ liệu');
            }
        },
        error: function (xhr, status, error) {
            console.error('Load error:', error);
            NotificationToast("error", 'Lỗi kết nối server: ' + error);
        }
    });
}

function AddNewRow() {
    const newItem = {
        orderId: 0,
        orderCode: generateUniqueCodeCore(rowData, arrConstant.PrefixOrder, 'orderCode'),
        orderName: "",
        orderDate: new Date(),
        status: 0,
        totalNetKg: 0,
        note: "",
        createdBy: "",
        createdDate: new Date(),
        updateBy: null,
        updateDate: null
    };
    AddNewRowAggrid(gridApiOrder, rowData, newItem, 'selected', rowData.length);
    document.addEventListener('keydown', saveAllOnDoubleEnter);
}

const saveAllOnDoubleEnter = createDoubleEnterHandler(saveAllOrders);

function editOrder(orderId) {
    UI.showLoading();
    $.ajax({
        url: `/Order/GetOrderById/${orderId}`,
        type: 'GET',
        success: function (response) {
            if (response.success) {
                const order = response.data;

                $('#modalTitle').text('Sửa đơn hàng');
                $('#orderId').val(order.orderId);
                $('#agentId').val(order.agentId);

                if (order.orderDate) {
                    const date = new Date(order.orderDate);
                    $('#orderDate').val(date.toISOString().split('T')[0]);
                }

                $('#customerName').val(order.customerName || '');
                $('#shipmentMethod').val(order.shipmentMethod || '');
                $('#totalNetKg').val(order.totalNetKg || '');
                $('#notes').val(order.notes || '');

                $('#modalOrder').fadeIn(300);
            } else {
                NotificationToast("error", response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('Load order error:', error);
            NotificationToast("error", 'Lỗi khi tải thông tin đơn hàng');
        },
        complete: function () {
            UI.hideLoading();
        }
    });
}

function saveOrder(rowIndex) {
    const rowNode = gridApiOrder.getDisplayedRowAtIndex(rowIndex);
    const data = rowNode.data;
    UI.showLoading();

    $.ajax({
        url: `/Order/AddOrUpdateOrder`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            if (response.success) {
                NotificationToast("success", response.message);
                loadOrders();
            } else {
                NotificationToast("error", response.message);
            }
        },
        error: function (xhr, status, error) {
            NotificationToast("error", 'Lỗi khi lưu: ' + error);
        },
        complete: function () {
            UI.hideLoading();
        }
    });
}

function saveAllOrders() {
    let dataToSave = [];

    gridApiOrder.forEachNode((node) => {
        const data = node.data;
        if (data.orderId === 0 || data.isDirty) {
            dataToSave.push(data);
        }
    });

    if (dataToSave.length === 0) {
        NotificationToast("warning", "Không có dữ liệu mới hoặc thay đổi nào để lưu!");
        return;
    }

    UI.showLoading();

    $.ajax({
        url: '/Order/SaveBatchOrders',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSave),
        success: function (response) {
            if (response.success) {
                NotificationToast("success", response.message);
                loadOrders();
            } else {
                NotificationToast("error", response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('Save batch error:', error);
            NotificationToast("error", 'Lỗi khi lưu hàng loạt: ' + error);
        },
        complete: function () {
            UI.hideLoading();
        }
    });
}

function deleteSelectedOrders() {
    const selectedRows = gridApiOrder.getSelectedRows();
    if (selectedRows.length === 0) return;

    const orderIdsToDelete = selectedRows
        .filter(row => row.orderId > 0)
        .map(row => row.orderId);

    const unsavedRows = selectedRows.filter(row => row.orderId === 0);

    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedRows.length} đơn hàng đã chọn không?`)) {
        if (orderIdsToDelete.length === 0) {
            gridApiOrder.applyTransaction({ remove: unsavedRows });
            NotificationToast("success", "Đã xóa các dòng chưa lưu thành công!");
            $('#btnDeleteSelected').prop('disabled', true);
            return;
        }

        UI.showLoading();
        $.ajax({
            url: '/Order/DeleteBatchOrders',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(orderIdsToDelete),
            success: function (response) {
                if (response.success) {
                    NotificationToast("success", response.message);
                    if (unsavedRows.length > 0) {
                        gridApiOrder.applyTransaction({ remove: unsavedRows });
                    }
                    loadOrders();
                    $('#btnDeleteSelected').prop('disabled', true);
                } else {
                    NotificationToast("error", response.message);
                }
            },
            error: function (xhr, status, error) {
                NotificationToast("error", "Lỗi khi xóa: " + error);
            },
            complete: function () {
                UI.hideLoading();
            }
        });
    }
}

async function deleteOrder(orderId) {
    if (!await IsToastConfirmDeleteNoLength()) return;
    UI.showLoading();
    $.ajax({
        url: `/Order/DeleteOrder`,
        type: 'DELETE',
        data: { orderId: orderId },
        success: function (response) {
            if (response.success) {
                NotificationToast("success", response.message);
                loadOrders();
            } else {
                NotificationToast("error", response.message);
            }
        },
        error: function (xhr, status, error) {
            NotificationToast("error", 'Lỗi khi xóa: ' + error);
        },
        complete: function () {
            UI.hideLoading();
        }
    });
}
//#endregion

//#region 5. EXCEL EXPORT & UPDATE STATUS
function updateStatus(orderId, currentStatus) {
    const statusOptions = [
        { value: 1, text: 'Mới tạo' },
        { value: 2, text: 'Đang xử lý' },
        { value: 3, text: 'Đã xuất kho' },
        { value: 4, text: 'Đã giao hàng' },
        { value: 5, text: 'Hoàn thành' },
        { value: 6, text: 'Đã hủy' }
    ];

    let html = '<select id="statusSelect" class="form-control">';
    statusOptions.forEach(opt => {
        const selected = opt.value === currentStatus ? 'selected' : '';
        html += `<option value="${opt.value}" ${selected}>${opt.text}</option>`;
    });
    html += '</select>';

    const newStatus = prompt(`Chọn trạng thái mới:\n\n${html}\n\nNhập số từ 0-5:`);

    if (newStatus !== null) {
        const statusNum = parseInt(newStatus);
        if (statusNum >= 0 && statusNum <= 5) {
            UI.showLoading();

            $.ajax({
                url: '/Order/UpdateStatus',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ orderId: orderId, status: statusNum }),
                headers: {
                    'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
                },
                success: function (response) {
                    if (response.success) {
                        NotificationToast("success", response.message);
                        loadOrders();
                    } else {
                        NotificationToast("error", response.message);
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Update status error:', error);
                    NotificationToast("error", 'Lỗi khi cập nhật trạng thái');
                },
                complete: function () {
                    UI.hideLoading();
                }
            });
        } else {
            NotificationToast("error", 'Trạng thái không hợp lệ. Vui lòng nhập số từ 0-5.');
        }
    }
}

function exportAllToExcel() {
    UI.showLoading();

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
            UI.hideLoading();
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

    UI.showLoading();

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
            UI.hideLoading();
        }
    });
}
//#endregion

//#region 6. UTILITIES & RENDERERS
function renderStatusBadge(status) {
    const statusMap = {
        0: { text: 'Mới tạo', class: 'badge-primary' },
        1: { text: 'Đang xử lý', class: 'badge-warning' },
        2: { text: 'Đã xuất kho', class: 'badge-primary' },
        3: { text: 'Đã giao hàng', class: 'badge-primary' },
        4: { text: 'Hoàn thành', class: 'badge-success' },
        5: { text: 'Đã hủy', class: 'badge-danger' }
    };

    const statusInfo = statusMap[status] || { text: 'Không xác định', class: 'status-unknown' };
    return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

function CellRenderAction(params) {
    let strSave = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="saveOrder(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;
    let strCancel = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="cancelRow(${params.node.rowIndex}, 'orderCode')" title="Bỏ"><i class="ti ti-x f-20"></i></a>`;
    let deleteOrderBtn = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteOrder(${params.data.orderId})" title="${arrMsg.key_delete}"><i class="ti ti-trash f-20"></i></a>`;
    return params.data.orderId === 0 ? `${strSave}${strCancel}` : `${deleteOrderBtn}`;
}

function closeModal() {
    $('#modalOrder').fadeOut(300);
    $('#orderForm')[0].reset();
}

function updateStatusBar(total) {
    $('#totalRecords').text(`Tổng: ${total} đơn hàng`);
    // Note: Trong file gốc bạn có 2 hàm updateStatusBar (1 cái dùng ID #lblTotalRecords, 1 cái dùng #totalRecords). 
    // Mình giữ nguyên logic của bạn để tránh lỗi giao diện. Bạn có thể tự gộp nếu chỉ dùng 1 ID nhé!
    $('#lblTotalRecords').text("Tổng cộng: " + total + " đơn hàng");
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    $('#lastUpdate').text(`Cập nhật lần cuối: ${timeStr}`);
}

function onFillEnd(params) {
    return;
}

// Hàm saveBatchRecords cũ đang được comment
// async function saveBatchRecords(fillHandleBatch) { ... }
//#endregion