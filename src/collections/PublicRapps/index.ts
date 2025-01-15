import { CollectionConfig } from 'payload'

const PublicRapps: CollectionConfig = {
  slug: 'publicRapps',
  fields: [
    // type
    {
      name: 'type',
      type: 'select',
      label: 'Rent Application Type',
      admin: { description: 'Select the type of application you want to rent' },
      defaultValue: 'text',
      required: true,
      options: [
        {
          label: 'Text Rapp',
          value: 'text',
        },
        {
          label: 'Image Rapp',
          value: 'image',
        },
      ],
    },
    // model
    // give icon for model info (server pages for SEO)
    {
      type: 'relationship',
      relationTo: 'models',
      name: 'model',
      label: 'Generation Model',
      required: true,
      admin: {
        allowCreate: false,
        description: 'Select the AI model',
      },
      filterOptions: ({ data }) => {
        return {
          type: {
            equals: data.type,
          },
        }
      },
    },
    // add computation and commision in the dropdown
    {
      type: 'number',
      name: 'computationcost',
      label: 'Computation Cost',
      defaultValue: 0,
      admin: {
        components: {
          // Field: ComputationCost,
        },
      },
      // validate: (val) => {
      //   console.log("val", val);
      //   return true;
      // },
    },
    {
      type: 'number',
      name: 'commission',
      label: 'Commision',
      admin: {
        components: {
          // Field: Commission,
        },
      },
      // validate: (val) => {
      //   console.log("val", val);
      //   return true;
      // },
    },
    // systemprompt
    {
      name: 'systemprompt',
      type: 'textarea',
      label: 'System Prompt',
      admin: {
        placeholder: 'give instructions to the model',
        description: 'Set context for the model',
        condition: (data) => data.type === 'text',
      },
      required: true,
    },
    // prompt
    {
      type: 'textarea',
      name: 'prompt',
      label: 'User Prompt',
      required: true,
      admin: {
        placeholder: 'a cute minimalistic simple [hedgehog] side profile Clipart',
        description: 'Put any variables in [square brackets]',
      },
    },
    // negativeprompt
    {
      type: 'textarea',
      name: 'negativeprompt',
      label: 'Negative Prompt',
      required: true,
      admin: {
        placeholder: 'give negative prompt',
        description: 'Add something to neglect',
        condition: (data) => data.type === 'image',
      },
    },
    // public => rentprompts admin
    // private => creator will change
    // status
    {
      name: 'status',
      label: 'Rapps Status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        {
          label: 'Pending verification',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Denied',
          value: 'denied',
        },
      ],
    },
    // needsApproval only public rapp
    {
      type: 'checkbox',
      name: 'needsApproval',
      label: 'Send for Approval',
      admin: {
        description: 'Mark this item as needing approval.',
        position: 'sidebar',
      },
      defaultValue: false,
      required: true,
    },
    // isFeatured (no need for private)
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Is Featured',
      defaultValue: false,
      required: true,
      admin: {
        description: 'Highlight the rapp in the list by marking it as featured.',
      },
    },
    // imageinput
    // disables if model doesn't accept image
    {
      type: 'checkbox',
      name: 'imageinput',
      label: 'Allow user to send image as Input',
      admin: {
        description: 'User will be able to give image as input to your Rapp',
        // condition: (data) => data.modelType === "image",
      },
      defaultValue: false,
      required: true,
    },
    // likes
    {
      name: 'likes',
      type: 'array',
      admin: {
        hidden: true,
      },
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
      ],
    },
    // settings
    // {

    // }
    // name
    {
      type: 'text',
      name: 'name',
      label: 'Rapp Name',
      admin: {
        description: 'Title of your Rent application',
        placeholder: 'ex: Funky Sticker Generator',
        position: 'sidebar',
      },
      required: true,
    },
    // description
    {
      type: 'textarea',
      name: 'description',
      label: 'Rapp Description',
      admin: {
        description: `Describe what your application does to a potential buyer.
        A more detailed description will increase your sales, also can use markup for increase readability.`,
        placeholder: 'Generates amazing high quality stickers',
        position: 'sidebar',
      },
      required: true,
    },
    // applicable or not (you want to sell this ?)
    // estimatedPrice
    {
      label: 'Estimated Price',
      name: 'price',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'What do you think the price of this application should as per Cycle',
        placeholder: 'Mention estimated price in coins',
        position: 'sidebar',
      },
      required: true,
    },
    // totalCost (cost + commission) and estimated if applicable
    {
      type: 'number',
      name: 'totalCost',
      defaultValue: 0,
      // required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        components: {
          // Field: totalCost,
        },
      },
    },
    // images
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      admin: {
        description: 'Uplaod 4-6 examples generated by this application',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Example/Sample Image',
        },
      ],
    },
    // creator
    {
      name: 'creator',
      label: 'Created By',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      // defaultValue: ({ user }) => user.id,
      hasMany: false,
      admin: {
        allowCreate: false,
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}

export default PublicRapps
