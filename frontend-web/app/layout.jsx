/**
 * 파일명: layout.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 앱 전역 레이아웃
 */
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "./AppShell";
import SharedHydrator from "./common/store/SharedHydrator";
import { loadFrontendConfig } from "./common/config/frontendConfig.server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MyWebTemplate — 풀스택 개발 템플릿",
  description: "FastAPI + Next.js 기반의 인증/컴포넌트/대시보드 템플릿",
};

/**
 * @description RootLayout export를 노출한다.
 */
const RootLayout = async ({ children }) => {
  const config = await loadFrontendConfig()
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SharedHydrator config={config} />
        <AppShell>
          <div className="bg-gray-50 text-gray-950 min-h-screen">{children}</div>
        </AppShell>
      </body>
    </html>
  );
}

export default RootLayout;
