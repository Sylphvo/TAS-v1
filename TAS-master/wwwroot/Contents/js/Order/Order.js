// ========================================
// ORDER.JS - Order Management
// ========================================

let gridApiOrder;
let gridColumnApi;
let rowData = [];
var currentPage = 1;
var pageSize = 20; // Số dòng mỗi trang

// ========================================
// INITIALIZE PAGE
// ========================================
function initPage() {
    
    // Setup AG Grid
    setupGrid();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Load initial data
    loadOrders();
    
    // Load agents for dropdown
    loadAgents();
    
    // Set default date to today
    $('#orderDate').val(new Date().toISOString().split('T')[0]);
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
                minWidth: 50,
                width: 110,
                
            },
            {
                headerName: 'Mã đơn hàng',
                field: 'orderCode',
                editable: true,
                minWidth: 210,
                cellRenderer: params => {
                    return `<strong style="color: #2c3e50;">${params.value}</strong>`;
                }
            },
            {
                headerName: 'Tên đơn hàng',
                field: 'orderName',
                editable: true,
                width: 180
            },
            //{
            //    headerName: 'Tên đại lý',
            //    field: 'agentName',
            //    editable: true,
            //    width: 180
            //},
            {
                headerName: 'Công ty',
                field: 'buyerCompany',
                editable: true,
                width: 180
            },
            {
                headerName: 'Loại SP',
                field: 'productType',
                editable: true,
                width: 120
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
                cellStyle: { fontWeight: 'bold', color: '#27ae60' }
            },
            {
                headerName: 'Trạng thái',
                field: 'status',
                width: 130,
                cellRenderer: params => {
                    return renderStatusBadge(params.value);
                }
            },
            {
                headerName: 'Thao tác',
                field: 'action',
                width: 200,
                pinned: 'right',
                cellRenderer: CellRenderAction,
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
        paginationPageSize: 10,
        paginationPageSizeSelector: [5, 10, 20, 100],

        // Events
        onSelectionChanged: onSelectionChanged,
        onGridReady: function (params) {
            gridApiOrder = params.api;
            gridColumnApi = params.columnApi;
            params.api.sizeColumnsToFit();
        }
    };
    gridApiOrder = agGrid.createGrid(document.querySelector("#orderGrid"), gridOptions);
}


// ========================================
// RENDER STATUS BADGE
// ========================================
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

// ========================================
// SETUP EVENT HANDLERS
// ========================================
function setupEventHandlers() {
    // Button clicks
    $('#btnRefresh').on('click', loadOrders);
    $('#btnAdd').on('click', showAddModal);
    $('#btnExport').on('click', exportAllToExcel);
    $('#btnExportSelected').on('click', exportSelectedToExcel);
    $('#btnSave').on('click', saveOrder);
    
    // Quick filter
    $('#quickFilter').on('input', function() {
        gridApiOrder.setGridOption('quickFilterText', $(this).val());
    });
    
    // Form validation
    $('#orderForm').on('submit', function(e) {
        e.preventDefault();
        saveOrder();
    });
}

// ========================================
// LOAD ORDERS
// ========================================
function loadOrders(pageIndex) {
    showLoading();

    // 1. Nếu không truyền pageIndex, mặc định là trang 1 (khi bấm nút Tìm kiếm)
    if (pageIndex) {
        currentPage = pageIndex;
    } else {
        currentPage = 1;
    }

    // 2. Lấy giá trị từ các ô Filter trên màn hình
    var filterData = {
        PageIndex: currentPage,
        PageSize: pageSize,
        Keyword: $('#txtSearchKeyword').val(), // Lấy từ ô tìm kiếm
        Status: $('#ddlStatus').val(),         // Lấy từ dropdown trạng thái
        FromDate: $('#dtFromDate').val(),      // Lấy ngày bắt đầu
        ToDate: $('#dtToDate').val()           // Lấy ngày kết thúc
    };

    $.ajax({
        url: '/Order/GetAllOrders',
        type: 'GET',
        data: filterData, // Gửi object filter lên controller
        success: function (response) {
            if (response.success) {
                // response.data lúc này là object PagedResult { items: [...], totalRecords: 100 }
                var pagedResult = response.data;
                rowData = pagedResult.items;

                // 3. Cập nhật dữ liệu vào Grid
                // Lưu ý: data trả về nằm trong thuộc tính .items
                gridApiOrder.setGridOption('rowData', pagedResult.items);

                // 4. Cập nhật thanh trạng thái (Tổng số dòng tìm thấy)
                updateStatusBar(pagedResult.totalRecords);

                // 5. [Quan trọng] Xử lý phân trang UI (Nếu bạn dùng phân trang tùy chỉnh)
                //renderPagination(pagedResult.totalRecords, currentPage, pageSize);

                updateLastUpdateTime();
            } else {
                NotificationToast("error", response.message || 'Không thể tải dữ liệu');
            }
        },
        error: function (xhr, status, error) {
            console.error('Load error:', error);
            NotificationToast("error", 'Lỗi kết nối server: ' + error);
        },
        complete: function () {
            hideLoading();
        }
    });
}

// Hàm cập nhật thanh status bar (Ví dụ)
function updateStatusBar(totalCount) {
    $('#lblTotalRecords').text("Tổng cộng: " + totalCount + " đơn hàng");
}
// ========================================
// LOAD AGENTS
// ========================================
function loadAgents() {
    $.ajax({
        url: '/Common/GetAgents',
        type: 'GET',
        success: function(response) {
            if (response.success) {
                const $select = $('#agentId');
                $select.empty().append('<option value="">-- Chọn đại lý --</option>');
                
                response.data.forEach(agent => {
                    $select.append(`<option value="${agent.agentId}">${agent.agentName} (${agent.agentCode})</option>`);
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
    //$('#modalTitle').text('Thêm đơn hàng mới');
    //$('#orderId').val('');
    //$('#orderForm')[0].reset();
    //$('#orderDate').val(new Date().toISOString().split('T')[0]);
    //$('#modalOrder').fadeIn(300);
    const newRow = {
        agentCode: "",
        agentName: "",
        buyerCompany: "",
        buyerName: "",
        expectedShipDate: "",
        note: "",
        orderCode: generateOrderCode(),
        orderDate: "",
        orderId: 0,
        productType: "",
        registerDate: "",
        registerPerson: "",
        shippedAt: null,
        status: 6,
        totalNetKg: 0,
        updateDate: null,
        updatePerson: null
    }


    gridApiOrder.applyTransaction({ add: [newRow], addIndex: rowData.length });
    rowData.push(newRow);
    //BẮT BUỘC
    RefeshSingleColumn(gridApiOrder, 'action');
    //updateRowNumbers();
}

// ========================================
// EDIT ORDER
// ========================================
function editOrder(orderId) {
    showLoading();
    
    $.ajax({
        url: `/Order/GetOrderById/${orderId}`,
        type: 'GET',
        success: function(response) {
            if (response.success) {
                const order = response.data;
                
                $('#modalTitle').text('Sửa đơn hàng');
                $('#orderId').val(order.orderId);
                $('#agentId').val(order.agentId);
                
                // Format date
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
                NotificationToast("error",response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Load order error:', error);
            NotificationToast("error",'Lỗi khi tải thông tin đơn hàng');
        },
        complete: function() {
            hideLoading();
        }
    });
}

// ========================================
// SAVE ORDER
// ========================================
function saveOrder() {
    // Validation
    if (!$('#agentId').val()) {
        NotificationToast("error",'Vui lòng chọn đại lý');
        $('#agentId').focus();
        return;
    }
    
    if (!$('#orderDate').val()) {
        NotificationToast("error",'Vui lòng chọn ngày đặt hàng');
        $('#orderDate').focus();
        return;
    }
    
    const orderId = $('#orderId').val();
    const isEdit = orderId !== '';
    
    const data = {
        orderId: isEdit ? parseInt(orderId) : 0,
        agentId: $('#agentId').val(),
        orderDate: $('#orderDate').val(),
        customerName: $('#customerName').val(),
        shipmentMethod: $('#shipmentMethod').val(),
        totalNetKg: $('#totalNetKg').val() ? parseFloat($('#totalNetKg').val()) : null,
        notes: $('#notes').val()
    };
    
    const url = isEdit ? '/Order/UpdateOrder' : '/Order/CreateOrder';
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
                NotificationToast("success", response.message);
                closeModal();
                loadOrders();
            } else {
                NotificationToast("error", response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Save error:', error);
            NotificationToast("error",'Lỗi khi lưu: ' + error);
        },
        complete: function() {
            hideLoading();
        }
    });
}

// ========================================
// DELETE ORDER
// ========================================
function deleteOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
        return;
    }
    
    showLoading();
    
    $.ajax({
        url: `/Order/DeleteOrder/${orderId}`,
        type: 'DELETE',
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function(response) {
            if (response.success) {
                NotificationToast("success",response.message);
                loadOrders();
            } else {
                NotificationToast("error",response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Delete error:', error);
            NotificationToast("error",'Lỗi khi xóa: ' + error);
        },
        complete: function() {
            hideLoading();
        }
    });
}

// ========================================
// UPDATE STATUS
// ========================================
function updateStatus(orderId, currentStatus) {
    const statusOptions = [
        { value: 0, text: 'Mới tạo' },
        { value: 1, text: 'Đang xử lý' },
        { value: 2, text: 'Đã xuất kho' },
        { value: 3, text: 'Đã giao hàng' },
        { value: 4, text: 'Hoàn thành' },
        { value: 5, text: 'Đã hủy' }
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
            showLoading();
            
            $.ajax({
                url: '/Order/UpdateStatus',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ orderId: orderId, status: statusNum }),
                headers: {
                    'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
                },
                success: function(response) {
                    if (response.success) {
                        NotificationToast("success",response.message);
                        loadOrders();
                    } else {
                        NotificationToast("error",response.message);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Update status error:', error);
                    NotificationToast("error",'Lỗi khi cập nhật trạng thái');
                },
                complete: function() {
                    hideLoading();
                }
            });
        } else {
            NotificationToast("error",'Trạng thái không hợp lệ. Vui lòng nhập số từ 0-5.');
        }
    }
}

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
        success: function(blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            NotificationToast("success",'Xuất Excel thành công');
        },
        error: function(xhr, status, error) {
            console.error('Export error:', error);
            NotificationToast("error",'Lỗi khi xuất Excel');
        },
        complete: function() {
            hideLoading();
        }
    });
}

function exportSelectedToExcel() {
    const selectedRows = gridApiOrder.getSelectedRows();
    if (selectedRows.length === 0) {
        NotificationToast("error",'Vui lòng chọn ít nhất 1 đơn hàng');
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
        success: function(blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Orders_Selected_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            NotificationToast("success",'Xuất Excel thành công');
        },
        error: function(xhr, status, error) {
            console.error('Export error:', error);
            NotificationToast("error",'Lỗi khi xuất Excel');
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
    const selectedRows = gridApiOrder.getSelectedRows();
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
    $('#modalOrder').fadeOut(300);
    $('#orderForm')[0].reset();
}

// ========================================
// UPDATE STATUS BAR
// ========================================
function updateStatusBar(total) {
    $('#totalRecords').text(`Tổng: ${total} đơn hàng`);
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    $('#lastUpdate').text(`Cập nhật lần cuối: ${timeStr}`);
}

// ========================================
// NOTIFICATIONS
// ========================================

function showLoading() {
    // TODO: Implement loading spinner
    console.log('Loading...');
}

function hideLoading() {
    // TODO: Hide loading spinner
    console.log('Loading complete');
}
// Render Action Column
function CellRenderAction(params) {
    // Define action buttons
    let strSave = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="saveOrder(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;
    let strCancel = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="cancelRow(${params.node.rowIndex})" title="Bỏ"><i class="ti ti-x f-20"></i></a>`;

    let markShipped = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="markShipped(${params.value})" title="Lưu"><i class="ti ti-package f-20"></i></a>`;
    let editOrder = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="editOrder(${params.value})" title="Bỏ"><i class="ti ti-edit f-20"></i></a>`;
    let updateStatus = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="updateStatus(${params.value},${params.data.status})" title="${arrMsg.key_delete}"><i class="ti ti-eye f-20"></i></a>`;
    let deleteOrder = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteOrder(${params.value})" title="${arrMsg.key_delete}"><i class="ti ti-trash f-20"></i></a>`;

	// Check if the order has been shipped
    const hasShipped = params.data.shippedAt != null;

    const shipBtn = !hasShipped ? markShipped : '';
    // CHỈ hiện nút lưu khi chưa lưu
    if (params.data.orderId === 0) {
        return `
        ${strSave}
        ${strCancel}
    `;
    }
    else {
        return `
        ${editOrder}
        ${updateStatus}
        ${shipBtn}
        ${deleteOrder}
    `;
    }
   
}
function cancelRow(rowIndex) {
    const objectData = gridApiOrder.getDisplayedRowAtIndex(rowIndex).data;
    rowData = rowData.filter(item => item.orderCode !== objectData.orderCode);
    gridApiOrder.setGridOption('rowData', rowData);
}