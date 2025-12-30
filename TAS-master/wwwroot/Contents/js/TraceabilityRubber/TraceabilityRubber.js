// ========================================
// TRACEABILITYTABLEAG.JS - AG Grid Tree Data
// ========================================

let gridApi;
let gridColumnApi;
let allData = [];

// ========================================
// INITIALIZE
// ========================================
function initTraceabilityTableAG() {
    console.log('Initializing Traceability Table with AG Grid...');

    // Setup AG Grid
    setupGrid();

    // Setup event handlers
    setupEventHandlers();

    // Load initial data
    loadTableData(false);
}

// ========================================
// SETUP AG GRID
// ========================================
function setupGrid() {
    const gridDiv = document.querySelector('#traceabilityGrid');

    const gridOptions = {
        // Tree Data Configuration
        treeData: true,
        animateRows: true,
        groupDefaultExpanded: 0, // Start collapsed

        // Get hierarchy path
        getDataPath: function (data) {
            return data.orgHierarchy;
        },

        // Auto Group Column (Expand/Collapse column)
        autoGroupColumnDef: {
            headerName: '',
            width: 300,
            cellRendererParams: {
                suppressCount: true,
                innerRenderer: function (params) {
                    if (params.node.level === 0) {
                        // Level 1: Order
                        return `<strong style="color: #2c3e50;">${params.data.orderCode || ''}</strong>`;
                    } else if (params.node.level === 1) {
                        // Level 2: Agent
                        return `<span style="color: #f39c12;">${params.data.agentName || ''}</span>`;
                    } else {
                        // Level 3: Farm
                        return `<span style="color: #27ae60;">${params.data.farmerName || ''}</span>`;
                    }
                }
            },
            cellStyle: function (params) {
                if (params.node.level === 1 || params.node.level === 2) {
                    return { backgroundColor: '#fff9e6' }; // Yellow highlight
                }
                return null;
            }
        },

        // Column Definitions
        columnDefs: [
            {
                headerName: 'Tên Đơn Hàng',
                field: 'orderName',
                width: 200,
                cellStyle: function (params) {
                    if (params.node.level === 1 || params.node.level === 2) {
                        return { backgroundColor: '#fff9e6' };
                    }
                    return null;
                }
            },
            {
                headerName: 'Tên Đại Lý',
                field: 'agentName',
                width: 180,
                cellStyle: function (params) {
                    if (params.node.level === 1 || params.node.level === 2) {
                        return { backgroundColor: '#fff9e6' };
                    }
                    return null;
                },
                valueGetter: function (params) {
                    // Only show at Level 2
                    if (params.node.level === 1) {
                        return params.data.agentName;
                    }
                    return '';
                }
            },
            {
                headerName: 'Tên Nhà Vườn',
                field: 'farmerName',
                width: 200,
                cellStyle: function (params) {
                    if (params.node.level === 1 || params.node.level === 2) {
                        return { backgroundColor: '#fff9e6' };
                    }
                    return null;
                },
                valueGetter: function (params) {
                    // Only show at Level 3
                    if (params.node.level === 2) {
                        return params.data.farmerName;
                    }
                    return '';
                }
            },
            {
                headerName: 'Tổng Thành Phẩm',
                field: 'totalFinishedProductKg',
                width: 160,
                type: 'numericColumn',
                valueFormatter: function (params) {
                    if (params.value == null) return '';
                    return Number(params.value).toFixed(2);
                },
                cellStyle: function (params) {
                    const style = { textAlign: 'right' };
                    if (params.node.level === 1 || params.node.level === 2) {
                        style.backgroundColor = '#fff9e6';
                    }
                    return style;
                }
            },
            {
                headerName: 'Tổng Thành Phẩm Ly Tâm',
                field: 'totalCentrifugeProductKg',
                width: 180,
                type: 'numericColumn',
                valueFormatter: function (params) {
                    if (params.value == null) return '';
                    return Number(params.value).toFixed(2);
                },
                cellStyle: function (params) {
                    const style = { textAlign: 'right' };
                    if (params.node.level === 1 || params.node.level === 2) {
                        style.backgroundColor = '#fff9e6';
                    }
                    return style;
                }
            },
            {
                headerName: 'Ngày Thu Mua',
                field: 'datePurchase',
                width: 140,
                valueFormatter: function (params) {
                    if (!params.value) return '';
                    const date = new Date(params.value);
                    return date.toLocaleDateString('vi-VN');
                },
                cellStyle: function (params) {
                    if (params.node.level === 1 || params.node.level === 2) {
                        return { backgroundColor: '#fff9e6' };
                    }
                    return null;
                }
            }
        ],

        // Grid Options
        defaultColDef: {
            resizable: true,
            sortable: false,
            filter: false
        },

        // Row Style
        getRowStyle: function (params) {
            if (params.node.level === 1 || params.node.level === 2) {
                return { backgroundColor: '#fff9e6' };
            }
            return null;
        },

        // Events
        onGridReady: function (params) {
            gridApi = params.api;
            gridColumnApi = params.columnApi;
            params.api.sizeColumnsToFit();
        }
    };

    new agGrid.Grid(gridDiv, gridOptions);
}

// ========================================
// SETUP EVENT HANDLERS
// ========================================
function setupEventHandlers() {
    // Toggle switch
    $('#showAllToggle').on('change', function () {
        const showAll = $(this).is(':checked');
        loadTableData(showAll);
    });

    // Expand All
    $('#btnExpandAll').on('click', function () {
        gridApi.expandAll();
    });

    // Collapse All
    $('#btnCollapseAll').on('click', function () {
        gridApi.collapseAll();
    });

    // Export Excel
    $('#btnExport').on('click', exportToExcel);
}

// ========================================
// LOAD TABLE DATA
// ========================================
function loadTableData(showAll) {
    showLoading();

    $.ajax({
        url: '/TraceabilityTable/GetTableData',
        type: 'GET',
        data: { showAll: showAll },
        success: function (response) {
            if (response.success) {
                allData = response.data;
                processAndRenderData(allData);
                updateStatusBar(allData.length);
                updateLastUpdateTime();
            } else {
                showError(response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('Load error:', error);
            showError('Lỗi khi tải dữ liệu');
        },
        complete: function () {
            hideLoading();
        }
    });
}

// ========================================
// PROCESS AND RENDER DATA
// ========================================
function processAndRenderData(rawData) {
    // Transform data to include orgHierarchy path
    const processedData = rawData.map(row => {
        const hierarchy = [];

        // Build hierarchy path based on SortList
        if (row.orderCode) {
            // Level 1: Order
            hierarchy.push(row.orderCode);
        } else if (row.agentName && row.sortOrder === 1) {
            // Level 2: Agent
            const parts = row.sortList.split('__');
            hierarchy.push(parts[0]); // OrderCode
            hierarchy.push(row.sortList); // OrderCode__AgentCode
        } else if (row.farmerName && row.sortOrder === 2) {
            // Level 3: Farm
            const parts = row.sortList.split('__');
            hierarchy.push(parts[0]); // OrderCode
            hierarchy.push(parts[0] + '__' + parts[1]); // OrderCode__AgentCode
            hierarchy.push(row.sortList); // Full path
        }

        return {
            ...row,
            orgHierarchy: hierarchy
        };
    });

    gridApi.setGridOption('rowData', processedData);
}

// ========================================
// EXPORT TO EXCEL
// ========================================
function exportToExcel() {
    const params = {
        fileName: `Traceability_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Traceability'
    };

    gridApi.exportDataAsExcel(params);
}

// ========================================
// UPDATE STATUS BAR
// ========================================
function updateStatusBar(total) {
    $('#totalRecords').text(`Tổng: ${total} rows`);
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    $('#lastUpdate').text(`Cập nhật lần cuối: ${timeStr}`);
}

// ========================================
// LOADING & NOTIFICATIONS
// ========================================
function showLoading() {
    console.log('Loading...');
}

function hideLoading() {
    console.log('Loading complete');
}

function showError(message) {
    alert('Lỗi: ' + message);
}
