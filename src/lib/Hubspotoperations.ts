import axios from "axios";

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN!;

export const hubSpotOperations = async (
  entity: "contact" | "company" | "deal" | "ticket" | "task" | "report",
  action: "add" | "get" | "update" | "delete",
  data?: any
) => {
  try {
    let endpoint = "";
    let url = "";
    let method = "";
    let properties = {};

    // Define the correct endpoint based on entity type
    switch (entity) {
      case "contact":
        endpoint = "contacts";
        break;
      case "company":
        endpoint = "companies";
        break;
      case "deal":
        endpoint = "deals";
        break;
      case "ticket":
        endpoint = "tickets";
        break;
      case "task":
        endpoint = "tasks";
        break;
      case "report":
        if (action === "get") {
          const response = await axios.get("https://api.hubapi.com/reports/v1/sales", {
            headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
          });
          console.log("✅ Sales report fetched:", response.data);
          return response.data;
        }
        throw new Error("Reports only support 'get' action.");
      default:
        throw new Error("Invalid entity type.");
    }

    // Construct URL based on action
    if (action === "add") {
      url = `https://api.hubapi.com/crm/v3/objects/${endpoint}`;
      method = "post";
      properties = data;
    } else if (action === "get") {
      url = `https://api.hubapi.com/crm/v3/objects/${endpoint}${data?.id ? `/${data.id}` : ""}`;
      method = "get";
    } else if (action === "update") {
      if (!data?.id) throw new Error("Update requires an 'id'.");
      url = `https://api.hubapi.com/crm/v3/objects/${endpoint}/${data.id}`;
      method = "patch";
      properties = data;
    } else if (action === "delete") {
      if (!data?.id) throw new Error("Delete requires an 'id'.");
      url = `https://api.hubapi.com/crm/v3/objects/${endpoint}/${data.id}`;
      method = "delete";
    } else {
      throw new Error("Invalid action type.");
    }

    // Perform the API request
    const response = await axios({
      url,
      method,
      headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
      ...(method !== "get" && method !== "delete" ? { data: { properties } } : {}),
    });

    console.log(`✅ ${action.toUpperCase()} ${entity} successful:`, response.data);
    return response.data;
  } catch (error) {
    const err = error as any;
    console.error(`❌ Error performing ${action} on ${entity}:`, err.response?.data || err);
    return null;
  }
};
