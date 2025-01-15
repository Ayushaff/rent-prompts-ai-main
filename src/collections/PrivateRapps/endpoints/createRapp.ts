import addData from '@/utilities/addReqData'
import { PayloadHandler } from 'payload'

interface NewRapp {}

const createRapp: PayloadHandler = async (req): Promise<Response> => {
  try {
    const { payload } = req

    const reqData = await addData(req)
    const model = await payload.findByID({ collection: 'models', id: reqData.model })
    const modelCost = model.commissionapplicable ? model.cost + (model.commission ?? 0) : model.cost
    const totalCost = reqData.priceapplicable ? reqData.price + modelCost : modelCost

    const data = {
      type: reqData.type,
      model: reqData.model,
      systemprompt: reqData.systemprompt,
      prompt: reqData.prompt,
      negativeprompt: reqData.negativeprompt,
      status: reqData.status,
      imageinput: reqData.imageinput,
      name: reqData.name,
      description: reqData.description,
      priceapplicable: reqData.priceapplicable,
      price: reqData.price,
      totalCost: totalCost,
      images: reqData.images,
      creator: reqData.creator,
      systemVariables: reqData.systemVariables,
      promptVariables: reqData.promptVariables,
      negativeVariables: reqData.negativeVariables,
      key: reqData.key,
      access: reqData.access,
    }
    // console.log('reqData', data)
    const rapp = await payload.create({ collection: 'privateRapps', data: data })
    // console.log('newrapp', rapp)
    return Response.json({ data: rapp }, { status: 200 })
  } catch (e) {
    console.log(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export default createRapp
