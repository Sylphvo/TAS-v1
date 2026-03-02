// ========================================
// GLOBAL VARIABLES
// ========================================
var gridApiIntake, gridColumnApi;
var IsOptionAll = false;
var ListDataFull;
let rowData = [];
let fillHandleBatch = [];
var agentByCode = {};
var farmByCode = {};
var arrValue = {
    typeExcel: 1, // Xuất Excel Data
    typeSampleExcel: 2, // Xuất Excel Mẫu

    comboAgent: [], // combo đại lý
    comboFarmCode: [], // combo thông tin nhà vườn
    comboOrderCode: [], // combo đơn hàng
    selectFirst: true,
    loadFirst: false,	
};

var columnDefs =
[
    {
        headerName: 'Số thứ tự',
        field: 'rowNo',
        minWidth: 80,
        width: 80,
    },
    {
        headerName: 'Tên đại lý',
        field: 'agentCode',
        cellEditor: SelectEditorWithTextDisplay,
        editable: true,
        width: 120,
        filter: 'agTextColumnFilter',
        cellStyle: CellStyle_Col_Model,
        valueFormatter: (params) => {
            if (!params.value) return '';
            return params.data.agentName;
        },
        suppressFillHandle: false // Chỉ bật fill cho riêng cột này
    },
    {
        headerName: 'Tên Nhà Vườn',
        field: 'farmCode',
        cellEditor: SelectEditorWithTextDisplay,
        editable: true,
        width: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => {
            if (!params.value) return '';
            return params.data.farmerName;
        },
        suppressFillHandle: false
    },
    {
        headerName: 'KL Mủ (kg)',
        field: 'rubberKg',
        width: 120,
        editable: true,
        type: 'numericColumn',
        valueFormatter: params => formatNumber(params.value),
        cellStyle: CellStyle_Col_Model,
        suppressFillHandle: false
    },
    {
        headerName: 'TSC',
        field: 'tscPercent',
        width: 100,
        editable: true,
        type: 'numericColumn',
        valueFormatter: params => formatNumber(params.value, 2),
        suppressFillHandle: false
    },
    {
        headerName: 'DRC',
        field: 'drcPercent',
        width: 100,
        editable: true,
        type: 'numericColumn',
        valueFormatter: params => formatNumber(params.value, 2),
        suppressFillHandle: false
    },
    {
        headerName: 'Thành phẩm',
        field: 'finishedProductKg',
        width: 100,
        editable: true,
        type: 'numericColumn',
        valueFormatter: params => formatNumber(params.value),
        suppressFillHandle: false
    },
    {
        headerName: 'Thành Phẩm Ly Tâm',
        field: 'centrifugeProductKg',
        width: 100,
        editable: true,
        type: 'numericColumn',
        valueFormatter: params => formatNumber(params.value),
        suppressFillHandle: false
    },
    {
        headerName: 'Trạng thái',
        field: 'statusText',
        width: 120,
        editable: false,
        cellRenderer: CellRenderStatus,
        suppressFillHandle: false
    },
    {
        headerName: 'Người cập nhật',
        field: 'timeDate_Person',
        width: 130,
        editable: false,
		hide: true
    },
    {
        headerName: 'Thời gian',
        field: 'timeDate',
        width: 150,
        editable: false,
    }
];
var gridOptions = CreateGridOption(columnDefs);

function initPage() {
    gridApiIntake = agGrid.createGrid(document.querySelector("#RubberIntake"), gridOptions);
    loadData();// Load initial data
    loadAllCombos();// Setup filter change events
    RegisterAllEvent(gridApiIntake);
    RegisterEventPageIntake();
    ApplyCboSelect2();
}

function RegisterEventPageIntake() {
    //đăng ký select trang
    $('#selectorPaging').change(function (e) {
        let selectPage = $(this).val();
        IsOptionAll = selectPage == '*';
        loadData();
    });
    $('#cboAgent,#cboFarm,#cboOrder,#cboStatus').change(function (e) {
        loadData();
    });
    $('#CboType').change(function (e) {
        let dataType = $(this).val();
        FilterType(dataType);
    });
}
function onGridReady(params) {
    gridApiIntake = params.api;
    gridColumnApi = params.columnApi;
    
    // Auto size columns
    gridApiIntake.sizeColumnsToFit();    
}

// ========================================
// LOAD DATA
// ========================================
async function loadData(pageIndex, pageSize) {
    const agentCode = $('#cboAgent').val();
    const farmCode = $('#cboFarm').val();
    const orderCode = $('#cboOrder').val();
    const status = $('#cboStatus').val();

    // 1. Nếu không truyền pageIndex, mặc định là trang 1 (khi bấm nút Tìm kiếm)
    if (pageIndex) {
        arrConstant.currentPage = pageIndex;
    } else {
        arrConstant.currentPage = 1;
    }
    if (pageSize) {
        arrConstant.pageSize = pageSize;
    }
    //{ agentCode, farmCode, orderCode, status }
    var filterData = {
        PageIndex: arrConstant.currentPage,
        PageSize: arrConstant.pageSize,
        Keyword: $('#txtSearchKeyword').val(), // Lấy từ ô tìm kiếm
        FromDate: $('#dtFromDate').val(),      // Lấy ngày bắt đầu
        ToDate: $('#dtToDate').val(),
        agentCode: agentCode,
        farmCode: farmCode,
        orderCode: orderCode,
        status: status
    };
    try {
        const response = await $.ajax({
            url: '/RubberIntake/GetAllIntakes',
            type: 'POST',
            data: filterData
        });
        
        if (response.success) {
            var pagedResult = response.data;
            rowData = pagedResult.items;

            gridApiIntake.setGridOption('rowData', rowData);

            renderServerPagination(
                'divPagingContainer',     // ID thẻ div chứa thanh phân trang
                pagedResult.totalRecords, // Tổng số bản ghi (Server trả về)
                arrConstant.currentPage,            // Trang hiện tại
                arrConstant.pageSize,               // Size hiện tại
                function (newPage, newSize) {
                    // Callback: Khi người dùng bấm Next/Prev/Change Size -> Gọi lại hàm load này
                    loadData(newPage, newSize);
                }
            );

            if (!arrValue.loadFirst) {
                arrValue.loadFirst = true;
                RegisterAllEvent();
            }
        } else {
            //NotificationToast('error', response.message || 'Lỗi khi tải dữ liệu');
        }
		
        

    } catch (error) {
        console.error('Error loading data:', error);
        //NotificationToast('error', 'Lỗi kết nối server');
    } finally {

    }
}

// ========================================
// CRUD OPERATIONS
// ========================================


// Add New Row
function addNewRow() {
    const newItem = {
        intakeId: 0,
        intakeCode: generateUniqueCodeCore(rowData, arrConstant.PrefixIntake, 'intakeCode'),
        agentCode: '',
        agentName: '',
        farmCode: '',
        farmerName: '',
        rubberKg: 0,
        tscPercent: 0,
        drcPercent: 0,
        finishedProductKg: 0,
        centrifugeProductKg: 0,
        status: 0,
        statusText: arrValue.MsgProgress,
        timeDate_Person: '',
        timeDate: ''
    };
    AddNewRowAggrid(gridApiIntake, rowData, newItem, 'selected', rowData.length);
}
function onRemoveSelected() {
    const selectedData = gridApiIntake.getSelectedRows();
    gridApiIntake.applyTransaction({ remove: selectedData });
}
function cancelRow(rowIndex) {
    const objectData = gridApiIntake.getDisplayedRowAtIndex(rowIndex).data;
    rowData = rowData.filter(item => item.intakeCode !== objectData.intakeCode);
    gridApiIntake.setGridOption('rowData', rowData);
}
// Save Single Row
async function saveRow(rowIndex) {
    const rowNode = gridApiIntake.getDisplayedRowAtIndex(rowIndex);
    const data = rowNode.data;
    
    // Validate
    if (!data.farmCode) {
        NotificationToast('error', 'Vui lòng chọn mã nhà vườn');
        return;
    }
    
    
    try {
        const response = await $.ajax({
            url: '/RubberIntake/AddOrUpdate',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                intakeId: data.intakeId || 0,
                intakeCode: data.intakeCode,
                agentCode: data.agentCode,
                farmCode: data.farmCode,
                farmerName: data.farmerName,
                rubberKg: data.rubberKg,
                tscPercent: data.tscPercent,
                drcPercent: data.drcPercent,
                finishedProductKg: data.finishedProductKg,
                centrifugeProductKg: data.centrifugeProductKg,
                status: data.status
            })
        });
        
        if (response.success) {
            NotificationToast('success', 'Lưu thành công');
            // Update intakeId if new
            if (!data.intakeId) {
                data.intakeId = response.intakeId;
            }
            // Reload row
            gridApiIntake.applyTransaction({ update: [data] });
            gridApiIntake.refreshCells({ rowNodes: [rowNode], force: true });
        } else {
            NotificationToast('error', response.message || 'Lưu thất bại');
        }

    } catch (error) {
        console.error('Error saving row:', error);
        NotificationToast('error', 'Lỗi kết nối server');
    } finally {
    }
}



// Delete Single Row
async function deleteRow(rowIndex) {

    if (!await IsToastConfirmDeleteNoLength()) return;
    const rowNode = gridApiIntake.getDisplayedRowAtIndex(rowIndex);
    const data = rowNode.data;
    
    // If new row (no intakeId), just remove from grid
    if (!data.intakeId || data.intakeId === 0) {
        gridApiIntake.applyTransaction({ remove: [data] });
        //updateRowNumbers();
        NotificationToast('success', 'Đã xóa dòng');
        return;
    }
    
    
    
    try {
        const response = await $.ajax({
            url: '/RubberIntake/Delete',
            type: 'POST',
            data: { intakeId: data.intakeId }
        });
        
        if (response.success) {
            gridApiIntake.applyTransaction({ remove: [data] });
            //updateRowNumbers();
            NotificationToast('success', 'Xóa thành công');
        } else {
            NotificationToast('error', response.message || 'Xóa thất bại');
        }
    } catch (error) {
        console.error('Error deleting row:', error);
        NotificationToast('error', 'Lỗi kết nối server');
    } finally {
        
    }
}

// Delete Selected Rows
async function deleteSelected() {
    const selectedRows = gridApiIntake.getSelectedRows();
    
    if (selectedRows.length === 0) {
        NotificationToast('warning', 'Vui lòng chọn các dòng cần xóa');
        return;
    }


    if (!await IsToastConfirmDelete(selectedRows.length)) return;
    
    const intakeIds = selectedRows
        .filter(row => row.intakeId > 0)
        .map(row => row.intakeId);
    
    if (intakeIds.length === 0) {
        // Just remove from grid
        gridApiIntake.applyTransaction({ remove: selectedRows });
        //updateRowNumbers();
        NotificationToast('success', 'Đã xóa các dòng mới');
        return;
    }
    
    try {
        const response = await $.ajax({
            url: '/RubberIntake/DeleteMultiple',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(intakeIds)
        });
        
        if (response.success) {
            gridApiIntake.applyTransaction({ remove: selectedRows });
            //updateRowNumbers();
            NotificationToast('success', response.message);
        } else {
            NotificationToast('error', response.message || 'Xóa thất bại');
        }
    } catch (error) {
        NotificationToast('error', 'Lỗi kết nối server');
    } finally {
        
    }
}


// Approve Row
async function approveRow(rowIndex, status) {
    const rowNode = gridApiIntake.getDisplayedRowAtIndex(rowIndex);
    const data = rowNode.data;
    
    if (!data.intakeId || data.intakeId === 0) {
        NotificationToast('warning', 'Vui lòng lưu dòng trước khi duyệt');
        return;
    }
    
    try {
        const response = await $.ajax({
            url: '/RubberIntake/Approve',
            type: 'POST',
            data: { intakeId: data.intakeId, status: status }
        });
        
        if (response.success) {
            data.status = status;
            data.statusText = arrValue.MsgProgress;
            gridApiIntake.applyTransaction({ update: [data] });
            RefeshSingleColumn(gridApiIntake, 'action');
            NotificationToast('success', 'Duyệt thành công');
        } else {
            NotificationToast('error', response.message || 'Duyệt thất bại');
        }
    } catch (error) {
        //console.error('Error approving row:', error);
        NotificationToast('error', 'Lỗi kết nối server');
    } finally {
        
    }
}

// Approve All
async function approveAll() {
    let str = "'Bạn có chắc muốn duyệt tất cả các bản ghi chưa duyệt?'";
    if (!await ToastConfirm(str)) {
        return;
    }
    
    
    
    try {
        const response = await $.ajax({
            url: '/RubberIntake/ApproveAll',
            type: 'POST',
            data: { status: 1 }
        });
        
        if (response.success) {
            NotificationToast('success', response.message);
            loadData();
        } else {
            NotificationToast('error', response.message || 'Duyệt thất bại');
        }
    } catch (error) {
        console.error('Error approving all:', error);
        NotificationToast('error', 'Lỗi kết nối server');
    } finally {
        
    }
}

// ========================================
// IMPORT/EXPORT EXCEL
// ========================================

// Import Excel
function importExcel() {
    document.getElementById('fileImport').click();
}

async function handleFileImport(event) {
    const file = event.files[0];
    if (!file) return;
    
    
    
    try {
        const data = await readExcelFile(file);
        
        if (data.length === 0) {
            NotificationToast('warning', 'File Excel không có dữ liệu');
            return;
        }
        
        // Map Excel data to model
        const importData = data.map(row => ({
            farmCode: row['Mã Nhà vườn'] || '',
            farmerName: row['Tên Nhà vườn'] || '',
            rubberKg: parseFloat(row['KL Mủ (kg)']) || 0,
            tscPercent: parseFloat(row['TSC (%)']) || 0,
            drcPercent: parseFloat(row['DRC (%)']) || 0,
            finishedProductKg: parseFloat(row['Thành phẩm (kg)']) || 0,
            centrifugeProductKg: parseFloat(row['Thành phẩm ly tâm (kg)']) || 0
        }));
        
        // Send to server
        const response = await $.ajax({
            url: '/RubberIntake/ImportExcel',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(importData)
        });
        
        if (response.success) {
            NotificationToast('success', response.message);
            loadData();
        } else {
            NotificationToast('error', response.message || 'Import thất bại');
        }
    } catch (error) {
        console.error('Error importing Excel:', error);
        NotificationToast('error', 'Lỗi khi đọc file Excel');
    } finally {
        
        event.value = '';  // Reset file input
    }
}

// Export Excel
async function exportExcel() {
    const agentCode = $('#cboAgent').val();
    const farmCode = $('#cboFarm').val();
    const orderCode = $('#cboOrder').val();
    const status = $('#cboStatus').val();
    
    try {
        const response = await $.ajax({
            url: '/RubberIntake/ExportExcel',
            type: 'POST',
            data: { agentCode, farmCode, orderCode, status }
        });
        
        if (response.success && response.data) {
            // Prepare data for export
            const exportData = response.data.map(row => ({
                'STT': row.rowNo,
                'Mã Intake': row.intakeCode,
                'Đại lý': row.agentCode,
                'Tên đại lý': row.agentName,
                'Mã Nhà vườn': row.farmCode,
                'Tên Nhà vườn': row.farmerName,
                'KL Mủ (kg)': row.rubberKg,
                'TSC (%)': row.tscPercent,
                'DRC (%)': row.drcPercent,
                'Thành phẩm (kg)': row.finishedProductKg,
                'Thành phẩm ly tâm (kg)': row.centrifugeProductKg,
                'Trạng thái': row.statusText,
                'Người cập nhật': row.timeDate_Person,
                'Thời gian': row.timeDate
            }));
            
            // Create workbook and export
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Cập nhật số liệu');
            
            // Generate filename
            const fileName = `CapNhatSoLieu_${new Date().toISOString().slice(0,10)}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            NotificationToast('success', 'Export Excel thành công');
        } else {
            NotificationToast('error', response.message || 'Export thất bại');
        }
    } catch (error) {
        console.error('Error exporting Excel:', error);
        NotificationToast('error', 'Lỗi kết nối server');
    } finally {
        
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function formatNumber(value, decimals = 0) {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}
// Update Row Numbers
function updateRowNumbers() {
    //let counter = 1;
    //gridApiIntake.forEachNodeAfterFilterAndSort(node => {
    //    node.setDataValue('rowNo', counter++);
    //});
}
// Fill Handle
function onCellValueChanged(event) {
    let rowIndex = event.node.rowIndex;
    let colDef = event.colDef.field;
    let isObjAgent = colDef == "agentCode";
    let isObjFarm = colDef == "farmCode";
    let objDataAgentOrFarm = isObjAgent ? arrValue.comboAgent : arrValue.comboFarmCode;
    // Kiểm tra nguồn thay đổi
    // kéo thả 
    if (event.source == "rangeSvc" || event.source === 'fillHandle') {
        // A. Nếu là kéo Fill: CHỈ LƯU, KHÔNG XỬ LÝ NGAY
        // Lưu thông tin cần thiết (ID, giá trị mới, tên cột...)
        if (isObjAgent || isObjFarm) {
            if (fillHandleBatch.length > 0) {
                if (isObjAgent) {
                    event.data.agentCode = fillHandleBatch[fillHandleBatch.length - fillHandleBatch.length].data.agentCode;
                }
                else if (isObjFarm) {
                    event.data.farmCode = fillHandleBatch[fillHandleBatch.length - fillHandleBatch.length].data.farmCode;
                }
            }
            else {//lần đầu thêm vào mảng
                if (isObjAgent) {
                    event.data.agentCode = objDataAgentOrFarm.find(x => x.text == event.newValue).value;
                }
                else if (isObjFarm) {
                    event.data.farmCode = objDataAgentOrFarm.find(x => x.text == event.newValue).value;
                }
            }
        }
        fillHandleBatch.push({
            rowIndex: rowIndex,
            colId: event.column.getId(),
            newValue: event.newValue,
            data: event.data // Dữ liệu của cả dòng
        });
        
    }
	else if (event.source == "edit") {// B. Nếu là edit trực tiếp: XỬ LÝ NGAY
        if (event.colDef.field == "agentCode") {
            event.data.agentName = objDataAgentOrFarm.filter(x => x.value == event.newValue)[objDataAgentOrFarm.length - objDataAgentOrFarm.length].text;
            event.data.agentCode = objDataAgentOrFarm.filter(x => x.value == event.newValue)[objDataAgentOrFarm.length - objDataAgentOrFarm.length].value;
           
        }
        if (event.colDef.field == "farmCode") {
            event.data.farmerName = objDataAgentOrFarm.filter(x => x.value == event.newValue)[objDataAgentOrFarm.length - objDataAgentOrFarm.length].text;
            event.data.farmCode = objDataAgentOrFarm.filter(x => x.value == event.newValue)[objDataAgentOrFarm.length - objDataAgentOrFarm.length].value;
        }
        gridApiIntake.applyTransaction({ update: [event.data] });
        saveRow(event.rowIndex);
    }
    
    //edit từng dòng
	// Cập nhật các trường liên quan
    if (event.colDef.field === 'rubberKg' || event.colDef.field === 'tscPercent') {
        const rubberKg = event.data.rubberKg || 0;
        const tscPercent = event.data.tscPercent || 0;
        
        if (rubberKg > 0 && tscPercent > 0) {
            event.data.finishedProductKg = Math.round((rubberKg * tscPercent / 100) * 100) / 100;
            gridApiIntake.applyTransaction({ update: [event.data] });
        }
        saveRow(event.rowIndex);
    }
    if (event.colDef.field == 'tscPercent') {
        //calcDRCPercent(e.data);
        event.data.drcPercent = event.data.tscPercent - 3;
        event.api.refreshCells({ rowNodes: [event.node], columns: ['drcPercent'], force: true });
    }
    if (['rubberKg', 'drcPercent'].includes(event.colDef.field)) {
        //calcFinish(event.data);
        //calcCentrifuge(event.data);
        event.data.finishedProductKg = +(num(event.data.rubberKg) * num(event.data.drcPercent) / 100).toFixed(3);
        event.data.centrifugeProductKg = +((num(event.data.rubberKg) * num(event.data.drcPercent) / 100) * 1.5).toFixed(3);

        event.api.refreshCells({ rowNodes: [event.node], columns: ['finishedProductKg'], force: true });
        event.api.refreshCells({ rowNodes: [event.node], columns: ['centrifugeProductKg'], force: true });
        saveRow(event.rowIndex);
    }
}
function onFillEnd(params) {
    // Kiểm tra xem có hàng đợi nào không
    if (fillHandleBatch.length > 0) {
        // --- XỬ LÝ 1 LẦN TẠI ĐÂY ---
        // Ví dụ: Gọi API saveBatch(fillHandleBatch)
        saveBatchRecords(fillHandleBatch);

        // Cực kỳ quan trọng: Reset mảng sau khi xử lý xong
        fillHandleBatch = [];
    }
}
// Save All
async function saveBatchRecords(fillHandleBatch) {
    if (fillHandleBatch.length === 0) {
        NotificationToast('warning', 'Không có dữ liệu để lưu');
        return;
    }
    let dataSaveBatch = fillHandleBatch.map(x => x.data);
    try {   
        const response = await $.ajax({
            url: '/RubberIntake/saveBatchRecords',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataSaveBatch.map(item => ({
                intakeId: item.intakeId,
                agentCode: item.agentCode,
                farmCode: item.farmCode,
                farmerName: item.farmerName,
                rubberKg: item.rubberKg,
                tscPercent: item.tscPercent,
                drcPercent: item.drcPercent,
                finishedProductKg: item.finishedProductKg,
                centrifugeProductKg: item.centrifugeProductKg,
                status: item.status
            })))
        });

        if (response.success) {
            NotificationToast('success', response.message);
            loadData();
        } else {
            NotificationToast('error', response.message || 'Lưu thất bại');
        }
    } catch (error) {
        console.error('Error saving all:', error);
        NotificationToast('error', 'Lỗi kết nối server');
    }
}
// Chuyển chuỗi sang số
const num = v => {
    const x = parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(x) ? x : 0;
};
//function onRowDragEnd(event) {
//    //updateRowNumbers();
//}

async function loadAllCombos() {
    try {
        const response = await $.ajax({
            url: '/Common/GetAllCombos',
            type: 'POST'
        });
        
        if (response.success) {
            arrValue.comboAgent = response.comboAgent;
            arrValue.comboFarmCode = response.comboFarmCode;
            arrValue.comboOrderCode = response.comboOrderCode;
			// Render combos
            RenderComboBox(arrValue.comboAgent, 'cboAgent', arrValue.selectFirst);
            RenderComboBox(arrValue.comboFarmCode, 'cboFarm', arrValue.selectFirst);
            RenderComboBox(arrValue.comboOrderCode, 'cboOrder', arrValue.selectFirst);
        }
    } catch (error) {

    }
}

function clearFilter() {
    $('#cboAgent').val('');
    $('#cboFarm').val('');
    $('#cboOrder').val('');
    $('#cboStatus').val('').trigger('change');
    $('#CboType').val('').trigger('change');
    loadData();
}

function reloadPage() {
    NotificationToast('success', 'Tải dữ liệu thành công');
    loadData();
    RegisterAllEvent();
}

function showLoading(show) {
    if (show) {
        // Show loading overlay
        $('body').append('<div class="loading-overlay"><div class="spinner-border text-primary"></div></div>');
    } else {
        // Hide loading overlay
        $('.loading-overlay').remove();
    }
}



function FilterType(dataType) {
    if (dataType == '1') {
        gridApiIntake.setColumnsVisible(['tscPercent'], true);
        gridApiIntake.setColumnsVisible(['finishedProductKg'], true);
        gridApiIntake.setColumnsVisible(['centrifugeProductKg'], false);
        gridApiIntake.setColumnsVisible(['drcPercent'], false);
    }
    else if (dataType == '2') {
        gridApiIntake.setColumnsVisible(['tscPercent'], false);
        gridApiIntake.setColumnsVisible(['drcPercent'], true);
        gridApiIntake.setColumnsVisible(['finishedProductKg'], true);
        gridApiIntake.setColumnsVisible(['centrifugeProductKg'], false);
    }
    else if (dataType == '3') {
        gridApiIntake.setColumnsVisible(['tscPercent'], true);
        gridApiIntake.setColumnsVisible(['centrifugeProductKg'], true);
        gridApiIntake.setColumnsVisible(['finishedProductKg'], false);
    }
    gridApiIntake.sizeColumnsToFit();
}
function CellRenderSelectNameByCode(params) {
    return params.colDef.field == 'agentCode' ? params.data.agentName : params.data.farmerName;
}

function RefeshSingleColumn(fieldName) {
    gridApiIntake.refreshCells({ force: true, columns: [fieldName] });
}

// Render Action Column
function CellRenderAction(params) {
    let strSave = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="saveRow(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;

    let strCancel = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="cancelRow(${params.node.rowIndex}, 'intakeCode')" title="Bỏ"><i class="ti ti-x f-20"></i></a>`;
    let strApprove = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="approveRow(${params.node.rowIndex},${arrValue.IdProgress})" title="${arrMsg.key_delete}"><i class="ti ti-arrow-back f-20"></i></a>`;
    let strDelete = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteRow(${params.node.rowIndex})" title="${arrMsg.key_delete}"><i class="ti ti-trash f-20"></i></a>`;
    const status = params.data.status == arrValue.IdFinish;

    // CHỈ hiện nút lưu khi chưa lưu
    if (params.data.intakeId === 0) {
        return strSave + strCancel;
    }
    else {
        if (status) {
            return strApprove;
        }
        else {
            return strDelete;
        }
    }
}
// Render Status Column
function CellRenderStatus(params) {
    let statusClass = '';
    if (params.data.status == arrValue.IdProgress) {
        statusClass = 'badge badge-warning';
    }
    else if (params.data.status == arrValue.IdFinish) {
        statusClass = 'badge badge-success';
    }
    return `<span class="${statusClass}">${params.data.statusText}</span>`;
}