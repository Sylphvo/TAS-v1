# TAS
Cây thư mục chuẩn của dự án .NET thường bao gồm các thư mục và tệp sau:

TASApp/                            ← Thư mục gốc dự án MVC
├─ TASApp.csproj                   ← File cấu hình project (.NET, package, framework)
├─ Program.cs                      ← Điểm khởi chạy, cấu hình middleware, routing, DI
├─ appsettings.json                ← Cấu hình chung (connection string, logging, v.v.)
├─ appsettings.Development.json    ← Cấu hình riêng cho môi trường Development
├─ Properties/
│  └─ launchSettings.json          ← Cấu hình môi trường debug khi chạy project
├─ Controllers/                    ← Chứa controller xử lý request, gọi service, trả về View/API
│  └─ HomeController.cs
├─ Models/                         ← Lớp POCO mô tả dữ liệu, ánh xạ bảng DB
│  └─ (POCO models)
├─ Data/                           ← Chứa DbContext và các seed dữ liệu
│  ├─ ApplicationDbContext.cs
│  └─ Seed/                        ← Khởi tạo dữ liệu mẫu
├─ Migrations/                     ← File migration do EF Core sinh ra để tạo/sửa DB
├─ Services/                       ← Nơi viết logic nghiệp vụ tách khỏi controller
│  ├─ Interfaces/                  ← Giao diện dịch vụ để Dependency Injection
│  └─ Implementations/             ← Lớp triển khai thực tế của service
├─ ViewModels/                     ← DTO dùng để hiển thị dữ liệu ra View
├─ Views/                          ← Razor view hiển thị UI
│  ├─ Shared/                      ← Layout và view dùng chung
│  │  ├─ _Layout.cshtml            ← Giao diện khung chung cho toàn site
│  │  └─ _ValidationScriptsPartial.cshtml ← Script validate form
│  └─ Home/                        ← View tương ứng với HomeController
│     ├─ Index.cshtml
│     └─ Privacy.cshtml
├─ ViewComponents/                 ← Thành phần UI tái sử dụng có logic riêng (mini controller)
├─ TagHelpers/                     ← Mở rộng cú pháp HTML trong Razor
├─ Middleware/                     ← Pipeline xử lý request/response tùy chỉnh
├─ Filters/                        ← Bộ lọc toàn cục (logging, auth, validation)
├─ wwwroot/                        ← Static file public: CSS, JS, ảnh
│  ├─ css/
│  ├─ js/
│  └─ lib/
├─ Resources/                      ← File .resx phục vụ đa ngôn ngữ
│  ├─ Controllers.{lang}.resx
│  └─ Views.{lang}.resx
└─ Areas/                          ← Phân khu chức năng độc lập (Admin, User,...)
   └─ Admin/
      ├─ Controllers/              ← Controller riêng cho khu vực Admin
      ├─ Views/                    ← View riêng cho khu vực Admin
      └─ Models/                   ← Model riêng cho khu vực Admin
