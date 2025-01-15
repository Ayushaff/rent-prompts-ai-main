import { PayloadHandler } from 'payload'
import { run } from '../providers/Groq/client'
import addData from '@/utilities/addReqData'

interface ReqBody {
  prompt: string
  keyToUse: 'prod' | 'test'
  systemprompt?: string
  negativeprompt?: string
  image?: any
  settings?: any
}

const testModel: PayloadHandler = async (req): Promise<Response> => {
  const { routeParams, payload, user } = req
  const id = routeParams?.id as string

  if (!user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) {
    return Response.json({ success: false, error: 'No id provided' }, { status: 400 })
  }

  try {
    const model = await payload.findByID({ collection: 'models', id: id })

    const data = await addData(req)

    const { prompt, keyToUse, systemprompt, negativeprompt, image, settings }: ReqBody = data
    let output
    switch (model.provider) {
      case 'groq':
        const apiKey =
          keyToUse === 'prod' ? model.prodkeys?.groq?.apikey : model.testkeys?.groq?.apikey
        const modelname =
          keyToUse === 'prod' ? model.prodkeys?.groq?.modelname : model.testkeys?.groq?.modelname

        output = await run({
          apiKey: apiKey ?? '',
          model: modelname ?? '',
          prompt: prompt,
          negativeprompt: negativeprompt,
          systemPrompt: systemprompt,
          image: image,
          settings: settings,
        })
        break
      case 'openai':
        break
      case 'replicate':
        break
    }
    if (output.error) {
      return Response.json({ success: false, error: output.error }, { status: 400 })
    }
    return Response.json(
      { success: true, message: 'Model run successfully', data: output },
      { status: 200 },
    )
  } catch (error) {
    console.log('Error in testModel endpoint livepreview run', error.message)
    return Response.json({ success: false, error: 'Error running model' }, { status: 400 })
  }
}
export default testModel
