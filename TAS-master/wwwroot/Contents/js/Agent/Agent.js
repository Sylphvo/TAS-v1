var sortData = { sortColumnEventActual: '', sortOrderEventActual: '' }
var gridOptionsAgent, ListDataFull;
var page = 1;
var pageSize = 20;
var gridApi;
var pagerApi;
function CreateGridAgent() {
    gridOptionsAgent = {
        paginationPageSize: 100,
        columnDefs: CreateColModelAgent(),
        defaultColDef: {
            width: 170,
            filter: true,
            floatingFilter: true,
        },
		rowHeight: 45,// chiều cao hàng
		headerHeight: 45,// chiều cao header
		rowData: [],//data sẽ được load sau
		rowDragManaged: true,// cho phép kéo thả hàng
		rowDragMultiRow: true,// cho phép kéo thả nhiều hàng
        rowSelection: 'multiple',         // cho phép chọn nhiều hàng
        suppressRowClickSelection: false, // cho phép click hàng để chọn
        animateRows: true,// hiệu ứng khi sắp xếp lại hàng
        singleClickEdit: true,//
        suppressServerSideFullWidthLoadingRow: true,
        components: {
            //customFloatingFilterInput: getFloatingFilterInputComponent(),
            //customheader: CustomHeaderAgent,
        },
        cellSelection: true,
        onGridReady: function (params) {
            gridApi = params.api;
            params.api.sizeColumnsToFit();
        },
        rowDragManaged: true,
        onRowDragEnd() {
            persistCurrentPageOrder();          // rows đã đúng thứ tự bạn vừa kéo
        },
        onCellValueChanged: e => {
            UpdateDataAfterEdit(0, e.data);
        }
    };
    const eGridDiv = document.querySelector(Agent);
    gridApi = agGrid.createGrid(eGridDiv, gridOptionsAgent);
    CreateRowDataAgent();
    resizeGridAgent();
}
function resizeGridAgent() {
    setTimeout(function () {
        setWidthHeightGrid(25);
    }, 100);
}
function setWidthHeightGrid(heithlayout) {
    //gridOptionsAgent.api.sizeColumnsToFit();
    //var heigh = $(window).height() - $('.top_header').outerHeight() - $('.dm_group.dmg-shortcut').outerHeight() - ($('.col-xl-12').outerHeight() + heithlayout);
    //$(myGrid).css('height', heigh);
    //gridOptions.api.sizeColumnsToFit({
    //	defaultMinWidth: 100,
    //	columnLimits: [{ key: "DESCRIPTION", minWidth: 200 }],
    //});
}
function RefreshAllGridWhenChangeData() {
    //ShowHideLoading(true, Agent);
    setTimeout(function () {
        CreateRowDataAgent();
    }, 1);
}
function CreateRowDataAgent() {
    var listSearchAgent = {};
    $.ajax({
        async: !false,
        type: 'POST',
        url: "/Agent/Agents",
        data: listSearchAgent,
        dataType: "json",
        success: function (data) {
            ListDataFull = data;            
            gridApi.setGridOption("rowData", data);
            renderPagination(agPaging, IsOptionAll);
        }
    });
}
function CreateColModelAgent() {
    var columnDefs = [
        {
            field: 'agentCode', headerName: 'Mã đại lý', width: 110, minWidth: 110
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: true
            , checkboxSelection: true
            , headerCheckbox: true
            , headerCheckboxSelection: true // checkbox ở header để chọn tất cả
            , rowDrag: true
            , filter: "agTextColumnFilter"
            , floatingFilterComponent: 'customFloatingFilterInput'
            , floatingFilterComponentParams: { suppressFilterButton: true }
            , headerComponent: "customHeader"
            //, cellRenderer: cellRender_StartDate
            //, colSpan: 2
        },
        {
            field: 'agentName', headerName: 'Tên đại lý', width: 110, minWidth: 110
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: true
            , filter: "agTextColumnFilter"
            //, cellRenderer: cellRender_StartDate
            , headerComponent: "customHeader"
        },
        {
            field: 'ownerName', headerName: 'Chủ đại lý', width: 110, minWidth: 110
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: true
            , filter: "agTextColumnFilter"
            //, cellRenderer: cellRender_StartDate
            , headerComponent: "customHeader"
        },
        {
            field: 'agentAddress', headerName: 'Địa chỉ', width: 110, minWidth: 110
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: true
            , filter: "agTextColumnFilter"
            //, cellRenderer: cellRender_StartDate
            , headerComponent: "customHeader"
        },
        {
            field: 'taxCode', headerName: 'Điện thoại', width: 110, minWidth: 110
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: true
            , filter: "agTextColumnFilter"
            //, cellRenderer: cellRender_StartDate
            , headerComponent: "customHeader"
        },
        {
            field: 'isActive', headerName: 'Trạng thái', width: 110, minWidth: 110
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: false
            , filter: false
            , cellRenderer: function (params) {
                if (params.value == 0) {
                    return '<span class="badge text-bg-primary">không hoạt động</span>';
                }
                if (params.value == 1) {
                    return '<span class="badge text-bg-success">đang hoạt động</span>';
                }
            }
            //, cellRenderer: cellRender_StartDate
            , headerComponent: "customHeader"
        },
        {
            field: 'updateTime', headerName: 'Ngày tạo', width: 110, minWidth: 110
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: true
            , filter: "agTextColumnFilter"
            //, cellRenderer: cellRender_StartDate
            , headerComponent: "customHeader"
        },
        {
            field: 'updateBy', headerName: 'Người tạo', width: 110, minWidth: 110
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: true
            , filter: "agTextColumnFilter"
            //, cellRenderer: cellRender_StartDate
            , headerComponent: "customHeader"
        },
        {
            field: 'action', headerName: 'Chức năng', width: 160, minWidth: 160
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: false
            , filter: false
            , editType: 'fullRow'
            , headerComponent: "customHeader"
            , cellRenderer: ActionRenderer
        }
        
    ]
    return columnDefs;
}
function onRowSelected(event) {
   
}

function CustomHeaderAgent() { }

CustomHeaderAgent.prototype.init = function (params) {
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

    //if (!IsNullOrEmpty(this.params.style)) {
    //    this.eGui.style = this.params.style;
    //}
    if (this.params.style != null && this.params.style != undefined) {
        this.eGui.style = this.params.style;
    }

    this.eSortDownButton = this.eGui.querySelector('.ag-sort-descending-icon');
    this.eSortUpButton = this.eGui.querySelector('.ag-sort-ascending-icon');

    //if (!IsNullOrEmpty(params.sortOrderDefault)) {
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

CustomHeaderAgent.prototype.onSortChanged = function () {
    //Remove tất cả icon sort ở col khác
    $('.ag-sort-ascending-icon').not($(this.eSortUpButton)).addClass('ag-hidden');
    $('.ag-sort-descending-icon').not($(this.eSortDownButton)).addClass('ag-hidden');
    //
    if (!$(this.eSortUpButton).hasClass('ag-hidden') || ($(this.eSortDownButton).hasClass('ag-hidden') && $(this.eSortUpButton).hasClass('ag-hidden'))) {
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

CustomHeaderAgent.prototype.getGui = function () {
    return this.eGui;
};

CustomHeaderAgent.prototype.onSortRequested = function () {
    RefreshAllGridWhenChangeData();
};

CustomHeaderAgent.prototype.destroy = function () {
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


// Import từ URL demo
document.getElementById('importExcelAgent').addEventListener('change', async e => {
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
    XLSX.writeFile(wb, 'datanhaplieu.xlsx');
}
// Export Example Excel
function onExportExcel() {
    const rowData_temp = [
        { STT: 1, maNhaVuon: "NV_2", tenNhaVuon: "Đoàn Thị Diệu Hiền (giang)", KG: 99, TSC: 99, DRC: 99, thanhPham: 99, thanhPhamLyTam: 99 },
    ];
    const ws = XLSX.utils.json_to_sheet(rowData_temp);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'mau.xlsx');
}

function persistCurrentPageOrder() {
    const start = (page - 1) * pageSize;
    const n = gridApi.getDisplayedRowCount();
    const ordered = [];
    for (let i = 0; i < n; i++) {
        ordered.push(gridApi.getDisplayedRowAtIndex(i).data);
    }
    // ghi đè đoạn trang hiện tại vào mảng gốc
    ListDataFull.splice(start, n, ...ordered);
}

// --- helpers ---


// Chuyển chuỗi sang số
const num = v => {
    const x = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(x) ? x : 0;
};
// Cập nhật dữ liệu sau khi chỉnh sửa
// status: 1: edit, 2: add
function UpdateDataAfterEdit(status, rowData) {
    var rowDataObj = {};
    if (status == 1) {
        rowDataObj.agentCode = $('#agentCode').val();//Mã đại lý
        rowDataObj.agentName = $('#agentName').val();//Tên đại lý
        rowDataObj.ownerName = $('#ownerName').val();//Chủ đại lý
        rowDataObj.agentAddress = $('#agentAddress').val();//địa chỉ
        rowDataObj.taxCode = $('#taxCode').val();//điện thoại
        rowDataObj.isActive = 1;//Tổng khai thác
        rowData = rowDataObj;
    }
    $.ajax({
        async: true,
        url: "/Agent/AddOrUpdate",
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(rowData),
        success: function (res) {
            Toast.fire({
                icon: "success",
                title: (status == 0 ? "Cập nhật" : "Thành công") + " dữ liệu thành công"
            });
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            Toast.fire({
                icon: "danger",
                title: (status == 0 ? "Cập nhật" : "Thành công") + " dữ liệu thất bại"
            });
        }
    });
}

function ActionRenderer(params) {
    const wrap = document.createElement('div');
    wrap.innerHTML =
    (params.data.isActive == 0 ?
    ` <button class="button_action_custom avtar avtar-xs btn-light-success js-change_isActive" title="đổi trạng thái hoạt động">
        <i class="ti ti-check f-20"></i>
    </button>`
    :
    `<button class="button_action_custom avtar avtar-xs btn-light-danger js-change_isActive" title="đổi trạng thái hoạt động">
        <i class="ti ti-x f-20"></i>
    </button>`)
    +
    `<button class="button_action_custom avtar avtar-xs btn-light-danger js-delete" title="Xóa dòng">
      <i class="ti ti-trash f-20"></i>
    </button>
	`;
    
    const btnDelete = wrap.querySelector('.js-delete');
    if (params.data.isActive == 0) {
        const btnChangeIsActive = wrap.querySelector('.js-change_isActive');
        btnChangeIsActive.addEventListener('click', (e) => {
            ApproveDataRubberAgent(params.data.agentId, 1);
        });
    }
    else {
        const btnChangeIsActive = wrap.querySelector('.js-change_isActive');
        btnChangeIsActive.addEventListener('click', (e) => {
            ApproveDataRubberAgent(params.data.agentId, 0);
        });
    }
    btnDelete.addEventListener('click', (e) => {
        // e.stopPropagation();
        Swal.fire({
            title: 'Xóa dòng này?',
            icon: "error",
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: `Lưu`,
            showCloseButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    async: true,
                    method: 'POST',
                    url: "/Agent/DeleteRubberAgent",
                    dataType: 'json',
                    data: { agentId: params.data.agentId },
                    success: function (res) {
                        if (res == 1) {
                            Toast.fire({
                                icon: "success",
                                title: "Xóa thành công"
                            });
                            params.api.applyTransaction({ remove: [params.node.data] });
                            RefreshAllGridWhenChangeData();
                        }
                    },
                    error: function () {
                        Toast.fire({
                            icon: "danger",
                            title: "Xóa thất bại"
                        });
                    }
                });
            }
        });
    });

    return wrap;
}
function ApproveDataRubberAgent(agentId, status) {
    $.ajax({
        async: true,
        method: 'POST',
        url: "/Agent/ApproveDataRubberAgent",
        dataType: 'json',
        data: { agentId: agentId, status: status },
        success: function (res) {
            if (status == 1) {
                Toast.fire({
                    icon: "success",
                    title: "đổi trạng thái thành công"
                });
            }
            RefreshAllGridWhenChangeData();
        },
        error: function () {
            Toast.fire({
                icon: "danger",
                title: "đổi trạng thái thất bại"
            });
        }
    });
}                           