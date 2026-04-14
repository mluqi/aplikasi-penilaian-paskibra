/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", 
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com", 
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "103.191.196.17",
        port: "8003",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dev8-p3.palindo.id",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "p16-oec-va.ibyteimg.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "gdb.voanews.com",
        pathname: "**",
      },
    ],
  },
  // Add proxy rewrites for API and uploads
  async rewrites() {
    return [
      // API Backend proxy to port 8002
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8003/api/:path*",
      },
      // Uploads proxy to port 8002
      {
        source: "/uploads/:path*",
        destination: "http://127.0.0.1:8003/uploads/:path*",
      },
    ];
  },

  // Add headers for CORS with cookie support and caching
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "development"
                ? "http://localhost:3006"
                : "https://dev8-p3.palindo.id",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS, PATCH",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization, X-Requested-With, Cookie, Set-Cookie, X-CSRF-Token",
          },
          {
            key: "Access-Control-Expose-Headers",
            value: "Set-Cookie, X-CSRF-Token",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "development"
                ? "http://localhost:3006"
                : "https://dev8-p3.palindo.id",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  allowedDevOrigins: ["localhost", "103.191.196.17", "dev8-p3.palindo.id"],
};

export default nextConfig;
