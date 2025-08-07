import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECT_ROLE);
    console.log(
      `Database connected : ${connect.connection.host}, ${connect.connection.name}`
    );
  } catch (err) {
    console.log(`connect error : ${err}`);
    process.exit(1);
  }
};
