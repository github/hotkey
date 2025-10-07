import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/test*.js'],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [
        {
          browser: 'chromium'
        }
      ]
    }
  }
})
