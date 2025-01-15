// import { run } from '@/collections/Models/providers/Groq/client'
// import { Model } from '@/payload-types'
// import addData from '@/utilities/addReqData'
// import replaceVariables from '@/utilities/replaceVariables'
// import { PayloadHandler } from 'payload'

// interface ReqData {
//   promptValues: { [key: string]: string }
//   negativeValues?: { [key: string]: string }
//   systemValues?: { [key: string]: string }
//   settings?: any
//   image?: any
// }

// const runRapp: PayloadHandler = async (req): Promise<Response> => {

//   try {
//     const data = await addData(req)
//     const {payload, user} = req;

//     const { promptValues, negativeValues, systemValues, settings, image }: ReqData = data

//     // const { routeParams, payload } = req
//     // const id = routeParams?.id as string

//     // const rapp = await payload.findByID({ collection: 'privateRapps', id: id })

//     // const model = rapp.model as Model
//     const modelInfo = await payload.findByID({collection: 'models', id: data.model})

//     if ((user?.balance ?? 0) < (modelInfo?.cost ?? 0) + (modelInfo?.commission ?? 0)) {
//       return Response.json({ error : 'Insufficient balance'}, {status: 404})
//   }
  

//     const rapp = {key: 'test',
//       systemprompt: '',
//       negativeprompt: '',
//     }
//     const handleVariables = (variables) => {
//       return variables.reduce((acc, variable) => {
//         acc[variable.name] = variable.value;
//         return acc;
//       }, {});
//     };
    
//     const promptValue = handleVariables(data.variables);

//     const prompt = replaceVariables(data.userPrompt, promptValue)
//     const systemPrompt = replaceVariables(rapp.systemprompt ?? '', systemValues ?? {})
//     const negativePrompt = replaceVariables(rapp.negativeprompt ?? '', negativeValues ?? {})

//     let output
//     switch (modelInfo.provider) {
//       case 'groq':
//         const apiKey =
//           rapp.key === 'prod' ? modelInfo.prodkeys?.groq?.apikey : modelInfo.testkeys?.groq?.apikey
//         const modelname =
//           rapp.key === 'prod' ? modelInfo.prodkeys?.groq?.modelname : modelInfo.testkeys?.groq?.modelname

//         output = await run({
//           apiKey: apiKey ?? '',
//           model: modelname ?? '',
//           prompt: prompt,
//           negativeprompt: negativePrompt,
//           systemPrompt: systemPrompt,
//           settings: settings ? settings : '',
//           image: image,
//         })

//         break
//       case 'openai':
//         break
//       case 'replicate':
//         break
//     }
//     return Response.json({ data: output }, { status: 200 })
//   } catch (e) {
//     console.log(e)
//     return Response.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }
// export default runRapp


















import { run } from '@/collections/Models/providers/Groq/client'
import { Model } from '@/payload-types'
import addData from '@/utilities/addReqData'
import replaceVariables from '@/utilities/replaceVariables'
import { PayloadHandler } from 'payload'

interface ReqData {
  promptValues: { [key: string]: string }
  negativeValues?: { [key: string]: string }
  systemValues?: { [key: string]: string }
  settings?: any
  image?: any
  rappId?: string
}

const runRapp: PayloadHandler = async (req): Promise<Response> => {
  try {
    const data = await addData(req)
    const { payload, user } = req

    console.log('data:', data)

    const { promptValues, negativeValues, systemValues, settings, image, rappId }: ReqData = data

    let rapp
    if (rappId) {
      rapp = await payload.findByID({ collection: 'privateRapps', id: rappId })

    } else {

      rapp = {
        key: 'test',
        systemprompt: '',
        negativeprompt: '',
      }
    }

    const modelId = typeof data.model === 'object' ? data?.model?.id : data?.model ;
    
    const modelInfo = await payload.findByID({ collection: 'models', id: modelId })

    if(user?.role === 'enterprise'){
      if ((user?.balance ?? 0) < (modelInfo?.cost ?? 0) + (modelInfo?.commission ?? 0)) {
        return Response.json({ error: 'Insufficient balance' }, { status: 404 })
      }
    } 
    else if(user?.role === "member"){
      const enterpriseDetail = await payload.findByID({
        collection: 'users',
        id: user?.associatedWith as string,
      })

      if((enterpriseDetail?.balance ?? 0) < (modelInfo?.cost ?? 0) + (modelInfo?.commission ?? 0)){
        return Response.json({ error: 'Insufficient balance' }, { status: 404 })
      }
    }

    // Handle variables and replace them in the prompts
    const handleVariables = (variables) => {
      return variables.reduce((acc, variable) => {
        acc[variable.name] = variable.value
        return acc
      }, {})
    }

    // Conditionally fetch prompts from `data` or use `rapp`
    const promptValue = handleVariables(data.variables || [])

    
    console.log("data.userpr:", data.userPrompt)
    const prompt = replaceVariables(data.userPrompt ?? rapp.prompt, promptValue)
    const systemPrompt = replaceVariables(
      data.systemValues ?? rapp.systemprompt ?? '',
      systemValues ?? {}
    )
    console.log("systemPrompt:", systemPrompt)
    console.log("Prompt:", prompt)
    const negativePrompt = replaceVariables(
      data.negativeValues ?? rapp.negativeprompt ?? '',
      negativeValues ?? {}
    )
    console.log("nigaPrompt:", negativePrompt)


    let output
    switch (modelInfo.provider) {
      case 'groq': {
        const apiKey =
          rapp.key === 'prod' ? modelInfo.prodkeys?.groq?.apikey : modelInfo.testkeys?.groq?.apikey
        const modelname =
          rapp.key === 'prod' ? modelInfo.prodkeys?.groq?.modelname : modelInfo.testkeys?.groq?.modelname

        output = await run({
          apiKey: apiKey ?? '',
          model: modelname ?? '',
          prompt: prompt,
          negativeprompt: negativePrompt,
          systemPrompt: systemPrompt,
          settings: settings ? settings : '',
          image: image,
        })
        break
      }
      case 'openai':
        // Handle OpenAI integration
        break
      case 'replicate':
        // Handle Replicate integration
        break
      default:
        throw new Error('Unknown model provider')
    }

    return Response.json({ data: output }, { status: 200 })
  } catch (e) {
    console.log(e)
    return Response.json({ error: 'Failed to run the model' }, { status: 500 })
  }
}

export default runRapp
