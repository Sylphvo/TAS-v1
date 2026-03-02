var arrConstant = {
    idProgress: 0, // Đang xử lý
    msgProgress: arrMsg.key_chuaduyet, // Đã tạo đơn hàng
    idFinish: 1, // Đang xử lý
    msgFinish: arrMsg.key_hoanthanh, // Đã tạo đơn hàng
    currentPage: 1, // Đã tạo đơn hàng
    pageIndex: 10, // Đã tạo đơn hàng
    pageSize: 10, // Đã tạo đơn hàng

    SortOrder_Lot: 1, // Order
    SortOrder_Agent: 2,// Agent
    SortOrder_Farm: 3,// Farmer
    isCheckAll: false,// Farmer
    isLoadFirst: true,// Farmer
    PrefixOrder: 'EXP_',
    PrefixIntake: 'INT_',
    PrefixLot: 'LOT_',
};
class SelectEditorWithTextDisplay {
    init(params) {
        this.params = params;

        this.eSelect = document.createElement('select');
        this.eSelect.className = 'ag-cell-edit-input cboSelect2Search';
        this.eSelect.style.width = '100%';
        this.eSelect.style.height = '100%';

        const currentValue = params.value;
        const objectData = params.colDef.field == 'agentCode' ? arrValue.comboAgent : arrValue.comboFarmCode;
        objectData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value; // FR001
            option.text = item.text;   // Nhà vườn ABC

            if (item.value === currentValue) {
                option.selected = true;
            }

            this.eSelect.appendChild(option);
        });
    }

    getGui() {
        return this.eSelect;
    }

    afterGuiAttached() {
        // ⚠️ BẮT BUỘC init Select2 ở đây
        $(this.eSelect).select2({
            width: '100%',
            dropdownAutoWidth: true,
            dropdownParent: $(this.eSelect).closest('.ag-cell'),
            minimumResultsForSearch: 0 // luôn hiện search
        });

        $(this.eSelect).focus();
    }

    getValue() {
        return $(this.eSelect).val(); // FR001
    }

    destroy() {
        // cleanup tránh memory leak
        if (this.eSelect) {
            $(this.eSelect).select2('destroy');
        }
    }
}
// Can use for Ag-Grid Free version
// Căn giữa cho cột Model
function CellStyle_Col_Model(params) {
    let cellAttr = {};
    cellAttr['text-align'] = 'center';
    return cellAttr;
}
//// Tạo mã Intake tự động: INT_YYYYMMDDHHMMSS
//function generateIntakeCode() {
//    const datePart = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
//    return `INT_${datePart}`;
//}
//// Tạo mã Order tự động: ORD_YYYYMMDDHHMMSS_001
//function getOrderCodePrefix() {
//    const now = new Date();
//    const year = now.getFullYear();
//    const month = String(now.getMonth() + 1).padStart(2, '0');
//    const day = String(now.getDate()).padStart(2, '0');
//    return `ORD_${year}${month}${day}_`;
//}

// Hàm tạo Prefix động theo ngày (VD: AG_20250223_, LOT_20250223_)
function getCodePrefix(prefixText) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${prefixText}_${year}${month}${day}_`;
}

/**
 * Hàm core: Sinh mã ngẫu nhiên và đảm bảo KHÔNG trùng trong rowData
 * @param {Array} rowData - Mảng dữ liệu hiện tại của Ag-Grid
 * @param {String} prefixText - Tiền tố của mã (VD: 'AG', 'LOT', 'FARM')
 * @param {String} fieldName - Tên cột cần check trùng trong rowData (VD: 'AgentCode')
 */
function generateUniqueCodeCore(rowData, prefixText, fieldName) {
    const prefix = getCodePrefix(prefixText);
    let isDuplicate = true;
    let newCode = "";
    let safetyCounter = 0; // Chống treo trình duyệt nếu full 1000 số

    while (isDuplicate && safetyCounter < 1000) {
        // 1. Sinh số ngẫu nhiên 000-999
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        newCode = `${prefix}${randomNum}`;

        // 2. Kiểm tra xem mã này đã tồn tại trong rowData chưa theo fieldName
        const exists = rowData && rowData.some(item => item[fieldName] === newCode);

        if (!exists) {
            isDuplicate = false; // Ngon, không trùng -> Thoát vòng lặp
        }

        safetyCounter++;
    }

    if (safetyCounter >= 1000) {
        console.error(`Đã hết số để sinh cho loại mã [${prefixText}] trong ngày hôm nay!`);
        return `${prefix}ERROR`;
    }

    return newCode;
}
function RefeshSingleColumn(gridApiDynamic, fieldName) {
    gridApiDynamic.refreshCells({ force: true, columns: [fieldName] });
}

/**
* Tạo DataSource chuẩn cho Ag-Grid Infinite Row Model
* @param {string} apiUrl - Đường dẫn API (Controller)
* @param {function} getFilterParamsFn - Hàm trả về object chứa tham số search/filter
* @param {function} onDataLoaded - (Optional) Callback khi tải xong (nhận vào totalRecords)
*/
function createInfiniteDataSource(apiUrl, getFilterParamsFn, onDataLoaded) {
    return {
        getRows: function (params) {
            // 1. Lấy tham số filter từ trang hiện tại
            var filterParams = getFilterParamsFn ? getFilterParamsFn() : {};

            // 2. Gộp với tham số phân trang của Ag-Grid
            var requestData = Object.assign({}, filterParams, {
                StartRow: params.startRow,
                EndRow: params.endRow
            });

            console.log(`Loading ${apiUrl}:`, requestData);

            // 3. Gọi AJAX
            $.ajax({
                url: apiUrl,
                type: 'GET',
                data: requestData,
                success: function (response) {
                    if (response.success) {
                        // Gọi callback của Ag-Grid để render dữ liệu
                        // response.rows: Mảng dữ liệu
                        // response.lastRow: Tổng số bản ghi (để tính thanh cuộn)
                        params.successCallback(response.rows, response.lastRow);

                        // Gọi callback riêng của trang (nếu có) để update UI
                        if (onDataLoaded) {
                            onDataLoaded(response.lastRow);
                        }
                    } else {
                        console.error("API Error:", response.message);
                        params.failCallback();
                    }
                },
                error: function (xhr, status, error) {
                    console.error("AJAX Error:", error);
                    params.failCallback();
                }
            });
        }
    };
}
// Thêm dòng mới vào Ag-Grid và chọn dòng đó
function AddNewRowAggrid(gridApiDynamic, listData, newItem, fieldName, rowIndex) {
    var transaction = {
        add: [newItem],
        addIndex: rowIndex
    };
    gridApiDynamic.applyTransaction(transaction);
    RefeshSingleColumn(gridApiDynamic, fieldName);
    // 1. Chọn hàng (Selection - bôi màu nền)
    gridApiDynamic.getDisplayedRowAtIndex(rowIndex).setSelected(true);
    // 2. Focus vào ô (Tạo viền khung cho ô)
    gridApiDynamic.setFocusedCell(rowIndex, fieldName);
    // 3. Auto Scroll (Cuộn tới hàng đó)
    // 'top', 'bottom', hoặc 'middle' để kiểm soát vị trí hàng sau khi cuộn
    gridApiDynamic.ensureIndexVisible(rowIndex, 'middle');
    listData.push(newItem);
    //return listData;
}
function CreateGridOption(columnDefs) {
    let columndefDefault = [
        {
            headerName: '',
            field: 'selected',
            width: 80,
            pinned: 'left', // Giữ pinned để cố định icon bên trái
            lockPosition: true,
            suppressMenu: true,
            rowDrag: true,         // Hiện icon ::
            checkboxSelection: true, // Hiện ô Checkbox
            headerCheckboxSelection: true,
            columnDelete: true,
            suppressMovable: true,
            filter: false,
            resizable: false, // Nên tắt cái này để người dùng không kéo dãn cột action
            cellRenderer: CellRenderAction // Nên tắt cái này để người dùng không kéo dãn cột action
        }
    ];
	columndefDefault.push(...columnDefs);
    return {
        // Column Definitions
        columnDefs: columndefDefault,
        //sideBar: true,
        // Default Column Definition
        rowSelection: 'multiple',// Chọn nhiều dòng
        defaultColDef: {// Áp dụng cho tất cả các cột
            sortable: false,// Cho phép sắp xếp cột
            filter: true,// Cho phép lọc cột
            resizable: true,// Cho phép thay đổi kích thước cột
            floatingFilter: true,// Hiện ô lọc bên dưới header
            suppressMenu: false,// Hiện menu lọc
            cellStyle: CellStyle_Col_Model,
            suppressFillHandle: true,
            cellClass: (params) => {
                // Kiểm tra xem cột có được set editable là true hay không
                return params.colDef.editable ? 'editcolumn' : 'noteditcolumn';
            }
        },
        rowDragManaged: true,// Kéo thả dòng được quản lý
        rowDragEntireRow: true,// Kéo thả cả dòng
        animateRows: true,// Hiệu ứng khi sắp xếp lại dòng
        enableCellTextSelection: true,// Bật tính năng chọn text trong cell
        enableClipboard: true,// Bật tính năng copy paste

        suppressMultiRangeSelection: true,// chỉ chọn 1 range
        suppressCellFocus: true,// tránh bôi đen cell khi click
        enableRangeHandle: true,// Bật Range Handle
        enableRangeSelection: true,// Bật Range Selection
        enableFillHandle: true, // Bật Fill Handle
        fillHandleDirection: 'y', // CHỈ kéo dọc
        cellSelection: {// Fill Handle configuration
            handle: {// Fill Handle configuration
                mode: 'fill',// Enable Fill Handle
                direction: 'y', // Fill Handle can only be dragged horizontally
            }
        },

        //pagination: true,
        paginationPageSize: 50,// Kích thước trang mặc định
        paginationPageSizeSelector: [20, 50, 100, 200],// Các lựa chọn kích thước trang
        rowHeight: 43,// Độ cao dòng
        headerHeight: 45,// Độ cao header
        suppressRowClickSelection: true,// Click row không chọn

        // Events
        onGridReady: onGridReady,// Load Data
        onCellValueChanged: onCellValueChanged,// Edit Cell
        //onRowDragEnd: onRowDragEnd,// Drag and Drop

        singleClickEdit: true,// Double click to edit
        onFillEnd: onFillEnd// Fill Handle
    };

}
function RegisterAllEvent(gridApiDynamic) {
    $('.ag-header-select-all:not(.ag-hidden)').on('click', function (e) {
        let IsChecked = $(this).find('.ag-input-field-input');
        if (IsChecked.prop('checked')) {
            gridApiDynamic.deselectAll();
        } else {
            gridApiDynamic.selectAll(); // chọn tất cả
        }
    });
}
function cancelRow(rowIndex, strCode) {
    const objectData = gridApiDynamic.getDisplayedRowAtIndex(rowIndex).data;
    rowData = rowData.filter(item => item[strCode] != objectData[strCode]);
    gridApiDynamic.setGridOption('rowData', rowData);
}
function LoadDataAgGrid(gridApiDynamic, pageIndex, pageSize, strUrl, functionDynamic) {
	// 1. Hiện loading
    showLoading();  
    if (typeof (pageIndex) == 'number') {
        arrConstant.pageIndex = pageIndex;
    } else {
        arrConstant.pageIndex = 1;
    }
    if (pageSize) {
        arrConstant.pageSize = pageSize;
    }
    // 2. Lấy giá trị từ các ô Filter trên màn hình
    var filterData = {
        PageIndex: arrConstant.pageIndex,
        PageSize: arrConstant.pageSize,
        Keyword: $('#txtSearchKeyword').val(), // Lấy từ ô tìm kiếm
        Status: $('#ddlStatus').val(),         // Lấy từ dropdown trạng thái
        FromDate: $('#dtFromDate').val(),      // Lấy ngày bắt đầu
        ToDate: $('#dtToDate').val()           // Lấy ngày kết thúc
    };

    $.ajax({
        url: strUrl,
        type: 'GET',
        data: filterData, // Gửi object filter lên controller
        success: function (response) {
            if (response.success) {
                // response.data lúc này là object PagedResult { items: [...], totalRecords: 100 }
                var pagedResult = response.data;
                rowData = pagedResult.items;
                gridApiDynamic.setGridOption('rowData', rowData);
                updateStatusBar(rowData.length);
                // 5. [Quan trọng] Xử lý phân trang UI (Nếu bạn dùng phân trang tùy chỉnh)
                // Quan trọng: Truyền hàm callback để khi bấm nút nó gọi lại loadOrders
                renderServerPagination(
                    'divPagingContainer',// ID thẻ div chứa thanh phân trang
                    pagedResult.totalRecords,// Tổng số bản ghi (Server trả về)
                    arrConstant.currentPage,// Trang hiện tại
                    arrConstant.pageSize,// Size hiện tại
                    functionDynamic                    
                );
                //updateLastUpdateTime();
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