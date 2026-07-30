# Ứng Dụng Nén Ảnh Tĩnh (Client-Side Image Resizer)

Đây là một ứng dụng web tĩnh cho phép bạn nén và thay đổi kích thước nhiều ảnh cùng lúc ngay trên trình duyệt (client-side), đảm bảo dung lượng đầu ra luôn <= 500KB. 

Đặc điểm nổi bật:
- 🔒 **Bảo mật**: Mọi quá trình nén ảnh diễn ra hoàn toàn trong trình duyệt của người dùng. Không có hình ảnh nào được tải lên máy chủ.
- ⚡ **Nhanh chóng**: Sử dụng `browser-image-compression` và tận dụng sức mạnh tính toán của máy tính người dùng.
- 🎨 **Giao diện hiện đại**: Thiết kế với phong cách Glassmorphism đẹp mắt, hỗ trợ responsive.
- 📦 **Tính năng ZIP**: Có thể nén và tải về nhiều ảnh dưới dạng file `.zip`.

## Hướng Dẫn Triển Khai Lên GitHub Pages

Vì đây là ứng dụng 100% tĩnh (chỉ có HTML, CSS, JS), bạn có thể dễ dàng host miễn phí trên GitHub Pages.

**Bước 1: Khởi tạo và đẩy mã lên GitHub**
1. Đăng nhập vào tài khoản [GitHub](https://github.com/).
2. Tạo một Repository (Kho lưu trữ) mới. Giữ ở chế độ Public.
3. Mở terminal (dòng lệnh) trên máy tính của bạn, truy cập vào thư mục chứa code này và chạy các lệnh sau:
   ```bash
   git init
   git add .
   git commit -m "Khởi tạo dự án nén ảnh"
   git branch -M main
   git remote add origin https://github.com/TEN_DANG_NHAP/TEN_REPO_CUA_BAN.git
   git push -u origin main
   ```
   *(Nhớ thay `TEN_DANG_NHAP` và `TEN_REPO_CUA_BAN` bằng thông tin chính xác của bạn)*

**Bước 2: Bật GitHub Pages**
1. Truy cập vào Repository bạn vừa tạo trên GitHub.
2. Bấm vào **Settings** (biểu tượng bánh răng) ở thanh menu trên cùng.
3. Ở menu bên trái, tìm và chọn **Pages**.
4. Trong phần **Build and deployment**, mục **Source**, chọn "Deploy from a branch".
5. Trong mục **Branch**, chọn nhánh `main` và thư mục `/ (root)`. Nhấn **Save**.
6. Đợi 1-2 phút, GitHub sẽ tự động build. Làm mới (F5) trang Pages, bạn sẽ thấy link trang web của mình ở trên cùng (ví dụ: `https://username.github.io/repo-name/`).

## Thư viện sử dụng
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) - Để nén ảnh client-side.
- [JSZip](https://stuk.github.io/jszip/) - Để đóng gói nhiều ảnh vào file ZIP.
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - Hỗ trợ tải file về máy khách.
