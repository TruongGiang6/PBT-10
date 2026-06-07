# PBT-10 - JavaScript Bất đồng bộ & API (Async/Await, Fetch API)

Dự án này chứa các bài tập thực hành và câu trả lời lý thuyết về cách xử lý bất đồng bộ trong JavaScript (Asynchronous JavaScript) sử dụng Promises, Async/Await và cách giao tiếp với máy chủ thông qua Fetch API.

## 📁 Cấu trúc thư mục

```text
PBT-10/
├── dashboard/
├── gallery/
├── screenshots/
├── user_directory/
├── weather_app/
├── answers.md
└── README.md
```

- `screenshots/`: Chứa các hình ảnh minh họa kết quả giao diện của các ứng dụng sau khi gọi API thành công.
- `answers.md`: Câu trả lời cho các câu hỏi lý thuyết về cơ chế hoạt động của Event Loop, Call Stack, Microtask/Macrotask Queue và cách xử lý lỗi với `fetch()`.
- `dashboard/`: Ứng dụng bảng điều khiển (Dashboard) giả lập, gọi nhiều API cùng lúc để lấy dữ liệu thống kê và hiển thị lên biểu đồ/giao diện.
- `gallery/`: Ứng dụng thư viện ảnh, fetch dữ liệu từ một API cung cấp hình ảnh ngẫu nhiên và render dạng lưới (grid) lên trang web.
- `user_directory/`: Ứng dụng danh bạ người dùng, gọi API lấy danh sách người dùng (thường dùng JSONPlaceholder hoặc RandomUser API) và hiển thị thông tin chi tiết (tên, email, avatar).
- `weather_app/`: Ứng dụng thời tiết thực tế, cho phép người dùng nhập tên thành phố, sau đó dùng Fetch API gọi đến dịch vụ thời tiết (như OpenWeatherMap) để lấy và hiển thị nhiệt độ, trạng thái thời tiết.

## 👤 Thông tin sinh viên
- **Họ và tên:** Vũ Trường Giang
- **MSV:** 2451170885
- **Trường:** Đại học Thủy Lợi (TLU)

## 🚀 Cách xem dự án
Vào từng thư mục bài tập (ví dụ: `weather_app`, `user_directory`,...), mở trực tiếp file `.html` tương ứng trong trình duyệt web để trải nghiệm. Đảm bảo máy tính của bạn có kết nối Internet để các ứng dụng có thể gọi dữ liệu từ API một cách chính xác.