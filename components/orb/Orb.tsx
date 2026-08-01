"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createOrbUniforms, ORB_FRAGMENT, ORB_VERTEX } from "./orbMaterial";
import { ORB_STATES, type OrbStateName } from "./orbStates";

function OrbMesh({ state, reduced }: { state: OrbStateName; reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const target = useRef(new THREE.Color());

  /* Passed as `args`, so three.js constructs the material once and later
     renders never reset the uniform values the frame loop is driving. */
  const [config] = useState(() => ({
    vertexShader: ORB_VERTEX,
    fragmentShader: ORB_FRAGMENT,
    uniforms: createOrbUniforms(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));

  useFrame((_, delta) => {
    const mat = material.current;
    if (!mat) return;
    const u = mat.uniforms;
    const s = ORB_STATES[state];
    /* Frame-rate independent easing, so the tween reads the same on a 60Hz
       and a 120Hz display. */
    const k = reduced ? 1 : 1 - Math.pow(0.02, delta);

    target.current.setRGB(s.col[0], s.col[1], s.col[2]);
    u.uColor.value.lerp(target.current, k);
    u.uAmp.value += (s.amp - u.uAmp.value) * k;

    const t = u.uTime.value + (reduced ? 0 : delta);
    u.uTime.value = t;
    const breath = reduced ? 0 : Math.sin(t * 0.9) * 0.02;
    u.uScale.value += (s.scale * (1 + breath) - u.uScale.value) * k;

    if (mesh.current && !reduced) {
      mesh.current.rotation.y += delta * 0.12;
      mesh.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.15, 5]} />
      <shaderMaterial ref={material} args={[config]} />
    </mesh>
  );
}

export default function Orb({
  state,
  active,
  reduced,
}: {
  state: OrbStateName;
  active: boolean;
  reduced: boolean;
}) {
  return (
    <Canvas
      /* Stop rendering entirely when the orb is off-screen or the visitor
         asked for reduced motion — the GPU idles instead of burning frames
         behind the pinned scroll sections. */
      frameloop={active && !reduced ? "always" : "demand"}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 3.2], fov: 45 }}
    >
      <OrbMesh state={state} reduced={reduced} />
    </Canvas>
  );
}
