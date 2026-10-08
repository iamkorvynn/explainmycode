import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeCanvasProps {
  className?: string;
  interactive?: boolean;
}

export function ThreeCanvas({ className = "", interactive = true }: ThreeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0a09, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Lighting (Warm amber glow + cool neon accents)
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.8);
    scene.add(ambientLight);

    const pointLightCoral = new THREE.PointLight(0xff7a50, 4, 30);
    pointLightCoral.position.set(5, 5, 8);
    scene.add(pointLightCoral);

    const pointLightCyan = new THREE.PointLight(0x38bdf8, 3, 30);
    pointLightCyan.position.set(-6, -4, 6);
    scene.add(pointLightCyan);

    const pointLightAmber = new THREE.PointLight(0xf59e0b, 2.5, 25);
    pointLightAmber.position.set(0, -6, 4);
    scene.add(pointLightAmber);

    // 4. Core 3D Geometry: Multi-layer Algorithmic Core
    const group = new THREE.Group();
    scene.add(group);

    // Layer A: Inner Faceted Core (Icosahedron)
    const innerGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0xff6b4a,
      roughness: 0.2,
      metalness: 0.8,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
      flatShading: true,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // Layer B: Outer Holographic Wireframe Cage
    const cageGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const wireframeGeo = new THREE.WireframeGeometry(cageGeo);
    const cageMat = new THREE.LineBasicMaterial({
      color: 0xff9f7a,
      transparent: true,
      opacity: 0.45,
      linewidth: 1.5,
    });
    const cageLines = new THREE.LineSegments(wireframeGeo, cageMat);
    group.add(cageLines);

    // Layer C: Outer Orbital Torus Rings (Matrix data tracks)
    const ringGeo1 = new THREE.TorusGeometry(5.2, 0.04, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    group.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(6.2, 0.03, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xffa07a,
      transparent: true,
      opacity: 0.5,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    ringMesh2.rotation.z = Math.PI / 6;
    group.add(ringMesh2);

    // Layer D: Star Galaxy / Code Particle Constellation
    const particleCount = 1400;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const coralColor = new THREE.Color(0xff7a50);
    const cyanColor = new THREE.Color(0x38bdf8);
    const whiteColor = new THREE.Color(0xffedd5);

    for (let i = 0; i < particleCount; i++) {
      // Distribute in a spherical cloud around center
      const radius = 6 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = Math.random();
      const col = mixed < 0.45 ? coralColor : mixed < 0.8 ? cyanColor : whiteColor;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Interactive Mouse Tracking & Drag Orbit
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseX = x * 1.5;
      mouseY = y * 1.5;

      if (isDragging) {
        const deltaX = e.clientX - previousPointerX;
        const deltaY = e.clientY - previousPointerY;
        group.rotation.y += deltaX * 0.008;
        group.rotation.x += deltaY * 0.008;
        previousPointerX = e.clientX;
        previousPointerY = e.clientY;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    // 6. Responsive Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX * 1.8;
      camera.position.y = targetY * 1.4;
      camera.lookAt(0, 0, 0);

      // Autonomous rotation
      if (!isDragging) {
        group.rotation.y += 0.005;
        group.rotation.x = Math.sin(elapsedTime * 0.4) * 0.15;
      }

      // Counter-rotating rings
      ringMesh1.rotation.z += 0.008;
      ringMesh2.rotation.z -= 0.006;

      // Cage breathing scale
      const pulse = 1 + Math.sin(elapsedTime * 1.8) * 0.035;
      innerMesh.scale.set(pulse, pulse, pulse);
      cageLines.scale.set(1 / pulse, 1 / pulse, 1 / pulse);

      // Gently rotate particle galaxy
      particles.rotation.y = elapsedTime * 0.02;
      particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", handleResize);

      // Dispose three.js resources
      innerGeo.dispose();
      innerMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden ${className}`}
    >
      {/* Interactive Helper Pill */}
      {interactive && (
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#1e293b]/80 backdrop-blur-md border border-white/10 text-[10px] text-[#e2e8f0] transition-opacity duration-300 pointer-events-none flex items-center gap-1.5 ${
            isHovered ? "opacity-90" : "opacity-40"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a50] animate-ping" />
          <span>Interactive 3D Engine • Click & Drag to Orbit</span>
        </div>
      )}
    </div>
  );
}
