"use client";

import { useState, useEffect } from "react";

interface AnimatedCodeTextProps {
  text: string;
  speed?: number;
}

const AnimatedCodeText: React.FC<AnimatedCodeTextProps> = ({ text, speed = 20 }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <div style={{ whiteSpace: "pre-line", lineHeight: "1.2em" }}>{displayed}</div>;
};

export default AnimatedCodeText;