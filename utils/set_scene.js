import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const hasuraHeaders = {
  "content-type": "application/json",
  "x-hasura-admin-secret": process.env.HASURA_SECRET,
};

async function setScene(slug, mega_link) {
  try {
    const url = new URL(process.env.METADATA_URL + slug);
    const headers = {
      Authorization: `Bearer ${process.env.METADATA_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const req = await fetch(url.toString(), { method: "GET", headers });
    const res = await req.json();
    const movie_data = res.data;
    if (req.ok) {
      console.log(slug);
      let test_arr = await Promise.all(
        movie_data.performers.map(async (p) => {
          if (p.parent) {
            if (p.parent.extras.gender === "Female") {
              const imageURL = await getImage(p.parent.name);
              return {
                performer: {
                  data: {
                    id: p.parent.id,
                    name: p.parent.name,
                    image: imageURL ? imageURL : p.parent.thumbnail,
                    birthDay: p.parent.extras.birthday,
                  },
                  on_conflict: {
                    constraint: "performer_pkey",
                    update_columns: "id",
                  },
                },
              };
            } else {
              return Promise.resolve(null);
            }
          } else {
            if (p.extra.gender === "Female") {
              const imageURL = await getImage(p.name);
              return {
                performer: {
                  data: {
                    id: p.id,
                    name: p.name,
                    image: imageURL ? imageURL : p.thumbnail,
                    birthDay: p.extra.birthday,
                  },
                  on_conflict: {
                    constraint: "performer_pkey",
                    update_columns: "id",
                  },
                },
              };
            } else {
              return Promise.resolve(null);
            }
          }
        })
      );
      let filtered_arr = test_arr.filter((i) => i);
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
      mutation MyMutation($background: String = "", $description: String = "", $mega_link: String = "", $name: String = "", $preview: String = "", $rd_link: String = "", $slug: String = "", $data: [movie_performer_insert_input!] = {}, $id: Int = 10, $name1: String = "", $poster: String = "") {
        insert_movie_one(object: {background: $background, description: $description, mega_link: $mega_link, name: $name, preview: $preview, rd_link: $rd_link, slug: $slug, movie_performers: {data: $data}, studio: {data: {id: $id, name: $name1, poster: $poster}, on_conflict: {constraint: studio_pkey, update_columns: id}}}) {
          slug
        }
      }
    `;

      function executeMyMutation(
        background,
        description,
        mega_link,
        name,
        preview,
        rd_link,
        slug,
        data,
        id,
        name1,
        poster
      ) {
        return fetchGraphQL(operationsDoc, "MyMutation", {
          background: background,
          description: description,
          mega_link: mega_link,
          name: name,
          preview: preview,
          rd_link: rd_link,
          slug: slug,
          data: data,
          id: id,
          name1: name1,
          poster: poster,
        });
      }

      async function startExecuteMyMutation(
        background,
        description,
        mega_link,
        name,
        preview,
        rd_link,
        slug,
        data,
        id,
        name1,
        poster
      ) {
        const queryres = await executeMyMutation(
          background,
          description,
          mega_link,
          name,
          preview,
          rd_link,
          slug,
          data,
          id,
          name1,
          poster
        );

        if (queryres.errors) {
          // handle those errors like a pro
          console.error(queryres.errors);
        }

        // do something great with this precious data
        console.log(queryres.data);
      }

      startExecuteMyMutation(
        movie_data.background.full,
        movie_data.description,
        mega_link,
        movie_data.title,
        await checkVid(movie_data.trailer) ? movie_data.trailer : "",
        "",
        movie_data.slug,
        filtered_arr,
        movie_data.site.id,
        movie_data.site.name,
        movie_data.site.poster
      );
    }
  } catch (error) {
    console.log("something is wrong getting the data in setmovie");
    console.log(error);
  }
}

async function getImage(name) {
  const mainURL = `https://moviepedia/${name.split(" ").join("_")}`;
  const response = await fetch(mainURL);
  if (response.redirected) {
    console.log(response.url);
    const [new_name] = response.url.split("/").splice(-1);
    return verifyImage(new_name);
  } else {
    return verifyImage(name);
  }
  async function verifyImage(name) {
    const imageUrl = `https://moviepedia/pics/${name}.jpg`;
    try {
      const response = await fetch(imageUrl, { method: "HEAD" });
      const contentType = response.headers.get("Content-Type");
      if (contentType.startsWith("image/")) {
        return imageUrl;
      }
    } catch (error) {
      return false;
    }
  }
}

async function checkVid(url) {
  try {
    const req = await fetch(url, {
      method: "HEAD",
    });
    if (req.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

export default setScene;
