"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";

interface AnimatedConsoleTextProps {
  onComplete: () => void;
}

// Define los tipos de pasos a animar
type Step =
  | { type: "text"; content: string; speed?: number }
  | { type: "percentage"; duration?: number; suffix?: string; blinking?: boolean };

const steps: Step[] = [
  { type: "text", content: "Preparing scanner", speed: 120 },
  { type: "percentage", duration: 1000 },
  { type: "text", content: "Scanner ready", speed: 120 },
  { type: "percentage", duration: 1000, suffix: " Scanning", blinking: false },
  { type: "text", content: "Scanning complete", speed: 100 },
];

const AnimatedConsoleText: React.FC<AnimatedConsoleTextProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [blinkingDots, setBlinkingDots] = useState("");
  const currentPercentRef = useRef(0);

  // Actualiza los puntos parpadeantes para pasos de porcentaje con blinking
  useEffect(() => {
    let dotInterval: NodeJS.Timeout | null = null;
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      if (step.type === "percentage" && step.blinking) {
        dotInterval = setInterval(() => {
          setBlinkingDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500);
      } else {
        setBlinkingDots("");
      }
    }
    return () => {
      if (dotInterval) clearInterval(dotInterval);
    };
  }, [currentStep]);

  useEffect(() => {
    if (currentStep >= steps.length) return;
    const step = steps[currentStep];
    if (step.type === "text") {
      const { content, speed = 100 } = step;
      let index = 0;
      const interval = setInterval(() => {
        setCurrentLine(content.slice(0, index + 1));
        index++;
        if (index >= content.length) {
          clearInterval(interval);
          setCompletedLines((prev) => [...prev, content]);
          setCurrentLine("");
          if (currentStep === steps.length - 1) {
            setTimeout(() => {
              onComplete();
            }, 3000);
          } else {
            setCurrentStep((prev) => prev + 1);
          }
        }
      }, speed);
      return () => clearInterval(interval);
    } else if (step.type === "percentage") {
      const { duration = 2000, suffix = "" } = step;
      const intervalTime = 50;
      const totalSteps = duration / intervalTime;
      const increment = 100 / totalSteps;
      currentPercentRef.current = 0;
      const interval = setInterval(() => {
        currentPercentRef.current += increment;
        if (currentPercentRef.current >= 100) {
          currentPercentRef.current = 100;
          setCurrentLine(
            `${Math.floor(currentPercentRef.current)}%${suffix}${step.blinking ? blinkingDots : ""}`
          );
          clearInterval(interval);
          setCompletedLines((prev) => [
            ...prev,
            `${Math.floor(currentPercentRef.current)}%${suffix}${step.blinking ? blinkingDots : ""}`,
          ]);
          setCurrentLine("");
          setCurrentStep((prev) => prev + 1);
        } else {
          setCurrentLine(
            `${Math.floor(currentPercentRef.current)}%${suffix}${step.blinking ? blinkingDots : ""}`
          );
        }
      }, intervalTime);
      return () => clearInterval(interval);
    }
  }, [currentStep, blinkingDots, onComplete]);
  

  // Actualiza la línea actual cuando blinkingDots cambia (solo para pasos de porcentaje)
  useEffect(() => {
    if (currentStep < steps.length && steps[currentStep].type === "percentage") {
      const step = steps[currentStep] as Extract<Step, { type: "percentage" }>;
      setCurrentLine(
        `${Math.floor(currentPercentRef.current)}%${step.suffix || ""}${
          step.blinking ? blinkingDots : ""
        }`
      );
    }
  }, [blinkingDots, currentStep]);

  // Estilo del cursor grueso y parpadeante
  const cursorStyle: CSSProperties = {
    display: "inline-block",
    backgroundColor: "#00FF00",
    width: "8px",
    height: "1.2em",
    marginLeft: "2px",
    animation: "blink 1s step-start infinite",
  };

  // Condición para ocultar el cursor en ciertos pasos
  const hideCursor =
    currentStep < steps.length &&
    steps[currentStep].type === "percentage" &&
    (steps[currentStep] as { blinking?: boolean }).blinking;

  return (
    <>
      {/* Keyframes para el parpadeo del cursor */}
      <style jsx global>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
      <div style={{ lineHeight: "1.2em", whiteSpace: "pre-line" }}>
        {completedLines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        <div>
          {currentLine}
          {currentStep < steps.length && !hideCursor && (
            <span style={cursorStyle}>&nbsp;</span>
          )}
        </div>
      </div>
    </>
  );
};

export default AnimatedConsoleText;
