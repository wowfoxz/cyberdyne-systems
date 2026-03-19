"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useFBX } from "@react-three/drei";
import * as THREE from "three";

interface PlasmaRifleModelProps {
  opacity?: number;
}

export default function PlasmaRifleModel({ opacity = 1 }: PlasmaRifleModelProps) {
  // Cargamos el FBX del rifle de plasma
  const fbx = useFBX("./skynets_plasma_rifle.fbx");
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (fbx && opacity !== undefined) {
      fbx.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          const mesh = child;
          if (mesh.material) {
            // Si es un array de materiales
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat: THREE.Material) => {
                const standardMat = mat as THREE.MeshStandardMaterial;
                standardMat.transparent = true;
                standardMat.opacity = opacity;
                standardMat.color.setHex(0x0061d4);
              });
            } else {
              // Si es un único material
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

  // Rotación continua, si quieres animar el rifle
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.004;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={fbx}
      // Ajusta la escala, posición y rotación a tu gusto
      scale={[0.07, 0.07, 0.07]}
      position={[0, 0, 0]}
      
    />
  );
}
