"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber"; // useFrame desde fiber
import { useFBX } from "@react-three/drei";     // useFBX desde drei
import * as THREE from "three";

interface ModelProps {
  opacity?: number;
}

export default function CPUModel({ opacity = 1 }: ModelProps) {
  const fbx = useFBX("./cpu.fbx");
  const modelRef = useRef<THREE.Group | null>(null);
  
  useEffect(() => {
    if (fbx && opacity !== undefined) {
      fbx.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          const mesh = child;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat: THREE.Material) => {
                const standardMat = mat as THREE.MeshStandardMaterial;
                standardMat.transparent = true;
                standardMat.opacity = opacity;
                standardMat.color.setHex(0x0061d4);
              });
            } else {
              const standardMat = mesh.material as THREE.MeshStandardMaterial;
              standardMat.transparent = true;
              standardMat.opacity = opacity;
              standardMat.color.setHex(0x0061d4);
            }
          }
        }
      });
    }
  }, [fbx, opacity]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.z += 0.01;
    }
  });
  
  return (
    <primitive
      ref={modelRef}
      object={fbx}
      scale={[0.6, 0.6, 0.6]}
      position={[-1, -1.3, 0]}
      rotation={[Math.PI / 2, 3, 0]}
    />
  );
}
