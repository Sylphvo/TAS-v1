var arrMsgAgrid = { All: '' };
var arrValAgrid = {
    listFilterSelect: [],
    listDataSelected: [],
    listDataFilter: typeof ReadLocalStorage === 'function' ? ReadLocalStorage('ARR_AGRID_LIST_DATA_FILTER') ?? [] : [],
    gridIdSelect: '',
    listColNotFormatCurrency: []
};
//isSetColIdByGridId true: id filter by GridId, false: id filter not by GridId
function getFloatingFilterInputComponent(isSetColIdByGridId) {
	function FloatingFilterInput() { }

	FloatingFilterInput.prototype.init = function (params) {
		let gridId = isSetColIdByGridId ? params.api.alignedGridsService.gridOptionsService.eGridDiv.id : '';
		this.eGui = document.createElement('div');
		if (arrValAgrid.listFilterSelect.includes(params.column.colId)) {
            this.eGui.innerHTML = '<select style="width: calc(100% - 4px);margin-left:2px;" class="h-search select-filter-custom" id="' + gridId + 'ag-filter-' + params.column.colId + '" gridId="' + gridId + '"><option value="" selected="selected">' + arrMsgAgrid.All + '</option></select>';
		}
		else {
			this.eGui.innerHTML = '<div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-text-field-input-wrapper" role="presentation">' +
				'<input ref="eInput" class="h-search ag-input-field-input ag-text-field-input" type="text" id="' + gridId + 'ag-filter-' + params.column.colId + '" gridId="' + gridId + '">' +
			'</div>';
		}
		
		this.currentValue = null;
		this.eFilterInput = this.eGui.querySelector('input');
		var that = this;

        function onInputBoxChanged(obj) {
            arrValAgrid.gridIdSelect = obj.attributes.gridid.nodeValue;
            if (params.funcFilterGrid) {
                params.funcFilterGrid();
            }
            else {
                RefreshAllGridWhenChangeData();
            }
		}

        $(this.eFilterInput).keyup(delay(function (e) {
            SetValueDataFilter(this.attributes.gridid.nodeValue, this.id, this.value);
            onInputBoxChanged(this);

			if (e.keyCode == 13 || e.keyCode == 27) {
				$(this).blur();
			}
		}, params.filterParams.debounceMs));
	};

	//ThongND: Ham xu ly khi search xong
	FloatingFilterInput.prototype.onParentModelChanged = function (parentModel) { };
	//ThongND: Ham xu ly khi search xong END

	FloatingFilterInput.prototype.getGui = function () {
		return this.eGui;
	};

	FloatingFilterInput.prototype.afterGuiAttached = function () {
		SetOptionFilter(this.eGui);
        RenderValueFilter(this.eFilterInput);
	};
	return FloatingFilterInput;
}
//VuongLV: Hàm để render value trên textbox Filter End
function SetOptionFilter() { }

//VuongLV: Ham set value vao DataFilter
function SetValueDataFilter(gridId, col_name, value) {
    let dataFilter = { gridId: gridId, col: col_name, value: value };
    arrValAgrid.listDataFilter = arrValAgrid.listDataFilter.filter(x => x.gridId != dataFilter.gridId || x.col != dataFilter.col);
    if (!IsNullOrEmpty(value)) {
        arrValAgrid.listDataFilter.push(dataFilter);
    }
}
//VuongLV: Ham set value vao DataFilter End

//VuongLV: Hàm để render value trên textbox Filter
function RenderValueFilter(obj) {
	let gridId = $(obj).attr('gridId');
	let colName = $(obj).attr('id');
	let filter = arrValAgrid.listDataFilter.find(x => (x.gridId == gridId) && (x.col == colName));

	if (!IsNullOrEmpty(filter)) {
		$(obj).val(filter.value);
	}
}

function delay(callback, ms) {
    var timer = 0;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}

function CustomLoadingOverlay() { }

CustomLoadingOverlay.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div class="ag-overlay-loading-center" style="background-color:#ffffff;border-radius:20px;"><img src="../../Contents/imgs/loading-spinner-grey.gif"/><span>' + params.loadingMessage + '</span></div>';
};

CustomLoadingOverlay.prototype.getGui = function () {
    return this.eGui;
};

function CustomHeader() { }

CustomHeader.prototype.init = function (params) {
    this.params = params;
    this.gridId = params.api.alignedGridsService.gridOptionsService.eGridDiv.id;
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

    if (!IsNullOrEmpty(this.params.style)) {
        this.eGui.style = this.params.style;
    }

    this.eSortDownButton = this.eGui.querySelector('.ag-sort-descending-icon');
    this.eSortUpButton = this.eGui.querySelector('.ag-sort-ascending-icon');

    if (!IsNullOrEmpty(params.sortOrderDefault)) {
        sortData.sortColumn = params.column.colId;
        sortData.sortOrder = params.sortOrderDefault;
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

CustomHeader.prototype.onSortChanged = function () {
    //Remove tất cả icon sort ở col khác
    $('#' + this.gridId).find('.ag-sort-ascending-icon').not($(this.eSortUpButton)).addClass('ag-hidden');
    $('#' + this.gridId).find('.ag-sort-descending-icon').not($(this.eSortDownButton)).addClass('ag-hidden');
    //
    if (!$(this.eSortUpButton).hasClass('ag-hidden') || ($(this.eSortDownButton).hasClass('ag-hidden') && $(this.eSortUpButton).hasClass('ag-hidden'))) {
        $(this.eSortDownButton).removeClass('ag-hidden');
        $(this.eSortUpButton).addClass('ag-hidden');
        sortData.sortOrder = 'desc';
    }
    else if (!$(this.eSortDownButton).hasClass('ag-hidden')) {
        $(this.eSortUpButton).removeClass('ag-hidden');
        $(this.eSortDownButton).addClass('ag-hidden');
        sortData.sortOrder = 'asc';
    }
    sortData.sortColumn = this.params.column.colId;
    this.onSortRequested(sortData);
};

CustomHeader.prototype.getGui = function () {
    return this.eGui;
};

CustomHeader.prototype.onSortRequested = function (sortData) {
    if (this.params.funcSortGrid) {
        this.params.funcSortGrid(sortData);
    }
    else {
        RefreshAllGridWhenChangeData();
    }
};

CustomHeader.prototype.destroy = function () {
    this.eGui.removeEventListener(
        'click',
        this.onSortChangedListener
    );
};

// cell renderer class
function CustomTreeData() { }

// init method gets the details of the cell to be renderer
CustomTreeData.prototype.init = function (params) {
    if (params.data.SORT_ORDER == 1) {
        this.eGui = document.createElement('span');
        this.eGui.className = 'ag-group-value';
        this.eGui.innerText = params.value;
        $(this.eGui).parent().append('<span class="ag-group-expanded" onclick="ShowOrHideRowChildren(this)" rowIndex="' + params.rowIndex + '"><span class="ag-icon ag-icon-tree-closed"></span></span>');
    }
};

CustomTreeData.prototype.getGui = function () {
    return this.eGui;
};

function setStyle(element, propertyObject) {
    for (var property in propertyObject) {
        element.style[property] = propertyObject[property];
    }
}

function BtnCellEditRenderer() { }
function BtnCellDeleteRenderer() { }

BtnCellEditRenderer.prototype.init = function (params) {
    this.params = params;

    this.eGuiEdit = document.createElement('button');
    this.eGuiEdit.innerHTML = 'Edit';

    this.btnClickedHandler = this.btnClickedHandler.bind(this);
    this.eGuiEdit.addEventListener('click', this.btnClickedHandler);
}
BtnCellDeleteRenderer.prototype.init = function (params) {
    this.params = params;

    this.eGuiDelete = document.createElement('button');
    this.eGuiDelete.innerHTML = 'Delete';

    this.btnClickedHandler = this.btnClickedHandler.bind(this);
    this.eGuiDelete.addEventListener('click', this.btnClickedHandler);
}

BtnCellEditRenderer.prototype.getGui = function () {
    return this.eGuiEdit;
}
BtnCellDeleteRenderer.prototype.getGui = function () {
    return this.eGuiDelete;
}

BtnCellEditRenderer.prototype.destroy = function () {
    this.eGuiEdit.removeEventListener('click', this.btnClickedHandler);
}
BtnCellDeleteRenderer.prototype.destroy = function () {
    this.eGuiDelete.removeEventListener('click', this.btnClickedHandler);
}

BtnCellEditRenderer.prototype.btnClickedHandler = function (event) {
    this.params.clicked(this.params.value);
}
BtnCellDeleteRenderer.prototype.btnClickedHandler = function (event) {
    this.params.clicked(this.params.value);
}
function NumericCellEditor() {
}

// gets called once before the renderer is used
NumericCellEditor.prototype.init = function (params) {
    // create the cell
    let sort_order = params.data.SORT_ORDER;
    let sort_order_group = params.data.SORT_ORDER_GROUP;
    this.eInput = document.createElement('input');

    if (isCharNumeric(params.charPress)) {
        this.eInput.value = params.charPress;
    } else {
        if (params.value !== undefined && params.value !== null) {
            this.eInput.value = params.value;
        }
    }

    var that = this;
    this.eInput.addEventListener('keypress', function (event) {
        if (!isKeyPressedNumeric(event)) {
            that.eInput.focus();
            if (event.preventDefault) event.preventDefault();
        } else if (that.isKeyPressedNavigation(event)) {
            event.stopPropagation();
        }
    });

    // only start edit if key pressed is a number, not a letter
    var isedit = !(params.data.SORT_ORDER == 1);
    this.cancelBeforeStart = !isedit;
    $(this.eInput).css({ 'width': '100%', 'text-align': 'right' })
};

NumericCellEditor.prototype.isKeyPressedNavigation = function (event) {
    return event.keyCode === 39
        || event.keyCode === 37;
};

// gets called once when grid ready to insert the element
NumericCellEditor.prototype.getGui = function () {
    return this.eInput;
};

// focus and select can be done after the gui is attached
NumericCellEditor.prototype.afterGuiAttached = function () {
    this.eInput.focus();
};

// returns the new value after editing
NumericCellEditor.prototype.isCancelBeforeStart = function () {
    return this.cancelBeforeStart;
};

// example - will reject the number if it contains the value 007
// - not very practical, but demonstrates the method.
NumericCellEditor.prototype.isCancelAfterEnd = function () {
    var value = this.getValue();
    return value.indexOf('007') >= 0;
};

// returns the new value after editing
NumericCellEditor.prototype.getValue = function () {
    return this.eInput.value;
};

// any cleanup we need to be done here
NumericCellEditor.prototype.destroy = function () {
    // but this example is simple, no cleanup, we could  even leave this method out as it's optional
};

// if true, then this editor will appear in a popup 
NumericCellEditor.prototype.isPopup = function () {
    // and we could leave this method out also, false is the default
    return false;
};

function isCharNumeric(charStr) {
    return !!/\d/.test(charStr);
}

function isKeyPressedNumeric(event) {
    var charCode = getCharCodeFromEvent(event);
    var charStr = String.fromCharCode(charCode);
    return isCharNumeric(charStr);
}

function getCharCodeFromEvent(event) {
    event = event || window.event;
    return (typeof event.which == "undefined") ? event.keyCode : event.which;
}

// function to act as a class
function MyCellEditor() { }

// gets called once before the renderer is used
MyCellEditor.prototype.init = function (params) {
    // create the cell
    this.eInput = document.createElement('input');
    this.eInput.value = params.value;

    var isedit = !(params.data.SORT_ORDER == 1);
    this.cancelBeforeStart = !isedit;
    $(this.eInput).css({ 'width': '100%', 'text-align': 'left' })
};

// gets called once when grid ready to insert the element
MyCellEditor.prototype.getGui = function () {
    return this.eInput;
};

// focus and select can be done after the gui is attached
MyCellEditor.prototype.afterGuiAttached = function () {
    this.eInput.focus();
    this.eInput.select();
};
MyCellEditor.prototype.isCancelBeforeStart = function () {
    return this.cancelBeforeStart;
};

// example - will reject the number if it contains the value 007
// - not very practical, but demonstrates the method.
MyCellEditor.prototype.isCancelAfterEnd = function () {
    var value = this.getValue();
    return value.indexOf('007') >= 0;
};
// returns the new value after editing
MyCellEditor.prototype.getValue = function () {
    return this.eInput.value;
};

// any cleanup we need to be done here
MyCellEditor.prototype.destroy = function () {
    // but this example is simple, no cleanup, we could
    // even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
MyCellEditor.prototype.isPopup = function () {
    // and we could leave this method out also, false is the default
    return false;
};

//////////////////////////////////////
function MyCellCalendarEditor() { }

// gets called once before the renderer is used
MyCellCalendarEditor.prototype.init = function (params) {
    // create the cell
    this.eInput = document.createElement('input');
    this.eInput.value = params.value;

    var isedit = !(params.data.SORT_ORDER == 1);
    this.cancelBeforeStart = !isedit;
    $(this.eInput).css({ 'width': '100%', 'text-align': 'left' })
    // $(this.eInput).datepicker({ dateFormat: "yy/mm/dd" });
    $.datetimepicker.setLocale(IsNullOrEmpty(params.locale) ? 'vi' : params.locale);
    $(this.eInput).datetimepicker({
        format: 'Y/m/d',
        defaultTime: '8:00',
        datepicker: true,
        timepicker: false,
        locale: 'vi',
        // minDate: params.YEAR_SELECT !== undefined ? params.YEAR_SELECT + '/01/01' : null,
        // maxDate: params.YEAR_SELECT !== undefined ? params.YEAR_SELECT + '/12/31' : null
    }).keydown(function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (event.which === 13) {
            gridOptions.api.stopEditing(false);
        }
        else if (event.which === 27) {
            gridOptions.api.stopEditing(true);
        }
    });
};

// gets called once when grid ready to insert the element
MyCellCalendarEditor.prototype.getGui = function () {
    return this.eInput;
};

// focus and select can be done after the gui is attached
MyCellCalendarEditor.prototype.afterGuiAttached = function () {
    this.eInput.focus();
    this.eInput.select();
};
MyCellCalendarEditor.prototype.isCancelBeforeStart = function () {
    return this.cancelBeforeStart;
};

// example - will reject the number if it contains the value 007
// - not very practical, but demonstrates the method.
MyCellCalendarEditor.prototype.isCancelAfterEnd = function () {
    // var value = this.getValue();
    return false;
};
// returns the new value after editing
MyCellCalendarEditor.prototype.getValue = function () {
    return this.eInput.value;
};

// any cleanup we need to be done here
MyCellCalendarEditor.prototype.destroy = function () {
    // but this example is simple, no cleanup, we could
    // even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
MyCellCalendarEditor.prototype.isPopup = function () {
    // and we could leave this method out also, false is the default
    return false;
};

function MyCellCalendarEditor_0() { }

// gets called once before the renderer is used
MyCellCalendarEditor_0.prototype.init = function (params) {
    // create the cell
    this.eInput = document.createElement('input');
    this.eInput.value = params.value;

    var isedit = !(params.data.SORT_ORDER == 1);
    this.cancelBeforeStart = !isedit;
    $(this.eInput).css({ 'width': '100%', 'text-align': 'left' })
    // $(this.eInput).datepicker({ dateFormat: "yy/mm/dd" });
    $.datetimepicker.setLocale(IsNullOrEmpty(params.locale) ? 'vi' : params.locale);
    $(this.eInput).datetimepicker({
        format: 'Y/m/d',
        defaultTime: '8:00',
        datepicker: true,
        timepicker: false,
        locale: 'vi',
        // minDate: params.YEAR_SELECT !== undefined ? params.YEAR_SELECT + '/01/01' : null,
        // maxDate: params.YEAR_SELECT !== undefined ? params.YEAR_SELECT + '/12/31' : null
    }).keydown(function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (event.which === 13) {
            gridOptions_0.api.stopEditing(false);
        }
        else if (event.which === 27) {
            gridOptions_0.api.stopEditing(true);
        }
    });
};

// gets called once when grid ready to insert the element
MyCellCalendarEditor_0.prototype.getGui = function () {
    return this.eInput;
};

// focus and select can be done after the gui is attached
MyCellCalendarEditor_0.prototype.afterGuiAttached = function () {
    this.eInput.focus();
    this.eInput.select();
};
MyCellCalendarEditor_0.prototype.isCancelBeforeStart = function () {
    return this.cancelBeforeStart;
};

// example - will reject the number if it contains the value 007
// - not very practical, but demonstrates the method.
MyCellCalendarEditor_0.prototype.isCancelAfterEnd = function () {
    // var value = this.getValue();
    return false;
};
// returns the new value after editing
MyCellCalendarEditor_0.prototype.getValue = function () {
    return this.eInput.value;
};

// any cleanup we need to be done here
MyCellCalendarEditor_0.prototype.destroy = function () {
    // but this example is simple, no cleanup, we could
    // even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
MyCellCalendarEditor_0.prototype.isPopup = function () {
    // and we could leave this method out also, false is the default
    return false;
};

function MyCellCalendarEditor_1() { }

// gets called once before the renderer is used
MyCellCalendarEditor_1.prototype.init = function (params) {
    // create the cell
    this.eInput = document.createElement('input');
    this.eInput.value = params.value;

    var isedit = !(params.data.SORT_ORDER == 1);
    this.cancelBeforeStart = !isedit;
    $(this.eInput).css({ 'width': '100%', 'text-align': 'left' })
    // $(this.eInput).datepicker({ dateFormat: "yy/mm/dd" });
    $.datetimepicker.setLocale(IsNullOrEmpty(params.locale) ? 'vi' : params.locale);
    $(this.eInput).datetimepicker({
        format: 'Y/m/d',
        defaultTime: '8:00',
        datepicker: true,
        timepicker: false,
        locale: 'vi',
        // minDate: params.YEAR_SELECT !== undefined ? params.YEAR_SELECT + '/01/01' : null,
        // maxDate: params.YEAR_SELECT !== undefined ? params.YEAR_SELECT + '/12/31' : null
    }).keydown(function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (event.which === 13) {
            gridOptions_1.api.stopEditing(false);
        }
        else if (event.which === 27) {
            gridOptions_1.api.stopEditing(true);
        }
    });
};

// gets called once when grid ready to insert the element
MyCellCalendarEditor_1.prototype.getGui = function () {
    return this.eInput;
};

// focus and select can be done after the gui is attached
MyCellCalendarEditor_1.prototype.afterGuiAttached = function () {
    this.eInput.focus();
    this.eInput.select();
};
MyCellCalendarEditor_1.prototype.isCancelBeforeStart = function () {
    return this.cancelBeforeStart;
};

// example - will reject the number if it contains the value 007
// - not very practical, but demonstrates the method.
MyCellCalendarEditor_1.prototype.isCancelAfterEnd = function () {
    // var value = this.getValue();
    return false;
};
// returns the new value after editing
MyCellCalendarEditor_1.prototype.getValue = function () {
    return this.eInput.value;
};

// any cleanup we need to be done here
MyCellCalendarEditor_1.prototype.destroy = function () {
    // but this example is simple, no cleanup, we could
    // even leave this method out as it's optional
};

// if true, then this editor will appear in a popup
MyCellCalendarEditor_1.prototype.isPopup = function () {
    // and we could leave this method out also, false is the default
    return false;
};
//ThongND: 20210120 Add function chung xu ly chuc nang An/Hien cap cha con
function ShowOrHideRowChildren(id_list, selector, funcSetValueArrParentIds, sortOrder) {
    var selectorCell = $(selector).parent().parent().parent();
    var selectorRow = $(selectorCell).parent();
    var itemParent = listDataFull.find(x => x.sortIdList == id_list);
    var row_index = parseInt($(selectorRow).attr('row-index')) + 1;
    var listChild;
    if (sortOrder == 1) {
        listChild = listRowChild.filter(function (item) {
            return id_list == id_list.substring(0, item.sortIdList.lastIndexOf('__'));
        });
    }
    else if (sortOrder == 2) {
        listChild = listRowChild.filter(function (item) {
            return item.sortIdList.includes(id_list) && item.sortOrder == sortOrder + 1;
        });
    }

    if (itemParent.isOpenChild) {
        //Close Row
        $(selector).attr('class', 'ag-icon ag-icon-tree-closed');
        itemParent.isOpenChild = false;
        gridOptions.api.applyTransaction({ remove: listChild });
        listChild.forEach(function (item) {
            item.isOpenChild = false;
        });

        if (typeof funcSetValueArrParentIds === 'function') {
            let arrParentIds = [...listChild.map(x => x.sortIdList)];
            funcSetValueArrParentIds(arrParentIds, false);
        }
    } else {
        if (sortOrder == 1) {
            listChild = listChild.filter(function (item) {
                return item.sortOrder == sortOrder + 1;
            });
        }
        //Open Row
        $(selector).attr('class', 'ag-icon ag-icon-tree-open');
        itemParent.isOpenChild = true;
        gridOptions.api.applyTransaction({
            add: listChild,
            addIndex: row_index,
        });

        if (typeof funcSetValueArrParentIds === 'function') {
            let arrParentIds = [...listChild.map(x => x.sortIdList)];
            funcSetValueArrParentIds(arrParentIds, true);
        }
    }
}

function ShowOrHideRowChildrenNew(id_list, selector) {
    var selectorCell = $(selector).parent().parent().parent();
    var selectorRow = $(selectorCell).parent();
    var row_index = parseInt($(selectorRow).attr('row-index')) + 1;
    var itemParent = listDataFull.find(x => x.sortIdList == id_list);
    var currentParent = itemParent;
    var listChild = listRowChild.filter(function (item) {
        currentParent = IsRowChildrentNext(id_list, item.sortIdList) ? item : currentParent;
        return id_list == id_list.substring(0, item.sortIdList.lastIndexOf('__'));
    });

    if (itemParent.isOpenChild) {
        //Close Row
        $(selector).attr('class', 'ag-icon ag-icon-tree-closed');
        itemParent.isOpenChild = false;
        gridApi.applyTransaction({ remove: listChild });
        listChild.forEach(function (item) {
            item.isOpenChild = false;
        });
    } else {
        //Open Row
        $(selector).attr('class', 'ag-icon ag-icon-tree-open');
        itemParent.isOpenChild = true;
        gridApi.applyTransaction({
            add: listChild,
            addIndex: row_index,
        });
    }
}

function ShowOrHideChildRow(id_list, selector) {
    var selectorCell = $(selector).parent().parent().parent();
    var selectorRow = $(selectorCell).parent();
    var row_index = parseInt($(selectorRow).attr('row-index')) + 1;
    var itemParent = listDataFull.find(x => x.ID_LIST == id_list);
    var currentParent = itemParent;
    var idListChildOpen = listRowChild.filter(x => (x.ID_LIST_PARENT == id_list && x.isOpenChild)
        || (x.ID_LIST_PARENT.indexOf(id_list) >= 0 && x.isOpenChild))
        .map(x => x.ID_LIST);
    var listRowChildFilter = listRowChild.filter(x => x.ID_LIST_PARENT == id_list || idListChildOpen.some(y => y == x.ID_LIST_PARENT));
    var listChild = listRowChildFilter.filter(function (item) {
        currentParent = IsRowChildrentNext(id_list, GetIDCurrent(item)) ? item : currentParent;
        return $("<div></div>").html(item.SAVE_BUTTON).find('[id_list^="' + id_list + '"]').length != 0
            && (itemParent.isOpenChild && currentParent.isOpenChild ? $('.ag-group-expanded .ag-icon-tree-closed[id_list="' + GetRowIDParent(item) + '"]').length == 0 : IsRowChildrentNext(id_list, GetIDCurrent(item)))
            && $("<div></div>").html(item.SAVE_BUTTON).find('[id_list="' + id_list + '"]').length == 0;
    });

    if (itemParent.isOpenChild) {
        //Close Row
        $(selector).attr('class', 'ag-icon ag-icon-tree-closed');
        itemParent.isOpenChild = false;
        gridApi.applyTransaction({ remove: listChild });
        listChild.forEach(function (item) {
            item.isOpenChild = false;
        });
        listRowOpen = listRowOpen.filter(x => x.ID_LIST.indexOf(itemParent.ID_LIST) < 0);
    } else {
        //Open Row
        $(selector).attr('class', 'ag-icon ag-icon-tree-open');
        itemParent.isOpenChild = true;
        gridApi.applyTransaction({
            add: listChild,
            addIndex: row_index,
        });
        listRowOpen.push(itemParent);
    }
}

function IsRowChildrentNext(idListParent, idListChild) {
    return idListParent == idListChild.substring(0, idListChild.lastIndexOf('_____'));
}

function GetIDCurrent(item) {
    return $("<div></div>").html(item.SAVE_BUTTON).find('input').attr('id_list');
}

function GetRowIDParent(item) {
    return $("<div></div>").html(item.SAVE_BUTTON).find('input').attr('id_list').substring(0, $("<div></div>").html(item.SAVE_BUTTON).find('input').attr('id_list').lastIndexOf('_____'));
}
//ThongND: 20210120 Add function chung xu ly chuc nang An/Hien cap cha con END

function SetValPaging(total) {
    $('span [ref=lbFirstRowOnPage]').text(total > 0 ? 1 : 0);
    $('span [ref=lbLastRowOnPage]').text(total);
    $('span [ref=lbRecordCount]').text(total);
}

var strHTMLCondition = '<div class="ag-filter-condition" ref="eJoinOperatorPanel">' +
    '<div role="presentation" ref="eJoinOperatorOr" class="ag-filter-condition-operator ag-filter-condition-operator-or ag-labeled ag-label-align-right ag-radio-button ag-input-field">' +
    '<div ref="eLabel" class="ag-input-field-label ag-label ag-radio-button-label">Hoặc</div>' +
    '<div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-radio-button-input-wrapper ag-checked" role="presentation">' +
    '<input ref="eInput" class="ag-input-field-input ag-radio-button-input" type="radio" id="[ID]">' +
    '</div>' +
    '</div>' +
    //'<div role="presentation" ref="eJoinOperatorOr" class="ag-filter-condition-operator ag-filter-condition-operator-or ag-labeled ag-label-align-right ag-radio-button ag-input-field">' +
    //     '<div ref="eLabel" class="ag-input-field-label ag-label ag-radio-button-label">OR</div>' +
    //     '<div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-radio-button-input-wrapper" role="presentation">' +
    //         '<input ref="eInput" class="ag-input-field-input ag-radio-button-input" type="radio" name="ag-simple-filter-and-or-258" aria-labelledby="ag-263-label">' +
    //     '</div>' +
    // '</div>' +
    '</div>';
var strHTMLInput = '<input ref="eInput" class="ag-input-field-input ag-text-field-input ag-custom-input" type="text" id="ag-input-[ID]" placeholder="Tìm kiếm..." aria-label="Filter Value">';

var temp = [];

function getFilterInputComponent() {
    function FilterInput() { }

    FilterInput.prototype.init = function (params) {
        this.eGui = document.createElement('div');
        this.eGui.className = "ag-filter-wrapper ag-focus-managed";
        this.eGui.innerHTML = '<div class="ag-filter-body-wrapper ag-simple-filter-body-wrapper body-wrapper-' + params.column.colId + '"><div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-text-field-input-wrapper" role="presentation">' + strHTMLInput.replace('[ID]', params.column.colId) + '</div></div><div class="ag-filter-apply-panel"><button type="button" ref="resetFilterButton" class="ag-standard-button ag-filter-apply-panel-button" onclick="ResetFilterInput(this, \'' + params.column.colId + '\')">Đặt lại</button><button type="button" ref="applyFilterButton" class="ag-standard-button ag-filter-apply-panel-button" onclick="ApplyFilterInput(\'' + params.column.colId + '\')">Áp dụng</button></div>';

        function onInputBoxChanged(selector) {
            var id = selector.attributes.id.value;
            if (!IsNullOrEmpty($(selector).val()) && temp.filter(function (item) { return item == id }).length == 0) {
                var idAuto = Math.floor(Math.random() * 1000);
                $(selector).parents('.body-wrapper-' + params.column.colId + '').append(strHTMLCondition.replace('[ID]', 'rdo' + params.column.colId + '_____' + idAuto) + strHTMLInput.replace('[ID]', params.column.colId + '_____' + idAuto));
                $('.body-wrapper-' + params.column.colId + ' .ag-filter-condition:gt(0)').css('margin-top', '9px');
                $("#ag-input-" + params.column.colId + "_____" + idAuto).keyup(delay(function (e) {
                    onInputBoxChanged(this);
                }, 10));
                temp.push(selector.attributes.id.value);
            }
            else if (IsNullOrEmpty($(selector).val())) {
                var index = $('.body-wrapper-' + params.column.colId + ' .ag-custom-input#' + $(selector).attr('id')).index();
                var arrID = [];
                arrID.push($(selector).attr('id'));
                $('.body-wrapper-' + params.column.colId + '').children(':gt(' + index + ')').each(function (index, item) {
                    $(item).remove();
                    arrID.push(item.id);
                });
                temp = temp.filter(item => !arrID.includes(item));
            }


        }

        $(this.eGui.querySelector('input.ag-custom-input')).keyup(delay(function (e) {
            onInputBoxChanged(this);
        }, 200));
    };

    FilterInput.prototype.getGui = function () {
        return this.eGui;
    };

    FilterInput.prototype.isFilterActive = function () {
        return this.filterActive;
    }

    // this example isn't using getModel() and setModel(),
    // so safe to just leave these empty. don't do this in your code!!!
    FilterInput.prototype.getModel = function () { }

    FilterInput.prototype.setModel = function () { }

    return FilterInput;
}

function ResetFilterInput(selector, colID) {
    var arrID = [];
    $(selector).parent().prev().children('[ref="eWrapper"]').find('input').val('');
    var id = $(selector).parent().prev().children('[ref="eWrapper"]').find('input').attr('id');
    arrID.push(id);
    $(selector).parent().prev().children().not('[ref="eWrapper"]').each(function (index, item) {
        $(item).remove();
        arrID.push(item.id);
    });
    temp = temp.filter(item => !arrID.includes(item));
    $('#CustomInput_' + colID).remove();
    $('.ag-header-cell[col-id="' + colID + '"] .ag-header-cell-label .ag-icon-filter').remove();
    RefreshAllGridWhenChangeData();
}

function ApplyFilterInput(colID) {
    var value = "";
    $('[id^="ag-input-' + colID + '"]').each(function (index, item) {
        if (!IsNullOrEmpty($(item).val()))
            value += $(item).val() + '____OR____';
    });
    if ($('#CustomInput_' + colID).length == 0)
        $('#divHidden').append('<span id="CustomInput_' + colID + '">' + value + '</span>');
    else
        $('#CustomInput_' + colID).html(value);
    if ($('.ag-header-cell[col-id="' + colID + '"] .ag-header-cell-label .ag-icon-filter').length == 0)
        $('.ag-header-cell[col-id="' + colID + '"] .ag-header-cell-label').append('<span class="ag-icon ag-icon-filter" unselectable="on" role="presentation"></span>');
    RefreshAllGridWhenChangeData();
}

//Phuvm 6/1/2025 Điều chỉnh kích thước cột khi đóng mở group action
function RegisterEventExpand(params) {
	$('.ag-header-expand-icon-expanded').click(function (e) {
		if ($(this).attr('ref') == 'agOpened') {
			params.api.sizeColumnsToFit(); 
		}
	})	
}

//VuongLV: Custom một bộ filter mới có thể tạo nhiều input filter 2025/03/05 => tham khảo setting ở màn hình TimeTrackingSheet
function getFloatingFilterMulti() {
    function FloatingFilterMulti() { }

    //Khởi tạo input filter
    FloatingFilterMulti.prototype.init = function (params) {
        let gridId = params.api.alignedGridsService.gridOptionsService.eGridDiv.id;
        let settingFilterMulti = params.settingFilterMulti;

        //Nếu chưa setting filter sẻ tự setting mặc định
        if (!settingFilterMulti) {
            settingFilterMulti = [{ type: 'input', name: params.column.colId, }];
        }

        this.eGui = document.createElement('div');
        this.eGui.style.display = 'flex';
        this.eGui.style.width = '100%';
        for (var settingFilter of settingFilterMulti) {
            //Kiểm tra nếu setting filter có type == 'selected' sẻ tạo selected filter
            if (!IsNullOrEmpty(settingFilter.type) && settingFilter.type == 'selected') {
                this.eGui.innerHTML += `
                    <div ref="eWrapper" class="ag-wrapper ag-input-wrapper justify-content-center" style="width:${100 / settingFilterMulti.length}%">
                        <select style="width: calc(100% - 4px);height:100%" title="${ParseString(settingFilter.tooltip)}" gridId="${gridId}" id="ag-filter-${settingFilter.name}">
                            <option value="" selected="selected">${arrMsgAgrid.All}</option>
                        </select>
                    </div>`;
            }
            else {
                this.eGui.innerHTML += `
                    <div ref="eWrapper" class="ag-wrapper ag-input-wrapper justify-content-center" style="width:${100 / settingFilterMulti.length}%">
                        <input style="width: calc(100% - 4px);height:100%" title="${ParseString(settingFilter.tooltip)}" gridId="${gridId}" id="ag-filter-${settingFilter.name}" type="text">
                    </div>`;
            }
        }

        this.eFilterInput = this.eGui.querySelectorAll('input');
        this.eFilterSelect = this.eGui.querySelectorAll('select');

        //Sử lý sự kiện khi key up input filter
        $(this.eFilterInput).keyup(delay(function (e) {
            if (IsCheckChangeValueFilter(this)) {
                SetValueDataFilter(this.attributes.gridid.nodeValue, this.id, this.value);
                onInputBoxChanged(this);
            }

            if (e.keyCode == 13 || e.keyCode == 27) {
                $(this).blur();
            }
        }, params.filterParams.debounceMs));

        //Sử lý filter data
        function onInputBoxChanged(obj) {
            //Nếu có setting function filter grid sẻ gọi đến function
            if (params.funcFilterGrid) {
                params.funcFilterGrid();
            }
        }

        //Kiểm tra data filter có bị thay đổi hay không
        function IsCheckChangeValueFilter(obj) {
            return (!arrValAgrid.listDataFilter.some(x => x.gridId == obj.attributes.gridid.nodeValue && x.col == obj.id && x.value == obj.value) && !IsNullOrEmpty(obj.value))
                || (arrValAgrid.listDataFilter.some(x => x.gridId == obj.attributes.gridid.nodeValue && x.col == obj.id) && IsNullOrEmpty(obj.value));
        }
    };

    FloatingFilterMulti.prototype.getGui = function () {
        return this.eGui;
    };

    FloatingFilterMulti.prototype.afterGuiAttached = function () {
        //Hàm sử lý sau khi render input => gọi lại hàm này ở màn hình chính trực tiếp sử lý tại đó
        SetOptionFilter(this);

        for (var filterInput of this.eFilterInput) {
            //Add value filter lại vào input trường hợp chạy lai header
            RenderValueFilter(filterInput);
        }
    };

    return FloatingFilterMulti;
}

//HungAnh: Custom tooltip 20/03/2025
function tooltipValueGetter(params) {
    const value = params.value;
    const isDecode = ParseBool(params.colDef.tooltipComponentParams ?.isDecode);

    if (IsNullOrEmpty(value) || value == 0) return "";
    if (IsHasSpecialCharacter(value)) return FormatSpecialCharacterCommon(value);
    if (arrValAgrid.listColNotFormatCurrency.includes(params.colDef.field)) return value;
    
    return typeof value == "string" ? (ValidateIsNum(ParseString(value)) || value < 0) ? formatCurrency(value, true, true) : (isDecode ? htmlDecode(value) : value) : value;
};

function headerTooltip(columns) {
    return columns.map(col => ({
        ...col,
        headerTooltip: col.headerName ? htmlDecode(col.headerName) : "", //Chỉ đặt tooltip nếu có headerName
        children: col.children ? headerTooltip(col.children) : undefined //Đệ quy nếu có children
    }));
};
//HungAnh: Custom tooltip 20/03/2025 End