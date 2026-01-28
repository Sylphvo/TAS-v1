// ========================================
// GLOBAL VARIABLES
// ========================================

var ListDataFull;
let rowData = [];
let fillHandleBatch = [];
var arrValue = {
    IdProgress: 0, // Đang xử lý
    MsgProgress: arrMsg.key_chuaduyet, // Đã tạo đơn hàng
    IdFinish: 1, // Đang xử lý
    MsgFinish: arrMsg.key_hoanthanh, // Đã tạo đơn hàng

    typeExcel: 1, // Xuất Excel Data
    typeSampleExcel: 2, // Xuất Excel Mẫu

    comboAgent: [], // combo đại lý
    comboFarmCode: [], // combo thông tin nhà vườn
    comboOrderCode: [], // combo đơn hàng
    selectFirst: true,
    loadFirst: false
};
var agentByCode = {};
var farmByCode = {};



// ========================================
// AG GRID CONFIGURATION
// ========================================

const gridOptions = {
    // Column Definitions
    columnDefs: [
        {
            headerName:'',
            field: 'selected',
            headerCheckboxSelection: true,
            checkboxSelection: true,
            width: 50,
            minWidth: 50,
            maxWidth: 50,
            pinned: 'left',
            lockPinned: true,
            suppressMovable: true,
            filter: false,
        },
        {
            headerName: 'STT',
            field: 'rowNo',
            minWidth: 50,
            width: 50,
            pinned: 'left',
            //suppressMenu: true,
            cellStyle: cellStyle_Col_Model_EventActual,
            rowDrag: true,
            filter: false,
            //checkboxSelection: true,          // checkbox từng dòng
            //headerCheckboxSelection: true,    // checkbox chọn tất cả
            //headerCheckboxSelectionFilteredOnly: true, // chỉ chọn những dòng đang filter
        },
        //{
        //    headerName: 'Mã Intake',
        //    field: 'intakeCode',
        //    width: 170,
        //    minWidth: 170,
        //    editable: true,
        //    filter: 'agTextColumnFilter',
        //    cellStyle: cellStyle_Col_Model_EventActual
        //},
        //{
        //    headerName: 'Mã đại lý',
        //    field: 'agentCode',
        //    width: 200,
        //    editable: true,
        //    cellEditor: SelectEditorWithTextDisplay,
        //    filter: 'agTextColumnFilter',
        //    cellStyle: cellStyle_Col_Model_EventActual
        //},
        //{
        //    headerName: 'Tên đại lý',
        //    field: 'agentName',
        //    width: 180,
        //    editable: false,
        //    filter: 'agTextColumnFilter',
        //    cellStyle: cellStyle_Col_Model_EventActual
        //},
        {
            headerName: 'Tên đại lý',
            field: 'agentCode',
            cellEditor: SelectEditorWithTextDisplay,
            editable: true,
            filter: 'agTextColumnFilter',
            cellStyle: cellStyle_Col_Model_EventActual,
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.data.agentName;
            }
        },
        {
            headerName: 'Tên Nhà Vườn',
            field: 'farmCode',
            cellEditor: SelectEditorWithTextDisplay,
            editable: true,
            filter: 'agTextColumnFilter',
            cellStyle: cellStyle_Col_Model_EventActual,
            valueFormatter: (params) => {
                if (!params.value) return '';
                return params.data.farmerName;
            }
        },
        //{
        //    headerName: 'Tên Nhà vườn',
        //    field: 'farmerName',
        //    width: 200,
        //    editable: true,
        //    filter: 'agTextColumnFilter',
        //    cellStyle: cellStyle_Col_Model_EventActual
        //},
        {
            headerName: 'KL Mủ (kg)',
            field: 'rubberKg',
            width: 120,
            editable: true,
            type: 'numericColumn',
            valueFormatter: params => formatNumber(params.value),
            cellStyle: cellStyle_Col_Model_EventActual
        },
        {
            headerName: 'TSC',
            field: 'tscPercent',
            width: 100,
            editable: true,
            type: 'numericColumn',
            valueFormatter: params => formatNumber(params.value, 2),
            cellStyle: cellStyle_Col_Model_EventActual
        },
        {
            headerName: 'DRC',
            field: 'drcPercent',
            width: 100,
            editable: true,
            type: 'numericColumn',
            valueFormatter: params => formatNumber(params.value, 2),
            cellStyle: cellStyle_Col_Model_EventActual
        },
        {
            headerName: 'Thành phẩm',
            field: 'finishedProductKg',
            width: 150,
            editable: true,
            type: 'numericColumn',
            valueFormatter: params => formatNumber(params.value),
            cellStyle: cellStyle_Col_Model_EventActual
        },
        {
            headerName: 'Thành Phẩm Ly Tâm',
            field: 'centrifugeProductKg',
            width: 170,
            editable: true,
            type: 'numericColumn',
            valueFormatter: params => formatNumber(params.value),
            cellStyle: cellStyle_Col_Model_EventActual
        },
        {
            headerName: 'Trạng thái',
            field: 'statusText',
            width: 120,
            editable: false,
            cellRenderer: params => {
                const status = params.data.status;
                let badgeClass = 'badge-secondary';
                
                switch (status) {
                    case 0: badgeClass = 'badge-warning'; break;
                    case 1: badgeClass = 'badge-success'; break;
                }
                
                return `<span class="badge ${badgeClass}">${params.value}</span>`;
            },
            cellStyle: cellStyle_Col_Model_EventActual
        },
        {
            headerName: 'Người cập nhật',
            field: 'timeDate_Person',
            width: 130,
            editable: false,
            cellStyle: cellStyle_Col_Model_EventActual,
			hide: true
        },
        {
            headerName: 'Thời gian',
            field: 'timeDate',
            width: 150,
            editable: false,
            cellStyle: cellStyle_Col_Model_EventActual
        },
        {
            headerName: 'Thao tác',
            field: 'action',
            width: 150,
            pinned: 'right',
            cellRenderer: params => {
                let html = '';
                const status = params.data.status;
                // CHỈ hiện nút lưu khi chưa lưu
                if (params.data.intakeId === 0) {
                    html += `
                       <a href="#" class=" avtar-xs btn-link-secondary" onclick="saveRow(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>
                       <a href="#" class=" avtar-xs btn-link-secondary" onclick="cancelRow(${params.node.rowIndex})" title="Bỏ"><i class="ti ti-x f-20"></i></a>
                    `;
                }
                else {
                    if (status == arrValue.IdFinish) {
                        html += `<a href="#" class=" avtar-xs btn-link-secondary" onclick="approveRow(${params.node.rowIndex},${arrValue.IdProgress})" title="${arrMsg.key_delete}"><i class="ti ti-arrow-back f-20"></i></a>`;
                    }
                    else {
                        html += `<a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteRow(${params.node.rowIndex})" title="${arrMsg.key_delete}"><i class="ti ti-trash f-20"></i></a>`;
                    }
                }
                return html;
                    
            },
            suppressMenu: true,
            suppressMovable: true,
            cellStyle: cellStyle_Col_Model_EventActual,
            filter: false
        }
    ],
    //sideBar: true,
    // Default Column Definition
	rowSelection: 'multiple',// Chọn nhiều dòng
	defaultColDef: {// Áp dụng cho tất cả các cột
		sortable: true,// Cho phép sắp xếp cột
		filter: true,// Cho phép lọc cột
		resizable: true,// Cho phép thay đổi kích thước cột
		floatingFilter: true,// Hiện ô lọc bên dưới header
		suppressMenu: false,// Hiện menu lọc
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
	rowHeight: 45,// Độ cao dòng
	headerHeight: 45,// Độ cao header
	suppressRowClickSelection: true,// Click row không chọn

    
    // Events
	onGridReady: onGridReady,// Load Data
	onCellValueChanged: onCellValueChanged,// Edit Cell
	onRowDragEnd: onRowDragEnd,// Drag and Drop

	singleClickEdit: false,// Double click to edit
    onFillEnd: onFillEnd // Fill Handle
    
};


function RegisterAllEvent() {
    $('.ag-header-select-all:not(.ag-hidden)').on('click', function (e) {
        let IsChecked = $(this).find('.ag-input-field-input');
        if (IsChecked.prop('checked')) {
            gridApiIntake.deselectAll();
        } else {
            gridApiIntake.selectAll(); // chọn tất cả
        }
    });
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
async function loadData() {
    const agentCode = $('#cboAgent').val();
    const farmCode = $('#cboFarm').val();
    const orderCode = $('#cboOrder').val();
    const status = $('#cboStatus').val();
    
    try {
        const response = await $.ajax({
            url: '/RubberIntake/GetAllIntakes',
            type: 'POST',
            data: { agentCode, farmCode, orderCode, status }
        });
        
        if (response.success) {
            rowData = response.data;
            gridApiIntake.setGridOption('rowData', rowData);
            updateRowNumbers(); // Update row numbers
            renderPagination(agPaging, gridApiIntake, rowData, IsOptionAll);  // Render pagination
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
function generateIntakeCode() {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    const randomPart = crypto
        .getRandomValues(new Uint32Array(1))[0]
        .toString(16)
        .toUpperCase();

    return `INT_${datePart}_${randomPart}`;
}

// Add New Row
function addNewRow() {
    const newRow = {
        intakeId: 0,
        intakeCode: generateIntakeCode(),
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
    
    gridApiIntake.applyTransaction({ add: [newRow], addIndex: rowData.length });
    rowData.push(newRow);
    //BẮT BUỘC
    RefeshSingleColumn('action');
    updateRowNumbers();
    
    //NotificationToast('info', 'Đã thêm dòng mới. Hãy nhập thông tin và lưu.');
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
        updateRowNumbers();
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
            updateRowNumbers();
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
        updateRowNumbers();
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
            updateRowNumbers();
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
            RefeshSingleColumn('action');
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
        console.log(`Kéo xong! Đang xử lý 1 lần cho ${fillHandleBatch.length} dòng...`);

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
function onRowDragEnd(event) {
    updateRowNumbers();
}

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

function cellStyle_Col_Model_EventActual(params) {
    let cellAttr = {};
    cellAttr['text-align'] = 'center';
    return cellAttr;
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