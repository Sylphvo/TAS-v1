var sortData = { sortColumnEventActual: '', sortOrderEventActual: '' }
var gridOptionsUserAccount, ListDataFull;
var page = 1;
var pageSize = 20;
var gridApi;
var pagerApi;

function CreateGridUserAccount() {
    gridOptionsUserAccount = {
        paginationPageSize: 100,
        columnDefs: CreateColModelUserAccount(),
        defaultColDef: {
            width: 170,
            filter: true,
            floatingFilter: true,
        },
        rowHeight: 45,
        headerHeight: 45,
        rowData: [],
        rowDragManaged: true,
        rowDragMultiRow: true,
        rowSelection: 'multiple',
        suppressRowClickSelection: false,
        animateRows: true,
        singleClickEdit: true,
        suppressServerSideFullWidthLoadingRow: true,
        components: {
        },
        cellSelection: true,
        onGridReady: function (params) {
            gridApi = params.api;
            params.api.sizeColumnsToFit();
        },
        rowDragManaged: true,
        onRowDragEnd() {
            persistCurrentPageOrder();
        },
        onCellValueChanged: e => {
            UpdateDataAfterEdit(0, e.data);
        }
    };
    const eGridDiv = document.querySelector(UserAccount);
    gridApi = agGrid.createGrid(eGridDiv, gridOptionsUserAccount);
    CreateRowDataUserAccount();
    resizeGridUserAccount();
}

function resizeGridUserAccount() {
    setTimeout(function () {
        setWidthHeightGrid(25);
    }, 100);
}

function setWidthHeightGrid(heithlayout) {
}

function RefreshAllGridWhenChangeData() {
    setTimeout(function () {
        CreateRowDataUserAccount();
    }, 1);
}

function CreateRowDataUserAccount() {
    var listSearchUserAccount = {};
    $.ajax({
        async: !false,
        type: 'POST',
        url: "/UserAccount/UserAccounts",
        data: listSearchUserAccount,
        dataType: "json",
        success: function (data) {
            ListDataFull = data;
            gridApi.setGridOption("rowData", data);
            renderPagination(agPaging, IsOptionAll);
        }
    });
}

function CreateColModelUserAccount() {
    var columnDefs = [
        {
            field: 'userName', 
            headerName: 'Tên đăng nhập', 
            width: 150, 
            minWidth: 150,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: true,
            checkboxSelection: true,
            headerCheckbox: true,
            headerCheckboxSelection: true,
            rowDrag: true,
            filter: "agTextColumnFilter",
            floatingFilterComponent: 'customFloatingFilterInput',
            floatingFilterComponentParams: { suppressFilterButton: true },
            headerComponent: "customHeader"
        },
        {
            field: 'firstName', 
            headerName: 'Tên', 
            width: 120, 
            minWidth: 120,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: true,
            filter: "agTextColumnFilter",
            headerComponent: "customHeader"
        },
        {
            field: 'lastName', 
            headerName: 'Họ', 
            width: 120, 
            minWidth: 120,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: true,
            filter: "agTextColumnFilter",
            headerComponent: "customHeader"
        },
        {
            field: 'email', 
            headerName: 'Email', 
            width: 200, 
            minWidth: 200,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: true,
            filter: "agTextColumnFilter",
            headerComponent: "customHeader"
        },
        {
            field: 'phoneNumber', 
            headerName: 'Số điện thoại', 
            width: 130, 
            minWidth: 130,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: true,
            filter: "agTextColumnFilter",
            headerComponent: "customHeader"
        },
        {
            field: 'emailConfirmed', 
            headerName: 'Email xác nhận', 
            width: 130, 
            minWidth: 130,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: false,
            filter: false,
            cellRenderer: function (params) {
                if (params.value) {
                    return '<span class="badge text-bg-success"><i class="ti ti-check"></i> Đã xác nhận</span>';
                }
                return '<span class="badge text-bg-warning"><i class="ti ti-clock"></i> Chưa xác nhận</span>';
            },
            headerComponent: "customHeader"
        },
        {
            field: 'twoFactorEnabled', 
            headerName: '2FA', 
            width: 100, 
            minWidth: 100,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: false,
            filter: false,
            cellRenderer: function (params) {
                if (params.value) {
                    return '<span class="badge text-bg-info"><i class="ti ti-shield-check"></i> Bật</span>';
                }
                return '<span class="badge text-bg-secondary">Tắt</span>';
            },
            headerComponent: "customHeader"
        },
        {
            field: 'isActive', 
            headerName: 'Trạng thái', 
            width: 130, 
            minWidth: 130,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: false,
            filter: false,
            cellRenderer: function (params) {
                if (!params.value) {
                    return '<span class="badge text-bg-danger">Không hoạt động</span>';
                }
                return '<span class="badge text-bg-success">Đang hoạt động</span>';
            },
            headerComponent: "customHeader"
        },
        {
            field: 'updatedAtUtc', 
            headerName: 'Ngày cập nhật', 
            width: 150, 
            minWidth: 150,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: false,
            filter: "agTextColumnFilter",
            headerComponent: "customHeader"
        },
        {
            field: 'updatedBy', 
            headerName: 'Người cập nhật', 
            width: 130, 
            minWidth: 130,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: false,
            filter: "agTextColumnFilter",
            headerComponent: "customHeader"
        },
        {
            field: 'action', 
            headerName: 'Chức năng', 
            width: 200, 
            minWidth: 200,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: false,
            filter: false,
            editType: 'fullRow',
            headerComponent: "customHeader",
            cellRenderer: ActionRenderer
        }
    ];
    return columnDefs;
}

function CustomHeaderUserAccount() { }

CustomHeaderUserAccount.prototype.init = function (params) {
    this.params = params;
    var strHiddenAsc = params.sortOrderDefault == 'asc' ? '' : 'ag-hidden';
    var strHiddenDesc = params.sortOrderDefault == 'desc' ? '' : 'ag-hidden';
    this.eGui = document.createElement('div');
    this.eGui.className = "ag-header-cell-label";
    this.eGui.innerHTML =
        '' + '<span class="ag-header-cell-text">' +
        this.params.displayName +
        '</span>' +
        '<span class="ag-header-icon ag-header-label-icon ag-sort-ascending-icon ' + strHiddenAsc + '"><span class="ag-icon ag-icon-asc"></span></span>' +
        '<span class="ag-header-icon ag-header-label-icon ag-sort-descending-icon ' + strHiddenDesc + '"><span class="ag-icon ag-icon-desc"></span></span>';

    if (this.params.style != null && this.params.style != undefined) {
        this.eGui.style = this.params.style;
    }

    this.eSortDownButton = this.eGui.querySelector('.ag-sort-descending-icon');
    this.eSortUpButton = this.eGui.querySelector('.ag-sort-ascending-icon');

    if (params.sortOrderDefault != null && params.sortOrderDefault != undefined) {
        sortData.sortColumnEventActual = params.column.colId;
        sortData.sortOrderEventActual = params.sortOrderDefault;
    }

    if (this.params.enableSorting) {
        this.onSortChangedListener = this.onSortChanged.bind(this);
        this.eGui.addEventListener(
            'click',
            this.onSortChangedListener
        );
    }
};

CustomHeaderUserAccount.prototype.onSortChanged = function () {
    if ($(this.eSortUpButton).hasClass('ag-hidden') && $(this.eSortDownButton).hasClass('ag-hidden')) {
        $(this.eSortDownButton).removeClass('ag-hidden');
        $(this.eSortUpButton).addClass('ag-hidden');
        sortData.sortOrderEventActual = 'desc';
    }
    else if (!$(this.eSortDownButton).hasClass('ag-hidden')) {
        $(this.eSortUpButton).removeClass('ag-hidden');
        $(this.eSortDownButton).addClass('ag-hidden');
        sortData.sortOrderEventActual = 'asc';
    }
    sortData.sortColumnEventActual = this.params.column.colId;
    this.onSortRequested();
};

CustomHeaderUserAccount.prototype.getGui = function () {
    return this.eGui;
};

CustomHeaderUserAccount.prototype.onSortRequested = function () {
    RefreshAllGridWhenChangeData();
};

CustomHeaderUserAccount.prototype.destroy = function () {
    this.eGui.removeEventListener(
        'click',
        this.onSortChangedListener
    );
};

function updateRowIndex() {
    gridApi.forEachNodeAfterFilterAndSort((node, index) => {
        node.setDataValue('STT', index + 1);
    });
}

// Import từ Excel
document.getElementById('importExcelUserAccount').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: true });
        gridApi.setGridOption("rowData", rows);
        notifier.show('Thành công', 'Import file Excel thành công', 'success', '', 4000);
    } catch (err) {
        notifier.show('Thất bại', 'Lỗi khi import file Excel!', 'danger', '', 4000);
    }
});

// Export Excel
function onExportExcelData() {
    const ws = XLSX.utils.json_to_sheet(ListDataFull);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'danh-sach-user.xlsx');
}

// Export Template Excel
function onExportTemplateExcel() {
    const rowData_temp = [
        { 
            STT: 1, 
            userName: "user01", 
            firstName: "Nguyễn", 
            lastName: "Văn A",
            email: "nguyenvana@example.com",
            phoneNumber: "0123456789",
            isActive: true
        },
    ];
    const ws = XLSX.utils.json_to_sheet(rowData_temp);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'mau-user-account.xlsx');
}

function persistCurrentPageOrder() {
    const start = (page - 1) * pageSize;
    const n = gridApi.getDisplayedRowCount();
    const ordered = [];
    for (let i = 0; i < n; i++) {
        ordered.push(gridApi.getDisplayedRowAtIndex(i).data);
    }
    ListDataFull.splice(start, n, ...ordered);
}

// Cập nhật dữ liệu sau khi chỉnh sửa
// status: 0: edit inline, 1: edit from modal
function UpdateDataAfterEdit(status, rowData) {
    var rowDataObj = {};
    if (status == 1) {
        rowDataObj.id = $('#userId').val();
        rowDataObj.firstName = $('#firstName').val();
        rowDataObj.lastName = $('#lastName').val();
        rowDataObj.userName = $('#userName').val();
        rowDataObj.email = $('#email').val();
        rowDataObj.phoneNumber = $('#phoneNumber').val();
        rowDataObj.emailConfirmed = $('#emailConfirmed').is(':checked');
        rowDataObj.phoneNumberConfirmed = $('#phoneNumberConfirmed').is(':checked');
        rowDataObj.twoFactorEnabled = $('#twoFactorEnabled').is(':checked');
        rowDataObj.lockoutEnabled = $('#lockoutEnabled').is(':checked');
        rowDataObj.isActive = $('#isActive').is(':checked');
        rowData = rowDataObj;
    }
    $.ajax({
        async: true,
        url: "/UserAccount/AddOrUpdate",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(rowData),
        success: function (res) {
            Toast.fire({
                icon: "success",
                title: (status == 0 ? "Cập nhật" : "Thêm mới") + " dữ liệu thành công"
            });
            $('#AddNewUserAccount').modal('hide');
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            Toast.fire({
                icon: "error",
                title: (status == 0 ? "Cập nhật" : "Thêm mới") + " dữ liệu thất bại"
            });
        }
    });
}

function ActionRenderer(params) {
    const wrap = document.createElement('div');
    wrap.innerHTML =
        (params.data.isActive == false ?
            ` <button class="button_action_custom avtar avtar-xs btn-light-success js-change_isActive" title="Kích hoạt tài khoản">
            <i class="ti ti-check f-20"></i>
        </button>`
            :
            `<button class="button_action_custom avtar avtar-xs btn-light-danger js-change_isActive" title="Vô hiệu hóa tài khoản">
            <i class="ti ti-x f-20"></i>
        </button>`)
        +
        `<button class="button_action_custom avtar avtar-xs btn-light-warning js-reset-password" title="Reset mật khẩu">
          <i class="ti ti-key f-20"></i>
        </button>
        <button class="button_action_custom avtar avtar-xs btn-light-danger js-delete" title="Xóa user">
          <i class="ti ti-trash f-20"></i>
        </button>
    `;

    // Button change active status
    const btnChangeIsActive = wrap.querySelector('.js-change_isActive');
    btnChangeIsActive.addEventListener('click', (e) => {
        ApproveDataUserAccount(params.data.id, !params.data.isActive);
    });

    // Button reset password
    const btnResetPassword = wrap.querySelector('.js-reset-password');
    btnResetPassword.addEventListener('click', (e) => {
        Swal.fire({
            title: 'Reset mật khẩu',
            html: `
                <input type="password" id="newPassword" class="swal2-input" placeholder="Mật khẩu mới">
                <input type="password" id="confirmPassword" class="swal2-input" placeholder="Xác nhận mật khẩu">
            `,
            showCancelButton: true,
            confirmButtonText: 'Reset',
            cancelButtonText: 'Hủy',
            preConfirm: () => {
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                if (!newPassword || !confirmPassword) {
                    Swal.showValidationMessage('Vui lòng nhập đầy đủ thông tin');
                    return false;
                }
                
                if (newPassword !== confirmPassword) {
                    Swal.showValidationMessage('Mật khẩu xác nhận không khớp');
                    return false;
                }
                
                if (newPassword.length < 6) {
                    Swal.showValidationMessage('Mật khẩu phải có ít nhất 6 ký tự');
                    return false;
                }
                
                return { newPassword: newPassword };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    async: true,
                    method: 'POST',
                    url: "/UserAccount/ResetPassword",
                    dataType: 'json',
                    data: { userId: params.data.id, newPassword: result.value.newPassword },
                    success: function (res) {
                        if (res == 1) {
                            Toast.fire({
                                icon: "success",
                                title: "Reset mật khẩu thành công"
                            });
                        }
                    },
                    error: function () {
                        Toast.fire({
                            icon: "error",
                            title: "Reset mật khẩu thất bại"
                        });
                    }
                });
            }
        });
    });

    // Button delete
    const btnDelete = wrap.querySelector('.js-delete');
    btnDelete.addEventListener('click', (e) => {
        Swal.fire({
            title: 'Xóa user này?',
            text: 'User: ' + params.data.userName,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Xóa`,
            cancelButtonText: 'Hủy',
            showCloseButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    async: true,
                    method: 'POST',
                    url: "/UserAccount/DeleteUserAccount",
                    dataType: 'json',
                    data: { userId: params.data.id },
                    success: function (res) {
                        if (res == 1) {
                            Toast.fire({
                                icon: "success",
                                title: "Xóa user thành công"
                            });
                            params.api.applyTransaction({ remove: [params.node.data] });
                            RefreshAllGridWhenChangeData();
                        }
                    },
                    error: function () {
                        Toast.fire({
                            icon: "error",
                            title: "Xóa user thất bại"
                        });
                    }
                });
            }
        });
    });

    return wrap;
}

function ApproveDataUserAccount(userId, status) {
    $.ajax({
        async: true,
        method: 'POST',
        url: "/UserAccount/ApproveDataUserAccount",
        dataType: 'json',
        data: { userId: userId, status: status },
        success: function (res) {
            Toast.fire({
                icon: "success",
                title: status ? "Kích hoạt user thành công" : "Vô hiệu hóa user thành công"
            });
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            Toast.fire({
                icon: "error",
                title: "Đổi trạng thái thất bại"
            });
        }
    });
}

function cellStyle_Col_Model_EventActual(params) {
    let cellAttr = {};
    cellAttr['text-align'] = 'center';
    return cellAttr;
}