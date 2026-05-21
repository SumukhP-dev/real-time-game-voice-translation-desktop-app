import "./globals.css";

export const metadata = {
  title: "SquadSpeak",
  description:
    "Break the language barrier in competitive voice chat with live subtitles, translated speech, and local AI processing.",
  icons: { icon: "/app_icon.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
