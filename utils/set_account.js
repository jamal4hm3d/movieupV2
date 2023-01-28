import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const today = new Date();

const hasuraHeaders = {
  "content-type": "application/json",
  "x-hasura-admin-secret": process.env.HASURA_SECRET,
};

async function setAccount(emp_acc, link) {
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
    mutation MyMutation($emp_acc: Int = 10, $link: String = "", $last_switched: date = "") {
      update_accounts_by_pk(pk_columns: {name: "spot"}, _set: {emp_acc: $emp_acc, link: $link, last_switched: $last_switched}) {
        password
        name
        link
        last_switched
        emp_acc
        email_two
        email_one
      }
    }
  `;

  function executeMyMutation(emp_acc, link, last_switched) {
    return fetchGraphQL(operationsDoc, "MyMutation", {
      emp_acc: emp_acc,
      link: link,
      last_switched: last_switched,
    });
  }

  async function startExecuteMyMutation(emp_acc, link, last_switched) {
    const queryres = await executeMyMutation(emp_acc, link, last_switched);

    if (queryres.errors) {
      // handle those errors like a pro
      console.error(queryres.errors);
    }

    // do something great with this precious data
    console.log(queryres.data);
  }

  startExecuteMyMutation(emp_acc, link, today);
}

export default setAccount;
