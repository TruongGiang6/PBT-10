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

## Câu A3:

1. Sơ đồ 3 trạng thái của Promise (`Pending → Fulfilled`, `Pending → Rejected`)

```text
┌─── [Resolved] ───► FULFILLED (Thành công) ───► .then()
                     │                      (Trả về: value)
                     │
PENDING (Chờ xử lý) ─┤
                     │
                     │
                     └─── [Rejected] ───► REJECTED (Thất bại) ──────► .catch()
                                            (Trả về: error/reason)
```

2. Giải thích: Callback Hell là gì? Viết ví dụ 4 cấp callback hell → Refactor thành async/await:
- Callback Hell là tình trạng các hàm callback lồng vào nhau quá sâu (tạo thành hình kim tự tháp) khi xử lý tuần tự nhiều tác vụ bất đồng bộ. Hậu quả: Code cực kỳ rối, khó bảo trì và logic xử lý lỗi bị lặp lại ở mọi cấp
- Ví dụ 4 cấp Callback Hell:
```js
getUser(1, (err, user) => {
    if (err) return console.error(err);
    
    getPosts(user.id, (err, posts) => {
        if (err) return console.error(err);
        
        getComments(posts[0].id, (err, comments) => {
            if (err) return console.error(err);
            
            sendEmail(user.email, comments, (err, res) => {
                if (err) return console.error(err);
                console.log("Xong!", res);
            });
        });
    });
});
```
- Refactor bằng Async/Await:
```js
async function processUserWorkflow(userId) {
    try {
        const user = await getUser(userId);
        const posts = await getPosts(user.id);
        const comments = await getComments(posts[0].id);
        const res = await sendEmail(user.email, comments);
        
        console.log("Xong!", res);
    } catch (err) {
        // Gom toàn bộ việc xử lý lỗi vào một chỗ duy nhất
        console.error("Có lỗi xảy ra:", err);
    }
}

processUserWorkflow(1);
```
## PHẦN C:

## Câu C1:

**Bạn xây dựng app E-Commerce gọi nhiều APIs. Thiết kế chiến lược xử lý lỗi:**

1. Network errors (mất mạng giữa chừng) → Xử lý thế nào?: fetch() tự quăng lỗi. Dùng catch để hiện thông báo "Mất kết nối", lưu tác vụ vào giỏ hàng (LocalStorage) chờ có mạng gửi lại

2. API errors (server trả 500, 404, 429 Too Many Requests):
- Lỗi 404 (Not Found): Không thử lại (Retry). Hiển thị trang/thông báo "Không tìm thấy sản phẩm"
- Lỗi 500 (Server Error) & 429 (Spam/Quá tải): Kích hoạt Retry (thử lại) kèm độ trễ tăng dần để server kịp thở

3. Timeout (API chậm > 10 giây) → Viết code fetchWithTimeout(url, ms)
```js
async function fetchWithTimeout(url, options = {}, ms = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);

    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        return res;
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') throw new Error("Timeout: API phản hồi quá chậm!");
        throw err;
    }
}
```

4. Retry logic (thử lại 3 lần nếu lỗi network) → Viết code fetchWithRetry(url, maxRetries)
```js
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let i = 1; i <= maxRetries; i++) {
        try {
            const res = await fetchWithTimeout(url, options, 10000);
            
            // Nếu lỗi 5xx hoặc 429 -> Cố tình ném lỗi để nhảy xuống catch và Retry
            if (!res.ok && (res.status >= 500 || res.status === 429)) {
                throw new Error(`Lỗi server: ${res.status}`);
            }
            
            return res; // Thành công (2xx) hoặc lỗi Client (4xx) thì trả về luôn
            
        } catch (err) {
            if (i === maxRetries) throw new Error("Thất bại sau 3 lần thử: Lỗi mạng hoặc Server sập.");
            
            // Chờ 1s, 2s... trước khi thử lại (Exponential Backoff)
            await new Promise(resolve => setTimeout(resolve, i * 1000));
        }
    }
}
```

## Câu C2:

**Giải thích sự khác nhau. Cho ví dụ thực tế khi nào dùng mỗi cái:**

| Method           | Khi nào resolve?                   | Khi nào reject?            | Use case |
|--------          |------------------                  |------------------          |----------|
| `.all()`         | TẤT CẢ cùng thành công      |Ngay khi 1 cái thất bại            | Tải đủ bộ dữ liệu cốt lõi để mở trang        |
| `.allSettled()`  | TẤT CẢ đều đã chạy xong      | KHÔNG BAO GIỜ thất bại           | Tải các Widget độc lập trên Dashboard |
| `.race()`        | Thằng đầu tiên thành công   | Thằng đầu tiên thất bại           | Làm bộ đếm ngắt giờ (Timeout) cho API |
| `.any()`         | Thằng đầu tiên thành công   | Chỉ khi TẤT CẢ thất bại           | Tải file từ các Server dự phòng (CDN) |

**Viết ví dụ code cho mỗi method với scenario thực tế (không phải ví dụ `delay` đơn giản)**
```js
// Scenario: Phải tải đủ cấu hình ứng dụng, giỏ hàng và thông tin user thì mới render giao diện.
const fetchUser = () => fetch("/api/user").then(r => r.json());
const fetchCart = () => fetch("/api/cart").then(r => r.json());
const fetchTheme = () => fetch("/api/theme-config").then(r => r.json());
//Gom đủ dữ liệu để mở trang Dashboard
async function initApplication() {
    try {
        // Chạy song song cả 3. Chỉ cần API /api/cart lỗi 500, lập tức nhảy xuống khối catch.
        const [user, cart, theme] = await Promise.all([
            fetchUser(),
            fetchCart(),
            fetchTheme()
        ]);
        
        console.log("Đủ data, tiến hành vẽ UI cho user:", user.name);
        renderPage(user, cart, theme);
    } catch (error) {
        console.error("Ứng dụng không thể khởi tạo do thiếu dữ liệu cốt lõi:", error.message);
        showSystemErrorPage(); // Hiện màn hình lỗi hệ thống toàn cục
    }
}
//Tải danh sách file đính kèm
// Scenario: User tải lên 3 file ảnh cùng lúc. File nào lỗi thì báo lỗi đỏ, file nào thành công thì hiện nút xem.
const uploadFile = (file) => fetch("/api/upload", { method: "POST", body: file }).then(r => r.json());

async function handleBulkUpload(filesArray) {
    // Luôn luôn resolve về một mảng chứa kết quả của cả 3 tiến trình
    const uploadStatuses = await Promise.allSettled(filesArray.map(file => uploadFile(file)));

    uploadStatuses.forEach((result, index) => {
        if (result.status === "fulfilled") {
            console.log(`File thứ ${index + 1} tải lên THÀNH CÔNG:`, result.value.url);
            showSuccessTickInUI(index);
        } else {
            console.warn(`File thứ ${index + 1} tải lên THẤT BẠI. Lý do:`, result.reason);
            showErrorCrossInUI(index, result.reason);
        }
    });
}
//Tạo cơ chế Timeout cho API thanh toán
// Scenario: Khi bấm thanh toán, nếu API xử lý quá 5 giây mà chưa xong, hủy bỏ và báo lỗi timeout cho khách hàng.
const requestCheckout = (cartId) => fetch("/api/checkout", { method: "POST", body: cartId }).then(r => r.json());

const timeoutGuard = (ms) => new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Cổng thanh toán phản hồi quá chậm!")), ms)
);

async function processPayment(cartId) {
    try {
        // Cuộc đua giữa API mạng và Bộ đếm ngược 5000ms
        const paymentResult = await Promise.race([
            requestCheckout(cartId),
            timeoutGuard(5000)
        ]);
        
        alert("Thanh toán đơn hàng thành công!");
    } catch (error) {
        // Nếu bộ đếm ngược về trước, error.message sẽ là "Cổng thanh toán phản hồi quá chậm!"
        alert(`Giao dịch thất bại: ${error.message}`);
    }
}
//Lấy ảnh từ các Server CDN dự phòng
// Scenario: Cần load một bức ảnh Banner lớn. Gọi đồng thời lên 3 cụm Server CDN khác nhau trên thế giới. 
// Server nào gần user và phản hồi về ảnh thành công trước thì lấy ngay, bất chấp các server kia bị lỗi hay chậm.
const getImgFromSingapore = () => fetch("https://sg.cdn.com/banner.jpg").then(r => r.blob());
const getImgFromUSA = () => fetch("https://us.cdn.com/banner.jpg").then(r => r.blob());
const getImgFromJapan = () => fetch("https://jp.cdn.com/banner.jpg").then(r => r.blob());

async function loadBanner() {
    try {
        // Chỉ cần 1 cụm CDN trả về blob ảnh thành công trước, biến bannerBlob sẽ nhận giá trị luôn.
        const bannerBlob = await Promise.any([
            getImgFromSingapore(),
            getImgFromJapan(),
            getImgFromUSA()
        ]);
        
        displayBanner(bannerBlob);
    } catch (aggregateError) {
        // Chỉ lọt vào đây nếu CẢ 3 SERVER CDN ĐỀU SẬP hoàn toàn.
        console.error("Tất cả các server dự phòng đều không thể kết nối:", aggregateError.errors);
        displayFallbackLocalBanner();
    }
}
```

