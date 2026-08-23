import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

const PARTICLE_COUNT = 9000

const ShiruParticles = ({ progressRef }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    // ---------------------------------------
    // SCENE
    // ---------------------------------------

    const scene = new THREE.Scene()

    // ---------------------------------------
    // CAMERA
    // ---------------------------------------

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )

    camera.position.z = 5.5

    // ---------------------------------------
    // RENDERER
    // ---------------------------------------

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    )

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    )

    renderer.setClearColor(0x000000, 0)

    // Force the canvas to visually fill its container at all times.
    // setSize() controls the internal render resolution, but without
    // this the <canvas> element defaults to top-left placement inside
    // the container if its measured size is ever wrong/stale.
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'

    container.appendChild(renderer.domElement)

    // ---------------------------------------
    // PARTICLE GEOMETRY
    // ---------------------------------------

    const positions = new Float32Array(
      PARTICLE_COUNT * 3
    )

    const basePositions = new Float32Array(
      PARTICLE_COUNT * 3
    )

    const randomPositions = new Float32Array(
      PARTICLE_COUNT * 3
    )

    const sizes = new Float32Array(
      PARTICLE_COUNT
    )

    // ---------------------------------------
    // CREATE ORGANIC, FACETED PARTICLE FORM
    // (sharper "crumpled paper / rose" look)
    // ---------------------------------------

    for (let i = 0; i < PARTICLE_COUNT; i++) {

      const i3 = i * 3

      const u = Math.random()
      const v = Math.random()

      const theta = u * Math.PI * 2
      const phi = Math.acos(2 * v - 1)

      /*
       * Base spherical coordinates
       */

      let radius = 1

      /*
       * Organic deformation — higher frequency
       * than a smooth blob, for a more faceted look.
       */

      const wave1 =
        Math.sin(theta * 6.0 + phi * 4.0)

      const wave2 =
        Math.sin(theta * 9.0 - phi * 5.0)

      const wave3 =
        Math.cos(phi * 10.0)

      /*
       * Sharper crease term — cubes a sine wave to
       * flatten the peaks/valleys into ridges instead
       * of smooth bumps.
       */

      const crease =
        Math.pow(
          Math.sin(theta * 4.0 + phi * 3.0),
          3
        )

      radius +=
        wave1 * 0.10 +
        wave2 * 0.09 +
        wave3 * 0.07 +
        crease * 0.06

      /*
       * Make the shape slightly wider
       */

      let x =
        Math.sin(phi) *
        Math.cos(theta) *
        radius

      let y =
        Math.cos(phi) *
        radius

      let z =
        Math.sin(phi) *
        Math.sin(theta) *
        radius

      /*
       * Pull the center inward
       * to make it less like a perfect sphere.
       */

      const centerPull =
        0.82 +
        Math.sin(theta * 2) * 0.08

      x *= centerPull
      z *= centerPull

      /*
       * Add subtle vertical deformation
       */

      y *= 0.95

      /*
       * Organic noise
       */

      x +=
        Math.sin(y * 8 + theta * 2) *
        0.025

      y +=
        Math.sin(x * 7 + phi * 3) *
        0.025

      z +=
        Math.cos(z * 8 + theta) *
        0.025

      /*
       * Scale
       */

      x *= 1.05
      y *= 0.98
      z *= 0.85

      basePositions[i3] = x
      basePositions[i3 + 1] = y
      basePositions[i3 + 2] = z

      /*
       * Scattered position.
       * Used during the beginning of
       * the scroll animation.
       */

      randomPositions[i3] =
        (Math.random() - 0.5) * 5

      randomPositions[i3 + 1] =
        (Math.random() - 0.5) * 4

      randomPositions[i3 + 2] =
        (Math.random() - 0.5) * 3

      /*
       * Start scattered.
       */

      positions[i3] =
        randomPositions[i3]

      positions[i3 + 1] =
        randomPositions[i3 + 1]

      positions[i3 + 2] =
        randomPositions[i3 + 2]

      /*
       * Particle size — slightly smaller on average,
       * with denser count, gives a crisper wireframe
       * feel instead of a soft fuzzy cloud.
       */

      sizes[i] =
        Math.random() < 0.06
          ? Math.random() * 0.018 + 0.012
          : Math.random() * 0.008 + 0.003
    }

    // ---------------------------------------
    // GEOMETRY
    // ---------------------------------------

    const geometry =
      new THREE.BufferGeometry()

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        positions,
        3
      )
    )

    geometry.setAttribute(
      'size',
      new THREE.BufferAttribute(
        sizes,
        1
      )
    )

    // ---------------------------------------
    // PARTICLE MATERIAL
    // ---------------------------------------

    const material =
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.011,
        transparent: true,
        opacity: 0.52,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })

    // ---------------------------------------
    // PARTICLE SYSTEM
    // ---------------------------------------

    const particles =
      new THREE.Points(
        geometry,
        material
      )

    scene.add(particles)

    // ---------------------------------------
    // MOUSE
    // ---------------------------------------

    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    }

    const handleMouseMove = (event) => {

      mouse.targetX =
        (event.clientX /
          window.innerWidth -
          0.5) *
        0.5

      mouse.targetY =
        (event.clientY /
          window.innerHeight -
          0.5) *
        0.5
    }

    window.addEventListener(
      'mousemove',
      handleMouseMove
    )

    // ---------------------------------------
    // RESIZE
    // ---------------------------------------

    const handleResize = () => {

      const width =
        container.clientWidth

      const height =
        container.clientHeight

      camera.aspect =
        width / height

      camera.updateProjectionMatrix()

      renderer.setSize(
        width,
        height
      )
    }

    window.addEventListener(
      'resize',
      handleResize
    )

    // Re-measure one frame after mount, in case the container's
    // size wasn't final at the moment renderer.setSize() first ran.
    requestAnimationFrame(handleResize)

    // ---------------------------------------
    // ANIMATION
    // ---------------------------------------

    let animationId

    const clock =
      new THREE.Clock()

    const animate = () => {

      animationId =
        requestAnimationFrame(
          animate
        )

      const elapsed =
        clock.getElapsedTime()

      /*
       * Scroll progress comes from
       * GSAP / ShiruFeatures.
       */

      const progress =
        progressRef?.current ?? 0

      /*
       * Smooth mouse.
       */

      mouse.x +=
        (mouse.targetX - mouse.x) *
        0.04

      mouse.y +=
        (mouse.targetY - mouse.y) *
        0.04

      /*
       * Particle positions.
       */

      const positionAttribute =
        geometry.attributes.position

      const array =
        positionAttribute.array

      for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
      ) {

        const i3 = i * 3

        /*
         * Scroll controls gathering.
         *
         * 0 = scattered
         * 1 = fully formed
         */

        const gather =
          THREE.MathUtils.smoothstep(
            progress,
            0.02,
            0.72
          )

        /*
         * Small continuous movement.
         */

        const waveX =
          Math.sin(
            elapsed * 0.55 +
            i * 0.007
          ) * 0.018

        const waveY =
          Math.cos(
            elapsed * 0.45 +
            i * 0.009
          ) * 0.015

        const waveZ =
          Math.sin(
            elapsed * 0.5 +
            i * 0.005
          ) * 0.018

        /*
         * Scattered → organic shape
         */

        const targetX =
          THREE.MathUtils.lerp(
            randomPositions[i3],
            basePositions[i3],
            gather
          )

        const targetY =
          THREE.MathUtils.lerp(
            randomPositions[i3 + 1],
            basePositions[i3 + 1],
            gather
          )

        const targetZ =
          THREE.MathUtils.lerp(
            randomPositions[i3 + 2],
            basePositions[i3 + 2],
            gather
          )

        array[i3] +=
          (
            targetX +
            waveX -
            array[i3]
          ) * 0.045

        array[i3 + 1] +=
          (
            targetY +
            waveY -
            array[i3 + 1]
          ) * 0.045

        array[i3 + 2] +=
          (
            targetZ +
            waveZ -
            array[i3 + 2]
          ) * 0.045
      }

      positionAttribute.needsUpdate = true

      /*
       * Organic rotation.
       */

      particles.rotation.y =
        elapsed * 0.055 +
        mouse.x * 0.35

      particles.rotation.x =
        Math.sin(elapsed * 0.18) *
        0.08 +
        mouse.y * 0.25

      particles.rotation.z =
        Math.sin(elapsed * 0.12) *
        0.025

      /*
       * Scale based on scroll.
       */

      const scale =
        THREE.MathUtils.lerp(
          0.6,
          0.85,
          progress
        )

      particles.scale.set(
        scale,
        scale,
        scale
      )

      /*
       * Fade in as particles gather.
       */

      material.opacity =
        THREE.MathUtils.lerp(
          0.05,
          0.52,
          Math.min(progress * 1.4, 1)
        )

      renderer.render(
        scene,
        camera
      )
    }

    animate()

    // ---------------------------------------
    // CLEANUP
    // ---------------------------------------

    return () => {

      cancelAnimationFrame(
        animationId
      )

      window.removeEventListener(
        'mousemove',
        handleMouseMove
      )

      window.removeEventListener(
        'resize',
        handleResize
      )

      geometry.dispose()
      material.dispose()

      renderer.dispose()

      if (
        renderer.domElement &&
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        )
      }
    }

  }, [progressRef])

  return (
    <div
      ref={containerRef}
      className="
        pointer-events-none
        absolute
        inset-0
        z-0
        h-full
        w-full
        -translate-y-[6%]
      "
    />
  )
}

export default ShiruParticles