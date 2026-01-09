# Couple Relationship App (MVP)

Ứng dụng mobile đặc thù cho các cặp đôi để duy trì và cải thiện mối quan hệ.

## Công nghệ sử dụng

### 📱 Frontend (Web-Mobile)
- **Framework**: React 19 + Vite (Tối ưu Mobile-First)
- **Styling**: Tailwind CSS + DaisyUI (Premium Components)
- **Animations**: Framer Motion (Hiệu ứng mượt mà)
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Notifications**: Sonner
- **Success States**: Canvas-Confetti
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (Access + Refresh Tokens)
- **Validation**: Zod
- **Cron Jobs**: Node-cron (Xử lý Scheduled Share)

## Cấu trúc thư mục

```
/backend          # Express TypeScript Backend
/mobile           # Expo React Native App
/docker-compose.yml # Docker config cho MongoDB & Backend
```

## Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Chạy Backend với Docker
Yêu cầu đã cài đặt Docker và Docker Compose.

```bash
docker-compose up -d
```
Backend sẽ khởi động tại `http://localhost:5000`. Cơ sở dữ liệu mặc định sẽ được seed 60 câu hỏi Love Map.

### 2. Chạy Mobile App
Yêu cầu đã cài đặt Node.js và Expo CLI.

```bash
cd mobile
npm install
npm start
```
*Lưu ý: Nếu chạy trên thiết bị thật, hãy thay đổi `baseURL` trong `mobile/src/api/client.ts` thành IP địa phương của máy tính.*

## Các tính năng MVP
- **Check-in 90s**: Mood, Energy, Stress, Needs và Biết ơn.
- **Kudos**: Gửi lời cảm ơn nhanh vào "Jar of Wins".
- **Love Map**: Trả lời câu hỏi hàng ngày để hiểu nhau hơn.
- **Conflict Wizard (Repair)**: Quy trình theo NVC (Quan sát - Cảm xúc - Nhu cầu - Đề nghị).
- **Weekly Ritual**: Buổi thảo luận cuối tuần và danh sách vấn đề chờ (Backlog).
- **Quyền riêng tư**: Tùy chọn Private (mặc định), Share Now, hoặc Scheduled Share.

## Biến môi trường (Env)
Backend sử dụng các biến sau (đã được cấu hình mặc định trong docker-compose):
- `MONGO_URI`: `mongodb://mongodb:27017/coupleapp`
- `JWT_SECRET`: `your_jwt_secret`
- `REFRESH_SECRET`: `your_refresh_secret`
