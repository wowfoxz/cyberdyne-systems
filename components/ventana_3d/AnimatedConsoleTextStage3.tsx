"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";

interface AnimatedConsoleTextStage3Props {
  onComplete: () => void;
  onProgress?: (progress: number, stepIndex: number) => void;
}

type Step =
  | { type: "text"; content: string; speed?: number }
  | { type: "percentage"; duration?: number; suffix?: string; blinking?: boolean };

const steps: Step[] = [
  { type: "text", content: "Processing data", speed: 100 },
  { type: "percentage", duration: 2000 },
  { type: "text", content: "Holographic info. detected", speed: 100 },
  { type: "text", content: "Extracting holographic info.", speed: 100 },
  { type: "percentage", duration: 2000 },
  { type: "text", content: "Compiling", speed: 200 },
  { type: "percentage", duration: 5000, suffix: " Rendering", blinking: true },
];

const AnimatedConsoleTextStage3: React.FC<AnimatedConsoleTextStage3Props> = ({
  onComplete,
  onProgress,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [blinkingDots, setBlinkingDots] = useState("");
  const currentPercentRef = useRef(0);

  // Efecto para manejar blinkingDots, separado del intervalo principal
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

  // Efecto PRINCIPAL para animar texto o porcentaje (sin blinkingDots en dependencias)
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
          setCurrentStep((prev) => prev + 1);
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
        const progress = Math.floor(currentPercentRef.current);
        if (onProgress) onProgress(progress, currentStep);
        if (progress >= 100) {
          currentPercentRef.current = 100;
          setCurrentLine(`${100}%${suffix}${step.blinking ? blinkingDots : ""}`);
          clearInterval(interval);
          setCompletedLines((prev) => [
            ...prev,
            `${100}%${suffix}${step.blinking ? blinkingDots : ""}`,
          ]);
          setCurrentLine("");
          setCurrentStep((prev) => prev + 1);
          if (currentStep === steps.length - 1) {
            setTimeout(() => onComplete(), 3000);
          }
        } else {
          setCurrentLine(`${progress}%${suffix}${step.blinking ? blinkingDots : ""}`);
        }
      }, intervalTime);
      return () => clearInterval(interval);
    }
  }, [currentStep, onComplete, onProgress]);

  // Efecto para actualizar currentLine al cambiar blinkingDots, sin reiniciar el intervalo
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

  const cursorStyle: CSSProperties = {
    display: "inline-block",
    backgroundColor: "#00FF00",
    width: "8px",
    height: "1.2em",
    marginLeft: "2px",
    animation: "blink 1s step-start infinite",
  };

  const hideCursor =
    currentStep < steps.length &&
    steps[currentStep].type === "percentage" &&
    (steps[currentStep] as { blinking?: boolean }).blinking;

  return (
    <>
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

export default AnimatedConsoleTextStage3;
