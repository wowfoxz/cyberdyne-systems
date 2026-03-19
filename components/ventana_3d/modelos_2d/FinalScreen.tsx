"use client";

import Image from "next/image";
import { CSSProperties } from "react";

const containerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
  backgroundColor: "#000",
};

const imageWrapperStyle: CSSProperties = {
  position: "relative",
  width: "80%",
  height: "80%",
};

export default function FinalScreen() {
  return (
    <div style={containerStyle}>
      <div style={imageWrapperStyle}>
        <Image
          src="logo-skynet-con-slogan.png"
          alt="Skynet Final"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
