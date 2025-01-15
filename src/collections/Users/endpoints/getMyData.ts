

export const getPublicData = async (req) => {
  const { payload, user } = req;

  const data = await req.json();
  const { slug } = data;


  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

 try{

  const users = await payload.find({
    collection: 'users',
    where: {
      name: {
        equals: slug,
      },
    },
  })

  const user = users.docs[0];

  const enterprisedata = await payload.find({
    collection: 'users',
    where: {
      id: {
        equals: typeof user.associatedWith === 'string' 
        ? user.associatedWith 
        : user.associatedWith?.id,
      },
    },
  })


  const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      domain: user.domain,
      members: user.members.length,
      balance: user.balance,
      associateWith: enterprisedata.docs[0].domain
  }
    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export const updateProfile = async (req) => {
  const { payload, user } = req;

  // console.log("yaha aaya?")
  console.log("req:", req)

  const data = await req.json();
  // console.log("data:", data)

  const {id} = data;


  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

 try{

  const users = await payload.find({
    collection: 'users',
    where: {
      id: {
        equals: id,
      },
    },
  })

  const user = users.docs[0];

  const enterprisedata = await payload.find({
    collection: 'users',
    where: {
      id: {
        equals: user.associatedWith,
      },
    },
  })


  const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      domain: user.domain,
      members: user.members.length,
      balance: user.balance,
      associateWith: enterprisedata.docs[0].domain
  }
    return Response.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}