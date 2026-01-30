# Hướng Dẫn Truy Cập Web "Random Món Ăn" Trên Điện Thoại

Bạn có 2 cách để truy cập web này trên điện thoại:

## Cách 1: Public Online (Khuyên dùng) - Truy cập từ bất cứ đâu
Cách này giúp bạn có đường link (ví dụ: `random-mon-an.vercel.app`) để gửi cho bạn bè hoặc dùng 3G/4G đều được.

**Sử dụng Vercel (Miễn phí & Nhanh nhất):**
1.  Truy cập [Vercel.com](https://vercel.com) và đăng nhập (bằng GitHub, Google...).
2.  Chọn **"Add New..."** -> **"Project"**.
3.  Nếu code của bạn đã up lên GitHub: Chọn repo đó và nhấn **Import**.
4.  Nếu chưa up GitHub:
    - Cài đặt **Vercel CLI** trên máy tính: Mở CMD/Terminal gõ `npm i -g vercel`.
    - Sau đó `cd` vào thư mục `Eat` và gõ lệnh `vercel`.
    - Nhấn Enter liên tục để xác nhận các cài đặt mặc định.
    - Vercel sẽ trả về một đường link (Production), bạn có thể vào link đó trên điện thoại.

**Sử dụng Netlify Drop (Đơn giản nhất, không cần lệnh):**
1.  Truy cập [app.netlify.com/drop](https://app.netlify.com/drop).
2.  Kéo thả cả thư mục `Eat` vào ô upload.
3.  Đợi 1 vài giây, Netlify sẽ tạo link cho bạn.
4.  Gửi link đó qua điện thoại để mở.

---

## Cách 2: Mạng LAN (Tại nhà) - Chỉ dùng được khi kết nối cùng Wifi
Cách này không cần đưa web lên mạng, nhưng điện thoại và máy tính phải bắt chung 1 mạng Wifi.

1.  **Cài đặt Live Server (Nếu dùng VS Code):**
    - Click chuột phải vào file `index.html` chọn **"Open with Live Server"**.
    - Web sẽ mở trên trình duyệt máy tính (ví dụ: `http://127.0.0.1:5500`).

2.  **Xem địa chỉ IP máy tính:**
    - Mở CMD (Windows + R, gõ `cmd`).
    - Gõ lệnh `ipconfig` và tìm dòng **IPv4 Address** (thường là `192.168.1.xxx`).

3.  **Truy cập trên điện thoại:**
    - Mở trình duyệt trên điện thoại.
    - Gõ địa chỉ: `http://<IP-Của-Máy-Tính>:5500/index.html`
    - Ví dụ: `http://192.168.1.15:5500`

> [!TIP]
> Để đẹp nhất, hãy sử dụng **Cách 1** (Netlify Drop) vì nó miễn phí, nhanh và bạn có thể gửi link cho bất kỳ ai.
