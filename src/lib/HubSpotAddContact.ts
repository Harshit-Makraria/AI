import axios from "axios";

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN!; // Private App Access Token

// HubSpot CRM Management Function
export const HubSpotCRM = async ({
  action,
  objectType,
  objectId,
  data,
}: {
  action: "fetch" | "add" | "update" | "delete";
  objectType: "contact" | "deal";
  objectId?: string; // Required for update/delete
  data?: { [key: string]: string }; // Data for create/update
}) => {
  console.log(`📨 HubSpotCRM function called for ${objectType} - ${action}`);

  // Define API URL
  let url = `https://api.hubapi.com/crm/v3/objects/${objectType}s`;
  if (objectId) url += `/${objectId}`;

  try {
    let response;

    // Fetch all contacts or deals
    if (action === "fetch") {
      response = await axios.get(url, {
        headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
      });
    }
    // Add a new contact or deal
    else if (action === "add") {
      response = await axios.post(url, { properties: data }, {
        headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      });
    }
    // Update a contact or deal
    else if (action === "update" && objectId) {
      response = await axios.patch(url, { properties: data }, {
        headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      });
    }
    // Delete a contact or deal
    else if (action === "delete" && objectId) {
      response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
      });
    } else {
      throw new Error("Invalid parameters");
    }

    console.log(`✅ ${action.toUpperCase()} successful for ${objectType}:`, response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Error in ${action} ${objectType}:`, error.response?.data || error.message);
    } else {
      console.error(`❌ Error in ${action} ${objectType}:`, error);
    }
    return null;
  }
};
