// ========================================
// GLOBAL VARIABLES
// ========================================
let gridApiIntake;
let gridColumnApi;
let rowData = [];

// ========================================
// AG GRID CONFIGURATION
// ========================================
const gridOptions = {
    // Column Definitions
    columnDefs: [
        {
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 50,
            pinned: 'left',
            suppressMenu: true,
            suppressMovable: true
        },
        {
            headerName: 'STT',
            field: 'rowNo',
            width: 70,
            pinned: 'left',
            suppressMenu: true,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: 'Mã Intake',
            field: 'intakeCode',
            width: 150,
            editable: false,
            filter: 'agTextColumnFilter'
        },
        {
            headerName: 'Đại lý',
            field: 'agentCode',
            width: 100,
            editable: false,
            cellEditor: 'agSelectCellEditor',
            filter: 'agTextColumnFilter'
        },
        {
            headerName: 'Tên đại lý',
            field: 'agentName',
            width: 180,
            editable: false,
            filter: 'agTextColumnFilter'
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
            cellStyle: { backgroundColor: '#fff3cd' }
        },
        {
            headerName: 'Tên Nhà vườn',
            field: 'farmerName',
            width: 200,
            editable: true,
            filter: 'agTextColumnFilter',
            cellStyle: { backgroundColor: '#fff3cd' }
        },
        {
            headerName: 'KL Mủ (kg)',
            field: 'rubberKg',
            width: 120,
            editable: true,
            type: 'numericColumn',
            valueFormatter: params => formatNumber(params.value),
            cellStyle: { textAlign: 'right', backgroundColor: '#fff3cd' }
        },
        {
            headerName: 'TSC (%)',
            field: 'tscPercent',
            width: 100,
            editable: true,
            type: 'numericColumn',
            valueFormatter: params => formatNumber(params.value, 2),
            cellStyle: { textAlign: 'right', backgroundColor: '#fff3cd' }
        },
        {
            headerName: 'Thành phẩm (kg)',
            field: 'finishedProductKg',
            width: 140,
            editable: true,
            type: 'numericColumn',
            valueFormatter: params => formatNumber(params.value),
            cellStyle: { textAlign: 'right', backgroundColor: '#fff3cd' }
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
            }
        },
        {
            headerName: 'Người cập nhật',
            field: 'timeDate_Person',
            width: 130,
            editable: false
        },
        {
            headerName: 'Thời gian',
            field: 'timeDate',
            width: 150,
            editable: false
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
            suppressMovable: true
        }
    ],

    // Default Column Definition
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: true,
        suppressMenu: false
    },

    // Grid Options
    rowSelection: 'multiple',
    rowDragManaged: true,
    rowDragEntireRow: true,
    animateRows: true,
    enableRangeSelection: true,
    enableCellTextSelection: true,
    pagination: true,
    paginationPageSize: 50,
    paginationPageSizeSelector: [20, 50, 100, 200],
    
    // Events
    onGridReady: onGridReady,
    onCellValueChanged: onCellValueChanged,
    onRowDragEnd: onRowDragEnd
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const gridDiv = document.querySelector('#myGrid');
    gridApiIntake = agGrid.createGrid(gridDiv, gridOptions);
    
    // Load initial data
    loadData();
    
    // Setup filter change events
    setupFilterEvents();
});

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
    showLoading(true);
    
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
            
            NotificationToast('success', 'Tải dữ liệu thành công');
        } else {
            NotificationToast('error', response.message || 'Lỗi khi tải dữ liệu');
        }
    } catch (error) {
        console.error('Error loading data:', error);
        NotificationToast('error', 'Lỗi kết nối server');
    } finally {
        showLoading(false);
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
    
    gridApiIntake.applyTransaction({ add: [newRow], addIndex: 0 });
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
    gridApiIntake.forEachNodeAfterFilterAndSort(node => {
        node.setDataValue('rowNo', counter++);
    });
}

function onCellValueChanged(event) {
    console.log('Cell value changed:', event.colDef.field, event.newValue);
    
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
    console.log('Row drag ended');
    updateRowNumbers();
}

function setupFilterEvents() {
    $('#cboAgent').on('change', function() {
        const agentCode = $(this).val();
        if (agentCode) {
            loadFarmsByAgent(agentCode);
        } else {
            loadAllCombos();
        }
    });
}

async function loadFarmsByAgent(agentCode) {
    try {
        const response = await $.ajax({
            url: '/RubberIntake/GetFarmsByAgent',
            type: 'POST',
            data: { agentCode }
        });
        
        if (response.success) {
            const $cboFarm = $('#cboFarm');
            $cboFarm.empty();
            $cboFarm.append('<option value="">-- Tất cả --</option>');
            
            response.data.forEach(item => {
                $cboFarm.append(`<option value="${item.value}">${item.text}</option>`);
            });
        }
    } catch (error) {
        console.error('Error loading farms by agent:', error);
    }
}

async function loadAllCombos() {
    try {
        const response = await $.ajax({
            url: '/RubberIntake/GetAllCombos',
            type: 'POST'
        });
        
        if (response.success) {
            // Update combo farm
            const $cboFarm = $('#cboFarm');
            $cboFarm.empty();
            $cboFarm.append('<option value="">-- Tất cả --</option>');
            
            response.comboFarmCode.forEach(item => {
                $cboFarm.append(`<option value="${item.value}">${item.text}</option>`);
            });
        }
    } catch (error) {
        console.error('Error loading combos:', error);
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

function NotificationToast(type, message) {
    // Using Toastr or custom notification
    if (typeof toastr !== 'undefined') {
        toastr[type](message);
    } else {
        alert(message);
    }
}
