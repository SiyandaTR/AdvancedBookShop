"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function Particles({ count = 80 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10,
        ],
        speed: 0.0005 + Math.random() * 0.001,
        offset: Math.random() * Math.PI * 2,
        factor: 0.5 + Math.random() * 1,
      })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    const time = state.clock.elapsedTime

    particles.forEach((particle, i) => {
      const [x, y, z] = particle.position
      dummy.position.set(
        x + Math.sin(time * particle.speed * 50 + particle.offset) * particle.factor,
        y + Math.cos(time * particle.speed * 40 + particle.offset * 1.3) * particle.factor * 0.6,
        z + Math.sin(time * particle.speed * 30) * 0.3
      )
      dummy.scale.setScalar(0.02 + Math.sin(time * 0.5 + particle.offset) * 0.01)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <circleGeometry args={[1, 8]} />
      <meshBasicMaterial color="#888888" transparent opacity={0.35} />
    </instancedMesh>
  )
}

function GridLines() {
  const linesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!linesRef.current) return
    linesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05
    linesRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.03) * 0.05
  })

  const lines = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const vertices: number[] = []

    for (let i = -10; i <= 10; i += 2) {
      vertices.push(-10, i, -5, 10, i, -5)
      vertices.push(i, -10, -5, i, 10, -5)
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    return geometry
  }, [])

  return (
    <group ref={linesRef}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#888888" transparent opacity={0.06} />
      </lineSegments>
    </group>
  )
}

export function ThreeBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 -z-10" style={{ opacity: 0.6 }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Particles count={60} />
        <GridLines />
      </Canvas>
    </div>
  )
}
