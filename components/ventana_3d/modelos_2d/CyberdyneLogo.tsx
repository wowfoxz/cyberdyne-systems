"use client";

import Image from "next/image";
import { CSSProperties } from "react";

const logoStyle: CSSProperties = {
  position: "absolute",
  top: "10px",
  right: "10px",
  zIndex: 2,
};

export default function CyberdyneLogo() {
  return (
    <div style={logoStyle}>
      <Image src="cyberdyne.png" alt="Cyberdyne Logo" width={120} height={90} />
    </div>
  );
}
