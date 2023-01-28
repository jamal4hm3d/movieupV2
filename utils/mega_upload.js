import { execa } from "execa";
import dotenv from "dotenv";

dotenv.config();

async function megaUpload(acc,pass,file,file_name,folder,link) {
  try {
    const uploadProcess = execa(
      `${process.env.SCRIPT_PATH}/megauploadfile.sh`,
      [
        acc,
        pass,
        file,
        file_name,
        folder,
        link,
      ],
      { all: true }
    );
    uploadProcess.all.pipe(process.stdout);
    const { all: uploadData } = await uploadProcess;
    return getLinkFromOut(uploadData);
  } catch (error) {
    const loggingOut = execa(
      `${process.env.SCRIPT_PATH}/megaerror.sh`,
      [],
      { all: true }
    );
    loggingOut.all.pipe(process.stdout);
    const { all: loginData } = await loggingOut;
    console.log(loginData);
    console.log(error);
    console.log("There was error while uploading the file");
  }
}

function getLinkFromOut(str) {
  const strList = str.split(" ");
  const linkL = strList.find((s) => s.startsWith("https://"));
  const linkR = linkL.split("\n")[0];
  return linkR.split("\r")[0];
}

export default megaUpload;
