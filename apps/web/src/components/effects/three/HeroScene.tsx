import { ContactShadows, Float, RoundedBox, Sparkles } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, type ReactNode } from 'react';
import type { Group, Mesh } from 'three';

// Brand palette: purple -> magenta with cyan accents.
const PURPLE = '#1e3a8a';
const MAGENTA = '#1e3a8a';
const CYAN = '#5d86c6';
const PINK = '#8eaedc';

function Glossy({ color, emissive = 0 }: { color: string; emissive?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.18}
      metalness={0.15}
      clearcoat={1}
      clearcoatRoughness={0.12}
      emissive={color}
      emissiveIntensity={emissive}
    />
  );
}

/** A stack of three books with a page block, the core of the scene. */
function BookStack() {
  const books: [string, number, number, number][] = [
    // color, y, rotationY, width
    [PURPLE, -0.42, 0.1, 2.0],
    [CYAN, 0.0, -0.18, 1.8],
    [MAGENTA, 0.4, 0.28, 1.65],
  ];
  return (
    <group>
      {books.map(([color, y, rot, w], i) => (
        <group key={i} position={[0, y, 0]} rotation={[0, rot, 0]}>
          <RoundedBox args={[w, 0.34, 1.35]} radius={0.06} smoothness={4}>
            <Glossy color={color} />
          </RoundedBox>
          {/* page block */}
          <RoundedBox args={[w - 0.1, 0.26, 1.28]} radius={0.03} position={[0.06, 0, 0]}>
            <meshStandardMaterial color="#f8fafc" roughness={0.6} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

/** Ring with "students" orbiting the academic core. */
function Orbit() {
  const ring = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.y += dt * 0.35;
  });
  return (
    <group rotation={[0.45, 0, 0.18]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.25, 0.025, 16, 160]} />
        <meshStandardMaterial color={MAGENTA} emissive={MAGENTA} emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
      <group ref={ring}>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.25, 0, Math.sin(a) * 2.25]}>
              <sphereGeometry args={[i % 2 ? 0.13 : 0.18, 32, 32]} />
              <Glossy color={[CYAN, PINK, MAGENTA, PURPLE][i]} emissive={0.35} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Gem() {
  const mesh = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (mesh.current) {
      mesh.current.rotation.x += dt * 0.4;
      mesh.current.rotation.y += dt * 0.6;
    }
  });
  return (
    <Float speed={2.2} floatIntensity={1.4} rotationIntensity={0.4}>
      <mesh ref={mesh} position={[1.7, 1.35, 0.4]}>
        <icosahedronGeometry args={[0.32, 0]} />
        <Glossy color={CYAN} emissive={0.25} />
      </mesh>
    </Float>
  );
}

/** Tilts the whole scene gently toward the pointer. */
function Parallax({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const k = Math.min(1, dt * 3);
    g.rotation.y += (state.pointer.x * 0.35 - g.rotation.y) * k;
    g.rotation.x += (-state.pointer.y * 0.18 - g.rotation.x) * k;
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene({ variant = 'login', ring = true }: { variant?: 'login' | 'banner'; ring?: boolean }) {
  const isBanner = variant === 'banner';
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, isBanner ? 0.6 : 0.9, isBanner ? 6.2 : 6.6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <pointLight position={[-4, -1, 3]} intensity={30} color={MAGENTA} />
      <pointLight position={[3, -2, -2]} intensity={20} color={CYAN} />

      <Parallax>
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
          <group rotation={[0.25, -0.5, 0]}>
            <BookStack />
          </group>
        </Float>
        {ring && <Orbit />}
        <Gem />
        <Sparkles count={isBanner ? 30 : 60} scale={[6, 4, 4]} size={2.4} speed={0.35} color="#8eaedc" />
      </Parallax>

      {!isBanner && <ContactShadows position={[0, -1.6, 0]} opacity={0.35} scale={8} blur={2.8} far={3} color="#0d1a33" />}
    </Canvas>
  );
}
