import { CollectionConfig } from 'payload'
import addUser from './hooks/addUser'

const ProductFiles: CollectionConfig = {
  slug: 'productFiles',
  hooks: {
    beforeChange: [addUser],
  },
  upload: {
    disableLocalStorage: true,
    staticDir: 'productFiles',
    // staticURL: "/product_files",
    mimeTypes: [
      'image/*',
      'font/*',
      'application/postscript',
      'text/*',
      'audio/*',
      'video/*',
      'application/*',
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      // defaultValue: ({ user }) => user.id,
      hasMany: false,
      required: true,
    },
  ],
}
export default ProductFiles
