// ========================================
// TRACEABILITY - 4 LEVELS FINAL VERSION
// Level 1: Order (Đơn hàng)
// Level 2: Pond (Hồ)
// Level 3: Agent (Đại lý)
// Level 4: Farm (Nhà vườn)
// Fixed: JOIN via RubberIntake to get FarmCode
// ========================================

var arrParentIds = [];
var ListDataFull = [];
var ListRowChild = [];
var gridApiTraceability;
var gridOptionsTraceability;
var ListDataToShow = [];

// ========================================
// INITIALIZE
// ========================================
function initTraceabilityTableAG() {
    CreateGridTraceability();
    RegEventTraceability();
}

// ========================================
// REGISTER EVENTS
// ========================================
function RegEventTraceability() {
    // Toggle "Show All" checkbox
    //if ($('#ChkAll').length > 0) {
    //    /*arrConstant.isCheckAll = $('#ChkAll').prop('checked');*/
    //    //$('#ChkAll').on('change', function (e) {
    //    //    arrConstant.isCheckAll = e.target.checked;
    //    //    ShowOrHideAllRowChildren();
    //    //});
    //}

    // Expand All button
    $('#btnExpandAll').on('click', function () {
        arrConstant.isCheckAll = true;
        ShowOrHideAllRowChildren();
    });

    // Collapse All button
    $('#btnCollapseAll').on('click', function () {
        arrConstant.isCheckAll = false;
        ShowOrHideAllRowChildren();
    });

    // Export Excel button
    if ($('#btnExport').length > 0) {
        $('#btnExport').on('click', exportToExcel);
    }

    // Refresh button
    if ($('#btnRefresh').length > 0) {
        $('#btnRefresh').on('click', function () {
            CreateRowDataTraceability();
        });
    }

    // Other events
    $('.Col-orderName').on('click', function (e) {
        resizeGridTraceability();
    });    
}

// ========================================
// CREATE GRID
// ========================================
function CreateGridTraceability() {
    gridOptionsTraceability = {
        paginationPageSize: 100,
        columnDefs: CreateColModelTraceability(),
        defaultColDef: {
            width: 170,
            filter: true,
            floatingFilter: true,
            resizable: true,
            sortable: true
        },
        rowHeight: 45,
        headerHeight: 45,
        rowData: [],
        rowDragManaged: true,
        rowDragMultiRow: true,
        rowSelection: 'multiple',
        suppressRowClickSelection: false,
        animateRows: true,
        singleClickEdit: true,
        components: {
            customHeader: CustomHeaderTraceability,
        },
        cellSelection: true,
        onGridReady: function (params) {
            gridApiTraceability = params.api;
            params.api.sizeColumnsToFit();
     
        },
        onRowDragEnd() {
            if (typeof OnDragMoveSetRow !== 'undefined') {
                OnDragMoveSetRow();
            }
        },
        onCellValueChanged: e => {
            if (typeof UpdateDataAfterEdit !== 'undefined') {
                UpdateDataAfterEdit(0, e.data);
            }
        },
        enableRangeSelection: true,
        allowContextMenuWithControlKey: true,
        suppressContextMenu: false,

        // Row styling for yellow highlight (Level 2, 3, 4)
        getRowStyle: function (params) {
            if (params.data.sortOrder >= 2 && params.data.sortOrder <= 4) {
                return { backgroundColor: '#fff9e6' };
            }
            return null;
        }
    };

    const eGridDiv = document.querySelector('#traceabilityGrid');
    if (!eGridDiv) {
        console.error('❌ Grid container #traceabilityGrid not found!');
        return;
    }

    gridApiTraceability = agGrid.createGrid(eGridDiv, gridOptionsTraceability);
    CreateRowDataTraceability();
    resizeGridTraceability();
}

// ========================================
// RESIZE GRID
// ========================================
function resizeGridTraceability() {
    setTimeout(function () {
        if (typeof setWidthHeightGrid !== 'undefined') {
            setWidthHeightGrid(25);
        }
    }, 100);
}

function setWidthHeightGrid(heithlayout) {
    // Your custom resize logic here
}

function RefreshAllGridWhenChangeData() {
    setTimeout(function () {
        CreateRowDataTraceability();
    }, 1);
}

// ========================================
// LOAD TABLE DATA
// ========================================
function CreateRowDataTraceability() {
    var listSearchTraceability = {};
    ResetValueArrParentIds();


    $.ajax({
        async: true,
        type: 'GET',
        url: "/Traceability/GetTableData",
        data: listSearchTraceability,
        dataType: "json",
        success: function (response) {

            if (response.success) {
                ListDataFull = response.data;

                // Only show Level 1 initially
                //var listDataToShow = ListDataFull.filter(x => x.sortOrder === 1);
                ListRowChild = ListDataFull.filter(x => x.sortOrder !== 1);
                setTimeout(function () {
                    if (typeof renderPagination !== 'undefined') {
                        renderPagination(agPaging, gridApiTraceability, ListDataFull, IsOptionAll);
                    }
                    if (typeof updateStatusBar !== 'undefined') {
                        updateStatusBar(ListDataFull.length);
                    }
                    if (typeof updateLastUpdateTime !== 'undefined') {
                        updateLastUpdateTime();
                    }
                    gridApiTraceability.setGridOption("rowData", ListDataFull.filter(x => x.sortOrder == 1));
                }, 100);                
            } else {
                console.error('❌ API error:', response.message);
                showError(response.message || 'Lỗi khi tải dữ liệu');
            }
        },
        error: function (xhr, status, error) {
            //console.error('❌ AJAX error:', error);
            //console.error('Response:', xhr.responseText);
            showError('Lỗi khi tải dữ liệu: ' + error);
        }
    });
}

// ========================================
// COLUMN DEFINITIONS - 4 LEVELS
// ========================================
function CreateColModelTraceability() {
    var columnDefs = [
        {
            field: 'orderCode',
            headerName: 'Mã đơn hàng',
            width: 190,
            minWidth: 190,
            cellStyle: cellStyle_Col_Model_EventActual,
            editable: false,
            filter: true,
            headerComponent: "customHeader",
            filter: "agTextColumnFilter",
            cellRenderer: function (params) {
                if (params.data.sortOrder === 1) {
                    // Level 1: Order - show expand icon
                    var iconClass = params.data.isOpenChild ? 'ag-icon-tree-open' : 'ag-icon-tree-closed';
                    return `
                        <div style="display: flex; align-items: center; flex-direction: row-reverse;">
                            <span class="ag-group-expanded" style="margin-right: 5px;">
                                <span class="ag-icon ${iconClass}" 
                                      unselectable="on" 
                                      role="presentation" 
                                      onclick="ShowOrHideRowChildren('${params.data.sortList}', this, ${params.data.sortOrder})"
                                      style="cursor: pointer;">
                                </span>
                            </span>
                            <strong style="color: #2c3e50;">${params.value || ''}</strong>
                        </div>
                    `;
                }
                return params.value || '';
            }
        },
        {
            field: 'orderName',
            headerName: 'Tên đơn hàng',
            width: 200,
            minWidth: 150,
            cellStyle: function (params) {
                var style = cellStyle_Col_Model_EventActual(params);
                if (params.data.sortOrder >= 2 && params.data.sortOrder <= 4) {
                    style['background-color'] = '#fff9e6';
                }
                return style;
            },
            editable: false,
            headerComponent: "customHeader",
            filter: "agTextColumnFilter",
            cellRenderer: function (params) {
                var indent = (params.data.sortOrder - 1) * 20; // 0px, 20px, 40px, 60px
                return `<div style="padding-left: ${indent}px;">${params.value || ''}</div>`;
            }
        },
        {
            field: 'pondName',
            headerName: 'Tên hồ',
            width: 150,
            minWidth: 150,
            cellStyle: function (params) {
                var style = cellStyle_Col_Model_EventActual(params);
                if (params.data.sortOrder >= 2 && params.data.sortOrder <= 4) {
                    style['background-color'] = '#fff9e6';
                }
                return style;
            },
            editable: false,
            headerComponent: "customHeader",
            filter: "agTextColumnFilter",
            cellRenderer: function (params) {
                if (params.data.sortOrder === 2) {
                    // Level 2: Pond - show expand icon
                    var indent = 20;
                    var iconClass = params.data.isOpenChild ? 'ag-icon-tree-open' : 'ag-icon-tree-closed';
                    return `
                        <div style="display: flex; align-items: center; flex-direction: row-reverse; padding-left: ${indent}px;">
                            <span class="ag-group-expanded" style="margin-right: 5px;">
                                <span class="ag-icon ${iconClass}" 
                                      unselectable="on" 
                                      role="presentation" 
                                      onclick="ShowOrHideRowChildren('${params.data.sortList}', this, ${params.data.sortOrder})"
                                      style="cursor: pointer;">
                                </span>
                            </span>
                            <span style="color: #3498db; font-weight: 500;">${params.value || ''}</span>
                        </div>
                    `;
                } else if (params.data.sortOrder >= 3) {
                    return `<div style="padding-left: ${(params.data.sortOrder - 1) * 20}px;">${params.value || ''}</div>`;
                }
                return params.value || '';
            }
        },
        {
            field: 'agentName',
            headerName: 'Tên đại lý',
            width: 200,
            minWidth: 150,
            cellStyle: function (params) {
                var style = cellStyle_Col_Model_EventActual(params);
                if (params.data.sortOrder >= 2 && params.data.sortOrder <= 4) {
                    style['background-color'] = '#fff9e6';
                }
                return style;
            },
            editable: false,
            headerComponent: "customHeader",
            filter: "agTextColumnFilter",
            cellRenderer: function (params) {
                if (params.data.sortOrder === 3) {
                    // Level 3: Agent - show expand icon
                    var indent = 40;
                    var iconClass = params.data.isOpenChild ? 'ag-icon-tree-open' : 'ag-icon-tree-closed';
                    return `
                        <div style="display: flex; align-items: center;flex-direction: row-reverse; padding-left: ${indent}px;">
                            <span class="ag-group-expanded" style="margin-right: 5px;">
                                <span class="ag-icon ${iconClass}" 
                                      unselectable="on" 
                                      role="presentation" 
                                      onclick="ShowOrHideRowChildren('${params.data.sortList}', this, ${params.data.sortOrder})"
                                      style="cursor: pointer;">
                                </span>
                            </span>
                            <span style="color: #f39c12; font-weight: 500;">${params.value || ''}</span>
                        </div>
                    `;
                } else if (params.data.sortOrder === 4) {
                    return `<div style="padding-left: 60px;">${params.value || ''}</div>`;
                }
                return params.value || '';
            }
        },
        {
            field: 'farmerName',
            headerName: 'Tên nhà vườn',
            width: 200,
            minWidth: 150,
            cellStyle: function (params) {
                var style = cellStyle_Col_Model_EventActual(params);
                if (params.data.sortOrder >= 2 && params.data.sortOrder <= 4) {
                    style['background-color'] = '#fff9e6';
                }
                return style;
            },
            editable: false,
            headerComponent: "customHeader",
            filter: "agTextColumnFilter",
            cellRenderer: function (params) {
                if (params.data.sortOrder === 4) {
                    // Level 4: Farm - no expand icon (leaf level)
                    return `<div style="padding-left: 60px; color: #27ae60; font-weight: 500;">${params.value || ''}</div>`;
                }
                return params.value || '';
            }
        },
        {
            field: 'totalFinishedProductKg',
            headerName: 'KL đổ (kg)',
            width: 140,
            minWidth: 120,
            cellStyle: function (params) {
                var style = { 'text-align': 'right', 'padding-right': '10px' };
                if (params.data.sortOrder >= 2 && params.data.sortOrder <= 4) {
                    style['background-color'] = '#fff9e6';
                }
                return style;
            },
            editable: false,
            headerComponent: "customHeader",
            filter: "agNumberColumnFilter",
            valueFormatter: function (params) {
                if (params.value == null) return '';
                return Number(params.value).toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        },
        {
            field: 'totalCentrifugeProductKg',
            headerName: 'Thành phẩm (kg)',
            width: 160,
            minWidth: 140,
            cellStyle: function (params) {
                var style = { 'text-align': 'right', 'padding-right': '10px' };
                if (params.data.sortOrder >= 2 && params.data.sortOrder <= 4) {
                    style['background-color'] = '#fff9e6';
                }
                return style;
            },
            editable: false,
            headerComponent: "customHeader",
            filter: "agNumberColumnFilter",
            valueFormatter: function (params) {
                if (params.value == null || params.value === 0) return '-';
                return Number(params.value).toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        },
        {
            field: 'datePurchase',
            headerName: 'Ngày thu mua',
            width: 140,
            minWidth: 120,
            cellStyle: function (params) {
                var style = { 'text-align': 'center' };
                if (params.data.sortOrder >= 2 && params.data.sortOrder <= 4) {
                    style['background-color'] = '#fff9e6';
                }
                return style;
            },
            editable: false,
            headerComponent: "customHeader",
            filter: "agDateColumnFilter",
            valueFormatter: function (params) {
                if (!params.value) return '';
                try {
                    var date = new Date(params.value);
                    return date.toLocaleDateString('vi-VN');
                } catch (e) {
                    return params.value;
                }
            }
        }
    ];
    return columnDefs;
}

function cellStyle_Col_Model_EventActual(params) {
    let cellAttr = {};
    cellAttr['text-align'] = 'center';
    return cellAttr;
}

// ========================================
// SHOW/HIDE ROW CHILDREN - 4 LEVELS
// ========================================
function ShowOrHideRowChildren(id_list, selector, sortOrder) {
    // Find parent row
    var itemParent = ListDataFull.find(x => x.sortList === id_list);
    if (!itemParent) {
        return;
    }

    // Get row index for insertion
    var selectorCell = $(selector).parent().parent().parent();
    var selectorRow = $(selectorCell).parent();
    var row_index = parseInt($(selectorRow).parent().attr('row-index')) + 1;
    var sortOrderChildren = sortOrder + 1;
    if (itemParent.isOpenChild) {
        // ========================================
        // CLOSE ROW
        // ========================================
        // Remove all descendants recursively
        let idlistData;        
        if (sortOrder === 1) {
            idlistData = ListRowChild.filter(x => x.sortList.startsWith(itemParent.sortList) && x.sortOrder != sortOrder);

            gridApiTraceability.applyTransaction({ remove: idlistData });
            ListDataFull.filter(x => x.sortList.startsWith(itemParent.sortList)).forEach(x => x.isOpenChild = false);
        }
        else if (sortOrder === 2) {
            idlistData = ListRowChild.filter(x => x.sortList.startsWith(itemParent.sortList) && x.sortOrder > sortOrder);

            gridApiTraceability.applyTransaction({ remove: idlistData });
            ListDataFull.filter(x => x.sortList.startsWith(itemParent.sortList) && x.sortOrder >= sortOrder).forEach(x => x.isOpenChild = false);
        }
        else if (sortOrder === 3) {
            idlistData = ListRowChild.filter(x => x.sortOrder == sortOrderChildren && x.sortList.startsWith(itemParent.sortList));
            gridApiTraceability.applyTransaction({ remove: idlistData });
            ListDataFull.filter(x => x.sortList == itemParent.sortList)[ListDataFull.filter(x => x.sortList == itemParent.sortList).length - 1].isOpenChild = false;
        }
        
    } else {
        // ========================================
        // OPEN ROW
        // ========================================
        let idlistData;
        if (sortOrder === 1) {
            idlistData = ListRowChild.filter(x => x.sortList.startsWith(itemParent.sortList) && x.sortOrder != sortOrder);

            gridApiTraceability.applyTransaction({
                add: idlistData,
                addIndex: row_index
            });
            ListDataFull.filter(x => x.sortList.startsWith(itemParent.sortList)).forEach(x => x.isOpenChild = true);
        }
        else if (sortOrder === 2) {
            idlistData = ListRowChild.filter(x => x.sortList.startsWith(itemParent.sortList) && x.sortOrder > sortOrder);

            gridApiTraceability.applyTransaction({
                add: idlistData,
                addIndex: row_index
            });
            ListDataFull.filter(x => x.sortList.startsWith(itemParent.sortList) && x.sortOrder >= sortOrder).forEach(x => x.isOpenChild = true);
        }
        else if (sortOrder === 3) {
            idlistData = ListRowChild.filter(x => x.sortOrder == sortOrderChildren && x.sortList.startsWith(itemParent.sortList));

            gridApiTraceability.applyTransaction({
                add: idlistData,
                addIndex: row_index
            });
            ListDataFull.filter(x => x.sortList == itemParent.sortList)[ListDataFull.filter(x => x.sortList == itemParent.sortList).length - 1].isOpenChild = true;
        }
    }
    if ($(selectorRow).find('span.ag-icon').hasClass('ag-icon-tree-closed')) {
        $(selectorRow).find('span.ag-icon').removeClass('ag-icon-tree-closed').addClass('ag-icon-tree-open');
    }
    else {
        $(selectorRow).find('span.ag-icon').removeClass('ag-icon-tree-open').addClass('ag-icon-tree-closed');
    }
    ///gridApiTraceability.refreshCells({ force: true });
}

// ========================================
// SET VALUE ARR PARENT IDS
// ========================================
function SetValueArrParentIds(parentIds, isOpenRow) {
    isOpenRow = ParseBool(isOpenRow);

    parentIds.forEach(function (parentId) {
        if (isOpenRow) {
            if (!arrParentIds.includes(parentId)) {
                arrParentIds.push(parentId);
            }
        } else {
            arrParentIds = arrParentIds.filter(x => x !== parentId);
        }
    });

    //console.log('Updated arrParentIds:', arrParentIds.length, 'items');
}

// ========================================
// SHOW/HIDE ALL ROWS - 4 LEVELS
// ========================================
function ShowOrHideAllRowChildren() {
    var isCheckAll = typeof arrConstant !== 'undefined' ? arrConstant.isCheckAll : false;
    //console.log('🔄 Toggle all rows (4 levels):', isCheckAll);

    if (isCheckAll) {
        // EXPAND ALL
        //console.log('➕ Expanding all rows (Level 2, 3, 4)');

        var listDataChildToAdd = ListDataFull.filter(x => x.sortOrder >= 2 && x.sortOrder <= 4);

        //console.log('Adding', listDataChildToAdd.length, 'rows');

        // Update ALL icons to open
        $('div[col-id="orderCode"] span.ag-icon').removeClass('ag-icon-tree-closed').addClass('ag-icon-tree-open');
        $('div[col-id="pondName"] span.ag-icon').removeClass('ag-icon-tree-closed').addClass('ag-icon-tree-open');
        $('div[col-id="agentName"] span.ag-icon').removeClass('ag-icon-tree-closed').addClass('ag-icon-tree-open');

        gridApiTraceability.applyTransaction({ add: listDataChildToAdd });

        ListDataFull.forEach(x => {
            if (x.sortOrder > 0) x.isOpenChild = true;
        });

    } else {
        // COLLAPSE ALL
        //console.log('➖ Collapsing all rows');

        var listDataChildToRemove = ListDataFull.filter(x => x.sortOrder >= 2 && x.sortOrder <= 4);

        //console.log('Removing', listDataChildToRemove.length, 'rows');

        // Update ALL icons to closed
        $('div[col-id="orderCode"] span.ag-icon').removeClass('ag-icon-tree-open').addClass('ag-icon-tree-closed');
        $('div[col-id="pondName"] span.ag-icon').removeClass('ag-icon-tree-open').addClass('ag-icon-tree-closed');
        $('div[col-id="agentName"] span.ag-icon').removeClass('ag-icon-tree-open').addClass('ag-icon-tree-closed');

        gridApiTraceability.applyTransaction({ remove: listDataChildToRemove });

        ListDataFull.forEach(x => x.isOpenChild = false);
    }

    ResetValueArrParentIds();
    gridApiTraceability.refreshCells({ force: true });
}

// Reset arrParentIds
function ResetValueArrParentIds() {
    arrParentIds = [];
}

// ========================================
// EXPORT TO EXCEL
// ========================================
function exportToExcel() {
    //console.log('📊 Exporting to Excel...');
    const params = {
        fileName: `Traceability_4Levels_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Traceability'
    };
    gridApiTraceability.exportDataAsExcel(params);
}

// ========================================
// STATUS BAR UPDATES
// ========================================
function updateStatusBar(total) {
    if ($('#totalRecords').length > 0) {
        var level1 = ListDataFull.filter(x => x.sortOrder === 1).length;
        var level2 = ListDataFull.filter(x => x.sortOrder === 2).length;
        var level3 = ListDataFull.filter(x => x.sortOrder === 3).length;
        var level4 = ListDataFull.filter(x => x.sortOrder === 4).length;
        $('#totalRecords').html(`
            Tổng: <strong>${total}</strong> rows | 
            Orders: <strong>${level1}</strong> | 
            Ponds: <strong>${level2}</strong> | 
            Agents: <strong>${level3}</strong> | 
            Farms: <strong>${level4}</strong>
        `);
    }
}

function updateLastUpdateTime() {
    if ($('#lastUpdate').length > 0) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN');
        $('#lastUpdate').text(`Cập nhật: ${timeStr}`);
    }
}

// ========================================
// ERROR HANDLING
// ========================================
function showError(message) {
    console.error('❌ Error:', message);
    if (typeof NotificationToast !== 'undefined') {
        NotificationToast("error", message);
    } else {
        alert('Error: ' + message);
    }
}

// ========================================
// CUSTOM HEADER
// ========================================
function CustomHeaderTraceability() { }

CustomHeaderTraceability.prototype.init = function (params) {
    this.params = params;
    var strHiddenAsc = params.sortOrderDefault == 'asc' ? '' : 'ag-hidden';
    var strHiddenDesc = params.sortOrderDefault == 'desc' ? '' : 'ag-hidden';
    this.eGui = document.createElement('div');
    this.eGui.className = "ag-header-cell-label";
    this.eGui.innerHTML =
        '<span class="ag-header-cell-text">' +
        this.params.displayName +
        '</span>' +
        '<span class="ag-header-icon ag-header-label-icon ag-sort-ascending-icon ' + strHiddenAsc + '"><span class="ag-icon ag-icon-asc"></span></span>' +
        '<span class="ag-header-icon ag-header-label-icon ag-sort-descending-icon ' + strHiddenDesc + '"><span class="ag-icon ag-icon-desc"></span></span>';

    if (this.params.style != null && this.params.style != undefined) {
        this.eGui.style = this.params.style;
    }

    this.eSortDownButton = this.eGui.querySelector('.ag-sort-descending-icon');
    this.eSortUpButton = this.eGui.querySelector('.ag-sort-ascending-icon');

    if (params.sortOrderDefault != null && params.sortOrderDefault != undefined) {
        if (typeof sortData !== 'undefined') {
            sortData.sortColumnEventActual = params.column.colId;
            sortData.sortOrderEventActual = params.sortOrderDefault;
        }
    }

    if (this.params.enableSorting) {
        this.onSortChangedListener = this.onSortChanged.bind(this);
        this.eGui.addEventListener('click', this.onSortChangedListener);
    } else {
        this.eGui.removeChild(this.eSortDownButton);
        this.eGui.removeChild(this.eSortUpButton);
    }
};

CustomHeaderTraceability.prototype.onSortChanged = function () {
    $('.ag-sort-ascending-icon').not($(this.eSortUpButton)).addClass('ag-hidden');
    $('.ag-sort-descending-icon').not($(this.eSortDownButton)).addClass('ag-hidden');

    if (!$(this.eSortUpButton).hasClass('ag-hidden') || ($(this.eSortDownButton).hasClass('ag-hidden') && $(this.eSortUpButton).hasClass('ag-hidden'))) {
        $(this.eSortDownButton).removeClass('ag-hidden');
        $(this.eSortUpButton).addClass('ag-hidden');
        if (typeof sortData !== 'undefined') {
            sortData.sortOrderEventActual = 'desc';
        }
    } else if (!$(this.eSortDownButton).hasClass('ag-hidden')) {
        $(this.eSortUpButton).removeClass('ag-hidden');
        $(this.eSortDownButton).addClass('ag-hidden');
        if (typeof sortData !== 'undefined') {
            sortData.sortOrderEventActual = 'asc';
        }
    }
    if (typeof sortData !== 'undefined') {
        sortData.sortColumnEventActual = this.params.column.colId;
    }
    this.onSortRequested();
};

CustomHeaderTraceability.prototype.getGui = function () {
    return this.eGui;
};

CustomHeaderTraceability.prototype.onSortRequested = function () {
    RefreshAllGridWhenChangeData();
};

CustomHeaderTraceability.prototype.destroy = function () {
    this.eGui.removeEventListener('click', this.onSortChangedListener);
};

// ========================================
// HELPER FUNCTIONS
// ========================================
function htmlDecode(input) {
    if (!input) return '';
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

function ParseBool(val) {
    return val === true || val === "true";
}

function IsNullOrEmpty(value) {
    return value === null || value === undefined || value === '';
}
function cellHide(params) {
    return params.isOpenChild;
}