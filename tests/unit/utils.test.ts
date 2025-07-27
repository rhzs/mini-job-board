import { cn } from '@/lib/utils'

describe('lib/utils.ts', () => {
  describe('cn (className utility)', () => {
    it('should combine class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden')
      expect(result).toContain('base')
      expect(result).toContain('conditional')
      expect(result).not.toContain('hidden')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'end')
      expect(result).toContain('base')
      expect(result).toContain('end')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(typeof result).toBe('string')
    })

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle object with conditional classes', () => {
      const result = cn({
        'base': true,
        'active': true,
        'hidden': false
      })
      expect(result).toContain('base')
      expect(result).toContain('active')
      expect(result).not.toContain('hidden')
    })
  })
}) 