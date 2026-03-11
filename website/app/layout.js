import "./globals.css";

export const metadata = {
  title: "Real-Time Game Voice Translation",
  description:
    "Break the language barrier in competitive voice chat with live subtitles, translated speech, and local AI processing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
