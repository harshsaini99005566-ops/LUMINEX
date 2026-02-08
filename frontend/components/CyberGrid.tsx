'use client'

import { useEffect, useRef } from 'react'

export function CyberGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const drawGrid = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const gridSize = 60
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.03)'
      ctx.lineWidth = 1

      for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }

      for (let i = 0; i <= canvas.height; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }
    }

    drawGrid()

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  )
}
