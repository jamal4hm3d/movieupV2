import { Storage } from "megajs";

async function megaDel(email, pass) {
  try {
    const storage = await new Storage({
      email: email,
      password: pass,
      userAgent: "Mozilla/5.0",
      keepalive: false,
    }).ready;
    const oldFile = storage.root.children[0];
    await oldFile.delete(true);
    return true;
  } catch (error) {
    console.log("There was error while deleting old file");
    console.log(error);
    return false;
  }
}

export default megaDel;
