# Hướng Dẫn Deploy Website "Ultimate Net Worth Tracker" Lên Vercel

Chào bạn, vì công cụ `Vercel CLI` yêu cầu phải mở trình duyệt web lên để đăng nhập tài khoản (Authentication), mà màn hình Terminal của tôi không thể tự động bấm xác nhận qua trình duyệt của bạn được. Nên để dễ dàng và chắc chắn thành công 100%, tôi gửi bạn **3 bước đơn giản nhất** để tung website này lên Internet (Launch to Production) bằng tay:

### BƯỚC 1: Đẩy Mã Nguồn lên Github
1. Bạn hãy tạo một Repository trống trên [Github](https://github.com/new) có tên tuỳ ý (Ví dụ: `net-worth-app`).
2. Mở trình gõ lệnh (Terminal) tại thư mục dự án và chạy các lệnh sau:
   ```bash
   git init
   git add .
   git commit -m "🚀 Initial Commit - Ultimate Net Worth Tracker"
   git branch -M main
   git remote add origin https://github.com/<tên-username-của-bạn>/net-worth-app.git
   git push -u origin main
   ```

### BƯỚC 2: Kết nối tài khoản Vercel
1. Truy cập [Vercel.com](https://vercel.com/) và đăng nhập bằng tài khoản Github của bạn.
2. Bấm nút **[ Add New... ] -> [ Project ]**.
3. Import (Nhập) trực tiếp cái Repository `net-worth-app` mà bạn vừa tạo ở Bước 1.

### BƯỚC 3: Cài đặt Biến Môi Trường (Quan trọng nhất)
1. Trong màn hình cấu hình trước khi bấm Deploy, bạn hãy mở sập phần **Environment Variables** ra.
2. Thêm đúng 2 dòng Key mà tôi đã setup cho bạn:
   - Name 1: `NEXT_PUBLIC_SUPABASE_URL` | Value 1: `https://tnwhjnjnfdovnhuunumk.supabase.co`
   - Name 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Value 2: `eyJhbG... (Thay bằng chuỗi khóa ẩn danh tôi đã lưu trong file .env)`
3. Bấm **[ Deploy ]** và chờ Vercel Build tự động trong 2 phút! 🎉

---

**Chúc mừng bạn! Website đã lên sóng.**
Bạn sẽ được cấp 1 đường link miến phí như kiểu `net-worth-app.vercel.app` để có thể truy cập ở bất cứ máy nào. Lúc này bạn hãy sử dụng đoạn mã `seed_demo.sql` để test bảng điều khiển nhé!
