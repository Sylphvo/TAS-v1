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
            {
                headerName: 'Ngày tạo',
                field: 'orderDate',
                width: 180,
                editable: true,
                // 1. Định dạng hiển thị trên bảng lưới (DD/MM/YYYY)
                valueFormatter: params => {
                    if (!params.data.orderDate) return '';
                    const d = new Date(params.data.orderDate);
                    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                },

                // 2. Ép trình Edit phải hiểu dữ liệu truyền vào là kiểu Date chuẩn
                // (Giúp picker hiển thị đúng ngày hiện tại thay vì trống rỗng hoặc báo lỗi format)
                valueGetter: params => {
                    return new Date(params.data.orderDate).getDate() + "-" + (new Date(params.data.orderDate).getMonth() + 1) + "-" + new Date(params.data.orderDate).getFullYear()
                    //return params.data.orderDate ? new Date(params.data.orderDate).ddMMyyyyFormat() : null;
                },

                // 3. Xử lý sau khi người dùng chọn ngày xong
                valueParser: params => {
                    // Chuyển giá trị từ trình edit về lại kiểu dữ liệu mong muốn (String hoặc Date)
                    return params.data.orderDate;
                },
                cellEditor: "agDateStringCellEditor",

                //cellRenderer: params => {
                //    const parts = params.data.orderDate.split('/');
                //    // parts[0]: ngày, parts[1]: tháng, parts[2]: năm
                //    return new Date(parts[2], parts[1] - 1, parts[0]).ddMMyyyyFormat();
                //},
                //// Lấy dữ liệu từ chuỗi "3/2/2026" chuyển thành Object Date cho Editor
                //valueSetter: params => {
                //    if (params.newValue) {
                //        const d = new Date(params.newValue);
                //        // Chuyển đối tượng Date thành chuỗi dd/mm/yyyy
                //        const day = d.getDate().toString().padStart(2, '0');
                //        const month = (d.getMonth() + 1).toString().padStart(2, '0');
                //        const year = d.getFullYear();

                //        params.data.orderDate = `${day}/${month}/${year}`;
                //        return new Date(parts[2], parts[1] - 1, parts[0]).ddMMyyyyFormat();
                //    }
                //    return new Date(parts[2], parts[1] - 1, parts[0]);
                //},
                //// Lưu dữ liệu sau khi chọn xong về định dạng d/M/yyyy
                //valueSetter: params => {
                //    if (params.newValue instanceof Date) {
                //        const d = params.newValue;
                //        // Format không có số 0 ở trước: 3/2/2026
                //        const formatted = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                //        params.data.orderDate = formatted;
                //        return true;
                //    }
                //    return false;
                //}
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
                autoHeight: true // Tự động dãn dòng theo độ dài văn bản
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
            floatingFilter: true,
            cellStyle: CellStyle_Col_Model
        },

        rowSelection: 'multiple',
        animateRows: true,
        //pagination: truKe,
        //paginationPageSize: 10,
        //paginationPageSizeSelector: [5, 10, 20, 100],
        rowHeight: 70,// Độ cao dòng

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
const data = Array.from(Array(20).keys()).map((val, index) => ({
    date: new Date(2023, 5, index + 1),
}));

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
function loadOrders(pageIndex, pageSize) {
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
                // Quan trọng: Truyền hàm callback để khi bấm nút nó gọi lại loadOrders
                renderServerPagination(
                    'divPagingContainer',     // ID thẻ div chứa thanh phân trang
                    pagedResult.totalRecords, // Tổng số bản ghi (Server trả về)
                    arrConstant.currentPage,            // Trang hiện tại
                    arrConstant.pageSize,               // Size hiện tại
                    function (newPage, newSize) {
                        // Callback: Khi người dùng bấm Next/Prev/Change Size -> Gọi lại hàm load này
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
    const newRow = {
        // 1. Định danh
        orderId: 0, // 0 đánh dấu là dòng mới chưa lưu DB
        orderCode: generateUniqueFakeOrderCode(rowData), // Hàm sinh mã không trùng
        orderName: "", // Mới thêm: Tên đơn hàng

        // 2. Ngày tháng
        // Mặc định lấy ngày hiện tại (Format: YYYY-MM-DD) để binding vào input date
        orderDate: new Date().toISOString().split('T')[0],

        // 3. Trạng thái & Ghi chú
        status: 0, // Mặc định là 0 (Mới tạo/Draft)
        note: "",

        // 4. Audit (Thông tin quản trị - Có thể để null hoặc lấy user hiện tại)
        createdBy: "", // Có thể gán tên user đang login
        createdDate: new Date(), // Ngày tạo là ngay bây giờ
        updateBy: null,
        updateDate: null
    };


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
        ${deleteOrder}
    `;
    }
   
}
function cancelRow(rowIndex) {
    const objectData = gridApiOrder.getDisplayedRowAtIndex(rowIndex).data;
    rowData = rowData.filter(item => item.orderCode !== objectData.orderCode);
    gridApiOrder.setGridOption('rowData', rowData);
}