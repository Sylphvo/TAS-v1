var arrConstant = {
    idProgress: 0, // Đang xử lý
    msgProgress: arrMsg.key_chuaduyet, // Đã tạo đơn hàng
    idFinish: 1, // Đang xử lý
    msgFinish: arrMsg.key_hoanthanh, // Đã tạo đơn hàng
    currentPage: 1, // Đã tạo đơn hàng
    pageSize: 10, // Đã tạo đơn hàng

    SortOrder_Lot: 1, // Order
    SortOrder_Agent: 2,// Agent
    SortOrder_Farm: 3,// Farmer
    isCheckAll: false,// Farmer
    isLoadFirst: true,// Farmer
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
// Tạo mã Intake tự động: INT_YYYYMMDDHHMMSS
function generateIntakeCode() {
    const datePart = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    return `INT_${datePart}`;
}
// Tạo mã Order tự động: ORD_YYYYMMDDHHMMSS_001
function getOrderCodePrefix() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `ORD_${year}${month}${day}_`;
}

/**
 * Sinh mã ngẫu nhiên và đảm bảo KHÔNG trùng trong rowData
 * @param {Array} rowData - Mảng dữ liệu hiện tại của Ag-Grid
 */
function generateUniqueFakeOrderCode(rowData) {
    const prefix = getOrderCodePrefix();
    let isDuplicate = true;
    let newCode = "";
    let safetyCounter = 0; // Chống treo trình duyệt nếu full 1000 số

    while (isDuplicate && safetyCounter < 1000) {
        // 1. Sinh số ngẫu nhiên 000-999
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        newCode = `${prefix}${randomNum}`;

        // 2. Kiểm tra xem mã này đã tồn tại trong rowData chưa
        // Giả sử cột chứa mã đơn hàng tên là 'OrderCode'
        const exists = rowData && rowData.some(item => item.OrderCode === newCode);

        if (!exists) {
            isDuplicate = false; // Ngon, không trùng -> Thoát vòng lặp
        }

        safetyCounter++;
    }
    if (safetyCounter >= 1000) {
        console.error("Đã hết số để sinh trong ngày hôm nay!");
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
    gridApiOrder.getDisplayedRowAtIndex(rowIndex).setSelected(true);
    // 2. Focus vào ô (Tạo viền khung cho ô)
    gridApiOrder.setFocusedCell(rowIndex, fieldName);
    // 3. Auto Scroll (Cuộn tới hàng đó)
    // 'top', 'bottom', hoặc 'middle' để kiểm soát vị trí hàng sau khi cuộn
    gridApiOrder.ensureIndexVisible(rowIndex, 'middle');
    listData.push(newItem);
    //return listData;
}