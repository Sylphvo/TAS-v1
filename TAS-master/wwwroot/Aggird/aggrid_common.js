var arrMsgAgrid = { All: '' };
var arrValAgrid = {
	listFilterSelect: [],
	listDataSelected: [],
	listDataFilter: typeof ReadLocalStorage === 'function' ? ReadLocalStorage('ARR_AGRID_LIST_DATA_FILTER') ?? [] : [],
	gridIdSelect: '',
	listColNotFormatCurrency: []
};
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