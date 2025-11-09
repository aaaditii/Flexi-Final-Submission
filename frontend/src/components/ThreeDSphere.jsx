// frontend/src/components/ThreeDSphere.jsx
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

const ThreeDSphere = ({ project, position, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onClick(project)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={hovered ? 1.2 : 1}
    >
      <sphereGeometry args={[0.5, 64, 64]} />
      <meshStandardMaterial
        color={hovered ? "#A78BFA" : "#8B5CF6"}
        emissive={hovered ? "#A78BFA" : "#8B5CF6"}
        emissiveIntensity={hovered ? 0.5 : 0.3}
        metalness={0.8}
        roughness={0.2}
      />

      {hovered && (
        <Html
          transform
          distanceFactor={5}
          position={[0, 0.9, 0]}
          center
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div className="sphere-tooltip">
            <div className="tooltip-title">{project.title}</div>
            <div className="tooltip-desc">{project.short_desc}</div>
          </div>
        </Html>
      )}
    </mesh>
  );
};

export default ThreeDSphere;
