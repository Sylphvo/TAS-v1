var sortData = { sortColumnEventActual: '', sortOrderEventActual: '' }
var gridOptionsPond, ListDataFull;
var page, pageSize, gridApi, pagerApi;
var arrValueFilter = {
    statusActive: 1, // Đang hoạt động
    statusLocked: 2, // Đã khóa
    statusCleaning: 3, // Đang vệ sinh
    statusArchived: 0, // Đã lưu trữ

    contentActive: 'Đang hoạt động',
    contentLocked: 'Đã khóa',
    contentCleaning: 'Đang vệ sinh',
    contentArchived: 'Đã lưu trữ',

    typeExcel: 1, // Xuất Excel Data
    typeSampleExcel: 2, // Xuất Excel Mẫu

    comboAgent: [], // combo đại lý
    comboStatus: [], // combo trạng thái
    selectFirst: true
};

function CreateGridPond() {
    gridOptionsPond = {
        paginationPageSize: 100,
        columnDefs: CreateColModelPond(),
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
            // Kiểm tra tồn kho không vượt quá sức chứa
            if (e.colDef.field == 'currentNetKg') {
                if (num(e.data.currentNetKg) > num(e.data.capacityKg)) {
                    Toast.fire({
                        icon: "warning",
                        title: "Tồn kho không được vượt quá sức chứa!"
                    });
                    e.data.currentNetKg = e.data.capacityKg;
                    e.api.refreshCells({ rowNodes: [e.node], columns: ['currentNetKg'], force: true });
                }
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
    const eGridDiv = document.querySelector(PondGrid);
    gridApi = agGrid.createGrid(eGridDiv, gridOptionsPond);

    CreateRowDataPond();
    resizeGridPond();
}

function CreateColModelPond() {
    return [{
        headerName: 'STT',
        field: 'STT',
        width: 60,
        editable: false,
        valueGetter: 'node.rowIndex + 1',
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Mã Hồ/Bồn',
        field: 'pondCode',
        width: 120,
        editable: false,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Mã Đại Lý',
        field: 'agentCode',
        width: 120,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Tên Hồ/Bồn',
        field: 'pondName',
        width: 180,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Vị Trí',
        field: 'location',
        width: 200,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Sức Chứa (Kg)',
        field: 'capacityKg',
        width: 140,
        editable: true,
        cellEditor: 'agNumberCellEditor',
        valueFormatter: params => params.value ? formatNumber(params.value, 3) : '',
        cellStyle: { 'text-align': 'right' }
    },
    {
        headerName: 'Tồn Hiện Tại (Kg)',
        field: 'currentNetKg',
        width: 150,
        editable: true,
        cellEditor: 'agNumberCellEditor',
        valueFormatter: params => params.value ? formatNumber(params.value, 3) : '',
        cellStyle: params => {
            const capacity = num(params.data.capacityKg);
            const current = num(params.value);
            const percentage = capacity > 0 ? (current / capacity) * 100 : 0;

            let color = '#28a745'; // Xanh lá
            if (percentage >= 90) color = '#dc3545'; // Đỏ
            else if (percentage >= 70) color = '#ffc107'; // Vàng

            return {
                'text-align': 'right',
                'color': color,
                'font-weight': 'bold'
            };
        }
    },
    {
        headerName: 'Còn Trống (Kg)',
        field: 'remainingCapacity',
        width: 140,
        editable: false,
        valueGetter: params => {
            const capacity = num(params.data.capacityKg);
            const current = num(params.data.currentNetKg);
            return capacity - current;
        },
        valueFormatter: params => params.value ? formatNumber(params.value, 3) : '',
        cellStyle: { 'text-align': 'right', 'color': '#007bff' }
    },
    {
        headerName: 'Tỷ Lệ Sử Dụng (%)',
        field: 'usagePercentage',
        width: 150,
        editable: false,
        valueGetter: params => {
            const capacity = num(params.data.capacityKg);
            const current = num(params.data.currentNetKg);
            return capacity > 0 ? ((current / capacity) * 100).toFixed(2) : 0;
        },
        cellRenderer: params => {
            const percentage = parseFloat(params.value);
            let colorClass = 'success';
            if (percentage >= 90) colorClass = 'danger';
            else if (percentage >= 70) colorClass = 'warning';

            return `
                    <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1" style="height: 20px;">
                            <div class="progress-bar bg-${colorClass}" 
                                 role="progressbar" 
                                 style="width: ${percentage}%"
                                 aria-valuenow="${percentage}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                                ${percentage}%
                            </div>
                        </div>
                    </div>
                `;
        },
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Trạng Thái',
        field: 'status',
        width: 150,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: [1, 2, 3, 0]
        },
        valueFormatter: params => {
            switch (params.value) {
                case 1:
                    return 'Đang hoạt động';
                case 2:
                    return 'Đã khóa';
                case 3:
                    return 'Đang vệ sinh';
                case 0:
                    return 'Đã lưu trữ';
                default:
                    return '';
            }
        },
        cellStyle: params => {
            const colors = {
                1: { 'background-color': '#d4edda', 'text-align': 'center' },
                2: { 'background-color': '#f8d7da', 'text-align': 'center' },
                3: { 'background-color': '#fff3cd', 'text-align': 'center' },
                0: { 'background-color': '#e2e3e5', 'text-align': 'center' }
            };
            return colors[params.value] || { 'text-align': 'center' };
        }
    },
    {
        headerName: 'Ngày Vệ Sinh Cuối',
        field: 'lastCleanedAt',
        width: 150,
        editable: false,
        valueFormatter: params => params.value ? formatDate(params.value) : '',
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Ghi Chú',
        field: 'note',
        width: 200,
        editable: true,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Ngày Đăng Ký',
        field: 'registerDate',
        width: 130,
        editable: false,
        valueFormatter: params => params.value ? formatDateTime(params.value) : '',
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Người Đăng Ký',
        field: 'registerPerson',
        width: 130,
        editable: false,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Ngày Cập Nhật',
        field: 'updateDate',
        width: 130,
        editable: false,
        valueFormatter: params => params.value ? formatDateTime(params.value) : '',
        cellStyle: { 'text-align': 'center' }
    },
    {
        headerName: 'Người Cập Nhật',
        field: 'updatePerson',
        width: 130,
        editable: false,
        cellStyle: { 'text-align': 'left' }
    },
    {
        headerName: 'Thao Tác',
        field: 'action',
        width: 200,
        editable: false,
        cellRenderer: params => {
            return `
                    <button class="btn btn-sm btn-primary" onclick="EditPondData(${params.data.pondId})">
                        <i class="ti ti-edit"></i> Sửa
                    </button>
                    <button class="btn btn-sm btn-info" onclick="CleanPond(${params.data.pondId})">
                        <i class="ti ti-spray"></i> Vệ sinh
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="DeletePondData(${params.data.pondId})">
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

function formatNumber(value, decimals = 3) {
    if (!value) return '';
    return parseFloat(value).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function ApplyCustomColulmn(params) {
    gridApi.setGridOption("rowData", ListDataFull.filter(x => x[params.column.colId] = params.value));
    var idList = ListDataFull.map(x => x.pondId);
    var colId = params.column.colId;
    var valueData = params.value;

    $.ajax({
        async: true,
        method: 'POST',
        url: "/Pond/AddOrUpdateFull",
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
        rowDataObj.pondName = $('#PondName').val();
        rowDataObj.location = $('#Location').val();
        rowDataObj.capacityKg = num($('#CapacityKg').val());
        rowDataObj.currentNetKg = num($('#CurrentNetKg').val());
        rowData = rowDataObj;
    }
    $.ajax({
        async: true,
        url: "/Pond/AddOrUpdate",
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

function resizeGridPond() {
    setTimeout(function () {
        setWidthHeightGrid(45);
    }, 100);
}

function setWidthHeightGrid(heithlayout) {
    gridApi.sizeColumnsToFit();
}

function RefreshAllGridWhenChangeData() {
    ShowHideLoading(true, PondGrid);
    setTimeout(function () {
        CreateRowDataPond();
    }, 1);
}

// Lấy tham số tìm kiếm
function GetParamSearch() {
    return {
        agentCode: $('#ListCboAgent').val(),
        status: $('#ListCboStatus').val(),
        pondCode: $('#PondCode').val(),
        pondName: $('#PondName').val(),
        sortColumn: sortData.sortColumn,
        sortOrder: sortData.sortOrder,
    }
}

function CreateRowDataPond() {
    var listSearchPond = GetParamSearch();
    ShowHideLoading(true, PondGrid);
    $('#PondGrid .ag-overlay-no-rows-center').hide();
    $.ajax({
        async: !false,
        type: 'POST',
        url: "/Pond/GetRubberPonds",
        data: listSearchPond,
        dataType: "json",
        success: function (data) {
            ListDataFull = data;
            gridApi.setGridOption("rowData", data);
            ShowHideLoading(false, PondGrid);
        },
        error: function () {
            ShowHideLoading(false, PondGrid);
            NotificationToast("danger", "Lỗi khi tải dữ liệu");
        }
    });
}

// Custom Header
function CustomHeaderPond() { }

CustomHeaderPond.prototype.init = function (params) {
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

CustomHeaderPond.prototype.onSortChanged = function () {
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

CustomHeaderPond.prototype.getGui = function () {
    return this.eGui;
};

CustomHeaderPond.prototype.onSortRequested = function () {
    RefreshAllGridWhenChangeData();
};

CustomHeaderPond.prototype.destroy = function () {
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
                    1: 'Đang hoạt động',
                    2: 'Đã khóa',
                    3: 'Đang vệ sinh',
                    0: 'Đã lưu trữ'
                };
                newObj[headers[i]] = statusMap[obj[k]] || '';
            } else if (k == 'lastCleanedAt') {
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
    lstDataTemplate['Mã Hồ/Bồn'] = 'POND_001';
    lstDataTemplate['Mã Đại Lý'] = 'AG_001';
    lstDataTemplate['Tên Hồ/Bồn'] = 'Hồ 1';
    lstDataTemplate['Vị Trí'] = 'Khu A';
    lstDataTemplate['Sức Chứa (Kg)'] = '10000.000';
    lstDataTemplate['Tồn Hiện Tại (Kg)'] = '5000.000';
    lstDataTemplate['Trạng Thái'] = '1';
    lstDataTemplate['Ghi Chú'] = 'Ghi chú mẫu';
    lstDataTemplate = [lstDataTemplate];

    const ws = XLSX.utils.json_to_sheet(lstDataTemplate);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'Mẫu Hồ Bồn Cao Su.xlsx');
    NotificationToast("success", "Xuất Excel mẫu thành công");
}

// Import Excel Data
function ImportExcelData(rows) {
    $.ajax({
        async: true,
        method: 'POST',
        url: "/Pond/ImportDataLstData",
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

// Phê duyệt hồ/bồn
function ApprovePond(pondId, status) {
    $.ajax({
        async: true,
        method: 'POST',
        url: "/Pond/ApprovePond",
        dataType: 'json',
        data: { pondId: pondId, status: status },
        success: function (res) {
            Toast.fire({
                icon: "success",
                title: "Phê duyệt hồ/bồn thành công"
            });
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            Toast.fire({
                icon: "danger",
                title: "Phê duyệt hồ/bồn thất bại"
            });
        }
    });
}

function ApproveAllPonds(status) {
    $.ajax({
        async: true,
        method: 'POST',
        url: "/Pond/ApproveAllPonds",
        dataType: 'json',
        data: { status: status },
        success: function (res) {
            if (res == 1) {
                NotificationToast("success", "Phê duyệt tất cả hồ/bồn thành công");
            }
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            NotificationToast("danger", "Phê duyệt tất cả hồ/bồn thất bại");
        }
    });
}

function UpdatePondStatus() {
    var statusData = $('#ListCboStatusPond').val();

    if (statusData == '*') {
        ValidateError('ListCboStatusPond');
        NotificationToast("danger", "Vui lòng chọn trạng thái");
        return false;
    }

    $.ajax({
        async: true,
        method: 'POST',
        url: "/Pond/UpdatePondStatus",
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

function EditPondData(pondId) {
    // Logic mở form edit hồ/bồn
    var pondData = ListDataFull.find(x => x.pondId == pondId);
    if (pondData) {
        // Hiển thị modal hoặc form edit với dữ liệu
        $('#PondModal').modal('show');
        // Fill data vào form...
    }
}

function DeletePondData(pondId) {
    Swal.fire({
        title: 'Xác nhận xóa?',
        text: "Bạn có chắc chắn muốn xóa hồ/bồn này?",
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
                url: "/Pond/DeletePond",
                data: { pondId: pondId },
                success: function (res) {
                    Toast.fire({
                        icon: "success",
                        title: "Xóa hồ/bồn thành công"
                    });
                    RefreshAllGridWhenChangeData();
                },
                error: function () {
                    Toast.fire({
                        icon: "danger",
                        title: "Xóa hồ/bồn thất bại"
                    });
                }
            });
        }
    });
}

// Vệ sinh hồ/bồn
function CleanPond(pondId) {
    Swal.fire({
        title: 'Xác nhận vệ sinh?',
        text: "Hồ/bồn sẽ được chuyển sang trạng thái 'Đang vệ sinh'",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                async: true,
                method: 'POST',
                url: "/Pond/CleanPond",
                data: { pondId: pondId },
                success: function (res) {
                    Toast.fire({
                        icon: "success",
                        title: "Cập nhật trạng thái vệ sinh thành công"
                    });
                    RefreshAllGridWhenChangeData();
                },
                error: function () {
                    Toast.fire({
                        icon: "danger",
                        title: "Cập nhật trạng thái vệ sinh thất bại"
                    });
                }
            });
        }
    });
}

// Cập nhật tồn kho
function UpdateInventory(pondId, currentNetKg) {
    $.ajax({
        async: true,
        method: 'POST',
        url: "/Pond/UpdatePondInventory",
        data: { pondId: pondId, currentNetKg: currentNetKg },
        success: function (res) {
            Toast.fire({
                icon: "success",
                title: "Cập nhật tồn kho thành công"
            });
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            Toast.fire({
                icon: "danger",
                title: "Cập nhật tồn kho thất bại"
            });
        }
    });
}

function EditPond(params) {
    // Chỉ cho phép edit nếu hồ/bồn đang hoạt động hoặc đã khóa
    return params.data.status == arrValueFilter.statusActive ||
        params.data.status == arrValueFilter.statusLocked;
}