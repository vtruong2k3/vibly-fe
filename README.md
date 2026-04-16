<br />
<div align="center">
  <img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" width="120" alt="Next.js Logo" />
  <h1 align="center">Vibly Frontend App UI</h1>
  <p align="center">
    <strong>Giao diện người dùng Mạng Xã Hội Thế Thế Mới (Next.js 16 + React 19)</strong>
  </p>
  <p align="center">
    <i>Tương tác thời gian thực, Thiết kế cao cấp & Trải nghiệm siêu mượt mà</i>
  </p>
</div>

---

## 📖 Giới thiệu (Introduction)

Frontend của **Vibly** được thiết kế dưới dạng **SPA/SSR lai (Hybrid Rendering)** bằng sức mạnh của **Next.js App Router**. Ứng dụng không chỉ là nơi hiển thị thông tin mà còn chứa các thuật toán Client tối ưu (Cache, Optimistic UI, WebRTC, WebSockets) để mang lại cảm giác phản hồi tức thì dưới 50ms cho người dùng, giống hệ thống web của Facebook và X (Twitter) hiện đại.

---

## 🏗 Kiến Trúc Frontend Khoa Học (Tech Stack & Architecture)

### 1. Công nghệ Lõi (Core Framework)
- **Framework**: `Next.js 16.x` (Sử dụng App Router hoàn toàn mới).
- **Library**: `React 19` (Sử dụng các Hook ảo hóa hiện đại).
- **Language**: `TypeScript` (Type-safe từ ngọn - Đồng bộ với Backend API DTOs).

### 2. Quản Lý Trạng Thái (State Management)
Hệ thống bóc tách cực kì khắt khe 2 khái niệm Server State và Client State:
- **Server State**: Sử dụng `@tanstack/react-query v5`. Data gọi từ Backend API sẽ được cache cứng, tự động refetching khi Focus, Infinite Scroll Pagination cho Newsfeed.
- **Client State**: Sử dụng `zustand v5`. Trọng lượng cực nhẹ, chuyên dùng lưu trữ các biến UI (Mở modal nào, Mở khung Chat của ai, Dark mode hay Light mode).

### 3. Giao diện & Trải nghiệm (UI/UX Styling)
Dự án cấm sử dụng SCSS thuần hay CSS-in-JS gây phình nặng DOM.
- **CSS Engine**: `Tailwind CSS v4` mới nhất (Biên dịch trực tiếp bằng Engine Rust siêu tốc của Tailwind v4 PostCSS).
- **Hệ sinh thái UI**: 
  - `Shadcn UI` / `Radix UI` / `Base UI`: Component không quy định sẵn Style, chuẩn Accessibility `a11y`, hỗ trợ Screen Reader cho người khuyết tật.
  - `Framer Motion`: Đảm nhận toàn bộ trọng trách Animation mượt 60fps (Mở popup, Like bài viết nảy lên).

### 4. Kết nối Thời Gian Thực (Realtime)
- **Socket.IO Client**: Kết nối đến Gateway Backend để nhận luồng báo Message mới / Notification mới. Được gắn xuyên suốt qua `providers/`.
- **LiveKit React Components**: Bộ thư viện WebRTC đỉnh cao lo đường truyền Video/Audio Meetings.

---

## 📂 Sơ Đồ Mã Nguồn (`src/`)

```plaintext
src/
├── app/                  # Route Navigation (Next.js App Router: layout, page)
│   ├── (auth)/           # Các trang không yêu cầu đăng nhập (Login/Register)
│   └── (main)/           # Các trang yêu cầu màng bảo vệ Auth Guard (Feed, Profile)
├── components/           # UI Elements tái sử dụng toàn cục
│   ├── ui/               # Mọi Shadcn UI components (Buttons, Inputs, Dialogs)
│   └── shared/           # Các Component phức hợp (Navbar, Sidebar, PostCard)
├── features/             # Nơi ôm trọn vẹn nghiệp vụ của từng mảng (Feature-Sliced Design)
│   ├── auth/             # Component, Hook, Api Calls liên quan Login
│   ├── feed/             # Nghiệp vụ hiện bảng tin
│   ├── chat/             # Layout Chat inbox, Socket listeners
│   └── calls/            # Giao diện Video Call LiveKit
├── hooks/                # Custom React Hooks (vd: useDebounce, useMediaQuery)
├── lib/                  # Các file thư viện bọc lõi (axios.ts, utils định dạng ngày)
├── providers/            # AuthProvider, SocketProvider, QueryClientProvider
├── store/                # Nơi định nghĩa các Zustand Slices
└── types/                # Gom toàn bộ Interface / Type definitions (Sync với Server)
```

---

## 🚀 Hướng Dẫn Cài Đặt (Setup Guide)

### Yêu cầu cài đặt cấu hình máy:
- Node.js (Phiên bản `v20+` hoặc `v22+` LTS)
- PNPM (`npm install -g pnpm`)

### Bước 1: Cài đặt Dependencies

Tại thư mục `vibly-fe`, cài đặt thông qua `pnpm` workspace (Hệ thống dùng `pnpm-workspace.yaml` cấu hình cục bộ nên sẽ không ảnh hưởng bên ngoài):

```bash
pnpm install
```

### Bước 2: Setup Môi Trường API (`.env`)

Tạo file biến môi trường, sao chép file `.env.example` (nếu có) thành `.env`:

```bash
cp .env.example .env
```
Mở file `.env` lên và điền các thông số kết nối Server:
```env
NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"
NEXT_PUBLIC_SOCKET_URL="ws://localhost:8000"
NEXT_PUBLIC_LIVEKIT_URL="ws://localhost:7880"
```
*(Ghi chú: Tiền tố `NEXT_PUBLIC_` là BẮT BUỘC để NextJS lộ biến này ra khỏi Browser).*

### Bước 3: Khởi Chạy Local Dev Server

```bash
# Bật Dev server với tính năng Fast Refresh
pnpm run dev
```

Mở trình duyệt truy cập: **`http://localhost:3000`**

---

## 💻 Các Lệnh Hỗ Trợ (Commands)

| Câu lệnh (pnpm) | Chức năng (Description) |
|-----------------|--------------------------|
| `pnpm dev`      | Chạy Frontend ở port 3000 để bắt đầu code (Hot Reloading). |
| `pnpm build`    | Compiler React Component thành Static HTML + JS Chunking (Production). |
| `pnpm start`    | Phục vụ bản build ảo Production (Phải chạy Build trước). |
| `pnpm lint`     | Fix chuẩn rules ESLint Config. |

---

## 🤝 Các Quy Chuẩn Code Đặc Biệt Cần Nhớ

1. Quét Dữ Liệu Forms Rất Chặt (Strict Form Data)**:
   - Hãy sử dụng `React Hook Form` kết hợp với `Zod` schema. Vui lòng check lỗi ngay từ Client trước khi đẩy Axios lên Server gây rác Request.
2. Form Input UI:
   - Toàn bộ đều bọc bởi `<FormField>` của Shadcn. Không Code thẻ `<input>` rỗng nếu không có lý do thiết thực.
3. Fetching Data:
   - Không được dùng `useEffect` kết hợp `fetch` để lấy data (Gây Waterfall và re-render lag). Phải dùng `useQuery` (`react-query`) ở Client Component, hoặc `fetch` thẳng bên trong cấu trúc Server Component gốc của thư mục `app/`.
4. Style Mặc Định Của Dự Án:
   - Luôn sử dụng hàm `cn(...)` (merge từ clsx + tailwind-merge) có sẵn ở `lib/utils` để ghép chuỗi className động. Nó sẽ giải quyết xung đột khi thẻ cha truyền class ghi đè thẻ con.
