import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function QrCode({
  value,
  size = 200,
  className




}) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0b0c11", light: "#ffffff" }
    }).
    then((url) => {
      if (alive) setSrc(url);
    }).
    catch(() => {
      if (alive) setSrc("");
    });
    return () => {
      alive = false;
    };
  }, [value, size]);

  if (src === null) {
    return (
      <div
        className={cn("animate-pulse rounded-md bg-white/10", className)}
        style={{ width: size, height: size }} />);


  }
  if (src === "") return null;
  return (
    <img
      src={src}
      width={size}
      height={size}
      className={cn("rounded-md", className)}
      alt="QR code" />);


}