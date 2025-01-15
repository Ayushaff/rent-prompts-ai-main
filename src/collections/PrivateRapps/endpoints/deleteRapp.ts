
import addData from '@/utilities/addReqData'
import { PayloadHandler } from 'payload'

interface NewRapp {}

const deleteRapp: PayloadHandler = async (req): Promise<Response> => {
  try {
    const { payload } = req

    const reqData = await addData(req)

    if(!reqData.deleteRappId) {
        return Response.json({ error: 'No Rapp ID provided' }, { status: 400 })
    }

    try{
        const rapp = await payload.delete({ collection: 'privateRapps',  id: reqData.deleteRappId })
    } catch(err){
        return Response.json({ error: 'Failed to delete Rapp' }, { status: 500 })
    }
    
    return Response.json({ message: 'Rapp deleted Successfully' }, { status: 200 })
  } catch (e) {
    console.log(e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export default deleteRapp