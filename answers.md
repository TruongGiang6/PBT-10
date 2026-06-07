## PHẦN A

## Câu A1:

1. Thứ tự in ra màn hình sẽ là:1 -> 4 -> 3 -> 6 -> 2 -> 7 -> 5

2. Giải thích cơ chế:
- Call Stack (Ngăn xếp gọi hàm): Nơi thực thi code đồng bộ (chạy ngay lập tức)
- Microtask Queue (Hàng đợi ưu tiên cao): Chứa các callback của Promise, queueMicrotask, MutationObserver
- Macrotask Queue (Hàng đợi ưu tiên thấp): Chứa các callback của setTimeout, setInterval, I/O events
- Event Loop (Vòng lặp sự kiện): Liên tục kiểm tra Call Stack. Khi Call Stack trống, nó sẽ bốc TẤT CẢ công việc trong Microtask Queue ra chạy trước. Sau khi Microtask trống hoàn toàn, nó mới bốc 1 công việc bên Macrotask Queue ra chạy

## Câu A2:

1. await fetch(...) — fetch trả về gì? Tại sao cần await?
- Trả về gì: Hàm fetch() luôn trả về một Promise (đại diện cho một kết quả mạng sẽ có trong tương lai)
- Tại sao cần await: Nếu không có await, biến response sẽ chỉ lưu trữ cái Promise "đang chờ" đó chứ không phải dữ liệu thực tế. await báo cho JavaScript tạm dừng hàm này lại chờ đến khi server trả lời xong và Promise thành công (hoặc thất bại) rồi mới đi tiếp xuống dòng dưới. Nó giúp viết code bất đồng bộ trông gọn gàng như code đồng bộ, thay vì phải chain .then()

2. response.ok — Khi nào false? Liệt kê 3 status codes tương ứng.
- response.ok sẽ trả về false khi HTTP status code nằm ngoài khoảng 200 đến 299.
- 3 Status codes phổ biến khiến response.ok bị false:
+ 404 (Not Found - Không tìm thấy dữ liệu/URL)
+ 500 (Internal Server Error - Server bị sập hoặc lỗi code trên server)
+ 403 (Forbidden - Không có quyền truy cập)

3. response.json() — Tại sao cần await lần nữa?
- Dữ liệu tải về qua mạng không về trong một cục duy nhất mà về theo từng gói nhỏ dạng luồng (stream). fetch mới chỉ chờ lấy xong phần "Header" của response. Việc tải hết phần "Body" (chứa JSON) và tiến hành phân tích (parse) nó từ chuỗi (string) thành một Object tốn một khoảng thời gian. Vì quá trình đọc data này mất thời gian, response.json() cũng trả về một Promise, do đó bạn cần await nó lần nữa

4. try...catch — Catch những lỗi gì?
- Khối catch ở đoạn code trên sẽ bắt cả 3 trường hợp bạn đề cập:
+ Network error (Lỗi mạng): Mất mạng, server từ chối kết nối, hoặc lỗi CORS. Lúc này bản thân hàm fetch() sẽ thất bại và ném ra lỗi
+ Lỗi 404 / 500: Theo mặc định, fetch không coi 404/500 là lỗi mạng (nó vẫn gọi là request thành công vì server có trả lời). Tuy nhiên, đoạn code if (!response.ok) throw new Error(...) của bạn đã chủ động "dịch" các mã này thành một lỗi hệ thống và ném nó xuống catch
+ JSON parse error: Nếu server trả lời bằng văn bản HTML hoặc một chuỗi bị lỗi thay vì JSON chuẩn, hàm response.json() sẽ không phân tích được và ném ra lỗi SyntaxError, khối catch cũng sẽ tóm được lỗi này