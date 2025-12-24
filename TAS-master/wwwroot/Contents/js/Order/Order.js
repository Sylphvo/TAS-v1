var sortData = { sortColumnEventActual: '', sortOrderEventActual: '' }
var gridOptionsOrder, ListDataFull;
var page, pageSize, gridApi, pagerApi;
var arrValueFilter = {
    statusDraft: 0, // Nháp
    statusConfirmed: 1, // Đã xác nhận
    statusLoading: 2, // Đang chất hàng
    statusShipped: 3, // Đã giao hàng
    statusCancelled: 9, // Đã hủy

    contentDraft: 'Nháp',
    contentConfirmed: 'Đã xác nhận',
    contentLoading: 'Đang chất hàng',
    contentShipped: 'Đã giao hàng',
    contentCancelled: 'Đã hủy',

    typeExcel: 1, // Xuất Excel Data
    typeSampleExcel: 2, // Xuất Excel Mẫu

    comboAgent: [], // combo đại lý
    comboProductType: [], // combo loại sản phẩm
    comboStatus: [], // combo trạng thái
    selectFirst: true
};

function CreateGridOrder() {
    gridOptionsOrder = {
        paginationPageSize: 100,
        columnDefs: CreateColModelOrder(),
        defaultColDef: {
            width: 170,
            filter: true,
            floatingFilter: true,
        },
        rowHeight: 45,
        headerHeight: 45,
        rowData: [],
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
        animateRows: true,
        singleClickEdit: true,
        suppressServerSideFullWidthLoadingRow: true,
        cellSelection: true,
        onGridReady: function (params) {
            gridApi = params.api;
        },
        rowDragManaged: true,
        onRowDragEnd() {
            OnDragMoveSetRow();
        },
        onCellValueChanged: e => {
            // Tự động tính toán TotalNetKg nếu cần
            if (['targetTSC', 'targetDRC'].includes(e.colDef.field)) {
                // Logic tính toán nếu cần
            }
            UpdateDataAfterEdit(0, e.data);
        },
        enableRangeSelection: true,
        allowContextMenuWithControlKey: true,
        suppressContextMenu: false,
        getContextMenuItems: params => {
            return [{
                name: 'Áp dụng cho tất cả các cột',
                shortcut: "(Alt + a)",
                action: () => {
                    ApplyCustomColulmn(params);
                },
                cssClasses: ["red", "bold"],
                icon: '<i class="ti ti-copy f-20"></i>',
            }];
        },
        onCellKeyDown: function (params) {
            const keyboardEvent = params.event;
            if (keyboardEvent.altKey && keyboardEvent.key === "a") {
                ApplyCustomColulmn(params);
                NotificationToast("success", "Áp dụng cho tất cả thành công");
            }
        }
    };
    const eGridDiv = document.querySelector(OrderGrid);
    gridApi = agGrid.createGrid(eGridDiv, gridOptionsOrder);

    CreateRowDataOrder();
    resizeGridOrder();
}

function CreateColModelOrder() {
    return [{
        headerName: 'STT',
        field: 'STT',
        minWidth: 60,
        editable: false,
        valueGetter: 'node.rowIndex + 1',
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Mã Đơn',
        field: 'orderCode',
        minWidth: 120,
        editable: false,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Mã Đại Lý',
        field: 'agentCode',
        minWidth: 120,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Ngày Đặt Hàng',
        field: 'orderDate',
        minWidth: 130,
        editable: true,
        cellEditor: 'agDateCellEditor',
        valueFormatter: params => params.value ? formatDate(params.value) : '',
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Ngày Dự Kiến Giao',
        field: 'expectedShipDate',
        minWidth: 150,
        editable: true,
        cellEditor: 'agDateCellEditor',
        valueFormatter: params => params.value ? formatDate(params.value) : '',
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Ngày Đã Giao',
        field: 'shippedAt',
        minWidth: 130,
        editable: true,
        cellEditor: 'agDateCellEditor',
        valueFormatter: params => params.value ? formatDate(params.value) : '',
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Tên Người Mua',
        field: 'buyerName',
        minWidth: 150,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Công Ty Người Mua',
        field: 'buyerCompany',
        minWidth: 180,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Số Hợp Đồng',
        field: 'contractNo',
        minWidth: 130,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Điểm Đến',
        field: 'destination',
        minWidth: 150,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Địa Chỉ Giao Hàng',
        field: 'deliveryAddress',
        minWidth: 200,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Loại Sản Phẩm',
        field: 'productType',
        minWidth: 130,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'TSC Mục Tiêu (%)',
        field: 'targetTSC',
        minWidth: 140,
        editable: true,
        cellEditor: 'agNumberCellEditor',
        valueFormatter: params => params.value ? params.value.toFixed(2) : '',
        cellStyle: { 'text-align': 'right' }
    },
    {
        headerName: 'DRC Mục Tiêu (%)',
        field: 'targetDRC',
        minWidth: 140,
        editable: true,
        cellEditor: 'agNumberCellEditor',
        valueFormatter: params => params.value ? params.value.toFixed(2) : '',
        cellStyle: { 'text-align': 'right' }
    },
    {
        headerName: 'Tổng Khối Lượng (Kg)',
        field: 'totalNetKg',
        minWidth: 160,
        editable: true,
        cellEditor: 'agNumberCellEditor',
        valueFormatter: params => params.value ? params.value.toFixed(3) : '',
        cellStyle: { 'text-align': 'right' }
    },
    {
        headerName: 'Đơn Giá',
        field: 'unitPrice',
        minWidth: 130,
        editable: true,
        cellEditor: 'agNumberCellEditor',
        valueFormatter: params => params.value ? formatCurrency(params.value) : '',
        cellStyle: { 'text-align': 'right' }
    },
    {
        headerName: 'Trạng Thái',
        field: 'status',
        minWidth: 130,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: [0, 1, 2, 3, 9]
        },
        valueFormatter: params => {
            switch (params.value) {
                case 0:
                    return 'Nháp';
                case 1:
                    return 'Đã xác nhận';
                case 2:
                    return 'Đang chất hàng';
                case 3:
                    return 'Đã giao hàng';
                case 9:
                    return 'Đã hủy';
                default:
                    return '';
            }
        },
        cellStyle: params => {
            const colors = {
                0: { 'background-color': '#f0f0f0', 'text-align': 'center' },
                1: { 'background-color': '#d4edda', 'text-align': 'center' },
                2: { 'background-color': '#fff3cd', 'text-align': 'center' },
                3: { 'background-color': '#cce5ff', 'text-align': 'center' },
                9: { 'background-color': '#f8d7da', 'text-align': 'center' }
            };
            return colors[params.value] || { 'text-align': 'center' };
        }
    },
    {
        headerName: 'Ghi Chú',
        field: 'note',
        minWidth: 200,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Ngày Đăng Ký',
        field: 'registerDate',
        minWidth: 130,
        editable: false,
        valueFormatter: params => params.value ? formatDateTime(params.value) : '',
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Người Đăng Ký',
        field: 'registerPerson',
        minWidth: 130,
        editable: false,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Ngày Cập Nhật',
        field: 'updateDate',
        minWidth: 130,
        editable: false,
        valueFormatter: params => params.value ? formatDateTime(params.value) : '',
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Người Cập Nhật',
        field: 'updatePerson',
        minWidth: 130,
        editable: false,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Thao Tác',
        field: 'action',
        minWidth: 150,
        editable: false,
        cellRenderer: params => {
            return `
                    <button class="btn btn-sm btn-primary" onclick="EditOrderData(${params.data.orderId})">
                        <i class="ti ti-edit"></i> Sửa
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="DeleteOrderData(${params.data.orderId})">
                        <i class="ti ti-trash"></i>
                    </button>
                `;
        },
        cellStyle: { 'text-align': 'center' }
    }
    ];
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatCurrency(value) {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
}

function ApplyCustomColulmn(params) {
    gridApi.setGridOption("rowData", ListDataFull.filter(x => x[params.column.colId] = params.value));
    var idList = ListDataFull.map(x => x.orderId);
    var colId = params.column.colId;
    var valueData = params.value;

    $.ajax({
        async: true,
        method: 'POST',
        url: "/Order/AddOrUpdateFull",
        contentType: 'application/json',
        data: JSON.stringify(ListDataFull),
        success: function (res) {
            RefreshAllGridWhenChangeData();
        },
        error: function () { }
    });
}

// Cập nhật dữ liệu sau khi chỉnh sửa
// status: 0 - chỉnh sửa, 1 - thêm mới
function UpdateDataAfterEdit(status, rowData) {
    var rowDataObj = {};
    if (status == 1) {
        rowDataObj.agentCode = $('#ListCboAgentCode').val();
        rowDataObj.productType = $('#ListCboProductType').val();
        rowDataObj.buyerName = $('#BuyerName').val();
        rowDataObj.buyerCompany = $('#BuyerCompany').val();
        rowDataObj.totalNetKg = num($('#TotalNetKg').val());
        rowDataObj.unitPrice = num($('#UnitPrice').val());
        rowData = rowDataObj;
    }
    $.ajax({
        async: true,
        url: "/Order/AddOrUpdate",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(rowData),
        success: function (res) {
            Toast.fire({
                icon: "success",
                title: (status == 1 ? "Thêm mới" : "Cập nhật") + " dữ liệu thành công"
            });
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            Toast.fire({
                icon: "danger",
                title: (status == 1 ? "Thêm mới" : "Cập nhật") + " dữ liệu thất bại"
            });
        }
    });
}

// Chuyển chuỗi sang số
const num = v => {
    const x = parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(x) ? x : 0;
};

// Lưu thứ tự hiện tại sau khi kéo thả
function resizeGridOrder() {
    setTimeout(function () {
        setWidthHeightGrid();
    }, 100);
}

function setWidthHeightGrid(heithlayout) {
    gridApi.sizeColumnsToFit();
}

function RefreshAllGridWhenChangeData() {
    ShowHideLoading(true, OrderGrid);
    setTimeout(function () {
        CreateRowDataOrder();
    }, 1);
}

// Lấy tham số tìm kiếm
function GetParamSearch() {
    return {
        agentCode: $('#ListCboAgent').val(),
        productType: $('#ListCboProductType').val(),
        status: $('#ListCboStatus').val(),
        fromDate: $('#FromDate').val(),
        toDate: $('#ToDate').val(),
        orderCode: $('#OrderCode').val(),
        buyerName: $('#BuyerName').val(),
        sortColumn: sortData.sortColumn,
        sortOrder: sortData.sortOrder,
    }
}

function CreateRowDataOrder() {
    var listSearchOrder = GetParamSearch();
    ShowHideLoading(true, OrderGrid);
    $('#OrderGrid .ag-overlay-no-rows-center').hide();
    $.ajax({
        async: !false,
        type: 'POST',
        url: "/Order/GetRubberOrders",
        data: listSearchOrder,
        dataType: "json",
        success: function (data) {
            ListDataFull = data;
            gridApi.setGridOption("rowData", data);
            ShowHideLoading(false, OrderGrid);
        },
        error: function () {
            ShowHideLoading(false, OrderGrid);
            NotificationToast("danger", "Lỗi khi tải dữ liệu");
        }
    });
}

// Custom Header
function CustomHeaderOrder() { }

CustomHeaderOrder.prototype.init = function (params) {
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.className = 'customHeaderLabel d-flex flex-wrap align-items-center justify-content-between';
    this.eGui.innerHTML = `
        <div class="customSortDownLabel">
            <i class="ti ti-sort-descending ag-sort-descending-icon ag-hidden"></i>
        </div>
        <div class="d-flex flex-column">
            <span>${params.displayName}</span>
        </div>
        <div class="customSortUpLabel">
            <i class="ti ti-sort-ascending ag-sort-ascending-icon ag-hidden"></i>
        </div>
    `;

    this.eSortDownButton = this.eGui.querySelector('.customSortDownLabel');
    this.eSortUpButton = this.eGui.querySelector('.customSortUpLabel');

    if (sortData.sortColumnEventActual == params.column.colId) {
        if (sortData.sortOrderEventActual == 'asc') {
            $(this.eSortUpButton).find('.ag-sort-ascending-icon').removeClass('ag-hidden');
        } else {
            $(this.eSortDownButton).find('.ag-sort-descending-icon').removeClass('ag-hidden');
        }
    } else {
        sortData.sortColumnEventActual = params.column.colId;
        sortData.sortOrderEventActual = params.sortOrderDefault;
    }

    if (this.params.enableSorting) {
        this.onSortChangedListener = this.onSortChanged.bind(this);
        this.eGui.addEventListener('click', this.onSortChangedListener);
    } else {
        this.eGui.removeChild(this.eSortDownButton);
        this.eGui.removeChild(this.eSortUpButton);
    }
};

function cellStyle_Col_Model_EventActual(params) {
    let cellAttr = {};
    cellAttr['text-align'] = 'center';
    return cellAttr;
}

CustomHeaderOrder.prototype.onSortChanged = function () {
    $('.ag-sort-ascending-icon').not($(this.eSortUpButton)).addClass('ag-hidden');
    $('.ag-sort-descending-icon').not($(this.eSortDownButton)).addClass('ag-hidden');

    if (!$(this.eSortUpButton).hasClass('ag-hidden') || ($(this.eSortDownButton).hasClass('ag-hidden') && $(this.eSortUpButton).hasClass('ag-hidden'))) {
        $(this.eSortDownButton).removeClass('ag-hidden');
        $(this.eSortUpButton).addClass('ag-hidden');
        sortData.sortOrderEventActual = 'desc';
    } else if (!$(this.eSortDownButton).hasClass('ag-hidden')) {
        $(this.eSortUpButton).removeClass('ag-hidden');
        $(this.eSortDownButton).addClass('ag-hidden');
        sortData.sortOrderEventActual = 'asc';
    }
    sortData.sortColumnEventActual = this.params.column.colId;
    this.onSortRequested();
};

CustomHeaderOrder.prototype.getGui = function () {
    return this.eGui;
};

CustomHeaderOrder.prototype.onSortRequested = function () {
    RefreshAllGridWhenChangeData();
};

CustomHeaderOrder.prototype.destroy = function () {
    this.eGui.removeEventListener('click', this.onSortChangedListener);
};

function updateRowIndex() {
    gridApi.forEachNodeAfterFilterAndSort((node, index) => {
        node.setDataValue('STT', index + 1);
    });
}

function InputNameFile(typeExcel) {
    Swal.fire({
        title: "Nhập tên file Excel",
        input: "text",
        inputAttributes: {
            autocapitalize: "off"
        },
        showCancelButton: true,
        confirmButtonText: "Xuất Excel",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            if (typeExcel == arrValueFilter.typeExcel) {
                onExportExcelData(result.value);
            }
        }
    });
}

// Export Excel Data
function onExportExcelData(fileName) {
    const headers = gridApi.getColumnDefs().filter(x => x.field != 'action').map(item => item.headerName);
    const keys = gridApi.getColumnDefs().filter(x => x.field != 'action').map(item => item.field);
    const data = ListDataFull;

    const newData = data.map(obj => {
        const newObj = {};
        keys.forEach((k, i) => {
            if (k == 'status') {
                const statusMap = {
                    0: 'Nháp',
                    1: 'Đã xác nhận',
                    2: 'Đang chất hàng',
                    3: 'Đã giao hàng',
                    9: 'Đã hủy'
                };
                newObj[headers[i]] = statusMap[obj[k]] || '';
            } else if (['orderDate', 'expectedShipDate', 'shippedAt'].includes(k)) {
                newObj[headers[i]] = obj[k] ? formatDate(obj[k]) : '';
            } else if (['registerDate', 'updateDate'].includes(k)) {
                newObj[headers[i]] = obj[k] ? formatDateTime(obj[k]) : '';
            } else {
                newObj[headers[i]] = obj[k];
            }
        });
        return newObj;
    });

    const ws = XLSX.utils.json_to_sheet(newData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, fileName + '.xlsx');
    NotificationToast("success", "Xuất Excel thành công");
}

// Export Excel Mẫu
function onExportTemplateExcel() {
    var lstDataTemplate = {};
    lstDataTemplate['Mã Đơn'] = 'ORD_001';
    lstDataTemplate['Mã Đại Lý'] = 'AG_001';
    lstDataTemplate['Ngày Đặt Hàng'] = '01/01/2025';
    lstDataTemplate['Ngày Dự Kiến Giao'] = '15/01/2025';
    lstDataTemplate['Tên Người Mua'] = 'Nguyễn Văn A';
    lstDataTemplate['Công Ty Người Mua'] = 'Công ty ABC';
    lstDataTemplate['Số Hợp Đồng'] = 'HD_001';
    lstDataTemplate['Điểm Đến'] = 'TP.HCM';
    lstDataTemplate['Địa Chỉ Giao Hàng'] = '123 Đường ABC, Quận 1';
    lstDataTemplate['Loại Sản Phẩm'] = 'SVR10';
    lstDataTemplate['TSC Mục Tiêu (%)'] = '60.00';
    lstDataTemplate['DRC Mục Tiêu (%)'] = '57.00';
    lstDataTemplate['Tổng Khối Lượng (Kg)'] = '1000.000';
    lstDataTemplate['Đơn Giá'] = '50000.00';
    lstDataTemplate['Trạng Thái'] = '0';
    lstDataTemplate['Ghi Chú'] = 'Ghi chú mẫu';
    lstDataTemplate = [lstDataTemplate];

    const ws = XLSX.utils.json_to_sheet(lstDataTemplate);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'Mẫu Đơn Hàng Cao Su.xlsx');
    NotificationToast("success", "Xuất Excel mẫu thành công");
}

// Import Excel Data
function ImportExcelData(rows) {
    $.ajax({
        async: true,
        method: 'POST',
        url: "/Order/ImportDataLstData",
        contentType: 'application/json',
        data: JSON.stringify(rows),
        success: function (res) {
            NotificationToast("success", "Nhập Excel thành công");
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            NotificationToast("danger", "Nhập Excel thất bại");
        }
    });
}

// Bắt đầu chỉnh sửa ô đang chọn
function onBtStartEditing() {
    const selectedNode = gridApi.getFocusedCell();
    if (selectedNode) {
        gridApi.startEditingCell({
            rowIndex: selectedNode.rowIndex,
            colKey: selectedNode.column.getId()
        });
    }
}

// Phê duyệt đơn hàng
function ApproveOrder(orderId, status) {
    $.ajax({
        async: true,
        method: 'POST',
        url: "/Order/ApproveOrder",
        dataType: 'json',
        data: { orderId: orderId, status: status },
        success: function (res) {
            Toast.fire({
                icon: "success",
                title: "Phê duyệt đơn hàng thành công"
            });
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            Toast.fire({
                icon: "danger",
                title: "Phê duyệt đơn hàng thất bại"
            });
        }
    });
}

function ApproveAllOrders(status) {
    $.ajax({
        async: true,
        method: 'POST',
        url: "/Order/ApproveAllOrders",
        dataType: 'json',
        data: { status: status },
        success: function (res) {
            if (res == 1) {
                NotificationToast("success", "Phê duyệt tất cả đơn hàng thành công");
            }
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            NotificationToast("danger", "Phê duyệt tất cả đơn hàng thất bại");
        }
    });
}

function UpdateOrderStatus() {
    var statusData = $('#ListCboStatusOrder').val();

    if (statusData == '*') {
        ValidateError('ListCboStatusOrder');
        NotificationToast("danger", "Vui lòng chọn trạng thái");
        return false;
    }

    $.ajax({
        async: true,
        method: 'POST',
        url: "/Order/UpdateOrderStatus",
        dataType: 'json',
        data: { status: statusData },
        success: function (res) {
            if (res == 1) {
                NotificationToast("success", "Đổi trạng thái thành công");
            }
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            NotificationToast("danger", "Đổi trạng thái thất bại");
        }
    });
}

function EditOrderData(orderId) {
    // Logic mở form edit đơn hàng
    var orderData = ListDataFull.find(x => x.orderId == orderId);
    if (orderData) {
        // Hiển thị modal hoặc form edit với dữ liệu
        $('#OrderModal').modal('show');
        // Fill data vào form...
    }
}

function DeleteOrderData(orderId) {
    Swal.fire({
        title: 'Xác nhận xóa?',
        text: "Bạn có chắc chắn muốn xóa đơn hàng này?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                async: true,
                method: 'POST',
                url: "/Order/DeleteOrder",
                data: { orderId: orderId },
                success: function (res) {
                    Toast.fire({
                        icon: "success",
                        title: "Xóa đơn hàng thành công"
                    });
                    RefreshAllGridWhenChangeData();
                },
                error: function () {
                    Toast.fire({
                        icon: "danger",
                        title: "Xóa đơn hàng thất bại"
                    });
                }
            });
        }
    });
}

function EditOrder(params) {
    // Chỉ cho phép edit nếu đơn hàng chưa được xác nhận hoặc đã giao
    return params.data.status != arrValueFilter.statusShipped &&
        params.data.status != arrValueFilter.statusCancelled;
}