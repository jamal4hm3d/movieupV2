import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const URL = process.env.API_URL;

const hasuraHeaders = {
  "content-type": "application/json",
  "x-hasura-admin-secret": process.env.HASURA_SECRET,
};

const getAccountQuery = `query MyQuery {
    accounts_by_pk(name: "spot") {
      email_one
      email_two
      emp_acc
      link
      name
      password
    }
  }
`;

const getSceneQuery = `query MyQuery {
    scene {
      slug
    }
  }`;

async function getAccounts() {
  try {
    const req = await fetch(URL, {
      method: "POST",
      body: JSON.stringify({ query: getAccountQuery }),
      headers: hasuraHeaders,
    });
    const res = await req.json();
    const acc_data = {};
    const emp_acc_num = res.data.accounts_by_pk.emp_acc;
    if (emp_acc_num === 1) {
      acc_data.emp_acc = res.data.accounts_by_pk.email_one;
      acc_data.full_acc = res.data.accounts_by_pk.email_two;
      acc_data.switch = 2;
    } else {
      acc_data.emp_acc = res.data.accounts_by_pk.email_two;
      acc_data.full_acc = res.data.accounts_by_pk.email_one;
      acc_data.switch = 1;
    }
    acc_data.link = res.data.accounts_by_pk.link;
    acc_data.password = res.data.accounts_by_pk.password;
    return acc_data;
  } catch (error) {
    console.log("there was error while getting account data");
    console.log(error);
  }
}

async function getScenes() {
  try {
    const req = await fetch(URL, {
      method: "POST",
      body: JSON.stringify({ query: getSceneQuery }),
      headers: hasuraHeaders,
    });
    const res = await req.json();
    const data = res.data.scene;
    return data;
  } catch (error) {
    console.log("there was error while getting scene data");
    console.log(error);
  }
}

const utils = {
  getAccounts,
  getScenes,
};

export default utils;
