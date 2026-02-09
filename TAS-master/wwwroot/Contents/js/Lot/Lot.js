// ========================================
// POND.JS - Pond Management (Refactored)
// ========================================

let gridApiLot;
let gridColumnApi;
let rowData = [];
// ========================================
// INITIALIZE PAGE
// ========================================
function initLotPage() {
	gridApiLot = agGrid.createGrid(document.querySelector("#lotGrid"), gridOptions);
	// Setup AG Grid
	//setupGrid();

	// Setup event handlers
	setupEventHandlers();

	// Load initial data
	loadLots();

	// Load agents for dropdown
	//loadAgents();
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
		headerName: 'Mã hồ',
		field: 'lotCode',
		editable: true,
		minWidth: 150,
		cellRenderer: params => {
			return `<strong style="color: #2c3e50;">${params.value || ''}</strong>`;
		}
	},
	{
		headerName: 'Tên hồ',
		field: 'lotName',
		editable: true,
		width: 200
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
		}
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
		}
	},
	{
		headerName: 'Trạng thái',
		field: 'status',
		width: 150,
		cellRenderer: params => {
			return renderStatusBadge(params.value);
		}
	},
	{
		headerName: 'Thao tác',
		field: 'lotId',
		width: 150,
		pinned: 'right',
		cellRenderer: CellRenderAction,
		filter: false,
		sortable: false
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
	let isObjAgent = colDef == "agentCode";
	let isObjFarm = colDef == "farmCode";

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
	showLoading();
	// 1. Nếu không truyền pageIndex, mặc định là trang 1 (khi bấm nút Tìm kiếm)
	if (pageIndex) {
		arrConstant.currentPage = pageIndex;
	} else {
		arrConstant.currentPage = 1;
	}
	if (pageSize) {
		arrConstant.pageSize = pageSize;
	}
	// 2. Lấy giá trị từ các ô Filter trên màn hình
	var filterData = {
		PageIndex: arrConstant.currentPage,
		PageSize: arrConstant.PageSize,
		Keyword: $('#txtSearchKeyword').val(), // Lấy từ ô tìm kiếm
		Status: $('#ddlStatus').val(),         // Lấy từ dropdown trạng thái
		FromDate: $('#dtFromDate').val(),      // Lấy ngày bắt đầu
		ToDate: $('#dtToDate').val()           // Lấy ngày kết thúc
	};

	$.ajax({
		url: '/Lot/GetAllLots',
		type: 'GET',
		data: filterData, // Gửi object filter lên controller
		success: function (response) {
			if (response.success) {
				// response.data lúc này là object PagedResult { items: [...], totalRecords: 100 }
				var pagedResult = response.data;
				rowData = pagedResult.items;

				gridApiLot.setGridOption('rowData', rowData);

				updateStatusBar(rowData.length);
				// 5. [Quan trọng] Xử lý phân trang UI (Nếu bạn dùng phân trang tùy chỉnh)
				// Quan trọng: Truyền hàm callback để khi bấm nút nó gọi lại loadOrders
				renderServerPagination(
					'divPagingContainer',     // ID thẻ div chứa thanh phân trang
					pagedResult.totalRecords, // Tổng số bản ghi (Server trả về)
					arrConstant.currentPage,            // Trang hiện tại
					arrConstant.pageSize,               // Size hiện tại
					function (newPage, newSize) {
						// Callback: Khi người dùng bấm Next/Prev/Change Size -> Gọi lại hàm load này
						loadPonds(newPage, newSize);
					}
				);
				updateLastUpdateTime();
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

// ========================================
// ACTION RENDERER (Giống Order.js)
// ========================================
function CellRenderAction(params) {
	// Define action buttons
	let strSave = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="saveLot(${params.node.rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;
	let strCancel = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="cancelRow(${params.node.rowIndex})" title="Bỏ"><i class="ti ti-x f-20"></i></a>`;
	let deleteLot = `<a href="#" class=" avtar-xs btn-link-secondary" onclick="deleteLot(${params.data.orderId})" title="${arrMsg.key_delete}"><i class="ti ti-trash f-20"></i></a>`;
	// CHỈ hiện nút lưu khi chưa lưu
	return params.data.orderId === 0 ? `${strSave}${strCancel}` : `${deleteLot}`;
}

// ========================================
// SHOW ADD ROW (Thêm trực tiếp vào Grid)
// ========================================
function AddNewRow() {
	const newItem = {
		lotId: 0,
		lotCode: "",
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
	AddNewRowAggrid(gridApiLot, rowData, newItem, 'selected', 0);
}

function cancelRow(rowIndex) {
	const objectData = gridApiLot.getDisplayedRowAtIndex(rowIndex).data;
	rowData = rowData.filter(item => item.lotCode !== objectData.lotCode);
	gridApiLot.setGridOption('rowData', rowData);
}
// ========================================
// SAVE POND (Inline)
// ========================================
function savePondInline(rowIndex) {
	const rowNode = gridApiLot.getDisplayedRowAtIndex(rowIndex);
	const data = rowNode.data;

	if (!data.pondCode || !data.pondName) {
		NotificationToast("error", "Vui lòng nhập Mã và Tên hồ");
		return;
	}

	showLoading();
	$.ajax({
		url: data.pondId === 0 ? '/Lot/CreateLot' : '/Lot/UpdateLot',
		type: data.pondId === 0 ? 'POST' : 'PUT',
		contentType: 'application/json',
		data: JSON.stringify(data),
		success: function (response) {
			if (response.success) {
				NotificationToast("success", response.message);
				loadPonds();
			} else {
				NotificationToast("error", response.message);
			}
		},
		complete: hideLoading
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
				loadPonds();
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
