import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ContainerScrollProps {
  titleComponent: React.ReactNode
  children: React.ReactNode
}

export const ContainerScroll: React.FC<ContainerScrollProps> = ({ titleComponent, children }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const rotateValue = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scaleValue = useTransform(scrollYProgress, [0, 1], [1.05, 1])
  const translateValue = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div
      className="flex items-center justify-center relative w-full"
      ref={containerRef}
      style={{ minHeight: '480px' }}
    >
      <div className="w-full relative" style={{ padding: '20px 0' }}>
        <motion.div
          style={{ translateY: translateValue }}
          className="max-w-5xl mx-auto text-center mb-8"
        >
          {titleComponent}
        </motion.div>

        <motion.div
          style={{
            rotateX: rotateValue,
            scale: scaleValue,
            perspective: '1000px',
            boxShadow:
              '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026',
          }}
          className="max-w-5xl mx-auto h-[28rem] md:h-[36rem] w-full border border-border p-2 md:p-4 rounded-[30px] shadow-2xl"
        >
          <div className="h-full w-full overflow-hidden rounded-2xl bg-muted border border-border">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
