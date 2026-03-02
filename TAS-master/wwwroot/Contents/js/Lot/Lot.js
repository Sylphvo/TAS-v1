// ========================================
// POND.JS - Pond Management (Refactored)
// ========================================

var gridApiLot;
let gridColumnApi;
let rowData = [];
// ========================================
// INITIALIZE PAGE
// ========================================
function initLotPage() {
	gridApiLot = agGrid.createGrid(document.querySelector("#lotGrid"), gridOptions);
	gridApiDynamic = gridApiLot;
	// Setup event handlers
	setupEventHandlers();
	// Load initial data
	loadLots();
}

// ========================================
// SETUP AG GRID
// ========================================
var columnDefs =  [
	{
		headerName: 'Số thứ tự',
		field: 'rowNo',
		minWidth: 50,
		width: 110,
	},
	{
		headerName: 'Mã hồ',
		field: 'lotCode',
		editable: true,
		minWidth: 150,
		cellRenderer: params => {
			return `<strong style="color: #2c3e50;">${params.value || ''}</strong>`;
		},
		filter: 'agTextColumnFilter',
		suppressFillHandle: false // Cho phép Fill Handle
	},
	{
		headerName: 'Tên hồ',
		field: 'lotName',
		editable: true,
		width: 200,
		filter: 'agTextColumnFilter',
		suppressFillHandle: false // Cho phép Fill Handle
	},
	{
		headerName: 'Dung tích (kg)',
		field: 'capacityKg',
		editable: true,
		width: 140,
		type: 'numericColumn',
		valueFormatter: params => {
			if (params.value == null) return '0.00';
			return Number(params.value).toLocaleString('vi-VN', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
		},
		suppressFillHandle: false // Cho phép Fill Handle
	},
	{
		headerName: 'Khối lượng hiện tại (kg)',
		field: 'currentNetKg',
		width: 190,
		type: 'numericColumn',
		valueFormatter: params => {
			if (params.value == null) return '0.00';
			return Number(params.value).toLocaleString('vi-VN', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
		},
		suppressFillHandle: false // Cho phép Fill Handle
	},
	{
		headerName: 'Trạng thái',
		field: 'status',
		width: 150,
		cellRenderer: params => {
			return renderStatusBadge(params.value);
		}
	}
] ;
var gridOptions = CreateGridOption(columnDefs);
function onGridReady(params) {
	gridApiLot = params.api;
	gridColumnApi = params.columnApi;

	// Auto size columns
	gridApiLot.sizeColumnsToFit();
}
function onCellValueChanged(event) {
	let rowIndex = event.node.rowIndex;
	let colDef = event.colDef.field;
	saveOrder(rowIndex);
}
function onFillEnd(params) {
	return;
}
// ========================================
// RENDER STATUS BADGE
// ========================================
function renderStatusBadge(status) {
	const statusMap = {
		1: { text: 'Sẵn sàng', class: 'badge-success' },
		2: { text: 'Đang sản xuất', class: 'badge-warning' },
		3: { text: 'Bảo trì', class: 'badge-danger' }
	};

	const statusInfo = statusMap[status] || { text: 'Không xác định', class: 'badge-secondary' };
	return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// ========================================
// SETUP EVENT HANDLERS
// ========================================
function setupEventHandlers() {
	$('#btnRefresh').on('click', loadLots);
	$('#btnAdd').on('click', AddNewRow); // Đổi sang add dòng trực tiếp
	$('#btnExport').on('click', exportAllToExcel);
	$('#btnExportSelected').on('click', exportSelectedToExcel);

	$('#quickFilter').on('input', function () {
		gridApiLot.setGridOption('quickFilterText', $(this).val());
	});
}

// ========================================
// LOAD PONDS
// ========================================
function loadLots(pageIndex, pageSize) {
	let strUrl = '/Lot/GetAllLots';
	let functionCallback = function (newPage, newSize) {
		loadLots(gridApiLot, newPage, newSize);
	};
	LoadDataAgGrid(gridApiLot, pageIndex, pageSize, strUrl, functionCallback);
}

// ========================================
// ACTION RENDERER (Giống Order.js)
// ========================================
function CellRenderAction(params) {
	// Define action buttons
	let strSave = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="saveLot(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;
	let strCancel = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="cancelRow(${params.node.rowIndex}, 'lotCode')" title="Bỏ"><i class="ti ti-x f-20"></i></a>`;
	let deleteLot = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteLot(${params.data.lotId})" title="${arrMsg.key_delete}"><i class="ti ti-trash f-20"></i></a>`;
	// CHỈ hiện nút lưu khi chưa lưu
	return params.data.lotId === 0 ? `${strSave}${strCancel}` : `${deleteLot}`;
}

// ========================================
// SHOW ADD ROW (Thêm trực tiếp vào Grid)
// ========================================
function AddNewRow() {
	const newItem = {
		lotId: 0,
		lotCode: generateUniqueCodeCore(rowData, arrConstant.PrefixLot, 'lotCode'),
		lotName: "",
		capacityKg: 0,
		dailyCapacityKg: 0,
		currentNetKg: 0,
		status: 1,
		createdBy: "", // Có thể gán tên user đang login
		createdDate: new Date(), // Ngày tạo là ngay bây giờ
		updateBy: null,
		updateDate: null
	};
	AddNewRowAggrid(gridApiLot, rowData, newItem, 'selected', rowData.length);
	RefeshSingleColumn(gridApiLot, 'selected');
}

// ========================================
// SAVE ORDER
// ========================================
function saveOrder(rowIndex) {
	const rowNode = gridApiOrder.getDisplayedRowAtIndex(rowIndex);
	const data = rowNode.data;
	showLoading();

	$.ajax({
		url: `/Order/AddOrUpdateOrder`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(data),
		success: function (response) {
			if (response.success) {
				NotificationToast("success", response.message);
				loadOrders();
			} else {
				NotificationToast("error", response.message);
			}
		},
		error: function (xhr, status, error) {
			NotificationToast("error", 'Lỗi khi lưu: ' + error);
		},
		complete: function () {
			hideLoading();
		}
	});
}

// ========================================
// DELETE POND
// ========================================
function deleteLot(pondId) {
	if (!confirm('Bạn có chắc chắn muốn xóa hồ này?')) return;

	showLoading();
	$.ajax({
		url: `/Lot/DeletePond/${pondId}`,
		type: 'DELETE',
		success: function (response) {
			if (response.success) {
				NotificationToast("success", response.message);
				//loadLots();
			} else {
				NotificationToast("error", response.message);
			}
		},
		complete: hideLoading
	});
}

// ========================================
// UTILS
// ========================================
function onSelectionChanged() {
	const count = gridApiLot.getSelectedRows().length;
	$('#selectedRecords').text(count > 0 ? `Đã chọn: ${count}` : "").toggle(count > 0);
	$('#btnExportSelected').prop('disabled', count === 0);
}

function updateStatusBar(total) {
	$('#totalRecords').text(`Tổng: ${total} hồ`);
}

function updateLastUpdateTime() {
	$('#lastUpdate').text(`Cập nhật lần cuối: ${new Date().toLocaleTimeString('vi-VN')}`);
}

function showLoading() { console.log('Loading...'); }
function hideLoading() { console.log('Complete'); }

// ========================================
// EXPORT TO EXCEL
// ========================================
function exportAllToExcel() {
	showLoading();

	$.ajax({
		url: '/Order/ExportToExcel',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify([]),
		xhrFields: {
			responseType: 'blob'
		},
		headers: {
			'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
		},
		success: function (blob) {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			NotificationToast("success", 'Xuất Excel thành công');
		},
		error: function (xhr, status, error) {
			console.error('Export error:', error);
			NotificationToast("error", 'Lỗi khi xuất Excel');
		},
		complete: function () {
			hideLoading();
		}
	});
}

function exportSelectedToExcel() {
	const selectedRows = gridApiOrder.getSelectedRows();
	if (selectedRows.length === 0) {
		NotificationToast("error", 'Vui lòng chọn ít nhất 1 đơn hàng');
		return;
	}

	const orderIds = selectedRows.map(row => row.orderId);

	showLoading();

	$.ajax({
		url: '/Order/ExportToExcel',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(orderIds),
		xhrFields: {
			responseType: 'blob'
		},
		headers: {
			'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
		},
		success: function (blob) {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `Orders_Selected_${new Date().toISOString().split('T')[0]}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			NotificationToast("success", 'Xuất Excel thành công');
		},
		error: function (xhr, status, error) {
			console.error('Export error:', error);
			NotificationToast("error", 'Lỗi khi xuất Excel');
		},
		complete: function () {
			hideLoading();
		}
	});
}
