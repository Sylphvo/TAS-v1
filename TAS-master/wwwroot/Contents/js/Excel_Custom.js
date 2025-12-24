function detectHeader(matrix) {
    for (let i = 0; i < Math.min(matrix.length, 30); i++) {
        const nonEmpty = (matrix[i] || []).filter(c => c !== null && String(c).trim() !== '').length;
        if (nonEmpty >= 3) return i;        // hàng đầu tiên có >=3 ô khác rỗng
    }
    return 0;
}
function buildHeader(cells) {
    const used = new Set();
    return (cells || []).map((v, idx) => {
        let k = String(v ?? '').trim() || `col_${idx + 1}`;
        let base = k, n = 2;
        while (used.has(k)) k = `${base}_${n++}`;
        used.add(k);
        return k;
    });
}
async function readExcelAsData(file, opts = {}) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];

    // Ma trận 2D
    const matrix = XLSX.utils.sheet_to_json(ws, {
        header: 1, raw: true, defval: null, blankrows: false
    });

    // Tự dò hàng tiêu đề hoặc dùng opts.headerRow nếu biết sẵn
    const headerRow = Number.isInteger(opts.headerRow) ? opts.headerRow : detectHeader(matrix);
    const header = buildHeader(matrix[headerRow] || []);

    // Lọc bỏ các dòng trống sau tiêu đề
    const body = matrix.slice(headerRow + 1)
        .filter(r => (r || []).some(c => c !== null && String(c).trim() !== ''));

    // Trả về mảng object
    const records = body.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? null])));

    return { headerRow, header, records, matrix };
}
function toColN(header, records) {
    const cols = header.map((_, i) => `col_${i + 1}`);
    const out = records.map(r => {
        const o = {};
        header.forEach((h, i) => { o[cols[i]] = r[h] ?? null; });
        return o;
    });
    return { header: cols, records: out };
}

function ImportExcelRubberGarden(inputElementId) {
    const el = document.getElementById(inputElementId);
    if (!el) return;

    // tránh đăng ký trùng
    if (el.dataset.excelWired === '1') return;
    el.dataset.excelWired = '1';

    // cho phép chọn lại cùng 1 file
    el.addEventListener('click', () => { el.value = ''; });

    el.addEventListener('change', async e => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const { header, records, } = await readExcelAsData(file);
            const { records: rowsColN } = toColN(header, records);
            var rowsData = rowsColN.map(r => ({
				STT: r.col_1,
				FarmCode: r.col_2,
                FarmerName: r.col_3,
                RubberKG: r.col_4,
                TSCPercent: r.col_5,
                DRCPercent: r.col_6,
                FinishedProductKg: r.col_7,
                CentrifugeProductKg: r.col_8,
                Status: r.col_9
            }));
            ImportExcelData(rowsData);
        } catch (err) {
            console.error(err);
        } finally {
            // cho lần sau, kể cả cùng file
            el.value = '';
        }
    });
}
function ImportExcelRubberFarm(inputElementId) {
    const el = document.getElementById(inputElementId);
    if (!el) return;

    // tránh đăng ký trùng
    if (el.dataset.excelWired === '1') return;
    el.dataset.excelWired = '1';

    // cho phép chọn lại cùng 1 file
    el.addEventListener('click', () => { el.value = ''; });

    el.addEventListener('change', async e => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const { header, records, } = await readExcelAsData(file);
            const { records: rowsColN } = toColN(header, records);
            var rowsData = rowsColN.map(r => ({
                STT: r.col_1,
                FarmCode: r.col_2,
                FarmerName: r.col_3,
                RubberKG: r.col_4,
                TSCPercent: r.col_5,
                DRCPercent: r.col_6,
                FinishedProductKg: r.col_7,
                CentrifugeProductKg: r.col_8,
                Status: r.col_9
            }));
            ImportExcelData(rowsData);
        } catch (err) {
            console.error(err);
        } finally {
            // cho lần sau, kể cả cùng file
            el.value = '';
        }
    });
}
// Export Excel Data
function onExportExcelData(fileName) {
    const ws = XLSX.utils.json_to_sheet(ListDataFull);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, fileName + '.xlsx');
}