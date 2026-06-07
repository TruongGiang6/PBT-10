## PHẦN A

## Câu A1:

1. Thứ tự in ra màn hình sẽ là:1 -> 4 -> 3 -> 6 -> 2 -> 7 -> 5

2. Giải thích cơ chế:
- Call Stack (Ngăn xếp gọi hàm): Nơi thực thi code đồng bộ (chạy ngay lập tức)
- Microtask Queue (Hàng đợi ưu tiên cao): Chứa các callback của Promise, queueMicrotask, MutationObserver
- Macrotask Queue (Hàng đợi ưu tiên thấp): Chứa các callback của setTimeout, setInterval, I/O events
- Event Loop (Vòng lặp sự kiện): Liên tục kiểm tra Call Stack. Khi Call Stack trống, nó sẽ bốc TẤT CẢ công việc trong Microtask Queue ra chạy trước. Sau khi Microtask trống hoàn toàn, nó mới bốc 1 công việc bên Macrotask Queue ra chạy