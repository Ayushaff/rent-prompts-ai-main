import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { admin } from '@/access/admin'
import endpoints from './endpoints'

const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: ()=> true,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email', 'coinBalance'],
    useAsTitle: 'name',
  },
  auth: { useAPIKey: true },
  endpoints: endpoints,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'User Name',
      required: false,
    },
    {
      name: 'balance',
      type: 'number',
      label: 'Credit Balance',
      required: true,
      defaultValue: 0,
      validate: (val) => {
        if (val < 0) {
          return 'Balance cannot be negative'
        }
        return true
      },
      access: {
        update: admin,
      },
    },
    {
      name: 'role',
      defaultValue: 'professional',
      required: true,
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Enterprise', value: 'enterprise' },
        { label: 'Professional', value: 'professional' },
        { label: 'Member', value: 'member' },
        { label: 'User', value: 'user' },
      ],
      saveToJWT: true,
      access: {
        update: admin,
      },
    },
    {
      name: 'domain',
      label: 'Domain',
      defaultValue: '',
      type: 'text',
    },
    {
      name: 'members',
      label: 'Members',
      defaultValue: [],
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
    },
    {
      name: 'associatedWith',
      label: 'Associated with',
      type: 'text',
    },
    {
      name: 'rappAccess',
      label: 'Rapps Access',
      type: 'array',
      required: false,
      access: {
        update: () => true,
      },
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'rappId',
          label: 'Rapp ID',
          type: 'relationship',
          relationTo: 'privateRapps',
          required: true,
        },
        {
          name: 'getAccess',
          label: 'Get Access',
          type: 'select',
          hasMany: true, // This allows multiple selections
          required: false,
          options: [
            { label: 'Read', value: 'read' },
            { label: 'Delete', value: 'delete' },
            { label: 'Create', value: 'create' },
            { label: 'Update', value: 'update' },
          ],
        },
      ],
    },
    // {
    //   name: 'products',
    //   label: 'Products',
    //   type: 'relationship',
    //   required: true,
    //   defaultValue: [],
    //   relationTo: 'products',
    //   hasMany: true,
    // },
    // {
    //   name: 'productFiles',
    //   label: 'Product files',
    //   type: 'relationship',
    //   required: true,
    //   defaultValue: [],
    //   relationTo: 'productFiles',
    //   hasMany: true,
    // },
    // {
    //   name: 'purchases',
    //   label: 'Purchases',
    //   required: true,
    //   defaultValue: [],
    //   type: 'relationship',
    //   relationTo: 'purchases',
    //   hasMany: true,
    // },
    // {
    //   name: 'rappPurchases',
    //   label: 'Rapp Purchases',
    //   type: 'relationship',
    //   required: true,
    //   defaultValue: [],
    //   relationTo: 'rappPurchases',
    //   hasMany: true,
    // },
    // {
    //   name: 'bounties',
    //   label: 'Bounties',
    //   required: true,
    //   defaultValue: [],
    //   type: 'relationship',
    //   relationTo: 'bounties',
    //   hasMany: true,
    // },
    {
      name: 'publicRapps',
      label: 'Public Rapps',
      type: 'relationship',
      relationTo: 'publicRapps',
      required: false,
      defaultValue: [],
      filterOptions: ({ data }) => {
        return {
          creator: {
            equals: data.id,
          },
        }
      },
      hasMany: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'privateRapps',
      label: 'Private Rapps',
      required: false,
      defaultValue: [],
      type: 'relationship',
      relationTo: 'privateRapps',
      filterOptions: ({ data }) => {
        return {
          creator: {
            equals: data.id,
          },
        }
      },
      hasMany: true,
      admin: {
        hidden: true,
      },
    },
    // {
    //   // TODO: we have to add default images in this
    //   name: 'profileImage',
    //   type: 'upload',
    //   relationTo: 'media',
    //   required: true,
    // },
    // {
    //   // TODO: we have to add default images in this
    //   name: 'coverImage',
    //   type: 'upload',
    //   required: true,
    //   relationTo: 'media',
    // },
    // {
    //   name: 'genInfo',
    //   label: 'General Information',
    //   type: 'group',
    //   fields: [
    //     {
    //       // TODO: change its type later
    //       name: 'education',
    //       type: 'text',
    //       label: 'Education',
    //     },
    //     {
    //       // TODO: change its type later
    //       name: 'skills',
    //       type: 'array',
    //       required: true,
    //       defaultValue: [],
    //       label: 'Skills',
    //       fields: [
    //         {
    //           name: 'skill',
    //           type: 'text',
    //           required: true,
    //         },
    //       ],
    //     },
    //     {
    //       name: 'gender',
    //       type: 'select',
    //       label: 'Gender',
    //       required: true,
    //       options: [
    //         { label: 'Male', value: 'male' },
    //         { label: 'Female', value: 'female' },
    //         { label: 'Other', value: 'other' },
    //       ],
    //     },
    //     {
    //       name: 'age',
    //       type: 'number',
    //       label: 'Age',
    //       // min: 18,
    //       // defaultValue: 18,
    //       // required: true,
    //       // hooks: {
    //       //   beforeChange: [setAge],
    //       // },
    //     },
    //     {
    //       name: 'profession',
    //       type: 'text',
    //       label: 'Profession',
    //     },
    //     {
    //       name: 'workExperience',
    //       type: 'number',
    //       label: 'Work Experience',
    //     },
    //     {
    //       name: 'interests',
    //       type: 'array',
    //       required: true,
    //       defaultValue: [],
    //       fields: [
    //         {
    //           type: 'text',
    //           name: 'interest',
    //           required: true,
    //         },
    //       ],
    //       label: 'Interests',
    //     },
    //   ],
    // },
    // {
    //   name: 'socialMediaLinks',
    //   label: 'Social Media Links',
    //   type: 'group',
    //   fields: [
    //     {
    //       name: 'facebook',
    //       type: 'text',
    //       label: 'Facebook',
    //     },
    //     {
    //       name: 'instagram',
    //       type: 'text',
    //       label: 'Instagram',
    //     },
    //     {
    //       name: 'twitter',
    //       type: 'text',
    //       label: 'Twitter',
    //     },
    //     {
    //       name: 'github',
    //       type: 'text',
    //       label: 'GitHub',
    //     },
    //     {
    //       name: 'discord',
    //       type: 'text',
    //       label: 'Discord',
    //     },
    //   ],
    // },
    // {
    //   name: 'likes',
    //   type: 'array',
    //   required: true,
    //   defaultValue: [],
    //   fields: [
    //     {
    //       name: 'user',
    //       type: 'relationship',
    //       relationTo: 'users',
    //       required: true,
    //     },
    //   ],
    //   admin: {
    //     hidden: true,
    //   },
    // },
    // {
    //   name: 'following',
    //   type: 'array',
    //   required: true,
    //   defaultValue: [],
    //   fields: [
    //     {
    //       name: 'user',
    //       type: 'relationship',
    //       relationTo: 'users',
    //       required: true,
    //     },
    //   ],
    //   admin: {
    //     hidden: true,
    //   },
    // },
    // {
    //   name: 'followers',
    //   type: 'array',
    //   required: true,
    //   defaultValue: [],
    //   fields: [
    //     {
    //       name: 'user',
    //       type: 'relationship',
    //       relationTo: 'users',
    //       required: true,
    //     },
    //   ],
    //   admin: {
    //     hidden: true,
    //   },
    // },
    // {
    //   name: 'productListing',
    //   type: 'number',
    //   label: 'Product Listing',
    // },
  ],
  timestamps: true,
}

export default Users
