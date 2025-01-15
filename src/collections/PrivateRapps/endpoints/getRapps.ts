import { Model, User } from '../../../payload-types'
import addData from '@/utilities/addReqData'
import { PayloadHandler } from 'payload'
import slugify from 'slugify'

interface PrivateRapp {
  prompt: string
  systemprompt: string
  id: string
  slug: string
  type: string
  model?: Model
  name: string
  description: string
  computation?: string
  price: number
  images?: string[]
  access: {
    userId: {
      id: string;
      email: string;
    };
    getAccess: string[];
  }[];

  status: string
  commission?: number
  createdAt: string
  updatedAt: string
  creator: { id: string }
  rappAccess?: { rappId: { id: string } }[];
  negativeVariables: [],
  systemVariables: [],
  promptVariables: [],
  negativeprompt:string
  imageinput:boolean
  settings:[]
}

interface Access {
  userId: string;
  read: string;
  update: string;
}


interface rappData {
  id: string
  type: string
  model?: Model | string
  rappName: string
  rappDes: string
  computation?: string
  cost?: number
  computationcost: number
  status: string
  PrivateRapp: string
  commission?: number
  rappStatus: string
  createdAt: string
  updatedAt: string

}

export const getRapps = async (req) => {
    const { payload, user } = req;
  
    if (!user) {
      return Response.json({success:false, error: 'Unauthorized User' }, { status: 401 });
    }
  
    try {
      const { docs: rapps } = await payload.find({
        collection: 'privateRapps',
        where: {
          creator: {
            equals: user.id,
          },
        },
      });

      const rappAccessIds = user.rappAccess.map((accessObj) => typeof accessObj.rappId === 'object' && accessObj.rappId !== null ? accessObj.rappId.id : accessObj.rappId);

      const { docs: accessRapps } = await payload.find({
        collection: 'privateRapps',
        where: {
          id: {
            in: rappAccessIds,
          },
        },
      });

      const myRappsData = rapps.map((doc) => ({
        id: doc.id,
        slug: doc.slug,
        type: doc.type,
        model: doc.model?.name,
        rappName: doc.name,
        rappDes: doc.description,
        cost: doc.totalCost ,
        commission: doc.commission,
        rappStatus: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));

      const accessRappsData = accessRapps.map((doc) => ({
        id: doc.id,
        slug: doc.slug,
        type: doc.type,
        model: doc.model?.name,
        rappName: doc.name,
        rappDes: doc.description,
        cost: doc.totalCost,
        commission: doc.commission,
        rappStatus: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));

    const data = {
      myRapps: myRappsData,
      accessRapps: accessRappsData,
    }

    return Response.json({success:true, message: 'Rapps data fetched successfully', data }, { status: 200 })
  } catch (error) {
    console.error('Error getting rapps:', error)
    return Response.json({success: false, error: 'Error in getting rapps' }, { status: 500 })
  }
}

//get rapps by id
export const getRappById: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const id = routeParams?.id as string

  if (!id) {
    return Response.json({ success: false, error: 'ID parameter is missing.' }, { status: 400 })
  }

  if (!user) {
    return Response.json({ success: false, error: 'Unauthorized User' }, { status: 401 })
  }

  try {
    const rapp = await payload.findByID({
      collection: 'privateRapps',
      id: id,
    })

    if (!rapp) {
      return Response.json({ success: false, error: 'Rapp not found or access denied' }, { status: 404 })
    }

    const doc = rapp as unknown as PrivateRapp
    const model = doc.model as Model
    const rappData = {
      id: doc.id,
      type: doc.type,
      model: model,
      rappName: doc.name,
      rappDes: doc.description,
      cost: doc.price,
      commission: doc.commission,
      rappStatus: doc.status,
      images: doc.images,
      // creatorName: doc.creator.name ,
      // creatorRole: doc.creator.role,
      access: doc.access,
    }

    return Response.json({ success: true, message: 'Rapp data fetched successfully', rappData }, { status: 200 })
  } catch (error) {
    console.error('Error getting rapp by ID:', error)
    return Response.json({ success: false, error: 'Error in getting rapp' }, { status: 500 })
  }
}

//get rapps by id
export const getRappBySlug: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const slug = routeParams?.slug as string

  if (!slug) {
    return Response.json({ success: false, error: 'Slug parameter is missing.' }, { status: 400 })
  }

  if (!user) {
    return Response.json({ success: false, error: 'Unauthorized User' }, { status: 401 })
  }

  try {
    const rapp = await payload.find({
      collection: 'privateRapps',
      where: { slug: { equals: slug } },
    })
    
    
    if (!rapp) {
      return Response.json({ success: false, error: 'Rapp not found or access denied' }, { status: 404 })
    }

    const doc = rapp.docs[0] as unknown as PrivateRapp
    const model = doc?.model as Model
    
    const access = doc.access.map((access) => ({
      userId: {
        id: access?.userId?.id,
        email: access?.userId?.email,
      },
      getAccess: access.getAccess,
    }));

    const rappData = {
      id: doc.id,
      type: doc.type,
      modelId: model.id,
      modelName: model.name,
      rappName: doc.name,
      rappDes: doc.description,
      cost: doc.price,
      commission: doc.commission,
      rappStatus: doc.status,
      images: doc.images,
      systemVariables: doc.systemVariables,
      promptVariables: doc.promptVariables,
      negativeVariables: doc.negativeVariables,
      access: access,
    }

    return Response.json({ success: true, message: 'Rapp data fetched successfully', rappData }, { status: 200 })
  } catch (error) {
    console.error('Error getting rapp by ID:', error)
    return Response.json({ success: false, error: 'Error in getting rapp' }, { status: 500 })
  }
}

export const getPromptBySlug: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user, routeParams } = req
  const slug = routeParams?.slug as string
  
  if (!slug) {
    return Response.json({ success: false,error: 'Slug parameter is missing.' }, { status: 400 })
  }

  if (!user) {
    return Response.json({ success: false, error: 'Unauthorized User' }, { status: 401 })
  }

  try {
    const rapp = await payload.find({
      collection: 'privateRapps',
      where: { slug: { equals: slug } },
    })

    if (!rapp) {
      return Response.json({ success: false, error: 'Rapp not found or access denied' }, { status: 404 })
    }

    const doc:any = rapp.docs[0] 
    const model = doc?.model as Model
    const rappData = {
      id: doc.id,
      // type: doc.type,
      modelId: model.id,
      // rappName: doc.name,
      // rappDes: doc.description,
      // cost: doc.price,
      // commission: doc.commission,
      // rappStatus: doc.status,
      images: doc.images,
      imageinput:doc.imageinput,

      promptVariables: doc.promptVariables,
      systemVariables: doc.systemVariables,
      negativeVariables: doc.negativeVariables,

      negativeprompt:doc.negativeprompt,
      systemprompt:doc.systemprompt,
      userprompt: doc.prompt,

      access: doc.access,
      settings:doc.model?.settings,
    }

    return Response.json({ success: true, message: 'Rapp prompts fetched successfully', rappData }, { status: 200 })
  } catch (error) {
    console.error('Error getting rapp by ID:', error)
    return Response.json({ success: false, error: 'Error in getting prompts' }, { status: 500 })
  }
}
export const updatePrompts: PayloadHandler = async (req): Promise<Response> => {
  try {
    const { payload, routeParams, user } = req
    const id = routeParams?.id as string

    let promptData;
    try {
      promptData = await addData(req);
    } catch (e) {
        console.error('Error parsing form data:', e);
        return Response.json({ success: false, error: 'Malformed request body' }, { status: 400 });
    }

    // Update the document in Payload CMS
    const updatedDoc = await payload.update({
      collection: 'privateRapps', // Replace with your actual collection name
      id,
      data: {
        systemprompt: promptData.systemprompt,
        prompt: promptData.userprompt,
        negativeprompt: promptData.negativeprompt,

        imageinput: promptData?.imageinput,
        
        systemVariables:promptData?.systemVariables,
        promptVariables:promptData?.promptVariables,
        negativeVariables:promptData?.negativeVariables,

      },
    });

   return Response.json({ success: true, message: 'Prompt updated successfully', updatedDoc}, { status: 200 })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return Response.json({ success: false, error: 'Error in updating prompt' }, { status: 500})
  }
}
export const updateAccess: PayloadHandler = async (req): Promise<Response> => {
  const { payload, routeParams, user } = req
  const id = routeParams?.id as string
  
  try {
    let formData;
    try {
        formData = await addData(req);
    } catch (e) {
        console.error('Error parsing form data:', e);
        return Response.json({ success: false, error: 'Malformed request body' }, { status: 400 });
    }

    if (!formData) {
      return Response.json({ success: false, error: 'Invalid form data' }, { status: 400 })
    }
    
    const users: Access[] = formData.users;
    var accessArray: any[] = []; 
    let usersToUpdate: string[] = [];
    
    if (user?.role === 'enterprise') {
      if (Array.isArray(users)) {
          users.forEach(user => {
              if (user.read === 'true') {
                  const access: ('read' | 'delete' | 'update' | 'create')[] = [];
                  if (user.read === 'true') access.push('read');
                  if (user.update === 'true') access.push('update');
                  accessArray.push({ userId: user.userId, getAccess: access });
              } else if (user.read === 'false') {
                  usersToUpdate.push(user?.userId);
              }
          });
      }
    }
  
    const updatedSlug = `${slugify(formData.rappName).toLowerCase()}-${Date.now()}`;
      
      if (user?.role === 'enterprise') {
          const updatedRapp = await payload.update({
          collection: 'privateRapps',
          id: id,
          data: {
              name: formData.rappName,
              description: formData.rappDes,
              type: formData.type,
              status: formData.rappStatus,
              price: parseInt(formData.cost, 10),
              access: accessArray || [],
              model: formData.model,
              slug: updatedSlug,
          },
          });

          for (const userId of usersToUpdate) {
            const userRecord = await payload.findByID({
              collection: 'users',
              id: userId,
            });
            
            const updatedRappAccess = (userRecord.rappAccess || []).filter(rappAccess => {
              const currentRappId = typeof rappAccess.rappId === 'object' ? rappAccess.rappId.id : rappAccess.rappId;
              return currentRappId !== id;
            });
            const ids = updatedRappAccess.map((access) => {
              return {
                rappId: typeof access?.rappId === 'object' ? access?.rappId?.id : access?.rappId,  
                getAccess: access.getAccess,
              };
            });

            await payload.update({
                collection: 'users',
                id: userId,
                data: {
                    rappAccess: ids,
                },
            });
          }

          for (const user of users) {
            if (user.read === 'true') {
              const access: ('read' | 'delete' | 'update' | 'create')[] = [];

              if (user.read === 'true') access.push('read');
              if (user.update === 'true') access.push('update');

              const userRecord = await payload.findByID({
                  collection: 'users',
                  id: user.userId,
              });

              const updatedRappAccess = (userRecord.rappAccess || []).map((rapp) => {
                if (typeof rapp.rappId === 'object' && rapp.rappId.id === id) {
                  return {
                      ...rapp,
                      getAccess: access,
                  };
              } else if (typeof rapp.rappId === 'string' && rapp.rappId === id) {
                  return {
                      ...rapp,
                      getAccess: access,
                  };
              }
                return rapp;
              });

              const ids = updatedRappAccess.map((access) => {
                return {
                  rappId: typeof access.rappId === 'object' ? access.rappId.id : access.rappId, 
                  getAccess: access.getAccess
                };
              });

              await payload.update({
                  collection: 'users',
                  id: user.userId,
                  data: {
                      rappAccess: ids,
                  },
              });
          }
        }
        return Response.json({success:true, message:'Rapp updated successfully', slug:updatedSlug}, { status: 200 })

    } else{
      const updatedRapp = await payload.update({
        collection: 'privateRapps',
        id: id,
        data: {
          name: formData.rappName,
          description: formData.rappDes,
          type: formData.type,
          status: formData.rappStatus,
          price: parseInt(formData.cost, 10),
          model: formData.model,
          slug: updatedSlug,
        },
      })
      
     return Response.json({ success: true, message: 'Rapp updated successfully', slug:updatedSlug}, { status: 200 })
    }
    
  } catch (error) {
    console.error('Error updating access:', error)
    return Response.json({ success: false, error: 'Error updating Rapp' }, { status: 500})
  }
}
export const updatePermissions: PayloadHandler = async (req): Promise<Response> => {
  try {
    const { payload, routeParams } = req
    const id = routeParams?.id as string
    let formData;
    try {
        formData = await addData(req);
    } catch (e) {
        console.error('Error parsing form data:', e);
        return Response.json({ success: false, error: 'Malformed request body' }, { status: 400 });
    }

    if (!formData && !formData.users) {
      return Response.json({ success: false, error: 'Invalid form data' }, { status: 400 })
    }
     // Parse `users` field if it exists
     let users;
     try {
       users = JSON.parse(formData?.users); // Parse stringified `users` into an array
     } catch (e) {
       console.error('Error parsing users:', e);
       return Response.json({success: false, error: 'Invalid users data' }, { status: 400 });
     }
    // Create access array based on users in formData
    const accessArray = users?.map(user => ({
      userId: user?.userId,
      getAccess: user?.getAccess || [],
    }));

    const updatedRapp = await payload.update({
      collection: 'privateRapps',
      where: { id: { equals: id } },
      data: {
        access: accessArray,
        model: formData.modelId,
        // slug: updatedSlug,
      },
    })
    
   return Response.json({ success: true, message: 'Rapp updated successfully', updatedRapp}, { status: 200 })
  } catch (error) {
    console.error('Error updating access:', error)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500})
  }
}
export const getMemberRapps = async (req) => {
    const { payload, user } = req;
  
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized User' }, { status: 401 });
    }

    const data = await req.json();
    const { id } = data;
  
    try {
      const { docs: rapps } = await payload.find({
        collection: 'privateRapps',
        where: {
          creator: {
            equals: id,
          },
        },
      });

      const users = await payload.find({
        collection: 'users',
        where: {
          id: {
            equals: id,
          },
        },
      })
    
      const user = users.docs[0];

      const rappAccessIds = user.rappAccess.map((accessObj) => typeof accessObj.rappId === 'object' && accessObj.rappId !== null ? accessObj.rappId.id : accessObj.rappId);

      const { docs: accessRapps } = await payload.find({
        collection: 'privateRapps',
        where: {
          id: {
            in: rappAccessIds,
          },
        },
      });

      const myRappsData = rapps.map((doc) => ({
        id: doc.id,
        type: doc.type,
        model: doc.model?.name,
        rappName: doc.name,
        rappDes: doc.description,
        cost: doc.computationcost ,
        commission: doc.commission,
        rappStatus: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));

      const accessRappsData = accessRapps.map((doc) => ({
        id: doc.id,
        type: doc.type,
        model: doc.model?.name,
        rappName: doc.name,
        rappDes: doc.description,
        cost: doc.computationcost,
        commission: doc.commission,
        rappStatus: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));

      const data = {
        myRapps: myRappsData,
        accessRapps: accessRappsData,
      };
  
      return Response.json({ success: true, message: 'Rapps fetched successfully', data }, { status: 200 });
    } catch (error) {
      console.error('Error getting rapps:', error);
      return Response.json({ success: false, error: 'Error getting rapps' }, { status: 500 });
    }
  };
  