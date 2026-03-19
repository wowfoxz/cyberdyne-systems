"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber"; // useFrame desde fiber
import { useFBX } from "@react-three/drei";     // useFBX desde drei
import * as THREE from "three";

interface ModelProps {
  opacity?: number;
}

export default function T800ArmModel({ opacity = 1 }: ModelProps) {
  const fbx = useFBX("./T800_Arm.fbx");
  const modelRef = useRef<THREE.Group | null>(null);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01;
    }
  });

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
              });
            } else {
              const standardMat = mesh.material as THREE.MeshStandardMaterial;
              standardMat.transparent = true;
              standardMat.opacity = opacity;
            }
          }
        }
      });
    }
  }, [fbx, opacity]);

  return (
    <primitive
      ref={modelRef}
      object={fbx}
      scale={[0.5, 0.5, 0.5]}
      position={[1, -2.6, 0]}
    />
  );
}
