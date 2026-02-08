'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'

export function Scene3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Initialize scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0.1)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create rotating cubes
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      emissive: 0x00aa44,
      wireframe: false,
    })

    const cubes: THREE.Mesh[] = []
    for (let i = 0; i < 3; i++) {
      const cube = new THREE.Mesh(geometry, material.clone())
      cube.position.x = (i - 1) * 2.5
      cube.position.y = Math.sin(i) * 2
      scene.add(cube)
      cubes.push(cube)
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x00ff88, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ff88, 1)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      cubes.forEach((cube, i) => {
        cube.rotation.x += 0.005 + i * 0.001
        cube.rotation.y += 0.007 + i * 0.001
        cube.position.y = Math.sin(Date.now() * 0.001 + i) * 1.5
      })

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      container?.removeChild(renderer.domElement)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <motion.div
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden border border-cyber-primary/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    />
  )
}
