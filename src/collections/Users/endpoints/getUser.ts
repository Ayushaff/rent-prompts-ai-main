

export const getUser = async (req) => {
    const { payload, user } = req;
  
    if (!user) {
      return Response.json({success: false, error: 'Unauthorized User' }, { status: 401 });
    }
  
   try{
    
    const data = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user?.balance,
        domain: user.domain,
        members: user.members.length,
        associateWith: user.associateWith
    }
      return Response.json({success: true, message: 'User data fetched successfully', data }, { status: 200 });
    } catch (error) {
      console.error('Error fetching data:', error);
      return Response.json({success: true, error: 'Error in fetching loggedIn data' }, { status: 500 });
    }
};