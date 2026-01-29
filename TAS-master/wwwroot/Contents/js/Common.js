class SelectEditorWithTextDisplay {
    init(params) {
        this.params = params;

        this.eSelect = document.createElement('select');
        this.eSelect.className = 'ag-cell-edit-input cboSelect2Search';
        this.eSelect.style.width = '100%';
        this.eSelect.style.height = '100%';

        const currentValue = params.value;
        const objectData = params.colDef.field == 'agentCode' ? arrValue.comboAgent : arrValue.comboFarmCode;
        objectData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value; // FR001
            option.text = item.text;   // Nhà vườn ABC

            if (item.value === currentValue) {
                option.selected = true;
            }

            this.eSelect.appendChild(option);
        });
    }

    getGui() {
        return this.eSelect;
    }

    afterGuiAttached() {
        // ⚠️ BẮT BUỘC init Select2 ở đây
        $(this.eSelect).select2({
            width: '100%',
            dropdownAutoWidth: true,
            dropdownParent: $(this.eSelect).closest('.ag-cell'),
            minimumResultsForSearch: 0 // luôn hiện search
        });

        $(this.eSelect).focus();
    }

    getValue() {
        return $(this.eSelect).val(); // FR001
    }

    destroy() {
        // cleanup tránh memory leak
        if (this.eSelect) {
            $(this.eSelect).select2('destroy');
        }
    }
}

function CellStyle_Col_Model(params) {
    let cellAttr = {};
    cellAttr['text-align'] = 'center';
    return cellAttr;
}