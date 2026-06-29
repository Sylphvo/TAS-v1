//#region 1. GLOBAL VARIABLES & INITIALIZE PAGE
var gridApiLot;
let gridColumnApi;
let rowData = [];

function initLotPage() {
	gridApiLot = agGrid.createGrid(document.querySelector("#lotGrid"), gridOptions);
	gridApiDynamic = gridApiLot;
	// Setup event handlers
	setupEventHandlers();
	// Load initial data
	loadLots();
}
//#endregion

//#region 2. SETUP AG GRID & COLUMNS
var columnDefs = [
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
];

var gridOptions = CreateGridOption(columnDefs);

function onGridReady(params) {
	gridApiLot = params.api;
	gridColumnApi = params.columnApi;

	// Auto size columns
	gridApiLot.sizeColumnsToFit();
}
//#endregion

//#region 3. EVENT HANDLERS
function setupEventHandlers() {
	$('#btnRefresh').on('click', loadLots);
	$('#btnAdd').on('click', AddNewRow); // Đổi sang add dòng trực tiếp
	$('#btnExport').on('click', exportAllToExcel);
	$('#btnDeleteSelected').on('click', exportSelectedToExcel);

	$('#quickFilter').on('input', function () {
		gridApiLot.setGridOption('quickFilterText', $(this).val());
	});
}

function onCellValueChanged(event) {
	let rowIndex = event.node.rowIndex;
	let colDef = event.colDef.field;
	saveLot(rowIndex); // Sửa tạm: Nếu ở dưới dùng saveLot thì đổi thành saveLot thay vì saveOrder
}

function onSelectionChanged() {
	const count = gridApiLot.getSelectedRows().length;
	$('#selectedRecords').text(count > 0 ? `Đã chọn: ${count}` : "").toggle(count > 0);
	$('#btnDeleteSelected').prop('disabled', count < 2);
}

function onFillEnd(params) {
	return;
}
//#endregion

//#region 4. CRUD OPERATIONS (LOAD, ADD, SAVE, DELETE)
function loadLots(pageIndex, pageSize) {
	let strUrl = '/Lot/GetAllLots';
	let functionCallback = function (newPage, newSize) {
		loadLots(gridApiLot, newPage, newSize);
	};
	LoadDataAgGrid(gridApiLot, pageIndex, pageSize, strUrl, functionCallback);
}

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

function saveLot(rowIndex) {
	const rowNode = gridApiLot.getDisplayedRowAtIndex(rowIndex);
	const data = rowNode.data;
	UI.showLoading();

	$.ajax({
		url: `/Lot/AddOrUpdateLot`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(data),
		success: function (response) {
			if (response.success) {
				NotificationToast("success", response.message);
				loadLots();
			} else {
				NotificationToast("error", response.message);
			}
		},
		error: function (xhr, status, error) {
			NotificationToast("error", 'Lỗi khi lưu: ' + error);
		},
		complete: function () {
			UI.hideLoading();
		}
	});
}

function deleteLot(pondId) {
	if (!confirm('Bạn có chắc chắn muốn xóa hồ này?')) return;

	UI.showLoading();
	$.ajax({
		url: `/Lot/DeleteLot/${pondId}`,
		type: 'DELETE',
		success: function (response) {
			if (response.success) {
				NotificationToast("success", response.message);
				loadLots();
			} else {
				NotificationToast("error", response.message);
			}
		},
        complete: function () {
            UI.hideLoading();
        }
	});
}
//#endregion

//#region 5. EXCEL EXPORT
function exportAllToExcel() {
	UI.showLoading();

	$.ajax({
		url: '/Order/ExportToExcel', // Bạn có cần đổi URL này thành /Lot/ExportToExcel không?
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
			a.download = `Lots_${new Date().toISOString().split('T')[0]}.xlsx`; // Đã đổi tên file xuất ra thành Lots_
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
			UI.hideLoading();
		}
	});
}

function exportSelectedToExcel() {
	const selectedRows = gridApiLot.getSelectedRows(); // Đã sửa lỗi gridApiOrder thành gridApiLot
	if (selectedRows.length === 0) {
		NotificationToast("error", 'Vui lòng chọn ít nhất 1 hồ');
		return;
	}

	const orderIds = selectedRows.map(row => row.lotId); // Đã sửa từ orderId thành lotId

	UI.showLoading();

	$.ajax({
		url: '/Order/ExportToExcel', // Kiểm tra lại URL nhé
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
			a.download = `Lots_Selected_${new Date().toISOString().split('T')[0]}.xlsx`;
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
			UI.hideLoading();
		}
	});
}
//#endregion

//#region 6. UTILITIES & RENDERERS
function renderStatusBadge(status) {
	const statusMap = {
		1: { text: 'Sẵn sàng', class: 'badge-success' },
		2: { text: 'Đang sản xuất', class: 'badge-warning' },
		3: { text: 'Bảo trì', class: 'badge-danger' }
	};

	const statusInfo = statusMap[status] || { text: 'Không xác định', class: 'badge-secondary' };
	return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

function CellRenderAction(params) {
	// Define action buttons
	let strSave = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="saveLot(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;
	let strCancel = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="cancelRow(${params.node.rowIndex}, 'lotCode')" title="Bỏ"><i class="ti ti-x f-20"></i></a>`;
	let deleteLotBtn = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteLot(${params.data.lotId})" title="${arrMsg.key_delete}"><i class="ti ti-trash f-20"></i></a>`;
	// CHỈ hiện nút lưu khi chưa lưu
	return params.data.lotId === 0 ? `${strSave}${strCancel}` : `${deleteLotBtn}`;
}

function updateStatusBar(total) {
	$('#totalRecords').text(`Tổng: ${total} hồ`);
}

function updateLastUpdateTime() {
	$('#lastUpdate').text(`Cập nhật lần cuối: ${new Date().toLocaleTimeString('vi-VN')}`);
}



//#endregion