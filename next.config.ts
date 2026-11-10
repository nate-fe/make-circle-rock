import type { NextConfig } from "next";

/**
 * GitHub Pages 배포용.
 * - output: "export" → `npm run build` 하면 `out/` 폴더에 정적 파일(HTML/JS/CSS)만 만든다.
 * - basePath → 사이트가 nate-fe.github.io/make-circle-rock/ 아래에 올라가므로 모든 경로 앞에 저장소 이름을 붙인다.
 *   로컬 개발(npm run dev)에서는 붙이지 않아서 localhost:3000 그대로 쓴다.
 */
const repo = "make-circle-rock";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  trailingSlash: true, // /make-circle-rock/ → index.html 로 바로 연결
  images: { unoptimized: true }, // 정적 내보내기에선 이미지 최적화 서버가 없다
};

export default nextConfig;
