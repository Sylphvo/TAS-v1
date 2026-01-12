# TAS
TAS (.NET Core / ASP.NET Core)
1. Yêu cầu môi trường

Windows 10/11

.NET SDK (đúng version project đang dùng, ví dụ .NET 6 / 7 / 8)

IIS (đã bật)

ASP.NET Core Hosting Bundle (bắt buộc khi deploy IIS)

SQL Server (nếu backend dùng DB)

2. Chạy source local (DEV)
Cách 1: Chạy bằng CLI (nhanh – gọn)
cd TAS-master
dotnet restore
dotnet build
dotnet run


Mặc định app sẽ chạy ở:

https://localhost:xxxx
http://localhost:xxxx

Cách 2: Chạy bằng Visual Studio

Mở file TAS.sln

Set project Web API / Web App làm Startup Project

Nhấn F5

3. Cấu hình appsettings

appsettings.json → môi trường DEV

appsettings.Production.json → môi trường PROD (IIS)

Ví dụ:

{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=TAS;User Id=sa;Password=123;"
  }
}


❗ Không commit password thật. Dùng biến môi trường khi deploy.

4. Publish source (.NET Core)
Publish bằng CLI (khuyến nghị)
dotnet publish -c Release -o publish


Sau khi chạy xong → thư mục publish/ là source để deploy IIS.

5. Deploy lên IIS (Production)
Bước 1: Cài Hosting Bundle

Tải ASP.NET Core Hosting Bundle đúng version .NET

Cài xong → restart IIS

Bước 2: Tạo website trên IIS

Mở IIS Manager

Add Website

Site name: TAS

Physical path: trỏ tới thư mục publish

Port: ví dụ 8080

Application Pool:

.NET CLR version: No Managed Code

Pipeline: Integrated

Bước 3: Cấu hình quyền thư mục

Chuột phải thư mục publish

Properties → Security

Thêm quyền IIS_IUSRS (Read + Execute)

Bước 4: Kiểm tra

Truy cập:

http://localhost:8080


Nếu lỗi:

Check Event Viewer

Check log trong:

stdoutLogFile


(nếu đã bật logging trong web.config)

6. Lỗi hay gặp

❌ 502.5 → thiếu Hosting Bundle

❌ Không connect DB → sai connection string / firewall

❌ IsAuthenticated luôn false → sai auth middleware hoặc cookie

7. Ghi chú

Project dùng ASP.NET Core

Không commit:

bin/

obj/

appsettings.Production.json