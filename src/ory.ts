import * as ory from "@ory/client";
import axios from "axios";
export default {
  frontEnd: new ory.FrontendApi(
    new ory.Configuration({
      apiKey: process.env.API_KEY,
      basePath: process.env.ORY_SDK_URL,
      baseOptions: {
        withCredentials: true,
      },
    })
  ),
  updateIdentity: async (data: {
    id: string;
    updateIndentityBody: ory.UpdateIdentityBody;
  }) => {
    await axios.put(
      `${process.env.ORY_SDK_URL}/admin/identities/${data.id}`,
      data.updateIndentityBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );
  },
};
