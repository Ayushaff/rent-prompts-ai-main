const addData = async (req) => {
  try {
    return await req.json()
  } catch (e) {
    console.error('Error in addData parser', e.message)
    return Response.json({ sucess: false, error: 'Malformed request body' }, { status: 400 })
  }
}

export default addData
