import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const hasuraHeaders = {
  "content-type": "application/json",
  "x-hasura-admin-secret": process.env.HASURA_SECRET,
};

async function setLinks(slug, mega_link) {
  async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(process.env.API_URL, {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
      headers: hasuraHeaders,
    });

    return await result.json();
  }

  const operationsDoc = `
          mutation MyMutation($slug: String = "", $mega_link: String = "") {
            update_scene_by_pk(pk_columns: {slug: $slug}, _set: {mega_link: $mega_link}) {
              mega_link
              slug
            }
          }
        `;

  function executeMyMutation(slug, mega_link) {
    return fetchGraphQL(operationsDoc, "MyMutation", {
      slug: slug,
      mega_link: mega_link,
    });
  }

  async function startExecuteMyMutation(slug, mega_link) {
    const queryres = await executeMyMutation(slug, mega_link);

    if (queryres.errors) {
      // handle those errors like a pro
      console.error(queryres.errors);
    }

    // do something great with this precious data
    console.log(queryres.data);
  }

  startExecuteMyMutation(slug, mega_link);
}

export default setLinks;
