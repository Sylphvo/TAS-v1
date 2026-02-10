// ========================================
// AGENT.JS - Agent Management (Refactored)
// ========================================

let gridApiAgent;
let gridColumnApi;
let rowData = [];

// ========================================
// INITIALIZE PAGE
// ========================================
function initPageAgent() {
	gridApiAgent = agGrid.createGrid(document.querySelector("#agentGrid"), gridOptions);
	// Setup event handlers
	setupEventHandlers();

	// Load initial data
	loadAgents();
}

// ========================================
// SETUP AG GRID
// ========================================
var columnDefs = [
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
	},
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
		cellRenderer: params => `<strong>${params.value || ''}</strong>`
	},
	{
		headerName: 'Tên đại lý',
		field: 'agentName',
		editable: true,
		width: 200
	},
	{
		headerName: 'Địa chỉ',
		field: 'agentAddress',
		editable: true,
		width: 200
	},
	{
		headerName: 'Số điện thoại',
		field: 'agentPhone',
		editable: true,
		width: 150
	},
	{
		headerName: 'Trạng thái',
		field: 'isActive',
		width: 150,
		cellRenderer: params => {
			const statusClass = params.data.statusClass || 'secondary';
			const statusName = params.data.statusName || 'N/A';
			return `<span class="badge bg-${statusClass}">${statusName}</span>`;
		}
	}
];
var gridOptions = CreateGridOption(columnDefs);
function onGridReady(params) {
	gridApiAgent = params.api;
	gridColumnApi = params.columnApi;

	// Auto size columns
	gridApiAgent.sizeColumnsToFit();
}
function onCellValueChanged(event) {
	let rowIndex = event.node.rowIndex;
	let colDef = event.colDef.field;
	let isObjAgent = colDef == "agentCode";
	let isObjFarm = colDef == "farmCode";

}
function onFillEnd(params) {
	return;
}

// ========================================
// ACTION RENDERER (Giống Order.js)
// ========================================
function CellRenderAction(params) {
	let strSave = `<a href="#" class="avtar-xs btn-link-secondary" onclick="saveAgentInline(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;
	let strCancel = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="cancelRow(${gridApiAgent}, ${params.node.rowIndex}, ${params.data.agentCode})" title="Bỏ"><i class="ti ti-x f-20"></i></a>`;	
	let deleteAgent = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteLot(${params.data.agentId})" title="${arrMsg.key_delete}"><i class="ti ti-trash f-20"></i></a>`;
	// CHỈ hiện nút lưu khi chưa lưu
	return params.data.agentId == 0 ? `${strSave}${strCancel}` : `${deleteAgent}`;
}

// ========================================
// LOAD DATA WITH PAGINATION
// ========================================
function loadAgents(pageIndex, pageSize) {
	let strUrl = '/Agent/GetAgentsWithFilter';
	let functionCallback = function (newPage, newSize) {
		loadAgents(gridApiAgent, newPage, newSize);
	};
	LoadDataAgGrid(gridApiAgent, pageIndex, pageSize, strUrl, functionCallback);
}

// ========================================
// INLINE ACTIONS
// ========================================
function AddNewRow() {
	const newItem = {
		agentId: 0,
		agentCode: '',
		agentName: '',
		address: '',
		phone: '',
		status: 1,
		statusName: 'Hoạt động',
		statusClass: 'success'
	};
	AddNewRowAggrid(gridApiAgent, rowData, newItem, 'selected', 0);
}

function saveAgentInline(rowIndex) {
	const rowNode = gridApiAgent.getDisplayedRowAtIndex(rowIndex);
	const data = rowNode.data;

	if (!data.agentCode || !data.agentName) {
		NotificationToast('warning', 'Vui lòng nhập đầy đủ Mã và Tên đại lý');
		return;
	}

	$.ajax({
		url: '/Agent/SaveAgent',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(data),
		success: function (res) {
			if (res.success) {
				NotificationToast('success', 'Lưu thành công');
				loadAgents(currentPage);
			} else {
				NotificationToast('error', res.message);
			}
		}
	});
}

// ========================================
// EVENT HANDLERS
// ========================================
function setupEventHandlers() {
	$('#btnRefresh').on('click', loadAgents);
	$('#btnAdd').on('click', AddNewRow);

	$('#quickFilter').on('input', function () {
		// Debounce search
		clearTimeout(window.searchTimer);
		window.searchTimer = setTimeout(() => loadAgents(1), 500);
	});
}

// ========================================
// UTILS
// ========================================
function onSelectionChanged() {
	const count = gridApiAgent.getSelectedRows().length;
	$('#selectedRecords').text(count > 0 ? `Đã chọn: ${count}` : "").toggle(count > 0);
}

function updateStatusBar(total) {
	$('#totalRecords').html(`Tổng: <strong>${total}</strong> đại lý`);
	$('#lastUpdate').text(`Cập nhật: ${new Date().toLocaleTimeString('vi-VN')}`);
}


function showLoading() { /* Logic hiện loading */ }
function hideLoading() { /* Logic ẩn loading */ }