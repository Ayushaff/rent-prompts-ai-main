// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
// import { s3Storage } from '@payloadcms/storage-s3'
import { payloadCloudPlugin } from '@payloadcms/plugin-cloud'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import {
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import sharp from 'sharp' // editor-import
import { UnderlineFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import Categories from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import Users from './collections/Users'
import { seedHandler } from './endpoints/seedHandler'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { revalidateRedirects } from './hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { Page, Post } from 'src/payload-types'
import Models from './collections/Models'
import PrivateRapps from './collections/PrivateRapps'
import PublicRapps from './collections/PublicRapps'
import Products from './collections/Products'
import ProductFiles from './collections/ProductFiles'
import Purchases from './collections/Purchases'
import Bounties from './collections/Bounties'
import Courses from './collections/Courses'
import RappPurchases from './collections/RappPurchases'
import { s3Storage } from '@payloadcms/storage-s3'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  return doc?.slug
    ? `${process.env.NEXT_PUBLIC_SERVER_URL!}/${doc.slug}`
    : process.env.NEXT_PUBLIC_SERVER_URL!
}

export default buildConfig({
  admin: {
    // components: {
    //   // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
    //   // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
    //   beforeLogin: ['@/components/BeforeLogin'],
    //   // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
    //   // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
    //   beforeDashboard: ['@/components/BeforeDashboard'],
    // },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        LinkFeature({
          enabledCollections: ['pages', 'posts'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
      ]
    },
  }),
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Models,
    PublicRapps,
    PrivateRapps,
    Products,
    ProductFiles,
    Purchases,
    Bounties,
    Courses,
    RappPurchases,
  ],
  cors: [process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000/*'].filter(Boolean),
  csrf: [process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000/*'].filter(Boolean),
  endpoints: [
    // The seed endpoint is used to populate the database with some example data
    // You should delete this endpoint before deploying your site to production
    {
      handler: seedHandler,
      method: 'get',
      path: '/seed',
    },
  ],
  // globals: [Header, Footer],
  plugins: [
    // s3Storage({
    //   collections:{
    //     media:true
    //   },
    //   bucket: process.env.PAYLOAD_PUBLIC_CLOUDFLARE_PUBLIC_BUCKET_NAME || '',
    //   config: {
    //     region: "auto",
    //     endpoint: process.env.PAYLOAD_PUBLIC_CLOUDFLARE_ENDPOINT || '',
    //     credentials: {
    //       accessKeyId: process.env.PAYLOAD_PUBLIC_CLOUDFLARE_PUBLIC_ACCESS_KEY || '',
    //       secretAccessKey: process.env.PAYLOAD_PUBLIC_CLOUDFLARE_PUBLIC_SECRET_KEY || '',
    //     },
    //   }
    // }),
    // redirectsPlugin({
    //   collections: ['pages', 'posts'],
    //   overrides: {
    //     // @ts-expect-error
    //     fields: ({ defaultFields }) => {
    //       return defaultFields.map((field) => {
    //         if ('name' in field && field.name === 'from') {
    //           return {
    //             ...field,
    //             admin: {
    //               description: 'You will need to rebuild the website when changing this field.',
    //             },
    //           }
    //         }
    //         return field
    //       })
    //     },
    //     hooks: {
    //       afterChange: [revalidateRedirects],
    //     },
    //   },
    // }),
    nestedDocsPlugin({
      collections: ['categories'],
    }),
    seoPlugin({
      generateTitle,
      generateURL,
    }),
    formBuilderPlugin({
      fields: {
        payment: false,
      },
      formOverrides: {
        fields: ({ defaultFields }) => {
          return defaultFields.map((field) => {
            if ('name' in field && field.name === 'confirmationMessage') {
              return {
                ...field,
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => {
                    return [
                      ...rootFeatures,
                      FixedToolbarFeature(),
                      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    ]
                  },
                }),
              }
            }
            return field
          })
        },
      },
    }),
    payloadCloudPlugin(), // storage-adapter-placeholder
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.PAYLOAD_PUBLIC_CLOUDFLARE_PUBLIC_BUCKET_NAME as string,
      config: {
        credentials: {
          accessKeyId: process.env.PAYLOAD_PUBLIC_CLOUDFLARE_PUBLIC_ACCESS_KEY as string,
          secretAccessKey: process.env.PAYLOAD_PUBLIC_CLOUDFLARE_PUBLIC_SECRET_KEY as string,
        },
        region: 'auto',
        endpoint: process.env.PAYLOAD_PUBLIC_CLOUDFLARE_ENDPOINT,
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET!,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
