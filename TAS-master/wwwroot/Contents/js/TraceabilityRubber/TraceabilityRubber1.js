const employmentType = ["Permanent", "Contract"];
const paymentMethod = ["Cash", "Check", "Bank Transfer"];
const paymentStatus = ["paid", "pending"];

const departments = {
    executiveManagement: "Executive Management",
    legal: "Legal",
    design: "Design",
    engineering: "Engineering",
    product: "Product",
    customerSupport: "Customer Support"
};

const departmentFormatter = (params) =>
    departments[params.value] ?? "";

const gridOptions = {
    columnDefs: [
        { headerName: "ID", field: "employeeId", width: 100 },
        {
            field: "department",
            width: 280,
            flex: 1,
            valueFormatter: departmentFormatter,
            cellRenderer: TagCellRenderer
        },
        {
            field: "employmentType",
            editable: true,
            width: 100,
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: { values: employmentType }
        },

        {
            field: "location",
            width: 250,
            flex: 1,
            cellRenderer: FlagCellRenderer,
            editable: true
        },
        { field: "joinDate", editable: true, width: 120 },
        {
            headerName: "Salary",
            field: "basicMonthlySalary",
            width: 100,
            valueFormatter: p =>
                p.value == null ? "" : "$" + Math.round(p.value).toLocaleString()
        },
        {
            field: "paymentMethod",
            editable: true,
            width: 150,
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: { values: paymentMethod }
        },
        {
            headerName: "Status",
            field: "paymentStatus",
            editable: true,
            width: 100,
            cellRenderer: StatusCellRenderer,
            cellEditor: "agRichSelectCellEditor",
            cellEditorParams: { values: paymentStatus }
        },
        {
            field: "contact",
            pinned: "right",
            width: 120,
            cellRenderer: ContactCellRenderer
        }
    ],
    rowData: getData(),
    rowHeight: 50,// chiều cao hàng
    headerHeight: 45,// chiều cao header
    treeData: true,
    groupDefaultExpanded: -1,
    getDataPath: (data) => data.orgHierarchy,
    autoGroupColumnDef: {
        headerName: "Employee",
        width: 300,
        pinned: "left",
        sort: "asc",
        cellRendererParams: {
            suppressCount: true,
            innerRenderer: EmployeeCellRenderer
        }
    }
};

// Setup grid
document.addEventListener("DOMContentLoaded", function () {
    const gridDiv = document.getElementById("myGrid");
    gridApi = agGrid.createGrid(gridDiv, gridOptions);    
});

function EmployeeCellRenderer(params) {
    const wrapper = document.createElement("div");
    wrapper.className = "employee-cell";

    const left = document.createElement("div");
    left.innerHTML = `
        <span>${params.value}</span><br>
    `;

    const img = document.createElement("img");
    img.src = `/hr/${params.data.image}.webp`;
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.marginRight = "10px";
    img.style.borderRadius = "50%";

    wrapper.appendChild(left);
    wrapper.appendChild(img);
    return wrapper;
}

function FlagCellRenderer(params) {
    const div = document.createElement("div");
    div.className = "flag-cell";
    div.innerHTML = `<span>${params.value}</span>`;

    const img = document.createElement("img");
    img.src = `/hr/${params.data.flag}.svg`;

    div.appendChild(img);
    return div;
}

function TagCellRenderer(params) {
    const div = document.createElement("div");
    div.className = "tag";
    div.innerHTML = `
        <div class="circle"></div>
        <span>${params.valueFormatted ?? params.value}</span>
    `;
    return div;
}

function StatusCellRenderer(params) {
    const div = document.createElement("div");
    div.className = "tag";

    if (params.value === "paid") {
        div.innerHTML = `
            <img src="/hr/tick.svg" style="width:14px" />
            <span>${params.value}</span>
        `;
    } else {
        div.innerHTML = `<span>${params.value}</span>`;
    }

    return div;
}

function ContactCellRenderer(params) {
    const name = params.data.orgHierarchy.at(-1).toLowerCase().replace(" ", ".");

    const wrap = document.createElement("div");
    wrap.className = "contact-cell";

    wrap.innerHTML = `
        <a href="https://www.linkedin.com/company/ag-grid/" target="_blank">
            <img src="/hr/linkedin.svg" />
        </a>
        <a href="mailto:${name}@company.com">
            <img src="/hr/email.svg" />
        </a>
    `;

    return wrap;
}
function getData() {
    return [
        {
            orgHierarchy: ['Ashley Rivers'],
            contact: 'Ashley.Rivers',
            jobTitle: 'CEO',
            employmentType: 'Permanent',
            department: 'executiveManagement',
            employeeId: 126225,
            location: 'France',
            joinDate: '2010-01-05',
            basicMonthlySalary: 3813.99,
            currency: 'GBP',
            paymentMethod: 'Bank Transfer',
            paymentStatus: 'paid',
            image: '19',
            flag: 'fr',
        },
        {
            orgHierarchy: ['Ashley Rivers', 'Deborah Love'],
            contact: 'Deborah.Love',
            jobTitle: 'CTO',
            employmentType: 'Permanent',
            department: 'legal',
            employeeId: 131244,
            location: 'Spain',
            joinDate: '2010-06-08',
            basicMonthlySalary: 8569.62,
            currency: 'EUR',
            paymentMethod: 'Bank Transfer',
            paymentStatus: 'paid',
            image: '23',
            flag: 'es',
        },
        {
            orgHierarchy: ['Ashley Rivers', 'Deborah Love', 'Michael Allen'],
            contact: 'Michael.Allen',
            jobTitle: 'Employee',
            employmentType: 'Contract',
            department: 'legal',
            employeeId: 331148,
            location: 'United Kingdom',
            joinDate: '2000-04-16',
            basicMonthlySalary: 11864.5,
            currency: 'EUR',
            paymentMethod: 'Bank Transfer',
            paymentStatus: 'pending',
            image: '17',
            flag: 'uk',
        },
        {
            orgHierarchy: ['Ashley Rivers', 'Deborah Love', 'Michael Allen', 'Peggy Williams'],
            contact: 'Peggy.Williams',
            jobTitle: 'Employee',
            employmentType: 'Contract',
            department: 'legal',
            employeeId: 263032,
            location: 'Netherlands',
            joinDate: '2004-08-01',
            basicMonthlySalary: 3205.7,
            currency: 'EUR',
            paymentMethod: 'Bank Transfer',
            paymentStatus: 'pending',
            image: '28',
            flag: 'ne',
        },
    ];
}
