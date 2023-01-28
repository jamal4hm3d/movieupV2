import { execa } from "execa";
import dotenv from "dotenv";

dotenv.config();

async function removeFolder(folder) {
  const removeProcess = execa(
    "rm",
    ["-rf", `${process.env.VIDEO_PATH}/${folder}`],
    { all: true }
  );

  removeProcess.all.pipe(process.stdout);
  const { all: removeData } = await removeProcess;
  console.log(removeData);
}

export default removeFolder;
