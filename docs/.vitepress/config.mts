import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Reachkart Documentation",
  description: "Documentation for Reachkart backend API",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/markdown-examples' },
          { text: 'Running the Project', link: '/api-examples' }
        ]
      },
      {
        text: 'API Guide'
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jellibeantheargonaut/Reach-Kart' }
    ]
  }
})
