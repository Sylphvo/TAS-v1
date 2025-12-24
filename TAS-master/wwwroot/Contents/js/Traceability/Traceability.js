
var arrParentIds = [];


// Đăng ký sự kiện cho Traceability
function RegEventTraceability() {
    arrConstant.isCheckAll = $('#ChkAll').prop('checked');
    $('#ChkAll').on('change', function (e) {
        arrConstant.isCheckAll = e.target.checked;
        ShowOrHideAllRowChildren();
    });
    $('.Col-orderName').on('click', function (e) {
        resizeGridPallet();
    });
}


// Tạo grid Traceability
function CreateGridTraceability() {
    gridOptionsTraceability = {
        //pagination: true,
        paginationPageSize: 100,
        columnDefs: CreateColModelTraceability(),
        defaultColDef: {
            width: 170,
            filter: true,
            floatingFilter: true,
        },
        rowHeight: 45,// chiều cao hàng
        headerHeight: 45,// chiều cao header
        rowData: [],
        rowDragManaged: true,
        rowDragMultiRow: true,
        rowSelection: 'multiple',         // cho phép chọn nhiều hàng
        suppressRowClickSelection: false, // cho phép click hàng để chọn
        animateRows: true,
        singleClickEdit: true,
        components: {
            //customFloatingFilterInput: getFloatingFilterInputComponent(),
            //customheader: CustomHeaderTraceability,
        },
        cellSelection: true,
        onGridReady: function (params) {
            gridApi = params.api;
            params.api.sizeColumnsToFit();
        },
        rowDragManaged: true,
        onRowDragEnd() {
            OnDragMoveSetRow();
        },
        onCellValueChanged: e => {
            UpdateDataAfterEdit(0, e.data);
        },
        enableRangeSelection: true,
        allowContextMenuWithControlKey: true, // giữ Ctrl + click phải vẫn hiện
        suppressContextMenu: false, // cho phép hiện menu ag-Grid

    };

    const eGridDiv = document.querySelector(Traceability);
    gridApi = agGrid.createGrid(eGridDiv, gridOptionsTraceability);
    //SetButtonOnPagingForTraceability();
    CreateRowDataTraceability();
    resizeGridTraceability();
}
function resizeGridTraceability() {
    setTimeout(function () {
        setWidthHeightGrid(25);
    }, 100);
}
function setWidthHeightGrid(heithlayout) {
    //gridOptionsTraceability.api.sizeColumnsToFit();
    //var heigh = $(window).height() - $('.top_header').outerHeight() - $('.dm_group.dmg-shortcut').outerHeight() - ($('.col-xl-12').outerHeight() + heithlayout);
    //$(myGrid).css('height', heigh);
    //gridOptions.api.sizeColumnsToFit({
    //	defaultMinWidth: 100,
    //	columnLimits: [{ key: "DESCRIPTION", minWidth: 200 }],
    //});
}
function RefreshAllGridWhenChangeData() {
    //ShowHideLoading(true, Traceability);
    setTimeout(function () {
        CreateRowDataTraceability();
    }, 1);
}
function CreateRowDataTraceability() {
    var listSearchTraceability = {};
    ResetValueArrParentIds();
    //ShowHideLoading(true, divTraceability);
    //$('#TraceabilityModal .ag-overlay-no-rows-center').hide();
    $.ajax({
        async: !false,
        type: 'POST',
        url: "/Traceability/Traceabilitys",
        data: listSearchTraceability,
        dataType: "json",
        success: function (data) {
            ListDataFull = data;
			ListRowChild = data.filter(x => x.sortOrder != 1);
            gridApi.setGridOption("rowData", data);
            setTimeout(function () {
                renderPagination(agPaging, IsOptionAll);
            }, 100);
            
        }
    });
}
function CreateColModelTraceability() {
    var columnDefs = [
        {
            field: 'orderCode', headerName: 'Mã đơn hàng', width: 90, minWidth: 90
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: true
            , filter: true
            , floatingFilterComponent: 'customFloatingFilterInput'
            , floatingFilterComponentParams: { suppressFilterButton: true }
            , headerComponent: "customHeader"
            , filter: "agTextColumnFilter"
        },
        {
            field: 'orderName', headerName: 'Tên đơn hàng', width: 90, minWidth: 90
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: false
            , cellRenderer: cellRender_ParentAndChild
            , headerComponent: "customHeader"
            , filter: "agTextColumnFilter"
        },
        {
            field: 'agentName', headerName: 'Tên đại lý', width: 90, minWidth: 90
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: false
            , headerComponent: "customHeader"
            , cellRenderer: cellRender_ParentAndChild
            , filter: "agTextColumnFilter"
        },
        {
            field: 'farmerName', headerName: 'Tên nhà vườn', width: 90, minWidth: 90
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: true
            , headerComponent: "customHeader"
            , filter: "agTextColumnFilter"
        },
        {
            field: 'totalFinishedProductKg', headerName: 'Tổng thành phẩm', width: 90, minWidth: 90
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: false
            , headerComponent: "customHeader"
            , filter: "agTextColumnFilter"
        },
        {
            field: 'totalCentrifugeProductKg', headerName: 'Tổng thành phẩm ly tâm', width: 90, minWidth: 90
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: false
            , headerComponent: "customHeader"
            , filter: "agTextColumnFilter"
        },
        {
            field: 'datePurchase', headerName: 'Ngày thu mua', width: 90, minWidth: 90
            , cellStyle: cellStyle_Col_Model_EventActual
            , editable: false
            , headerComponent: "customHeader"
            , filter: "agTextColumnFilter"
        }
    ]
    return columnDefs;
}
function onRowSelected(event) {
    //if (event.node.isSelected()) {
    //	var id_list = GetIdListEventActual(event.data.id);
    //	if (id_list !== PFN_readCookie('id_list')) {
    //		$('.ag-body-viewport div.ag-row').removeClass('ag-row-selected');
    //           $('.ag-body-viewport div[row-index="' + $('.' + PFN_readCookie('id_list')).parent().attr('row-index') + '"]').removeClass('ag-row-selected');
    //	}
    //	if (IsNullOrEmpty(PFN_readCookie('focus_row')) && event.type == 'rowSelected' && event.source == 'rowClicked') {
    //		$('.ag-body-viewport div[row-index="' + event.rowIndex + '"]').addClass('ag-row-selected');
    //	}
    //   }
}

function CustomHeaderTraceability() { }

CustomHeaderTraceability.prototype.init = function (params) {
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

CustomHeaderTraceability.prototype.onSortChanged = function () {
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

CustomHeaderTraceability.prototype.getGui = function () {
    return this.eGui;
};

CustomHeaderTraceability.prototype.onSortRequested = function () {
    RefreshAllGridWhenChangeData();
};

CustomHeaderTraceability.prototype.destroy = function () {
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




// Cell Render Parent And Child
function cellRender_ParentAndChild(params) {
    let cellValue = params.value;
    let id_list = params.data.sortIdList;
    if (params.colDef.field == "orderName" && params.data.sortOrder == 1) {
        return `<div class="text-cell-eclip">
        <button type="button" class="Col-orderName btn btn-link" data-bs-toggle="modal" data-bs-target="#myLargeModalLabel">
            ${htmlDecode(params.data.orderName)}
        </button>
        </div>` +
        '<span class="ag-group-expanded" ref="eExpanded"><span class="ag-icon ' + (params.data.isOpenChild ? ' ag-icon-tree-open' : ' ag-icon-tree-closed') + '" unselectable="on" role="presentation" id_list="' + id_list + '" onclick="ShowOrHideRowChildren(\'' + id_list + '\', this, SetValueArrParentIds, ' + params.data.sortOrder + ')"></span></span>';     
    }
    else if (params.colDef.field === 'agentName' && params.data.sortOrder == 2) {
        return `<div class="text-cell-eclip"> ${htmlDecode(cellValue)}</div>` + '<span class="ag-group-expanded" ref="eExpanded"><span class="ag-icon ' + (params.data.isOpenChild ? ' ag-icon-tree-open' : 'ag-icon-tree-closed') + '" unselectable="on" role="presentation" onclick="ShowOrHideRowChildren(\'' + id_list + '\', this, SetValueArrParentIds, ' + params.data.sortOrder +')"></span></span>';
        
    }
    return `<div class="text-cell-eclip">${htmlDecode(cellValue)}</div>`;
}
// End Cell Render Parent And Child

// Set giá trị mảng arrParentIds
function SetValueArrParentIds(arrParentIds, isOpenRow) {
    isOpenRow = ParseBool(isOpenRow);
    $.each(arrParentIds, function (parentIdIndex, parentIdValue) {
        if (isOpenRow) {
            arrParentIds.push(parentIdValue);           
        } else {
            arrParentIds = arrParentIds.filter(x => x != parentIdValue);           
        }
    });
}

// Reset giá trị mảng arrParentIds
function ResetValueArrParentIds() {
    arrParentIds = [];
}

// Hiển thị hoặc ẩn các hàng con dựa trên việc chọn hoặc bỏ chọn checkbox "Chọn tất cả"
function ShowOrHideAllRowChildren() {
    let listDataChildToAdd = ListDataFull.filter(x => x.sortOrder != arrConstant.SortOrder_Lot);
    if (arrConstant.isCheckAll)
    {
        $('div[col-id="orderName"] span.ag-icon').removeClass('ag-icon-tree-closed').addClass('ag-icon-tree-open');
        gridApi.applyTransaction({ add: listDataChildToAdd });
    }
    else {
        $('div[col-id="orderName"] span.ag-icon').removeClass('ag-icon-tree-open').addClass('ag-icon-tree-closed');
        gridApi.applyTransaction({ remove: listDataChildToAdd });
    }
    ListDataFull.filter(x => x.isOpenChild = arrConstant.isCheckAll);
}
function IsEditColumnDataTable(params) {
    var valueData = params.data[params.colDef.field];
    var isEditData = false;
    if (IsNullOrEmpty(valueData)) { return isEditData; }
    if (params.data.sortOrder == '1') {
        isEditData = false;
    }
    else if (params.data.sortOrder == '2') {
        isEditData = false;
    }
    else if (params.data.sortOrder == '3') {
        isEditData = true;
    }
    return isEditData;
}
// read the raw data and convert it to a XLSX workbook
function convertDataToWorkbook(dataRows) {
    /* convert data to binary string */
    const data = new Uint8Array(dataRows);
    const arr = [];

    for (let i = 0; i !== data.length; ++i) {
        arr[i] = String.fromCharCode(data[i]);
    }

    const bstr = arr.join("");

    return XLSX.read(bstr, { type: "binary" });
}

// pull out the values we're after, converting it into an array of rowData

function populateGrid(api, workbook) {
    // our data is in the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // we expect the following columns to be present
    const columns = {
        A: "orderCode",
        B: "orderName",
        C: "agentName",
        D: "farmerName",
        E: "totalFinishedProductKg",
        F: "totalCentrifugeProductKg",
        G: "datePurchase",
    };

    const rowData = [];

    // start at the 2nd row - the first row are the headers
    let rowIndex = 2;

    // iterate over the worksheet pulling out the columns we're expecting
    while (worksheet["A" + rowIndex]) {
        var row = {};
        Object.keys(columns).forEach((column) => {
            row[columns[column]] = worksheet[column + rowIndex].w;
        });

        rowData.push(row);

        rowIndex++;
    }

    // finally, set the imported rowData into the grid
    api.setGridOption("rowData", rowData);
}

function importExcel() {
    const workbook = convertDataToWorkbook(ListDataFull);
    populateGrid(gridApi, workbook);
}
