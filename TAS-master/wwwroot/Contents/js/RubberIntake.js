// ========================================
// GLOBAL VARIABLES
// ========================================
let gridApiIntake, gridColumnApi;
var ListDataFull;
let rowData = [];
var arrValue = {
    statusInProgress: 0, // Đang xử lý
    //statusHandle: 1,// Đã Xử lý
    statusConfirmOrder: 1, // Đã tạo đơn hàng
    contentInProgress: 'Đang xử lý',
    //contentHandle: 'Đã Xử lý',
    contentConfirmOrder: 'Đã tạo đơn hàng',

    typeExcel: 1, // Xuất Excel Data
    typeSampleExcel: 2, // Xuất Excel Mẫu

    comboAgent: [], // combo đại lý
    comboFarmCode: [], // combo thông tin nhà vườn
    comboOrderCode: [], // combo đơn hàng
    selectFirst: true

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
            headerName: 'STT',
            field: 'rowNo',
            minWidth: 70,
            pinned: 'left',
            suppressMenu: true,
            cellStyle: cellStyle_Col_Model_EventActual,
            rowDrag: true,
            filter: false,
            checkboxSelection: true,          // checkbox từng dòng
            headerCheckboxSelection: true,    // checkbox chọn tất cả
            headerCheckboxSelectionFilteredOnly: true, // chỉ chọn những dòng đang filter
        },
        {
            headerName: 'Mã Intake',
            field: 'intakeCode',
            width: 170,
            minWidth: 170,
            editable: true,
            filter: 'agTextColumnFilter',
            cellStyle: cellStyle_Col_Model_EventActual
        },
        {
            headerName: 'Đại lý',
            field: 'agentCode',
            width: 100,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            filter: 'agTextColumnFilter',
            cellStyle: cellStyle_Col_Model_EventActual,
            cellEditorParams: () => ({
                values: arrValue.comboAgent.map(f => f.value),
                allowTyping: true,
                searchType: 'matchAny',
                cellRenderer: (p) => {
                    const f = agentByCode[p.value];
                    return f ? `${f.value} - ${f.text}` : p.value;
                }
            }),
        },
        {
            headerName: 'Tên đại lý',
            field: 'agentName',
            width: 180,
            editable: false,
            filter: 'agTextColumnFilter',
            cellStyle: cellStyle_Col_Model_EventActual
        },
        {
            headerName: 'Mã Nhà vườn',
            field: 'farmCode',
            width: 150,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: []  // Will be populated from ComboFarmCode
            },
            filter: 'agTextColumnFilter',
            cellStyle: cellStyle_Col_Model_EventActual,
            cellEditorParams: () => ({
                values: arrValue.comboFarmCode.map(f => f.value),
                allowTyping: true,
                searchType: 'matchAny',
                cellRenderer: (p) => {
                    const f = farmByCode[p.value];
                    return f ? `${f.value} - ${f.text}` : p.value;
                }
            }),
        },
        {
            headerName: 'Tên Nhà vườn',
            field: 'farmerName',
            width: 200,
            editable: true,
            filter: 'agTextColumnFilter',
            cellStyle: cellStyle_Col_Model_EventActual
        },
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
            headerName: 'TSC (%)',
            field: 'tscPercent',
            width: 100,
            editable: true,
            type: 'numericColumn',
            valueFormatter: params => formatNumber(params.value, 2),
            cellStyle: cellStyle_Col_Model_EventActual
        },
        {
            headerName: 'Thành phẩm (kg)',
            field: 'finishedProductKg',
            width: 140,
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
                    case 1: badgeClass = 'badge-info'; break;
                    case 2: badgeClass = 'badge-primary'; break;
                    case 3: badgeClass = 'badge-success'; break;
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
            cellStyle: cellStyle_Col_Model_EventActual
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
            width: 150,
            pinned: 'right',
            cellRenderer: params => {
                return `
                    <button class="btn btn-sm btn-primary" onclick="saveRow(${params.node.rowIndex})" title="Lưu">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="approveRow(${params.node.rowIndex})" title="Duyệt">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRow(${params.node.rowIndex})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
            },
            suppressMenu: true,
            suppressMovable: true,
            cellStyle: cellStyle_Col_Model_EventActual,
            filter: false
        }
    ],

    // Default Column Definition
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: true,
        suppressMenu: false,

    },

    // Grid Options
    rowSelection: 'multiple',
    rowDragManaged: true,
    rowDragEntireRow: true,
    animateRows: true,
    enableRangeSelection: true,
    enableCellTextSelection: true,
    //pagination: true,
    paginationPageSize: 50,
    paginationPageSizeSelector: [20, 50, 100, 200],
    rowHeight: 45,
    headerHeight: 45,
    
    // Events
    onGridReady: onGridReady,
    onCellValueChanged: onCellValueChanged,
    onRowDragEnd: onRowDragEnd
};


function RegisterCheckAll() {
    $('.ag-header-select-all:not(.ag-hidden)').on('click', function (e) {
        let IsChecked = $(this).find('.ag-input-field-input');
        if (IsChecked.prop('checked')) {
            gridApiIntake.deselectAll();
        } else {
            gridApiIntake.selectAll(); // chọn tất cả
        }
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
    //showLoading(true);
    
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
            
            // Update row numbers
            updateRowNumbers();
            
            //NotificationToast('success', 'Tải dữ liệu thành công');
        } else {
            //NotificationToast('error', response.message || 'Lỗi khi tải dữ liệu');
        }
		// Render pagination
        renderPagination(agPaging, gridApiIntake, rowData, IsOptionAll);
    } catch (error) {
        console.error('Error loading data:', error);
        //NotificationToast('error', 'Lỗi kết nối server');
    } finally {
        //showLoading(false);
    }
}

// ========================================
// CRUD OPERATIONS
// ========================================

// Add New Row
function addNewRow() {
    const newRow = {
        intakeId: 0,
        intakeCode: '',
        agentCode: '',
        agentName: '',
        farmCode: '',
        farmerName: '',
        rubberKg: 0,
        tscPercent: 0,
        finishedProductKg: 0,
        status: 0,
        statusText: 'Chưa duyệt',
        timeDate_Person: '',
        timeDate: ''
    };
    
    gridApiIntake.applyTransaction({ add: [newRow], addIndex: rowData.length });
    updateRowNumbers();
    
    NotificationToast('info', 'Đã thêm dòng mới. Hãy nhập thông tin và lưu.');
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
    
    showLoading(true);
    
    try {
        const response = await $.ajax({
            url: '/RubberIntake/AddOrUpdate',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                intakeId: data.intakeId || 0,
                intakeCode: data.intakeCode,
                farmCode: data.farmCode,
                farmerName: data.farmerName,
                rubberKg: data.rubberKg,
                tscPercent: data.tscPercent,
                finishedProductKg: data.finishedProductKg,
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
            reloadPage();
        } else {
            NotificationToast('error', response.message || 'Lưu thất bại');
        }

    } catch (error) {
        console.error('Error saving row:', error);
        NotificationToast('error', 'Lỗi kết nối server');
    } finally {
        showLoading(false);
    }
}

// Save All
async function saveAll() {
    const allData = [];
    gridApiIntake.forEachNode(node => {
        if (node.data.intakeId > 0) {  // Only update existing rows
            allData.push(node.data);
        }
    });
    
    if (allData.length === 0) {
        NotificationToast('warning', 'Không có dữ liệu để lưu');
        return;
    }
    
    if (!confirm(`Bạn có chắc muốn lưu ${allData.length} bản ghi?`)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await $.ajax({
            url: '/RubberIntake/SaveAll',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(allData.map(item => ({
                intakeId: item.intakeId,
                farmCode: item.farmCode,
                farmerName: item.farmerName,
                rubberKg: item.rubberKg,
                tscPercent: item.tscPercent,
                finishedProductKg: item.finishedProductKg,
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
    } finally {
        showLoading(false);
    }
}

// Delete Single Row
async function deleteRow(rowIndex) {
    if (!confirm('Bạn có chắc muốn xóa dòng này?')) {
        return;
    }
    
    const rowNode = gridApiIntake.getDisplayedRowAtIndex(rowIndex);
    const data = rowNode.data;
    
    // If new row (no intakeId), just remove from grid
    if (!data.intakeId || data.intakeId === 0) {
        gridApiIntake.applyTransaction({ remove: [data] });
        updateRowNumbers();
        NotificationToast('success', 'Đã xóa dòng');
        return;
    }
    
    showLoading(true);
    
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
        showLoading(false);
    }
}

// Delete Selected Rows
async function deleteSelected() {
    const selectedRows = gridApiIntake.getSelectedRows();
    
    if (selectedRows.length === 0) {
        NotificationToast('warning', 'Vui lòng chọn các dòng cần xóa');
        return;
    }
    
    if (!confirm(`Bạn có chắc muốn xóa ${selectedRows.length} dòng đã chọn?`)) {
        return;
    }
    
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
    
    showLoading(true);
    
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
        console.error('Error deleting multiple:', error);
        NotificationToast('error', 'Lỗi kết nối server');
    } finally {
        showLoading(false);
    }
}

// Approve Row
async function approveRow(rowIndex) {
    const rowNode = gridApiIntake.getDisplayedRowAtIndex(rowIndex);
    const data = rowNode.data;
    
    if (!data.intakeId || data.intakeId === 0) {
        NotificationToast('warning', 'Vui lòng lưu dòng trước khi duyệt');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await $.ajax({
            url: '/RubberIntake/Approve',
            type: 'POST',
            data: { intakeId: data.intakeId, status: 1 }
        });
        
        if (response.success) {
            data.status = 1;
            data.statusText = 'Chờ xử lý';
            gridApiIntake.applyTransaction({ update: [data] });
            NotificationToast('success', 'Duyệt thành công');
        } else {
            NotificationToast('error', response.message || 'Duyệt thất bại');
        }
    } catch (error) {
        console.error('Error approving row:', error);
        NotificationToast('error', 'Lỗi kết nối server');
    } finally {
        showLoading(false);
    }
}

// Approve All
async function approveAll() {
    if (!confirm('Bạn có chắc muốn duyệt tất cả các bản ghi chưa duyệt?')) {
        return;
    }
    
    showLoading(true);
    
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
        showLoading(false);
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
    const file = event.target.files[0];
    if (!file) return;
    
    showLoading(true);
    
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
            finishedProductKg: parseFloat(row['Thành phẩm (kg)']) || 0
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
        showLoading(false);
        event.target.value = '';  // Reset file input
    }
}

// Export Excel
async function exportExcel() {
    showLoading(true);
    
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
                'Thành phẩm (kg)': row.finishedProductKg,
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
        showLoading(false);
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

function updateRowNumbers() {
    let counter = 1;
    //gridApiIntake.forEachNodeAfterFilterAndSort(node => {
    //    node.setDataValue('rowNo', counter++);
    //});
}

function onCellValueChanged(event) {
    if (event.colDef.field == "agentCode" || event.colDef.field == "farmCode") {
        if (event.colDef.field == "agentCode") {
            let objData = arrValue.comboAgent.filter(x => x.value == event.newValue)
            event.data.agentName = objData[objData.length - 1].text;
        }
        else if (event.colDef.field == "farmCode") {
            let objData = arrValue.comboFarmCode.filter(x => x.value == event.newValue)
            event.data.farmerName = objData[objData.length - 1].text;
        }
        gridApiIntake.applyTransaction({ update: [event.data] });
    }
    
    // Auto calculate finishedProductKg if rubberKg or tscPercent changed
    if (event.colDef.field === 'rubberKg' || event.colDef.field === 'tscPercent') {
        const rubberKg = event.data.rubberKg || 0;
        const tscPercent = event.data.tscPercent || 0;
        
        if (rubberKg > 0 && tscPercent > 0) {
            event.data.finishedProductKg = Math.round((rubberKg * tscPercent / 100) * 100) / 100;
            gridApiIntake.applyTransaction({ update: [event.data] });
        }
    }
}

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
    $('#cboStatus').val('');
    loadData();
}

function reloadPage() {
    loadData();
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