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
    // Setup AG Grid
    setupGrid();

    // Setup event handlers
    setupEventHandlers();

    // Load initial data
    loadAgents();
}

// ========================================
// SETUP AG GRID
// ========================================
function setupGrid() {
    const gridOptions = {
        columnDefs: [
            {
                headerName: '',
                field: 'selected',
                checkboxSelection: true,
                headerCheckboxSelection: true,
                minWidth: 50,
                width: 50,
                pinned: 'left',
                lockPosition: true,
                suppressMenu: true,
                filter: false
            },
            {
                headerName: 'Số thứ tự',
                field: 'rowNo',
                pinned: 'left',
                minWidth: 50,
                width: 110,
            },
            {
                headerName: 'Mã đại lý',
                field: 'agentCode',
                editable: params => params.data.agentId === 0, // Chỉ cho sửa mã khi thêm mới
                minWidth: 150,
                pinned: 'left',
                cellRenderer: params => `<strong>${params.value || ''}</strong>`
            },
            {
                headerName: 'Tên đại lý',
                field: 'agentName',
                editable: true,
                width: 250
            },
            {
                headerName: 'Địa chỉ',
                field: 'agentAddress',
                editable: true,
                width: 300
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
            },
            {
                headerName: 'Thao tác',
                field: 'agentId',
                width: 150,
                pinned: 'right',
                cellRenderer: CellRenderAction,
                filter: false,
                sortable: false
            }
        ],
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true,
            floatingFilter: true,
            cellStyle: { 'display': 'flex', 'align-items': 'center' }
        },
        rowSelection: 'multiple',
        animateRows: true,
        rowHeight: 45,
        onSelectionChanged: onSelectionChanged,
        onGridReady: function (params) {
            gridApiAgent = params.api;
            gridColumnApi = params.columnApi;
            params.api.sizeColumnsToFit();
        }
    };

    const gridDiv = document.querySelector('#agentGrid');
    gridApiAgent = agGrid.createGrid(gridDiv, gridOptions);
}

// ========================================
// ACTION RENDERER (Giống Order.js)
// ========================================
function CellRenderAction(params) {
    const id = params.value;
    const rowIndex = params.node.rowIndex;

    let strSave = `<a href="#" class="avtar-xs btn-link-secondary" onclick="saveAgentInline(${rowIndex})" title="Lưu"><i class="ti ti-check f-20"></i></a>`;
    let strCancel = `<a href="#" class="avtar-xs btn-link-secondary" onclick="loadAgents(${arrConstant.currentPage})" title="Hủy"><i class="ti ti-x f-20"></i></a>`;
    let strEdit = `<a href="#" class="avtar-xs btn-link-secondary" onclick="openAgentModal(${id})" title="Sửa nâng cao"><i class="ti ti-edit f-20"></i></a>`;
    let strDelete = `<a href="#" class="avtar-xs btn-link-secondary" onclick="deleteAgent(${id})" title="Xóa"><i class="ti ti-trash f-20"></i></a>`;

    if (id === 0 || !id) {
        return `${strSave} ${strCancel}`;
    }
    return `${strEdit} ${strDelete}`;
}

// ========================================
// LOAD DATA WITH PAGINATION
// ========================================
function loadAgents(pageIndex, pageSize) {
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
    const filterData = {
        PageIndex: arrConstant.currentPage,
        PageSize: arrConstant.PageSize,
        Keyword: $('#txtSearchKeyword').val(), // Lấy từ ô tìm kiếm
        Status: $('#ddlStatus').val(),         // Lấy từ dropdown trạng thái
        FromDate: $('#dtFromDate').val(),      // Lấy ngày bắt đầu
        ToDate: $('#dtToDate').val()           // Lấy ngày kết thúc
    };

    $.ajax({
        url: '/Agent/GetAgentsWithFilter',
        type: 'GET',
        data: filterData,
        success: function (response) {
            if (response.success) {

                var pagedResult = response.data;
                rowData = pagedResult.items;

                gridApiAgent.setGridOption('rowData', rowData);

                renderServerPagination(
                    'divPagingContainer',     // ID thẻ div chứa thanh phân trang
                    pagedResult.totalRecords, // Tổng số bản ghi (Server trả về)
                    arrConstant.currentPage,            // Trang hiện tại
                    arrConstant.pageSize,               // Size hiện tại
                    function (newPage, newSize) {
                        // Callback: Khi người dùng bấm Next/Prev/Change Size -> Gọi lại hàm load này
                        loadAgents(newPage, newSize);
                    }
                );
                updateStatusBar(response.totalRecords);
            }
        },
        error: () => NotificationToast('error', 'Lỗi tải dữ liệu'),
        complete: hideLoading
    });
}

// ========================================
// INLINE ACTIONS
// ========================================
function showAddRow() {
    const newRow = {
        agentId: 0,
        agentCode: '',
        agentName: '',
        address: '',
        phone: '',
        status: 1,
        statusName: 'Hoạt động',
        statusClass: 'success'
    };
    gridApiAgent.applyTransaction({ add: [newRow], addIndex: 0 });
    gridApiAgent.ensureIndexVisible(0);
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
    $('#btnRefresh').click(() => loadAgents(1));
    $('#btnAdd').click(showAddRow);

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