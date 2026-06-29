# 🚀 Antigravity IDE Blueprint: TAS Project (Cập nhật)

Tài liệu này đóng vai trò là "Kiến trúc tổng thể" (Architect's Blueprint) và ghi nhận trạng thái hiện tại dành cho các AI Agent trên nền tảng **Google Antigravity IDE**. 
Yêu cầu Agent đọc kỹ toàn bộ bối cảnh, tiêu chuẩn mã nguồn và lộ trình dự án trước khi đề xuất hoặc thực thi bất kỳ thay đổi nào trên source code.

---

## 1. 🎯 Bối Cảnh Dự Án (Project Context)
- **Hệ sinh thái:** .NET 8 (C#)
- **Kiến trúc:** ASP.NET Core MVC (Sử dụng Controller và View, hỗ trợ đa ngôn ngữ).
- **Cơ sở dữ liệu:** SQL Server với Entity Framework Core.
- **Tình trạng:** Đã hoàn thiện các cấu hình nền tảng cốt lõi (Identity, Localization, CORS, Services).

## 2. 🤖 Chỉ Thị Dành Cho Antigravity Agent (Agent Directives)

Vì Antigravity hoạt động theo mô hình **Agent-First**, Agent vui lòng tuân thủ quy trình sau:

1. **Planning Mode (Lập Kế Hoạch):** 
   - Trước khi thực thi bất kỳ tác vụ nào lớn, hãy tạo một **Artifact** "Kế hoạch triển khai" (Implementation Plan). 
   - Không tự ý viết code hàng loạt khi chưa có sự đồng ý.
2. **Cross-Surface Execution (Thực thi toàn diện):**
   - Vận dụng Terminal để chạy .NET CLI (`dotnet build`, `dotnet ef migrations`, `dotnet test`).
   - Tự động sửa lỗi nếu quá trình biên dịch thất bại.
3. **Verification & Artifacts (Xác minh & Báo cáo):**
   - Sau khi hoàn thành, dùng **Browser Sub-Agent** để kiểm thử các luồng chức năng.
   - Trả về kết quả/ảnh chụp màn hình chứng minh tính năng đã hoạt động.
4. **Knowledge Base (Học hỏi & Tối ưu):**
   - Ghi nhớ cách dự án đang cấu hình DI (Dependency Injection) trong `Program.cs` và mô hình MVC hiện tại.

## 3. 🛠 Kiến Trúc Hiện Tại & Tiêu Chuẩn Lập Trình

- **Cấu trúc Thư mục:** Giữ sự phân tách rõ ràng (`Controllers`, `Services`, `Repository`, `Models`, `ViewModels`, `DTOs`).
- **Dependency Injection (DI):** Đã đăng ký một lượng lớn Services & Repositories (`FarmModels`, `AgentModels`, `TraceabilityModels`,...) theo Scope trong `Program.cs`. Mọi Service mới phải được thêm vào đây.
- **Xác thực (Authentication):** Đang sử dụng **ASP.NET Core Identity** kết hợp **Cookie Authentication** (`RequireLoginAttribute` được áp dụng toàn cục). *(Lưu ý: Không dùng JWT như dự định ban đầu do cấu trúc đã chuyển sang Web MVC).*
- **Đa ngôn ngữ (Localization):** Hệ thống đang hỗ trợ tiếng Việt (`vi`) và tiếng Anh (`en`) qua Cookie/QueryString/Header.

## 4. 🗺 Trạng Thái & Lộ Trình Phát Triển (Roadmap)

Dựa trên việc đọc mã nguồn, đây là trạng thái hiện tại của dự án:

- [x] **Phase 1: Khởi tạo Database & ORM**
  - Đã kết nối Entity Framework Core (`AppDbContext`) với SQL Server.
  - Đã khởi tạo cấu trúc và Migrations.
- [x] **Phase 2: Xây dựng Cơ chế Xác thực (Authentication)**
  - Đã tích hợp ASP.NET Core Identity.
  - Đã cấu hình Cookie Authentication thay vì JWT (phù hợp với mô hình MVC).
- [x] **Phase 3: Triển khai CRUD cơ bản**
  - Đã áp dụng các Model/Service Pattern cho các module quan trọng như `UserAccount`, `Farm`, `Agent`, `Order`, `Traceability`, v.v.
- [ ] **Phase 4: Tối ưu & Mở rộng (Cần thực hiện)**
  - [ ] Tích hợp Serilog (hoặc thư viện tương đương) để ghi log hệ thống thay cho logger mặc định.
  - [ ] Xây dựng Unit Test (sử dụng xUnit/NUnit) để tự động hóa kiểm thử logic.
  - [ ] Bổ sung Rate Limiting.
  - [ ] Hoàn thiện các View (UI/UX) cho các chức năng tương ứng.

---
**Nhắc nhở cuối cùng cho Agent:** Hãy bám sát vào chuẩn MVC hiện tại. Chú ý các endpoint cần public phải có `[AllowAnonymous]`, vì filter `RequireLogin` đang chặn toàn cục. Nếu gặp lỗi khó hoặc thiếu thư viện, hãy chủ động giải thích và xin quyền để cài đặt qua NuGet.
# 🚀 Antigravity IDE Blueprint: .NET Core Project (No-API, Direct DB Connection)

Tài liệu này đóng vai trò là "Kiến trúc tổng thể" (Architect's Blueprint) dành cho các AI Agent trên nền tảng **Google Antigravity IDE**. 
Yêu cầu Agent đọc kỹ toàn bộ bối cảnh, tiêu chuẩn mã nguồn và lộ trình dự án trước khi đề xuất hoặc thực thi bất kỳ thay đổi nào trên source code.

---

## 1. 🎯 Bối Cảnh Dự Án (Project Context)
- **Hệ sinh thái:** .NET Core / .NET 8+ (C#)
- **Mô hình kiến trúc:** Ứng dụng liền khối (Monolith) / Render phía Server (MVC, Razor Pages, hoặc Blazor Server). **Không sử dụng Web API riêng biệt.**
- **Kết nối Dữ liệu:** Ứng dụng kết nối trực tiếp đến Database (Direct Database Connection).
- **Tình trạng:** Đã có source code cơ bản (Greenfield / Early stage).

## 2. 🤖 Chỉ Thị Dành Cho Antigravity Agent (Agent Directives)

Vì Antigravity hoạt động theo mô hình **Agent-First** với mức độ tự chủ cao, Agent vui lòng tuân thủ quy trình sau:

1. **Planning Mode (Lập Kế Hoạch):** - Trước khi thực thi bất kỳ tác vụ nào, hãy tạo một **Artifact** là bảng "Kế hoạch triển khai" (Implementation Plan). 
   - Không tự ý viết mã (code) hàng loạt khi chưa nhận được sự đồng ý từ người dùng.
2. **Cross-Surface Execution (Thực thi toàn diện):**
   - Vận dụng quyền truy cập Terminal để chạy các lệnh .NET CLI (vd: `dotnet build`, `dotnet run`, `dotnet ef migrations add`, `dotnet test`).
   - Tự động sửa lỗi nếu quá trình biên dịch (build) thất bại.
3. **Verification & Artifacts (Xác minh & Báo cáo):**
   - Không bắt người dùng phải đọc raw tool logs.
   - Khi hoàn thành tính năng, hãy sử dụng **Browser Sub-Agent** để điều hướng đến các route (trang) vừa tạo hoặc render giao diện.
   - Trả về Artifacts là ảnh chụp màn hình (Screenshots) giao diện web (HTML/CSS) hoặc kết quả test để chứng minh code đã hoạt động tốt.
4. **Knowledge Base (Học hỏi & Tối ưu):**
   - Ghi nhớ các pattern code, cấu trúc thư mục UI và cấu hình Entity Framework của dự án này để không lặp lại sai sót trong các vòng lặp (iteration) sau.

## 3. 🛠 Tiêu Chuẩn Lập Trình & Quy Tắc Cơ Sở Dữ Liệu (Coding & DB Standards)

- **Cấu trúc Thư mục:** Tổ chức chuẩn theo mô hình MVC (Models, Views, Controllers) hoặc Razor Pages (Pages). Tách biệt thư mục `Data` hoặc `Persistence` (chứa DbContext).
- **Kết nối Cơ sở dữ liệu (Database Connection):**
  - Cấu hình chuỗi kết nối an toàn trong `appsettings.json`. KHÔNG BAO GIỜ hardcode.
  - Sử dụng Entity Framework Core. Cấu hình DbContext trong `Program.cs`.
- **🚨 QUY TẮC ĐỒNG BỘ DATABASE KHI SỬA BẢNG/GIAO DIỆN (CRITICAL):**
  - Khi có yêu cầu chỉnh sửa giao diện dẫn đến thay đổi cấu trúc hiển thị, hoặc khi chỉnh sửa/thêm bớt các trường (Fields/Properties) của bảng ở tầng UI/Model, **Agent bắt buộc phải đọc file `AppDbContext.cs`** (hoặc file quản lý DbContext chính của dự án).
  - Agent cần phân tích kỹ cấu hình `DbSet`, các thiết lập Fluent API (mối quan hệ One-to-Many, Many-to-Many, ràng buộc khóa chính/khóa ngoại, Seed Data) bên trong `AppDbContext.cs` trước khi chỉnh sửa Model.
  - Sau khi chỉnh sửa Model, Agent phải tự động mở Terminal chạy các lệnh Migration để cập nhật lại Cơ sở dữ liệu:
    ```bash
    dotnet ef migrations add <Ten_Migration_Khớp_Với_Thay_Dổi>
    dotnet ef database update
    ```
  - Tuyệt đối không được bỏ qua bước này để tránh lỗi runtime do không đồng bộ giữa Mã nguồn (C#) và Cơ sở dữ liệu thực tế.
- **Giao tiếp Dữ liệu (Data Flow):** - Controllers (hoặc PageModels) gọi trực tiếp DbContext để lấy dữ liệu.
  - Trả dữ liệu trực tiếp về Views (Razor) hoặc ViewModels, không trả về JSON (trừ trường hợp Ajax request cục bộ).
- **Bất đồng bộ (Async/Await):** 100% các thao tác gọi Database phải sử dụng `async` và `await` (vd: `ToListAsync()`, `FirstOrDefaultAsync()`). Đừng quên suffix `Async` cho tên hàm.
- **Xử lý ngoại lệ (Error Handling):** Sử dụng các trang lỗi thân thiện với người dùng (ví dụ: chuyển hướng đến `/Home/Error` hoặc dùng ExceptionHandler middleware).

## 4. 🗺 Lộ Trình Phát Triển (Next Actions / Roadmap)

- [ ] **Phase 1: Khởi tạo Entity Framework Core & Database**
  - Khai báo các Entity/Model.
  - Cấu hình chuỗi kết nối trong `appsettings.json`.
  - Thiết lập `DbContext` và chạy migration lần đầu (`dotnet ef migrations add InitialCreate`, `dotnet ef database update`).
- [ ] **Phase 2: Xây dựng Giao diện UI Cơ bản (Layout & Routing)**
  - Hoàn thiện `_Layout.cshtml` chung (chứa Navbar, Footer).
  - Đảm bảo các route cơ bản hoạt động (Trang chủ, Giới thiệu).
- [ ] **Phase 3: Triển khai CRUD (Trực tiếp từ Controller/PageModel tới DB)**
  - Xây dựng một module quản lý cụ thể (ví dụ: Quản lý Sản phẩm).
  - Tạo các Views (hoặc Pages): Danh sách (Index), Thêm mới (Create), Chỉnh sửa (Edit), Chi tiết (Details), Xóa (Delete).
  - Đảm bảo binding dữ liệu từ View về Controller chính xác và lưu xuống Database thành công.
- [ ] **Phase 4: Cập nhật & Tiến hóa hệ thống**
  - Khi thay đổi giao diện/bảng, áp dụng nghiêm ngặt quy tắc kiểm tra `AppDbContext.cs` và chạy lại Migration ở Mục 3.

---
**Nhắc nhở cuối cùng cho Agent:** Hãy giữ tư duy hệ thống nhất quán. Bất cứ khi nào người dùng bảo "sửa trường này trên giao diện hiển thị", hãy tự động đặt câu hỏi: *"Trường này đã có dưới Database chưa?"*, nếu chưa hoặc cần thay đổi kiểu dữ liệu, hãy mở ngay `AppDbContext.cs` để xử lý.