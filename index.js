import express from "express";
import cron from "node-cron";
import fs from "fs";
import dotenv from "dotenv";
import megaUpload from "./utils/mega_upload.js";
import removeFolder from "./utils/remove_folder.js";
import utils from "./utils/query_links.js";
import megaDel from "./utils/mega_del.js";
import { File } from "megajs";
import setAccount from "./utils/set_account.js";
import setScene from "./utils/set_scene.js";
import setLinks from "./utils/set_links.js";
import path from "path";

dotenv.config();

const app = express();

let isDirEmpty = true;

cron.schedule("* * * * *", async () => {
  if (isDirEmpty) {
    try {
      console.log("reading folders");
      const folders = fs.readdirSync(process.env.VIDEO_PATH);
      for await (const folder of folders) {
        let link = "";
        const files = fs.readdirSync(`${process.env.VIDEO_PATH}/${folder}`);
        console.log("reading files");
        for await (const file of files) {
          if (file.endsWith(".mp4") || file.endsWith(".mkv")) {
            console.log("getting account details from API");
            const acc_data = await utils.getAccounts();
            const scene_data = await utils.getScenes();
            const out_data = {};
            out_data.file_links = [];
            isDirEmpty = false;
            console.log("uploading to folder");
            link = await megaUpload(
              acc_data.emp_acc,
              acc_data.password,
              `${process.env.VIDEO_PATH}/${folder}/${file}`,
              file,
              `${folder}${path.extname(
                `${process.env.VIDEO_PATH}/${folder}/${file}`
              )}`,
              acc_data.link
            );
            if (link) {
              out_data.new_link = link;
              console.log(link);
              console.log("deleting old files folder");
              await megaDel(acc_data.full_acc, acc_data.password);
              await setAccount(acc_data.switch, out_data.new_link);
              console.log("getting links from files");
              const filesFolder = File.fromURL(out_data.new_link);
              const filesFolderWithAttr = await filesFolder.loadAttributes();
              for await (const file of filesFolderWithAttr.children) {
                const fileData = {};
                const id = await file.downloadId;
                fileData.name = file.name.slice(0, -4);
                fileData.link = `${out_data.new_link}/file/${id[1]}`;
                out_data.file_links.push(fileData);
              }
              const scene_data_names = scene_data.map((item) => item.slug);
              const new_scenes = out_data.file_links.filter(
                (item) => !scene_data_names.includes(item.name)
              );
              for await (const new_scene of new_scenes) {
                await setScene(new_scene.name, new_scene.link);
              }
              for await (const file of out_data.file_links) {
                await setLinks(file.name, file.link);
              }
              console.log("database updated");
            } else {
              isDirEmpty = true;
            }
          }
        }
        if (link) {
          console.log("deleting the folder from system");
          await removeFolder(folder);
          isDirEmpty = true;
        }
      }
    } catch (error) {
      console.log(error);
      console.log("cannot read the file system");
    }
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(8113, () => {
  console.log(`Example app listening on port 8113`);
});
