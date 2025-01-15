import addData from "@/utilities/addReqData";
import { PayloadHandler } from "payload";


export const purchaseRapps: PayloadHandler = async (req) => {
  const { user, payload } = req;
  const userId = user?.id as string;

  const data = await addData(req);
  const { modelId } = data;

  if (!user) {
    return Response.json({ message: "User not found" }, {status: 404});
  }

  if (!modelId) {
    return Response.json({ message: "Model not found" }, {status: 404});
  }
  
  try {
    const model: any = await payload.findByID({
      collection: "models",
      id: modelId,
    });

    if ( user.role === 'enterprise') {
      const totalPrice = model.cost + model.commission;
 
      if (user.balance < totalPrice) {
        return Response.json({ message: "Insufficient balance, Please recharge" }, {status: 401});
      }

      // deduct the rapp cost from the enterprise account
      try {
        const updateAdminUser = await payload.update({
          collection: "users",
          id: user?.id,
          data: {
            balance: user?.balance - totalPrice,
          },
        });
        return Response.json({ message: "rapp run successful" }, {status: 200});
    } catch (err) {
        return Response.json({ message: "Getting error while credit deduct from enterprise account" }, {status: 400});
    }

    } else if(user?.role === 'member'){

      // find the rapp owner data
      const rappOwner: any = await payload.findByID({
        collection: "users",
        id: user?.associatedWith as string,
      });
      const totalPrice = model.cost + model.commission;
 
      if (rappOwner.balance < totalPrice) {
        return Response.json({ message: "Insufficient balance, Please recharge" }, {status: 401});
      }

      // deduct the rapp cost from the enterprise account
      try {
        const updateAdminUser = await payload.update({
          collection: "users",
          id: rappOwner.id,
          data: {
            balance: rappOwner.balance - totalPrice,
          },
        });
        return Response.json({ message: "Cost deduction successfull" }, {status: 200});
    } catch (err) {
        return Response.json({ message: "Getting error while credit deduct from enterprise account" }, {status: 400});
    }
    }
    else {
      return Response.json({ message: "you haven't access to run this rapp" }, {status: 400});
    }
  } catch (error) {
    console.error("Purchase error:", error);
    return Response.json({ message: "Purchase Error" }, {status: 500});
  }
};