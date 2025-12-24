

var sortData = { sortColumnEventActual: '', sortOrderEventActual: '' }
var gridOptionsInformationGarden, ListDataFull;
var page = 1;
var pageSize = 20;
var gridApi;
var pagerApi;

function CreateGridInformationGarden() {
	gridOptionsInformationGarden = {
		//pagination: true,
		paginationPageSize: 100,
		columnDefs: CreateColModelInformationGarden(),
		defaultColDef: {
			width: 170,
			filter: true,
			floatingFilter: true,
		},
		rowHeight: 45,//
		headerHeight: 45,// 
		rowData: [],
		rowDragManaged: true,
		rowDragMultiRow: true,
		rowSelection: 'multiple',         // cho phép chọn nhiều hàng
		suppressRowClickSelection: true, // cho phép click hàng để chọn
		animateRows: true,
		singleClickEdit: true,
		components: {
			//customFloatingFilterInput: getFloatingFilterInputComponent(),
			//customheader: CustomHeaderInformationGarden,
		},
		cellSelection: true,
		onGridReady: function (params) {
			gridApi = params.api;
			params.api.sizeColumnsToFit();
		},
		rowDragManaged: true,
		onRowDragEnd() {
			persistCurrentPageOrder();          // rows đã đúng thứ tự bạn vừa kéo
		},
		onCellValueChanged: e => {
			UpdateDataAfterEdit(0, e.data);
		},
		enableRangeSelection: true,
		allowContextMenuWithControlKey: true, // giữ Ctrl + click phải vẫn hiện
		suppressContextMenu: false, // cho phép hiện menu ag-Grid

	};
	const eGridDiv = document.querySelector(InformationGarden);
	gridApi = agGrid.createGrid(eGridDiv, gridOptionsInformationGarden);

	CreateRowDataInformationGarden();
	resizeGridInformationGarden();
}
function resizeGridInformationGarden() {
	setTimeout(function () {
		setWidthHeightGrid(25);
	}, 100);
}
function setWidthHeightGrid(heithlayout) {
	//gridOptionsInformationGarden.api.sizeColumnsToFit();
	//var heigh = $(window).height() - $('.top_header').outerHeight() - $('.dm_group.dmg-shortcut').outerHeight() - ($('.col-xl-12').outerHeight() + heithlayout);
	//$(myGrid).css('height', heigh);
	//gridOptions.api.sizeColumnsToFit({
	//	defaultMinWidth: 100,
	//	columnLimits: [{ key: "DESCRIPTION", minWidth: 200 }],
	//});
}
function RefreshAllGridWhenChangeData() {
	//ShowHideLoading(true, InformationGarden);
	setTimeout(function () {
		CreateRowDataInformationGarden();
	}, 1);
}
function CreateRowDataInformationGarden() {
	var listSearchInformationGarden = {

	};
	$.ajax({
		async: true,
		type: 'POST',
		url: "/InformationGarden/InformationGardens",
		data: listSearchInformationGarden,
		dataType: "json",
		success: function (data) {
			ListDataFull = data;
			gridApi.setGridOption("rowData", data);
			renderPagination(agPaging, IsOptionAll);
		}
	});
}
function CreateColModelInformationGarden() {
	var columnDefs = [
		{
			field: 'rowNo'
			, headerName: 'Số thứ tự'
			, width: 90
			, minWidth: 90
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: false
			, filter: false
			, floatingFilterComponent: 'customFloatingFilterInput'
			, floatingFilterComponentParams: { suppressFilterButton: true }
			, headerComponent: "customHeader"
			//, cellRenderer: cellRender_StartDate			
		},
		{
			field: 'farmCode'
			, headerName: 'Mã Nhà Vườn'
			, width: 110
			, minWidth: 110
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: true
			, floatingFilterComponent: 'customFloatingFilterInput'
			, floatingFilterComponentParams: { suppressFilterButton: true }
			, headerComponent: "customHeader"
			//, cellRenderer: cellRender_StartDate
			, cellEditorParams: () => ({
				values: listComboFarmCode.map(f => f.farmCode),
				allowTyping: true,
				searchType: 'matchAny',
				cellRenderer: (p) => {
					const f = farmByCode[p.value];
					return f ? `${f.farmCode} - ${f.farmerName}` : (p.value ?? '');
				}
			})
			, filter: "agTextColumnFilter"
		},
		{
			field: 'agentCode'
			, headerName: 'Mã đại lý'
			, width: 110
			, minWidth: 110
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: true
			, filter: true
			, cellEditor: 'agSelectCellEditor'
			, popupPosition: 'under'
			, headerComponent: "customHeader"
			//, cellRenderer: cellRender_StartDate
			, cellEditorParams: () => ({
				values: ListAgent.map(f => f.agentCode),
				allowTyping: true,
				searchType: 'matchAny',
				cellRenderer: (p) => {
					const f = farmByCode[p.value];
					return f ? `${f.agentCode} - ${f.agentName}` : (p.value ?? '');
				}
			})
			, filter: "agTextColumnFilter"
		},
		{
			field: 'farmerName'
			, headerName: 'Tên nhà vườn'
			, width: 200
			, minWidth: 200
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: true
			, filter: "agTextColumnFilter"
			, floatingFilterComponent: 'customFloatingFilterInput'
			, floatingFilterComponentParams: { suppressFilterButton: true }
			, headerComponent: "customHeader"
			//, cellRenderer: cellRender_StartDate
		},
		{
			field: 'farmAddress'
			, headerName: 'Địa chỉ'
			, width: 200
			, minWidth: 200
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: true
			, filter: "agTextColumnFilter"
			//, cellRenderer: cellRender_StartDate
			, headerComponent: "customHeader"
		},
		{
			field: 'totalAreaHa'
			, headerName: 'Tổng diện tích (ha)'
			, width: 110
			, minWidth: 110
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: true
			, filter: "agTextColumnFilter"
			//, cellRenderer: cellRender_StartDate
			, headerComponent: "customHeader"
		},
		{
			field: 'rubberAreaHa'
			, headerName: 'Diện tích (ha)'
			, width: 110
			, minWidth: 110
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: true
			, filter: "agTextColumnFilter"
			//, cellRenderer: cellRender_StartDate
			, headerComponent: "customHeader"
		},
		{
			field: 'totalExploit'
			, headerName: 'Tổng Khai thác (kg)'
			, width: 110
			, minWidth: 110
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: true
			, filter: "agTextColumnFilter"
			//, cellRenderer: cellRender_StartDate
			, headerComponent: "customHeader"
		},
		{
			field: 'isActive'
			, headerName: 'Trạng thái hoạt động'
			, width: 110
			, minWidth: 110
			, cellStyle: { 'text-align': 'center' }
			, editable: false
			, filter: false
			, cellRenderer: function (params) {
				if (params.value == 0) {
					return '<span class="badge text-bg-primary">không hoạt động</span>';
				}
				if (params.value == 1) {
					return '<span class="badge text-bg-success">đang hoạt động</span>';
				}
			}
			, headerComponent: "customHeader"
		},
		{
			field: 'polygon'
			, headerName: 'Vị trí'
			, width: 70
			, minWidth: 70
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: false
			, filter: false
			, cellRenderer: cellRender_Polygon
			, headerComponent: "customHeader"
		},
		{
			field: 'certificates'
			, headerName: 'Giấy phép'
			, width: 110
			, minWidth: 110
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: false
			, filter: false
			, cellRenderer: cellRender_Certificates
			, headerComponent: "customHeader"
		},
		{
			field: 'updateTime'
			, headerName: 'Thời gian tạo'
			, width: 130
			, minWidth: 130
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: false
			, filter: "agTextColumnFilter"
			//, cellRenderer: cellRender_StartDate
			, headerComponent: "customHeader"
		},
		{
			field: 'updateBy'
			, headerName: 'Người tạo'
			, width: 100
			, minWidth: 100
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: false
			, filter: "agTextColumnFilter"
			//, cellRenderer: cellRender_StartDate
			, headerComponent: "customHeader"
		},
		{
			field: 'action', headerName: 'Chức năng', width: 160, minWidth: 160
			, cellStyle: cellStyle_Col_Model_EventActual
			, editable: false
			, filter: false
			, editType: 'fullRow'
			, headerComponent: "customHeader"
			, cellRenderer: ActionRenderer
		}

	]
	return columnDefs;
}
function cellRender_Polygon(params) {
	var classDisabled = !IsNullOrEmpty(params.value) ? '' : 'disabled';
	const wrap = document.createElement('div');
	wrap.innerHTML =		
		`<button class="button_action_custom avtar avtar-xs btn-light-info js-cancel btn ` + classDisabled +`" title="Xem vị trí">
			<i class="ti ti-external-link f-20"></i>
		</button>
	`;
	const btnCancel = wrap.querySelector('.js-cancel');
	btnCancel.addEventListener('click', (e) => {
		e.stopPropagation();
		var JsonGeo = `{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"ShippingId":1737627042558,"LotId":["1737124950403","1737124924398","1737158423720","1737624502416","1737125653061","1737158620410","1737159110176","1737159271473","1737159514814","1737159610691","1737159700941","1737159736051","1737159815354","1737159872604","1737159981484","1737124676191","1737124790626","1737124835812","1737124867606","1737158830250","1737158956444","1737159499039","1737159585487","1737159750697","1732171471327","1731982756751","1731986093610","1731889631296","1731892168355","1731894549836","1731896529438","1731899530484","1731901261706","1731914155420","1731918407992","1731815897732","1731826396406","1731812656181","1731975027072","1731808709767","1732008756567","1731805846309","1731636233388","1731749309961","1731738154319","1731743152030","1731643025271","1731744232652","1731744320709","1731746559460"],"OriginID":1726111852397,"Area":` + params.data.totalAreaHa + `,"ProductName":"` + params.data.farmerName + `","Quantity":[` + params.data.totalExploit + `],"ProducerName":"` + params.data.agentName + `","ProducerCountry":"VN","ProducerCountryEnglish":"Vietnam","ProductionPlace":"` + params.data.agentAddress + `","ProductionDate":["2025-01-17","2025-01-17","2025-01-18","2025-01-23","2025-01-17","2025-01-18","2025-01-18","2025-01-18","2025-01-18","2025-01-18","2025-01-18","2025-01-18","2025-01-18","2025-01-18","2025-01-18","2025-01-17","2025-01-17","2025-01-17","2025-01-17","2025-01-18","2025-01-18","2025-01-18","2025-01-18","2025-01-18","2024-11-21","2024-11-19","2024-11-19","2024-11-18","2024-11-18","2024-11-18","2024-11-18","2024-11-18","2024-11-18","2024-11-18","2024-11-18","2024-11-17","2024-11-17","2024-11-17","2024-11-19","2024-11-17","2024-11-19","2024-11-17","2024-11-15","2024-11-16","2024-11-16","2024-11-16","2024-11-15","2024-11-16","2024-11-16","2024-11-16"],"Species":"Hevea brasiliensis"},"geometry":{"type":"Polygon","coordinates":[[[106.48031529039143,11.672824226397438],[106.47832844406366,11.672461079639662],[106.47682406008244,11.671988265788558],[106.47526871412992,11.671704248747448],[106.47423304617405,11.67143270848358],[106.47306594997644,11.67126984986648],[106.4723675698042,11.671105677776653],[106.47173020988703,11.67104000891352],[106.46991435438395,11.67088995550289],[106.46847367286682,11.670899805838683],[106.46818365901709,11.671291520575076],[106.46831374615431,11.672564835904677],[106.46830368787052,11.673760000209326],[106.46868355572224,11.674152039246689],[106.46858129650353,11.675219144371612],[106.46821618080139,11.675700817862786],[106.4680854231119,11.675965787177027],[106.4680042862892,11.676314810806723],[106.46813068538906,11.676995126534145],[106.46837878972292,11.677882949180981],[106.46850485354663,11.67850120565384],[106.46864030510187,11.679137519160474],[106.46882336586714,11.680269943454594],[106.46707355976105,11.681109162416698],[106.4671603962779,11.681391528162786],[106.46751210093498,11.681616107225178],[106.46783597767354,11.681894532476754],[106.46819371730089,11.682431353958707],[106.46816622465848,11.682640172309265],[106.47083200514317,11.682338436308727],[106.4721704274416,11.682233698708336],[106.47331573069096,11.682129289399569],[106.47477719932795,11.682082666362183],[106.47610019892454,11.681815732905633],[106.47988881915808,11.681889279172717],[106.48038368672132,11.672917803920724],[106.48031529039143,11.672824226397438]]]},"id":` + params.data.farmId + `}]}`;

		if (!JsonGeo) {
			alert("Chưa có JSON.");
			return;
		}
		let geo;
		try {
			geo = JSON.parse(JsonGeo);
		} catch (e) {
			alert("JSON không hợp lệ.");
			return;
		}
		const zoom = asZoom();
		const url = buildUrlWithData(geo, zoom);
		if (url.length > 1800000) {
			alert(
				'JSON quá lớn. Hãy lưu JSON ở 1 URL public và dùng nút "Mở với URL file".'
			);
			return;
		}
		openUrl(url);
	});
	return wrap;
}
function cellRender_Certificates(params) {
	return `<a href="#">` + params.value + `<a>`;
}
function ActionRenderer(params) {
	const wrap = document.createElement('div');
	wrap.innerHTML =
	``
	+
	(params.data.isActive == 0 ?
		` <button class="button_action_custom avtar avtar-xs btn-light-success js-change_isActive" title="đổi trạng thái hoạt động">
        <i class="ti ti-check f-20"></i>
    </button>`
		:
		`<button class="button_action_custom avtar avtar-xs btn-light-danger js-change_isActive" title="đổi trạng thái hoạt động">
        <i class="ti ti-x f-20"></i>
    </button>`)
	+
	`
	<div class="box_polygon">
	<label for="importExcelPolygon_`+ params.data.farmId + `" class="button_action_custom avtar avtar-xs btn-light-primary btn_custom"><i class="ti ti-upload f-20"></i></label>
    <input type="file" id="importExcelPolygon_`+ params.data.farmId + `" class="import_polygon"  data-id="`+ params.data.farmId + `" data-rowIndex="` + params.node.rowIndex+`" hidden>
    <span id="file-name" class="ms-2 d-none"></span>
	</div>
	
	<button class="button_action_custom avtar avtar-xs btn-light-danger js-delete" title="Xóa dòng">
      <i class="ti ti-trash f-20"></i>
    </button>
	`;
	const btnUpload = wrap.querySelector('.import_polygon');
	const btnDelete = wrap.querySelector('.js-delete');
	['mousedown', 'click', 'dblclick', 'contextmenu'].forEach(ev => {
		btnUpload.addEventListener(ev, e => e.stopPropagation(), { capture: true });
	});
	if (params.data.isActive == 0) {
		const btnChangeIsActive = wrap.querySelector('.js-change_isActive');
		btnChangeIsActive.addEventListener('click', (e) => {
			ApproveDataFarm(params.data.farmId, 1);
		});
	}
	else {
		const btnChangeIsActive = wrap.querySelector('.js-change_isActive');
		btnChangeIsActive.addEventListener('click', (e) => {
			ApproveDataFarm(params.data.farmId, 0);
		});
	}
	// cho phép chọn lại cùng 1 file	
	btnUpload.addEventListener('change', async e => {
		e.preventDefault();
		const file = e.target.files && e.target.files[0];
		const farmId = $(e.target).attr('data-id');
		if (!file) return;
		try {
			await readExcelAsDataa(file);
			async function readExcelAsDataa(file, opts = {}) {
				const buf = await file.arrayBuffer();
				const wb = XLSX.read(buf, { type: 'array', cellDates: true });
				const ws = wb.Sheets[wb.SheetNames[0]];
				// Ma trận 2D
				const matrix = XLSX.utils.sheet_to_json(ws, {
					header: 1, raw: true, defval: null, blankrows: false
				});
				// Lọc bỏ các dòng trống sau tiêu đề
				const body = matrix.slice(1).filter(r => (r || []).some(c => c !== null && String(c).trim() !== ''));
				var rowDatas = {};
				rowDatas.polygon = JSON.stringify(body);
				rowDatas.farmId = farmId;

				$.ajax({
					async: true,
					method: 'POST',
					url: "/InformationGarden/ImportPolygon",
					contentType: 'application/json',
					data: JSON.stringify(rowDatas),
					success: function (res) {
						Toast.fire({
							icon: "success",
							title: "Import polygon thành công"
						});
						RefreshAllGridWhenChangeData();
					},
					error: function () {
						Toast.fire({
							icon: "danger",
							title: "Lỗi khi import polygon!"
						});
					}
				});
			}
		} catch (err) {
			console.error(err);
		} finally {
			// cho lần sau, kể cả cùng file
			btnUpload.value = '';
		}
	});
	btnDelete.addEventListener('click', (e) => {
		// e.stopPropagation();
		Swal.fire({
			title: 'Xóa dòng này?',
			icon: "error",
			showDenyButton: false,
			showCancelButton: true,
			confirmButtonText: `Lưu`,
			showCloseButton: true
		}).then((result) => {
			if (result.isConfirmed) {
				// remove theo đúng object data của node
				params.api.applyTransaction({ remove: [params.node.data] });
				Toast.fire({
					icon: "success",
					title: "Xóa thành công"
				});
			}
		});
	});

	return wrap;
}

function detectHeader(matrix) {
	console.log(matrix)
}
function onRowSelected(event) {
	//if (event.node.isSelected()) {
	//	var id_list = GetIdListEventActual(event.data.id);
	//	if (id_list !== PFN_readCookie('id_list')) {
	//		$('.ag-body-viewport div.ag-row').removeClass('ag-row-selected');
	//           $('.ag-body-viewport div[row-index="' + $('.' + PFN_readCookie('id_list')).parent().attr('row-index') + '"]').removeClass('ag-row-selected');
	//	}
	//	if (IsNullOrEmpty(PFN_readCookie('focus_row')) && event.type == 'rowSelected' && event.source == 'rowClicked') {
	//		$('.ag-body-viewport div[row-index="' + event.rowIndex + '"]').addClass('ag-row-selected');
	//	}
	//   }
}

function CustomHeaderInformationGarden() { }

CustomHeaderInformationGarden.prototype.init = function (params) {
	this.params = params;
	var strHiddenAsc = params.sortOrderDefault == 'asc' ? '' : 'ag-hidden';
	var strHiddenDesc = params.sortOrderDefault == 'desc' ? '' : 'ag-hidden';
	this.eGui = document.createElement('div');
	this.eGui.className = "ag-header-cell-label";
	this.eGui.innerHTML =
		'' + '<span class="ag-header-cell-text">' +
		this.params.displayName +
		'</span>' +
		'<span class="ag-header-icon ag-header-label-icon ag-sort-ascending-icon ' + strHiddenAsc + '"><span class="ag-icon ag-icon-asc"></span></span>' +
		'<span class="ag-header-icon ag-header-label-icon ag-sort-descending-icon ' + strHiddenDesc + '"><span class="ag-icon ag-icon-desc"></span></span>';

	//if (!IsNullOrEmpty(this.params.style)) {
	//    this.eGui.style = this.params.style;
	//}
	if (this.params.style != null && this.params.style != undefined) {
		this.eGui.style = this.params.style;
	}

	this.eSortDownButton = this.eGui.querySelector('.ag-sort-descending-icon');
	this.eSortUpButton = this.eGui.querySelector('.ag-sort-ascending-icon');

	//if (!IsNullOrEmpty(params.sortOrderDefault)) {
	if (params.sortOrderDefault != null && params.sortOrderDefault != undefined) {
		sortData.sortColumnEventActual = params.column.colId;
		sortData.sortOrderEventActual = params.sortOrderDefault;
	}

	if (this.params.enableSorting) {
		this.onSortChangedListener = this.onSortChanged.bind(this);
		this.eGui.addEventListener(
			'click',
			this.onSortChangedListener
		);
	} else {
		this.eGui.removeChild(this.eSortDownButton);
		this.eGui.removeChild(this.eSortUpButton);
	}
};
function cellStyle_Col_Model_EventActual(params) {
	let cellAttr = {};
	cellAttr['text-align'] = 'center';
	return cellAttr;
}

CustomHeaderInformationGarden.prototype.onSortChanged = function () {
	//Remove tất cả icon sort ở col khác
	$('.ag-sort-ascending-icon').not($(this.eSortUpButton)).addClass('ag-hidden');
	$('.ag-sort-descending-icon').not($(this.eSortDownButton)).addClass('ag-hidden');
	//
	if (!$(this.eSortUpButton).hasClass('ag-hidden') || ($(this.eSortDownButton).hasClass('ag-hidden') && $(this.eSortUpButton).hasClass('ag-hidden'))) {
		$(this.eSortDownButton).removeClass('ag-hidden');
		$(this.eSortUpButton).addClass('ag-hidden');
		sortData.sortOrderEventActual = 'desc';
	}
	else if (!$(this.eSortDownButton).hasClass('ag-hidden')) {
		$(this.eSortUpButton).removeClass('ag-hidden');
		$(this.eSortDownButton).addClass('ag-hidden');
		sortData.sortOrderEventActual = 'asc';
	}
	sortData.sortColumnEventActual = this.params.column.colId;
	this.onSortRequested();
};

CustomHeaderInformationGarden.prototype.getGui = function () {
	return this.eGui;
};

CustomHeaderInformationGarden.prototype.onSortRequested = function () {
	RefreshAllGridWhenChangeData();
};

CustomHeaderInformationGarden.prototype.destroy = function () {
	this.eGui.removeEventListener(
		'click',
		this.onSortChangedListener
	);
};
function updateRowIndex() {
	gridApi.forEachNodeAfterFilterAndSort((node, index) => {
		node.setDataValue('STT', index + 1);
	});
}


// Import từ URL demo
document.getElementById('importExcel').addEventListener('change', async e => {
	const file = e.target.files[0];
	if (!file) return;
	try {
		const buf = await file.arrayBuffer();
		const wb = XLSX.read(buf, { type: 'array', cellDates: true });
		const ws = wb.Sheets[wb.SheetNames[0]];
		const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: true });
		//gridApi.setRowData(rows);
		gridApi.setGridOption("rowData", data);
		notifier.show('Thành công', 'Import file Excel thành công', 'success', '', 4000);
	} catch (err) {
		notifier.show('Thất bại', 'Lỗi khi import file Excel!', 'danger', '', 4000);
	}
});
// Export Excel
function onExportExcelData() {
	const ws = XLSX.utils.json_to_sheet(ListDataFull);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'Data');
	XLSX.writeFile(wb, 'datanhaplieu.xlsx');
}
// Export Example Excel
function onExportTemplateExcel() {
	var lstDataTemplate = {};
	lstDataTemplate['Số thứ tự'] = '1';
	lstDataTemplate['Mã Nhà Vườn'] = 'NV_1';
	lstDataTemplate['Mã đại lý'] = 'NV_1';
	lstDataTemplate['Tên Nhà Vườn'] = 'Nhà Vườn A';
	lstDataTemplate['Địa chỉ'] = '9';
	lstDataTemplate['Tổng diện tích (ha)'] = '9';
	lstDataTemplate['Diện tích (ha)'] = '9';
	lstDataTemplate['Tổng Khai thác (kg)'] = '9';
	lstDataTemplate['Trạng thái hoạt động'] = '9';
	lstDataTemplate['Vị trí'] = '9';
	lstDataTemplate['Thời gian tạo'] = '9';
	lstDataTemplate['Người tạo'] = '9';
	lstDataTemplate = [lstDataTemplate];
	const ws = XLSX.utils.json_to_sheet(lstDataTemplate);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'Data');
	XLSX.writeFile(wb, 'mau.xlsx');
}


function ApproveDataFarm(farmId, status) {
	$.ajax({
		async: true,
		method: 'POST',
		url: "/InformationGarden/ApproveDataFarm",
		dataType: 'json',
		data: { farmId: farmId, status: status },
		success: function (res) {
			Toast.fire({
				icon: "success",
				title: "Đổi trạng thái thành công"
			});
			RefreshAllGridWhenChangeData();
		},
		error: function () {
			Toast.fire({
				icon: "danger",
				title: "Đổi trạng thái thất bại"
			});
		}
	});
}
// Chuyển chuỗi sang số
const num = v => {
	const x = parseFloat(String(v ?? '').replace(',', '.'));
	return Number.isFinite(x) ? x : 0;
};
// Cập nhật dữ liệu sau khi chỉnh sửa
// status: 1: edit, 2: add
function UpdateDataAfterEdit(status, rowData) {
	var rowDataObj = {};
	if (status == 1) {
		rowDataObj.agentCode = $('#ListCboAgentCode').val();//Mã đại lý
		rowDataObj.farmCode = $('#FarmCode').val();//Mã nhà vườn
		rowDataObj.farmerName = $('#FarmerName').val();//Tên nhà vườn
		rowDataObj.farmPhone = $('#FarmPhone').val();//Số điện thoại
		rowDataObj.farmAddress = $('#FarmAddress').val();//Địa chỉ
		rowDataObj.certificates = $('#Certificates').val(); //Giấy phép
		rowDataObj.totalAreaHa = num($('#TotalAreaHa').val());//Tổng diện tích
		rowDataObj.rubberAreaHa = num($('#RubberAreaHa').val());//Diện tích
		rowDataObj.totalExploit = num($('#TotalExploit').val());//Tổng khai thác
		rowDataObj.isActive = 1;//Tổng khai thác
		rowData = rowDataObj;
	}
	$.ajax({
		async: true,
		url: "/InformationGarden/AddOrUpdate",
		type: 'POST',
		contentType: 'application/json; charset=utf-8',
		data: JSON.stringify(rowData),
		success: function (res) {
			Toast.fire({
				icon: "success",
				title: (status == 1 ?"Cập nhật" : "Thành công") + " dữ liệu thành công"
			});
			RefreshAllGridWhenChangeData();
		},
		error: function () {
			Toast.fire({
				icon: "danger",
				title: (status == 1 ? "Cập nhật" : "Thành công") + " dữ liệu thất bại"
			});
		}
	});
}