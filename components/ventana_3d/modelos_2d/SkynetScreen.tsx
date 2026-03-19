"use client";

import Image from "next/image";
import { CSSProperties } from "react";

const containerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  backgroundColor: "#000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function SkynetScreen() {
  return (
    <div style={containerStyle}>
      <Image
        src="skynet logo.png"
        alt="Skynet Logo"
        width={120}
        height={120} // Ajusta el valor de height según el aspect ratio real
        style={{ width: "120px", height: "auto" }}
      />
    </div>
  );
}
