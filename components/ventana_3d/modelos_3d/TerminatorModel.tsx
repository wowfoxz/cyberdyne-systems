"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFBX } from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  opacity?: number;
  position?: [number, number, number];
}

export default function TerminatorModel({
  opacity = 1,
  position = [0, -2, 0],
}: ModelProps) {
  const fbx = useFBX("./terminator_t-800.fbx");
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (fbx) {
      fbx.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          const mesh = child;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat: THREE.Material) => {
                const standardMat = mat as THREE.MeshStandardMaterial;
                standardMat.color.setHex(0x0061d4);
                standardMat.transparent = true;
                standardMat.opacity = opacity;
              });
            } else {
              const standardMat = mesh.material as THREE.MeshStandardMaterial;
              standardMat.color.setHex(0x0061d4);
              standardMat.transparent = true;
              standardMat.opacity = opacity;
            }
          }
        }
      });
    }
  }, [fbx, opacity]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.z += 0.005;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={fbx}
      scale={[0.03, 0.03, 0.03]}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
    />
  );
}
