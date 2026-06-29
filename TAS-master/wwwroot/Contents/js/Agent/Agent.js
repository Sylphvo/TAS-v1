//#region 1. GLOBAL VARIABLES & INITIALIZE PAGE
let gridApiAgent;
let gridColumnApi;
let rowData = [];

function initPageAgent() {
	gridApiAgent = agGrid.createGrid(document.querySelector("#agentGrid"), gridOptions);
	gridApiDynamic = gridApiAgent; // Đồng bộ biến toàn cục nếu dùng chung hàm tiện ích

	// Setup event handlers
	setupEventHandlers();

	// Load initial data
	loadAgents();
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
		headerName: 'Mã đại lý',
		field: 'agentCode',
		editable: params => params.data.agentId === 0, // Chỉ cho sửa mã khi thêm mới
		minWidth: 150,
		cellRenderer: params => `<strong>${params.value || ''}</strong>`,
		suppressFillHandle: false
	},
	{
		headerName: 'Tên đại lý',
		field: 'agentName',
		editable: true,
		width: 200,
		suppressFillHandle: false
	},
	{
		headerName: 'Địa chỉ',
		field: 'address',
		editable: true,
		width: 250,
		suppressFillHandle: false
	},
	{
		headerName: 'Số điện thoại',
		field: 'phone',
		editable: true,
		width: 150,
		suppressFillHandle: false
	},
	{
		headerName: 'Email',
		field: 'email',
		editable: true,
		width: 180,
		suppressFillHandle: false
	},
	{
		headerName: 'Ghi chú',
		field: 'notes',
		editable: true,
		width: 200,
		cellEditor: 'agLargeTextCellEditor',
		cellEditorPopup: true,
		suppressFillHandle: false
	},
	{
		headerName: 'Trạng thái',
		field: 'status',
		width: 150,
		cellRenderer: params => renderStatusBadge(params.value),
		suppressFillHandle: false
	}
];

var gridOptions = CreateGridOption(columnDefs);

function onGridReady(params) {
	gridApiAgent = params.api;
	gridColumnApi = params.columnApi;
	// Auto size columns
	gridApiAgent.sizeColumnsToFit();
}
//#endregion

//#region 3. EVENT HANDLERS
function setupEventHandlers() {
	$('#btnRefresh').on('click', loadAgents);
	$('#btnAdd').on('click', AddNewRow);
	$('#btnExport').on('click', exportAllToExcel);
	$('#btnExportSelected').on('click', exportSelectedToExcel);

	$('#quickFilter').on('input', function () {
		// Debounce search
		clearTimeout(window.searchTimer);
		window.searchTimer = setTimeout(() => loadAgents(1), 500);
	});
}

function onSelectionChanged() {
	const count = gridApiAgent.getSelectedRows().length;
	$('#selectedRecords').text(count > 0 ? `Đã chọn: ${count}` : "").toggle(count > 0);
	$('#btnExportSelected').prop('disabled', count === 0);
}

function onCellValueChanged(event) {
	let rowIndex = event.node.rowIndex;
	saveAgent(rowIndex);
}

function onFillEnd(params) {
	return;
}
//#endregion

//#region 4. CRUD OPERATIONS (LOAD, ADD, SAVE, DELETE)
function loadAgents(pageIndex, pageSize) {
	let strUrl = '/Agent/GetAllAgents';
	let functionCallback = function (newPage, newSize) {
		loadAgents(newPage, newSize);
	};
	LoadDataAgGrid(gridApiAgent, pageIndex, pageSize, strUrl, functionCallback);
}

function AddNewRow() {
	const newItem = {
		agentId: 0,
		agentCode: generateUniqueCodeCore(rowData, 'DL', 'agentCode'), // Prefix DL cho Đại Lý
		agentName: "",
		address: "",
		phone: "",
		email: "",
		notes: "",
		status: 1
	};
	AddNewRowAggrid(gridApiAgent, rowData, newItem, 'selected', rowData.length);
	RefeshSingleColumn(gridApiAgent, 'selected');
}

function saveAgent(rowIndex) {
	const rowNode = gridApiAgent.getDisplayedRowAtIndex(rowIndex);
	const data = rowNode.data;

	if (!data.agentCode || !data.agentName) {
		NotificationToast('warning', 'Vui lòng nhập đầy đủ Mã và Tên đại lý');
		return;
	}

	if (typeof showLoading === 'function') showLoading();

	$.ajax({
		url: '/Agent/SaveAgent',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(data),
		success: function (res) {
			if (res.success) {
				NotificationToast('success', 'Lưu thành công');
				loadAgents();
			} else {
				NotificationToast('error', res.message);
			}
		},
		complete: function () {
			if (typeof hideLoading === 'function') hideLoading();
		}
	});
}

function deleteAgent(agentId) {
	if (!confirm('Bạn có chắc chắn muốn xóa đại lý này?')) return;

	if (typeof showLoading === 'function') showLoading();
	$.ajax({
		url: `/Agent/DeleteAgent/${agentId}`,
		type: 'DELETE',
		success: function (response) {
			if (response.success) {
				NotificationToast("success", response.message || "Xóa thành công");
				loadAgents();
			} else {
				NotificationToast("error", response.message);
			}
		},
		complete: function () {
			if (typeof hideLoading === 'function') hideLoading();
		}
	});
}
//#endregion

//#region 5. EXCEL EXPORT
function exportAllToExcel() {
	if (typeof showLoading === 'function') showLoading();

	$.ajax({
		url: '/Agent/ExportToExcel',
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
			a.download = `Agents_${new Date().toISOString().split('T')[0]}.xlsx`;
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
			if (typeof hideLoading === 'function') hideLoading();
		}
	});
}

function exportSelectedToExcel() {
	const selectedRows = gridApiAgent.getSelectedRows();
	if (selectedRows.length === 0) {
		NotificationToast("error", 'Vui lòng chọn ít nhất 1 đại lý');
		return;
	}

	const agentIds = selectedRows.map(row => row.agentId);

	if (typeof showLoading === 'function') showLoading();

	$.ajax({
		url: '/Agent/ExportToExcel',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(agentIds),
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
			a.download = `Agents_Selected_${new Date().toISOString().split('T')[0]}.xlsx`;
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
			if (typeof hideLoading === 'function') hideLoading();
		}
	});
}
//#endregion

//#region 6. UTILITIES & RENDERERS
function renderStatusBadge(status) {
	const statusMap = {
		1: { text: 'Hoạt động', class: 'badge-success' },
		0: { text: 'Ngừng hoạt động', class: 'badge-danger' }
	};
	const statusInfo = statusMap[status] || { text: 'Không xác định', class: 'badge-secondary' };
	return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

function CellRenderAction(params) {
	let strSave = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="saveAgent(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;
	let strCancel = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="cancelRow(${params.node.rowIndex}, 'agentCode')" title="Bỏ"><i class="ti ti-x f-20"></i></a>`;
	let deleteBtn = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteAgent(${params.data.agentId})" title="${typeof arrMsg !== 'undefined' ? arrMsg.key_delete : 'Xóa'}"><i class="ti ti-trash f-20"></i></a>`;

	// CHỈ hiện nút lưu khi chưa lưu
	return params.data.agentId === 0 ? `${strSave}${strCancel}` : `${deleteBtn}`;
}

function updateStatusBar(total) {
	$('#totalRecords').text(`Tổng: ${total} đại lý`);
}

function updateLastUpdateTime() {
	$('#lastUpdate').text(`Cập nhật lần cuối: ${new Date().toLocaleTimeString('vi-VN')}`);
}
//#endregion