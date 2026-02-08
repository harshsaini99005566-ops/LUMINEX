'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'

export function StatsGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    camera.position.z = 3

    // Create sphere with enhanced material
    const geometry = new THREE.IcosahedronGeometry(1.5, 64)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          float dist = length(vPosition);
          float wave = sin(dist * 5.0 - time) * 0.5 + 0.5;
          float glow = smoothstep(1.8, 1.3, dist);
          gl_FragColor = vec4(0.0, 1.0, 0.53, (wave * 0.8 + glow * 0.4) * 0.9);
        }
      `,
      wireframe: false,
      transparent: true,
    })

    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Add enhanced glow with better fresnel effect
    const glowGeometry = new THREE.IcosahedronGeometry(1.65, 32)
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          float pulse = sin(time * 2.0) * 0.5 + 0.5;
          gl_FragColor = vec4(0.0, 1.0, 0.53, fresnel * (0.4 + pulse * 0.2));
        }
      `,
      side: THREE.BackSide,
      transparent: true,
    })

    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    scene.add(glow)

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0x00ff88, 0.3)
    scene.add(ambientLight)

    // Animation loop with faster rotation for cyberpunk feel
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      material.uniforms.time.value += 0.01
      glowMaterial.uniforms.time.value += 0.01

      sphere.rotation.x += 0.0008
      sphere.rotation.y += 0.0015
      glow.rotation.x += 0.0005
      glow.rotation.y += 0.0012

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
      cancelAnimationFrame(animationId)
      renderer.dispose()
      container?.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <motion.div 
      ref={containerRef} 
      className="w-full h-64 rounded-lg border border-cyber-primary/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    />
  )
}
